"""
app/services/video_service.py

Full inference pipeline — entirely in memory, no intermediate PNGs written.

Flow:
  1. Load all frames from video as numpy arrays
  2. Fisheye correct + crop + scale each frame  (same params as ultimateDataGathering.py)
  3. Run Eulerian Motion Magnification across the full frame sequence
  4. Apply EMA temporal smoothing (alpha=0.20, the best-performing setting)
  5. Slide a 9-frame window, preprocess each window into a tensor, run model
  6. Bulk insert FramePrediction rows
"""

import cv2
import numpy as np
import torch
from PIL import Image
from scipy.signal import butter, filtfilt
import torchvision.transforms as transforms

from app.database.db import db
from app.database.models import FramePrediction
from app.ml.knee_model import get_model

# ──────────────────────────────────────────────────────────────────────────────
# CONSTANTS
# ──────────────────────────────────────────────────────────────────────────────

SEQUENCE_LENGTH = 9
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

# EMA  (only α=0.20 used — best performing setting)
EMA_ALPHA_SLOW    = 0.20
EMA_ALPHA_FAST    = 0.60
EMA_MOTION_THRESH = 10.0   # mean abs-diff (grayscale, 0-255 scale)

# Preprocessing transform — matches testModel.py exactly
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
    Returns (frames_bgr, fps)  where frames_bgr is a list of uint8 BGR arrays.
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise RuntimeError(f"Cannot open video: {video_path}")

    fps    = cap.get(cv2.CAP_PROP_FPS) or 30.0
    width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    # Build fisheye matrices once (depends on original frame size)
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
# STEP 2 — Eulerian Motion Magnification  (ported from ultimateDataGathering.py)
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

    # Convert to float32 YUV and build pyramids
    frames_yuv  = []
    pyramid_seq = []

    for frame in frames_bgr:
        yuv = cv2.cvtColor(frame, cv2.COLOR_BGR2YUV).astype(np.float32) / 255.0
        frames_yuv.append(yuv)
        pyramid_seq.append(_build_laplacian_pyramid(yuv[:, :, 0], EMM_PYRAMID_LEVELS))

    num_levels = len(pyramid_seq[0])

    # Temporal bandpass filter per pyramid level
    filtered_pyramids = []
    for lv in range(num_levels):
        seq  = np.array([pyramid_seq[t][lv] for t in range(N)], dtype=np.float32)
        filt = _temporal_bandpass(seq, fps)
        filtered_pyramids.append(filt)

    # Reconstruct magnified frames
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
# STEP 3 — EMA temporal smoothing  (α=0.20, ported from applyBlurFramesGenerator.py)
# ──────────────────────────────────────────────────────────────────────────────

def _apply_ema(frames_bgr: list[np.ndarray]) -> list[np.ndarray]:
    """
    Motion-adaptive EMA smoothing at alpha_slow=0.20.
    Low-motion frames blend slowly; high-motion frames blend faster.
    """
    out_frames = []
    prev_f32   = None
    prev_gray  = None

    for frame in frames_bgr:
        curr_f32  = frame.astype(np.float32)
        curr_gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        if prev_f32 is None:
            # First frame — pass through unchanged
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
# STEP 4 — tensor preprocessing for a 9-frame window
# ──────────────────────────────────────────────────────────────────────────────

def _window_to_tensor(window: list[np.ndarray]) -> torch.Tensor:
    """
    window: list of 9 BGR uint8 numpy frames
    Returns: (1, 27, 224, 224) float tensor ready for CNNRegressor
    """
    imgs = []
    for frame in window:
        # cv2 is BGR, PIL expects RGB
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        img = Image.fromarray(rgb)
        imgs.append(_TRANSFORM(img))   # (3, 224, 224)

    stacked = torch.cat(imgs, dim=0)   # (27, 224, 224)
    return stacked.unsqueeze(0)        # (1, 27, 224, 224)


# ──────────────────────────────────────────────────────────────────────────────
# PUBLIC — called by session_routes.py
# ──────────────────────────────────────────────────────────────────────────────

def run_inference_and_store(session_id: int, video_path: str) -> list[dict]:
    """
    Full in-memory pipeline:
      load → fisheye/crop/scale → EMM → EMA → sliding window inference → DB insert

    Returns list of {frame_index, predicted_angle} dicts.
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

    # 4. Sliding window inference
    model       = get_model()
    total       = len(frames)
    predictions = []

    for center in range(HALF, total - HALF):
        window     = frames[center - HALF : center + HALF + 1]
        tensor     = _window_to_tensor(window)
        angle_deg  = model.predict(tensor)

        predictions.append(
            FramePrediction(
                session_id=session_id,
                frame_index=center,
                predicted_angle=round(angle_deg, 2),
            )
        )

    # 5. Bulk insert
    db.session.bulk_save_objects(predictions)
    db.session.commit()

    return [
        {"frame_index": p.frame_index, "predicted_angle": p.predicted_angle}
        for p in predictions
    ]