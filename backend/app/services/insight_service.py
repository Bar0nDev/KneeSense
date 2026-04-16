"""
app/services/insight_service.py

Generates a clinical insight + short TL;DR summary from a session's frame
predictions and optical flow using DeepSeek, then stores both in LLMInsight.

Patient context (height, weight, age, sex) is fetched directly from the DB
via session_id → Session.patient_id → Patient.
"""

import os
from datetime import date
from openai import OpenAI
import numpy as np

from app.database.db import db
from app.database.models import FramePrediction, LLMInsight, OpticalFlowResult, Session, Patient

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


def _get_patient_context(session_id: int) -> dict:
    """
    Fetches patient demographics for a session.
    Returns a dict with age, sex, height_cm, weight_kg (all nullable).
    """
    session = db.session.get(Session, session_id)
    if not session or not session.patient_id:
        return {}

    patient = db.session.get(Patient, session.patient_id)
    if not patient:
        return {}

    age = None
    if patient.birthday:
        today = date.today()
        age = today.year - patient.birthday.year - (
            (today.month, today.day) < (patient.birthday.month, patient.birthday.day)
        )

    return {
        "age":       age,
        "sex":       patient.sex,
        "height_cm": patient.height_cm,
        "weight_kg": patient.weight_kg,
        "notes":     patient.notes,
    }


def _build_patient_section(ctx: dict) -> str:
    """Builds the patient context block for the prompt. Omits missing fields."""
    if not ctx:
        return ""

    lines = []
    if ctx.get("age"):
        lines.append(f"- Age: {ctx['age']} years")
    if ctx.get("sex"):
        lines.append(f"- Sex: {ctx['sex']}")
    if ctx.get("height_cm"):
        lines.append(f"- Height: {ctx['height_cm']} cm")
    if ctx.get("weight_kg"):
        bmi = round(ctx["weight_kg"] / ((ctx["height_cm"] / 100) ** 2), 1) if ctx.get("height_cm") else None
        lines.append(f"- Weight: {ctx['weight_kg']} kg" + (f" (BMI: {bmi})" if bmi else ""))
    if ctx.get("notes"):
        lines.append(f"- Clinical notes: {ctx['notes']}")

    if not lines:
        return ""

    return "PATIENT CONTEXT:\n" + "\n".join(lines) + "\n"


def _build_prompt(
    predictions: list[dict],
    flow_data: list[dict],
    fps: int,
    patient_ctx: dict,
) -> str:
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

    # Optical flow zone stats
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

    patient_section = _build_patient_section(patient_ctx)

    return f"""You are a physical therapy assistant analyzing knee motion data from a video session.

        Note: Angle values are predicted by a computer vision model and may contain minor frame-to-frame variation that does not reflect true movement jitter. Focus your assessment on overall trends, ROM, and aggregate statistics rather than individual frame fluctuations.

        {patient_section}
        SESSION STATS:
        - Duration: {duration_sec}s ({len(frames)} frames at {fps} fps)
        - Range of Motion (ROM): {rom}°  (min {min_angle}° → max {max_angle}°)
        - Mean angle: {mean_angle}° ± {std_angle}°
        - Peak flexion at: frame {peak_flex_frame} ({peak_flex_time}s)
        - Mean frame-to-frame change (smoothness): {smoothness}°/frame
        {flow_section}
        ANGLE SERIES (degrees, first 30 frames shown):
        {series_str}

        Respond with exactly two sections using these headers:

        CLINICAL INSIGHT:
        Write 3–5 sentences for a physiotherapist covering:
        1. ROM assessment (adequate/limited compared to normal ~135° full flexion)
        2. Movement quality / smoothness
        3. Zone load distribution and what it may indicate
        4. Any notable asymmetry or compensatory patterns
        5. One practical recommendation
        Where relevant, factor in the patient's age, sex, BMI, and any clinical notes when contextualizing findings.

        SUMMARY:
        Write 1–2 sentences in plain language summarizing the key finding and the single most important action item. Avoid jargon — this may be shown to the patient directly.

        Be factual, professional, and avoid speculation beyond what the data supports."""


def _parse_response(raw: str) -> tuple[str, str]:
    """
    Splits the model response into (insight_text, summary_text).
    Falls back gracefully if the model doesn't follow the format exactly.
    """
    insight_text = raw
    summary_text = None

    upper = raw.upper()
    summary_marker = "SUMMARY:"

    if summary_marker in upper:
        split_idx = upper.index(summary_marker)

        before = raw[:split_idx].strip()
        clinical_marker = "CLINICAL INSIGHT:"
        if before.upper().startswith(clinical_marker):
            before = before[len(clinical_marker):].strip()

        insight_text = before
        summary_text = raw[split_idx + len(summary_marker):].strip()

    return insight_text, summary_text


def generate_and_store_insight(session_id: int, fps: int = 30) -> dict:
    """
    Pulls FramePrediction + OpticalFlowResult rows for session_id,
    fetches patient demographics, generates a DeepSeek clinical insight
    and plain-language TL;DR summary, stores both in LLMInsight, and
    returns the result dict.
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

    patient_ctx = _get_patient_context(session_id)
    prompt = _build_prompt(pred_list, flow_list, fps, patient_ctx)

    response = _get_client().chat.completions.create(
        model=MODEL,
        max_tokens=600,  # bumped from 512 to accommodate the summary section
        messages=[{"role": "user", "content": prompt}]
    )

    raw = response.choices[0].message.content.strip()
    insight_text, summary_text = _parse_response(raw)

    insight = LLMInsight(
        session_id=session_id,
        insight_text=insight_text,
        summary_text=summary_text,
        model_used=MODEL,
    )
    db.session.add(insight)
    db.session.commit()

    return {
        "session_id":   session_id,
        "insight_text": insight_text,
        "summary_text": summary_text,
        "model_used":   MODEL,
    }