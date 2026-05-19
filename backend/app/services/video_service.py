"""
app/services/video_service.py

Full inference pipeline — entirely in memory, no intermediate PNGs written.

Flow:
  1. Load all frames from video as numpy arrays
  2. Fisheye correct + crop + scale each frame
  3. Run Eulerian Motion Magnification across the full frame sequence
  4. Apply EMA temporal smoothing (alpha=0.20, the best-performing setting)
  5. Compute dense Farneback optical flow → zone scores (stored every 10th frame)
  6. Slide a 9-frame window, preprocess each window into a tensor, run model
  7. Return FramePrediction + OpticalFlowResult dicts
"""

import cv2
import numpy as np
import torch
from PIL import Image
from scipy.signal import butter, filtfilt, savgol_filter
import torchvision.transforms as transforms

from app.ml.knee_model import get_model

# ──────────────────────────────────────────────────────────────────────────────
# CONSTANTS
# ──────────────────────────────────────────────────────────────────────────────

SEQUENCE_LENGTH = 15
HALF            = SEQUENCE_LENGTH // 2

# Fisheye / crop / scale
EMM_SCALE_FACTOR = 0.5
EMM_FX_SCALE     = 0.9
EMM_FY_SCALE     = 0.9
EMM_K1           = -0.05
EMM_CROP = {
    "LEFT":   0.23,
    "RIGHT":  0.20,
    "TOP":    0.20,
    "BOTTOM": 0.17,
}

# EMM bandpass
EMM_AMPLIFICATION  = 30
EMM_FREQ_MIN       = 0.8
EMM_FREQ_MAX       = 2.0
EMM_PYRAMID_LEVELS = 4

# EMA (only α=0.20 used — best performing setting)
EMA_ALPHA_SLOW    = 0.20
EMA_ALPHA_FAST    = 0.60
EMA_MOTION_THRESH = 10.0

# Optical flow
ZONE_COUNT           = 3
FLOW_STORE_EVERY_NTH = 10

FARNEBACK_PARAMS = dict(
    pyr_scale=0.5,
    levels=3,
    winsize=15,
    iterations=3,
    poly_n=5,
    poly_sigma=1.2,
    flags=0
)

# Preprocessing transform
_TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# ──────────────────────────────────────────────────────────────────────────────
# STEP 1 — load + geometric preprocessing
# ──────────────────────────────────────────────────────────────────────────────

