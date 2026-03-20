from app.ml.knee_model import KneeAngleModel
from app.utils.preprocessing import preprocess_input
from app.config import Config
from app.ml.knee_model import get_model

def predict_knee_angle(frame_paths: list[str]) -> dict:
    """
    frame_paths: list of 9 absolute file paths to frames
    Returns: {"angle": float (degrees)}
    """
    if len(frame_paths) != 9:
        raise ValueError(f"Expected 9 frame paths, got {len(frame_paths)}")

    tensor = preprocess_input(frame_paths)
    angle = get_model().predict(tensor)

    return {"angle": round(angle, 2)}