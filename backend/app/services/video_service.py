import os
import cv2
import tempfile
import shutil

from app.database.db import db
from app.database.models import FramePrediction
from app.utils.preprocessing import preprocess_input
from app.ml.knee_model import get_model

SEQUENCE_LENGTH = 9
HALF = SEQUENCE_LENGTH // 2

def extract_frames(video_path: str, frames_dir: str) -> list[str]:
    """
    Extract all frames from video into frames_dir as PNGs.
    Returns sorted list of frame file paths.
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise RuntimeError(f"Could not open video: {video_path}")

    frame_paths = []
    idx = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        path = os.path.join(frames_dir, f"frame_{idx:06d}.png")
        cv2.imwrite(path, frame)
        frame_paths.append(path)
        idx += 1

    cap.release()
    return sorted(frame_paths)


def run_inference_and_store(session_id: int, video_path: str) -> list[dict]:
    """
    Full pipeline:
      1. Extract frames from video into a temp dir
      2. Slide a 9-frame window across all frames
      3. Run inference on each window
      4. Bulk insert FramePrediction rows
      5. Clean up temp frames
      6. Return per-frame predictions list
    """
    frames_dir = tempfile.mkdtemp(prefix=f"session_{session_id}_")

    try:
        frame_paths = extract_frames(video_path, frames_dir)
        total_frames = len(frame_paths)

        if total_frames < SEQUENCE_LENGTH:
            raise ValueError(
                f"Video too short: {total_frames} frames, need at least {SEQUENCE_LENGTH}"
            )

        model = get_model()
        predictions = []

        # Slide window — center frame goes from HALF to total_frames-HALF-1
        for center in range(HALF, total_frames - HALF):
            window = frame_paths[center - HALF : center + HALF + 1]

            tensor = preprocess_input(window)           # (1, 27, 224, 224)
            angle_deg = model.predict(tensor)           # float, degrees

            predictions.append(
                FramePrediction(
                    session_id=session_id,
                    frame_index=center,
                    predicted_angle=round(angle_deg, 2),
                )
            )

        # Bulk insert
        db.session.bulk_save_objects(predictions)
        db.session.commit()

        return [
            {
                "frame_index": p.frame_index,
                "predicted_angle": p.predicted_angle,
            }
            for p in predictions
        ]

    finally:
        # Always clean up temp frames regardless of success/failure
        shutil.rmtree(frames_dir, ignore_errors=True)