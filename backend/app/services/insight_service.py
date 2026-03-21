"""
app/services/insight_service.py

Generates a clinical insight from a session's frame predictions
using the OpenAI API, then stores it in LLMInsight.
"""

import os
from openai import AsyncOpenAI
import numpy as np

from app.database.db import db
from app.database.models import FramePrediction, LLMInsight

# MODEL = "gpt-4o"
MODEL = "deepseek-chat"

_client = None

def _get_client():
    global _client
    if _client is None:
        api_key = os.getenv("DEEPSEEK_API_KEY")
        if not api_key:
            raise RuntimeError("DEEPSEEK_API_KEY not set in environment")
        _client = AsyncOpenAI(
            api_key=api_key,
            base_url="https://api.deepseek.com"
        )
    return _client


def _build_prompt(predictions: list[dict], fps: int) -> str:
    angles = [p["predicted_angle"] for p in predictions]
    frames = [p["frame_index"] for p in predictions]

    # Basic stats
    min_angle = round(min(angles), 1)
    max_angle = round(max(angles), 1)
    mean_angle = round(float(np.mean(angles)), 1)
    std_angle = round(float(np.std(angles)), 1)
    rom = round(max_angle - min_angle, 1)
    duration_sec = round(len(frames) / fps, 1)

    # Rough flexion/extension phases: find the frame of min angle (max flexion)
    peak_flex_frame = frames[int(np.argmin(angles))]
    peak_flex_time = round(peak_flex_frame / fps, 2)

    # Smoothness: mean of absolute frame-to-frame differences
    diffs = [abs(angles[i+1] - angles[i]) for i in range(len(angles) - 1)]
    smoothness = round(float(np.mean(diffs)), 2) if diffs else 0.0

    series_str = ", ".join(str(a) for a in angles[:30])
    if len(angles) > 30:
        series_str += f" ... ({len(angles)} frames total)"

    return f"""You are a physical therapy assistant analyzing knee motion data from a video session.

SESSION STATS:
- Duration: {duration_sec}s ({len(frames)} frames at {fps} fps)
- Range of Motion (ROM): {rom}°  (min {min_angle}° → max {max_angle}°)
- Mean angle: {mean_angle}° ± {std_angle}°
- Peak flexion at: frame {peak_flex_frame} ({peak_flex_time}s)
- Mean frame-to-frame change (smoothness): {smoothness}°/frame

ANGLE SERIES (degrees, first 30 frames shown):
{series_str}

Write a concise clinical insight (3–5 sentences) for a physiotherapist covering:
1. ROM assessment (adequate/limited and compared to normal ~135° full flexion)
2. Movement quality / smoothness
3. Any notable asymmetry or compensatory patterns visible in the data
4. One practical recommendation

Be factual, professional, and avoid speculation beyond what the data supports."""


def generate_and_store_insight(session_id: int, fps: int = 30) -> dict:
    """
    Pulls FramePrediction rows for session_id, generates an OpenAI insight,
    stores it as an LLMInsight row, and returns the insight dict.
    """
    predictions = (
        FramePrediction.query
        .filter_by(session_id=session_id)
        .order_by(FramePrediction.frame_index)
        .all()
    )

    if not predictions:
        raise ValueError(f"No predictions found for session {session_id}. Run /analyze first.")

    pred_list = [
        {"frame_index": p.frame_index, "predicted_angle": p.predicted_angle}
        for p in predictions
    ]

    prompt = _build_prompt(pred_list, fps)

    response = _get_client().chat.completions.create(
        model=MODEL,
        max_tokens=512,
        messages=[{"role": "user", "content": prompt}]
    )

    insight_text = response.choices[0].message.content.strip()

    # Store in DB
    insight = LLMInsight(
        session_id=session_id,
        insight_text=insight_text,
        model_used=MODEL,
    )
    db.session.add(insight)
    db.session.commit()

    return {
        "session_id": session_id,
        "insight_text": insight_text,
        "model": MODEL,
    }