def _load_and_preprocess_frames(video_path: str) -> tuple[list[np.ndarray], float]:
    """
    Opens video, applies fisheye correction + crop + scale to every frame.
    Returns (frames_bgr, fps) where frames_bgr is a list of uint8 BGR arrays.
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise RuntimeError(f"Cannot open video: {video_path}")

    fps    = cap.get(cv2.CAP_PROP_FPS) or 30.0
    width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    fx = EMM_FX_SCALE * width
    fy = EMM_FY_SCALE * height
    K  = np.array([[fx, 0,  width  / 2],
                   [0,  fy, height / 2],
                   [0,  0,  1         ]], dtype=np.float32)
    D  = np.array([EMM_K1, 0, 0, 0], dtype=np.float32)

    crop_l = int(EMM_CROP["LEFT"]   * width)
    crop_r = int(EMM_CROP["RIGHT"]  * width)
    crop_t = int(EMM_CROP["TOP"]    * height)
    crop_b = int(EMM_CROP["BOTTOM"] * height)

    frames = []
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        corrected = cv2.undistort(frame, K, D)
        cropped   = corrected[crop_t : height - crop_b, crop_l : width - crop_r]
        scaled    = cv2.resize(
            cropped,
            (int(cropped.shape[1] * EMM_SCALE_FACTOR),
             int(cropped.shape[0] * EMM_SCALE_FACTOR)),
            interpolation=cv2.INTER_AREA
        )
        frames.append(scaled)

    cap.release()
    return frames, fps


# ──────────────────────────────────────────────────────────────────────────────
# STEP 2 — Eulerian Motion Magnification
# ──────────────────────────────────────────────────────────────────────────────

def _build_laplacian_pyramid(img: np.ndarray, levels: int) -> list[np.ndarray]:
    pyramid, temp = [], img.copy()
    for _ in range(levels):
        down = cv2.pyrDown(temp)
        up   = cv2.pyrUp(down, dstsize=(temp.shape[1], temp.shape[0]))
        pyramid.append(cv2.subtract(temp, up))
        temp = down
    pyramid.append(temp)
    return pyramid


def _collapse_laplacian_pyramid(pyramid: list[np.ndarray]) -> np.ndarray:
    img = pyramid[-1]
    for i in range(len(pyramid) - 2, -1, -1):
        up  = cv2.pyrUp(img, dstsize=(pyramid[i].shape[1], pyramid[i].shape[0]))
        img = cv2.add(up, pyramid[i])
    return img


def _temporal_bandpass(data: np.ndarray, fps: float) -> np.ndarray:
    nyquist = 0.5 * fps
    low     = max(EMM_FREQ_MIN / nyquist, 1e-4)
    high    = min(EMM_FREQ_MAX / nyquist, 1 - 1e-4)
    b, a    = butter(2, [low, high], btype="band")
    return filtfilt(b, a, data, axis=0)


def _apply_emm(frames_bgr: list[np.ndarray], fps: float) -> list[np.ndarray]:
    """
    Runs full Eulerian Motion Magnification on the frame list in RAM.
    Returns a new list of uint8 BGR frames with motion magnified.
    """
    N = len(frames_bgr)
    frames_yuv, pyramid_seq = [], []

    for frame in frames_bgr:
        yuv = cv2.cvtColor(frame, cv2.COLOR_BGR2YUV).astype(np.float32) / 255.0
        frames_yuv.append(yuv)
        pyramid_seq.append(_build_laplacian_pyramid(yuv[:, :, 0], EMM_PYRAMID_LEVELS))

    num_levels = len(pyramid_seq[0])

    filtered_pyramids = []
    for lv in range(num_levels):
        seq  = np.array([pyramid_seq[t][lv] for t in range(N)], dtype=np.float32)
        filt = _temporal_bandpass(seq, fps)
        filtered_pyramids.append(filt)

    out_frames = []
    for t in range(N):
        orig_pyr = pyramid_seq[t]
        mag_pyr  = [
            orig_pyr[lv] + EMM_AMPLIFICATION * filtered_pyramids[lv][t]
            for lv in range(num_levels)
        ]
        y_mag   = np.clip(_collapse_laplacian_pyramid(mag_pyr), 0, 1)
        yuv_mag = np.stack([y_mag,
                            frames_yuv[t][:, :, 1],
                            frames_yuv[t][:, :, 2]], axis=2)
        out = cv2.cvtColor((yuv_mag * 255).astype(np.uint8), cv2.COLOR_YUV2BGR)
        out_frames.append(out)

    return out_frames


# ──────────────────────────────────────────────────────────────────────────────
# STEP 3 — EMA temporal smoothing
# ──────────────────────────────────────────────────────────────────────────────

def _apply_ema(frames_bgr: list[np.ndarray]) -> list[np.ndarray]:
    """
    Motion-adaptive EMA smoothing at alpha_slow=0.20.
    Low-motion frames blend slowly; high-motion frames blend faster.
    """
    out_frames = []
    prev_f32 = prev_gray = None

    for frame in frames_bgr:
        curr_f32  = frame.astype(np.float32)
        curr_gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        if prev_f32 is None:
            out_frames.append(frame)
            prev_f32  = curr_f32.copy()
            prev_gray = curr_gray.copy()
            continue

        motion = cv2.mean(cv2.absdiff(prev_gray, curr_gray))[0]
        alpha  = EMA_ALPHA_FAST if motion > EMA_MOTION_THRESH else EMA_ALPHA_SLOW

        blended   = (1.0 - alpha) * prev_f32 + alpha * curr_f32
        out_frame = np.clip(blended, 0, 255).astype(np.uint8)

        prev_f32  = blended
        prev_gray = cv2.cvtColor(out_frame, cv2.COLOR_BGR2GRAY)
        out_frames.append(out_frame)

    return out_frames


# ──────────────────────────────────────────────────────────────────────────────
# STEP 4 — Dense optical flow (Farneback) → zone scores, stored every 10th frame
# ──────────────────────────────────────────────────────────────────────────────

def _compute_optical_flow(
    session_id: str,
    frames_bgr: list[np.ndarray]
) -> list[dict]:
    """
    Runs dense Farneback optical flow across the full frame sequence.
    Flow is computed every frame (required for accuracy) but only stored
    every FLOW_STORE_EVERY_NTH frames to keep DB rows manageable.
    Returns a list of dicts.
    """
    H, W = frames_bgr[0].shape[:2]
    zone_width = W // ZONE_COUNT
    zone_ranges = []
    for i in range(ZONE_COUNT):
        x1 = i * zone_width
        x2 = (i + 1) * zone_width if i < ZONE_COUNT - 1 else W
        zone_ranges.append((x1, x2))

    rows = []
    prev_gray = cv2.cvtColor(frames_bgr[0], cv2.COLOR_BGR2GRAY)

    for idx in range(1, len(frames_bgr)):
        curr_gray = cv2.cvtColor(frames_bgr[idx], cv2.COLOR_BGR2GRAY)

        flow = cv2.calcOpticalFlowFarneback(
            prev_gray, curr_gray, None, **FARNEBACK_PARAMS
        )

        mag = np.sqrt(flow[..., 0] ** 2 + flow[..., 1] ** 2)

        zone_scores = [
            float(np.mean(mag[:, x1:x2])) for x1, x2 in zone_ranges
        ]
        total = sum(zone_scores) + 1e-8
        zone_percents = [round((s / total) * 100, 2) for s in zone_scores]

        # Compute every frame, store every 10th
        if idx % FLOW_STORE_EVERY_NTH == 0:
            rows.append({
                "frame_index":   idx,
                "zone1_score":   zone_scores[0],
                "zone2_score":   zone_scores[1],
                "zone3_score":   zone_scores[2],
                "zone1_percent": zone_percents[0],
                "zone2_percent": zone_percents[1],
                "zone3_percent": zone_percents[2],
            })

        prev_gray = curr_gray

    return rows


# ──────────────────────────────────────────────────────────────────────────────
# STEP 5 — tensor preprocessing for a 9-frame window
# ──────────────────────────────────────────────────────────────────────────────

def _window_to_tensor(window: list[np.ndarray]) -> torch.Tensor:
    imgs = []
    for frame in window:
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        img = Image.fromarray(rgb)
        imgs.append(_TRANSFORM(img))          # (3, 224, 224)

    stacked = torch.stack(imgs, dim=0)        # (T, 3, 224, 224)  ← stack not cat
    return stacked.unsqueeze(0)               # (1, T, 3, 224, 224)


# ──────────────────────────────────────────────────────────────────────────────
# PUBLIC — called by session_routes.py
# ──────────────────────────────────────────────────────────────────────────────
def _smooth_predictions(angles: list[float], window: int = 11, poly: int = 3) -> list[float]:
    n = len(angles)
    if n < poly + 2 or n < window:
        return angles
    w = min(window, n if n % 2 == 1 else n - 1)
    p = min(poly, w - 1)
    return savgol_filter(angles, window_length=w, polyorder=p).tolist()

def run_inference_and_store(
    session_id: int,
    video_path: str
) -> tuple[list[dict], list[dict]]:
    """
    Full in-memory pipeline:
      load → fisheye/crop/scale → EMM → EMA → optical flow + sliding window inference → DB insert

    Returns:
      predictions  — list of {frame_index, predicted_angle}
      flow_results — list of {frame_index, zone1_score, zone2_score, zone3_score,
                               zone1_percent, zone2_percent, zone3_percent}
    """
    # 1. Load + geometric preprocessing
    frames, fps = _load_and_preprocess_frames(video_path)

    if len(frames) < SEQUENCE_LENGTH:
        raise ValueError(
            f"Video too short: {len(frames)} frames, need at least {SEQUENCE_LENGTH}"
        )

    # 2. Eulerian Motion Magnification (full-video, needs all frames)
    frames = _apply_emm(frames, fps)

    # 3. EMA temporal smoothing at α=0.20
    frames = _apply_ema(frames)

    # 4. Optical flow — computed every frame, stored every 10th
    flow_orm_rows = _compute_optical_flow(session_id, frames)

    # 5. Sliding window inference
    model = get_model()
    total = len(frames)
    raw_angles = []
    frame_indices = []

    for center in range(HALF, total - HALF):
        window = frames[center - HALF : center + HALF + 1]
        tensor = _window_to_tensor(window)
        raw_angles.append(model.predict(tensor))
        frame_indices.append(center)

    # 5b. Post-hoc smoothing
    smoothed_angles = _smooth_predictions(raw_angles)

    predictions = [
        {"frame_index": fi, "predicted_angle": round(angle, 2)}
        for fi, angle in zip(frame_indices, smoothed_angles)
    ]
    flow_results = [
        {
            "frame_index":   r.frame_index,
            "zone1_score":   r.zone1_score,
            "zone2_score":   r.zone2_score,
            "zone3_score":   r.zone3_score,
            "zone1_percent": r.zone1_percent,
            "zone2_percent": r.zone2_percent,
            "zone3_percent": r.zone3_percent,
        }
        for r in flow_orm_rows
    ]

    return predictions, flow_results