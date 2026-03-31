"""
app/services/insight_service.py

Generates a clinical insight from a session's frame predictions + optical flow
using DeepSeek, then stores it in LLMInsight.
"""

import os
from openai import OpenAI
import numpy as np

from app.database.db import db
from app.database.models import FramePrediction, LLMInsight, OpticalFlowResult

# MODEL = "gpt-4o"
MODEL = "deepseek-chat"

_client = None

def _get_client():
    global _client
    if _client is None:
        api_key = os.getenv("DEEPSEEK_API_KEY")
        if not api_key:
            raise RuntimeError("DEEPSEEK_API_KEY not set in environment")
        _client = OpenAI(
            api_key=api_key,
            base_url="https://api.deepseek.com"
        )
    return _client


def _build_prompt(predictions: list[dict], flow_data: list[dict], fps: int) -> str:
    angles = [p["predicted_angle"] for p in predictions]
    frames = [p["frame_index"] for p in predictions]

    # Angle stats
    min_angle    = round(min(angles), 1)
    max_angle    = round(max(angles), 1)
    mean_angle   = round(float(np.mean(angles)), 1)
    std_angle    = round(float(np.std(angles)), 1)
    rom          = round(max_angle - min_angle, 1)
    duration_sec = round(len(frames) / fps, 1)

    peak_flex_frame = frames[int(np.argmin(angles))]
    peak_flex_time  = round(peak_flex_frame / fps, 2)

    diffs      = [abs(angles[i+1] - angles[i]) for i in range(len(angles) - 1)]
    smoothness = round(float(np.mean(diffs)), 2) if diffs else 0.0

    series_str = ", ".join(str(a) for a in angles[:30])
    if len(angles) > 30:
        series_str += f" ... ({len(angles)} frames total)"

    # Optical flow zone stats (may be empty if flow wasn't computed)
    flow_section = ""
    if flow_data:
        z1 = [r["zone1_percent"] for r in flow_data]
        z2 = [r["zone2_percent"] for r in flow_data]
        z3 = [r["zone3_percent"] for r in flow_data]

        avg_z1 = round(float(np.mean(z1)), 1)
        avg_z2 = round(float(np.mean(z2)), 1)
        avg_z3 = round(float(np.mean(z3)), 1)

        dominant_zone = ["left (zone 1)", "center (zone 2)", "right (zone 3)"][
            int(np.argmax([avg_z1, avg_z2, avg_z3]))
        ]

        flow_section = f"""
            OPTICAL FLOW — ZONE LOAD DISTRIBUTION (% of total motion per zone, averaged across session):
            - Zone 1 (left):   {avg_z1}%
            - Zone 2 (center): {avg_z2}%
            - Zone 3 (right):  {avg_z3}%
            - Dominant motion zone: {dominant_zone}
            """

    return f"""You are a physical therapy assistant analyzing knee motion data from a video session.

            SESSION STATS:
            - Duration: {duration_sec}s ({len(frames)} frames at {fps} fps)
            - Range of Motion (ROM): {rom}°  (min {min_angle}° → max {max_angle}°)
            - Mean angle: {mean_angle}° ± {std_angle}°
            - Peak flexion at: frame {peak_flex_frame} ({peak_flex_time}s)
            - Mean frame-to-frame change (smoothness): {smoothness}°/frame
            {flow_section}
            ANGLE SERIES (degrees, first 30 frames shown):
            {series_str}

            Write a concise clinical insight (3–5 sentences) for a physiotherapist covering:
            1. ROM assessment (adequate/limited and compared to normal ~135° full flexion)
            2. Movement quality / smoothness
            3. Zone load distribution — which region of the frame shows the most motion activity and what that may indicate
            4. Any notable asymmetry or compensatory patterns visible in the data
            5. One practical recommendation

            Be factual, professional, and avoid speculation beyond what the data supports."""


def generate_and_store_insight(session_id: int, fps: int = 30) -> dict:
    """
    Pulls FramePrediction + OpticalFlowResult rows for session_id,
    generates a DeepSeek insight, stores it as an LLMInsight row,
    and returns the insight dict.
    """
    predictions = (
        FramePrediction.query
        .filter_by(session_id=session_id)
        .order_by(FramePrediction.frame_index)
        .all()
    )

    if not predictions:
        raise ValueError(f"No predictions found for session {session_id}. Run /analyze first.")

    flow_rows = (
        OpticalFlowResult.query
        .filter_by(session_id=session_id)
        .order_by(OpticalFlowResult.frame_index)
        .all()
    )

    pred_list = [
        {"frame_index": p.frame_index, "predicted_angle": p.predicted_angle}
        for p in predictions
    ]

    flow_list = [
        {
            "frame_index":   r.frame_index,
            "zone1_percent": r.zone1_percent,
            "zone2_percent": r.zone2_percent,
            "zone3_percent": r.zone3_percent,
        }
        for r in flow_rows
    ]

    prompt = _build_prompt(pred_list, flow_list, fps)

    response = _get_client().chat.completions.create(
        model=MODEL,
        max_tokens=512,
        messages=[{"role": "user", "content": prompt}]
    )

    insight_text = response.choices[0].message.content.strip()

    insight = LLMInsight(
        session_id=session_id,
        insight_text=insight_text,
        model_used=MODEL,
    )
    db.session.add(insight)
    db.session.commit()

    return {
        "session_id":   session_id,
        "insight_text": insight_text,
        "model":        MODEL,
    }