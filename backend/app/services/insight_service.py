"""
app/services/insight_service.py

Generates a clinical insight + short TL;DR summary from a session's frame
predictions and optical flow using Claude, then stores both in LLMInsight.

Patient context (height, weight, age, sex) is fetched directly from the DB
via session_id → Session.patient_id → Patient.

SESSION PARADIGM — SEATED EXTENSION:
  The patient is seated; the knee starts in a resting flexed position
  (~80–90°) and extends toward full straightening.
  Higher angle  = more extension (straighter leg).
  Lower angle   = more flexion (more bent).
  Normal resting flexion  ≈ 80–90°.
  Extension is classified by soft bands (see EXTENSION_BANDS) rather than a
  hard target, because real-world sensor readings at full extension typically
  land around 155–165°, not the anatomical 170–180°.
  Functional extension threshold (e.g. stair-climbing): ≈ 120°.
"""

import os
import json
from datetime import date
import anthropic
import numpy as np

from app.database.firebase.firebase_db import get_fs_db

MODEL = "claude-haiku-4-5-20251001"

_client = None

# ---------------------------------------------------------------------------
# Seated-extension paradigm reference values
# ---------------------------------------------------------------------------
PARADIGM_LABEL       = "seated knee extension"
REST_FLEXION_RANGE   = (80, 90)  # expected resting angle (degrees)
FUNCTIONAL_THRESHOLD = 120       # minimum extension for basic function (stair-climbing etc.)

# Soft extension classification bands (sensor-adjusted; real readings at full
# extension typically land ~155–165°, not the anatomical 170–180° ceiling).
# Each tuple: (min_inclusive, label, clinical_note)
# Evaluated top-down; first matching band wins.
EXTENSION_BANDS = [
    (155, "full extension",
     "Peak extension is within the normal sensor-measured range for full extension "
     "(≥155°). No extension deficit identified."),
    (140, "mildly limited extension",
     "Peak extension is mildly limited (140–154°). This may reflect soft-tissue "
     "tightness, early post-operative guarding, or mild quadriceps weakness."),
    (120, "moderately limited extension",
     "Peak extension is moderately limited (120–139°). The patient clears the "
     f"{FUNCTIONAL_THRESHOLD}° functional threshold but has a meaningful deficit "
     "that warrants targeted strengthening or manual therapy."),
    (0,   "notably limited extension",
     f"Peak extension is notably limited (<120°), falling below the "
     f"{FUNCTIONAL_THRESHOLD}° functional threshold. This level of restriction "
     "may significantly impact activities of daily living and should be "
     "prioritised in the treatment plan."),
]

# Noise-robust ROM: use 5th/95th percentiles instead of raw min/max
ROM_LOW_PCT  = 5
ROM_HIGH_PCT = 95


def _get_client():
    global _client
    if _client is None:
        api_key = os.getenv("CLAUDE_API_KEY")
        if not api_key:
            raise RuntimeError("CLAUDE_API_KEY not set in environment")
        _client = anthropic.Anthropic(api_key=api_key)
    return _client


def _get_patient_context(session_id: str) -> dict:
    """
    Fetches patient demographics for a session from Firestore.
    Returns a dict with age, sex, height_cm, weight_kg (all nullable).
    """
    fs_db = get_fs_db()

    session_doc = fs_db.collection("sessions").document(session_id).get()
    if not session_doc.exists:
        return {}

    patient_id = session_doc.to_dict().get("patient_id")
    if not patient_id:
        return {}

    patient_doc = fs_db.collection("patients").document(str(patient_id)).get()
    if not patient_doc.exists:
        return {}

    patient = patient_doc.to_dict()
    age = None
    birthday = patient.get("birthday")
    if birthday:
        try:
            bday = date.fromisoformat(str(birthday))
            today = date.today()
            age = today.year - bday.year - ((today.month, today.day) < (bday.month, bday.day))
        except (ValueError, TypeError):
            pass

    return {
        "age":       age,
        "sex":       patient.get("sex"),
        "height_cm": patient.get("height_cm"),
        "weight_kg": patient.get("weight_kg"),
        "notes":     patient.get("notes"),
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


def _compute_angle_stats(angles: list[float], frames: list[int], fps: int) -> dict:
    """
    Computes noise-robust angle statistics for the seated-extension paradigm.

    Key design decisions:
    - ROM uses 5th/95th percentile bounds instead of raw min/max to suppress
      CNN outlier spikes from occlusion or rapid motion.
    - Smoothness is the median (not mean) frame-to-frame delta to resist the
      same spikes inflating the average.
    - Peak extension = highest angle reached (most straightened position).
    - Resting angle  = median of the first 10% of frames (steady seated state).
    """
    arr = np.array(angles)

    p5  = float(np.percentile(arr, ROM_LOW_PCT))
    p95 = float(np.percentile(arr, ROM_HIGH_PCT))
    rom_robust = round(p95 - p5, 1)

    mean_angle = round(float(np.mean(arr)), 1)
    std_angle  = round(float(np.std(arr)), 1)

    # Noise-robust smoothness: median |Δangle| per frame
    diffs = np.abs(np.diff(arr))
    smoothness = round(float(np.median(diffs)), 2) if len(diffs) else 0.0

    # Peak extension (highest angle = most extended)
    peak_ext_idx   = int(np.argmax(arr))
    peak_ext_angle = round(float(arr[peak_ext_idx]), 1)
    peak_ext_frame = frames[peak_ext_idx]
    peak_ext_time  = round(peak_ext_frame / fps, 2)

    # Resting angle: median of first 10% of frames
    n_rest = max(1, len(arr) // 10)
    resting_angle = round(float(np.median(arr[:n_rest])), 1)

    duration_sec = round(len(frames) / fps, 1)

    return {
        "duration_sec":    duration_sec,
        "n_frames":        len(frames),
        "p5":              round(p5, 1),
        "p95":             round(p95, 1),
        "rom_robust":      rom_robust,
        "mean_angle":      mean_angle,
        "std_angle":       std_angle,
        "smoothness":      smoothness,
        "peak_ext_angle":  peak_ext_angle,
        "peak_ext_frame":  peak_ext_frame,
        "peak_ext_time":   peak_ext_time,
        "resting_angle":   resting_angle,
    }


def _build_prompt(
    predictions: list[dict],
    flow_data: list[dict],
    fps: int,
    patient_ctx: dict,
) -> str:
    angles = [p["predicted_angle"] for p in predictions]
    frames = [p["frame_index"] for p in predictions]

    s = _compute_angle_stats(angles, frames, fps)

    # Soft extension classification — band lookup (top-down, first match wins)
    ext_label, ext_note = "unknown", ""
    for min_thresh, label, note in EXTENSION_BANDS:
        if s["peak_ext_angle"] >= min_thresh:
            ext_label, ext_note = label, note
            break

    # Whether resting angle is plausible
    rest_note = ""
    lo, hi = REST_FLEXION_RANGE
    if s["resting_angle"] < lo - 10:
        rest_note = (
            f"  Note: resting angle ({s['resting_angle']}°) is lower than expected "
            f"({lo}–{hi}°); the patient may have started in a more flexed position "
            f"or the video captures earlier motion."
        )
    elif s["resting_angle"] > hi + 15:
        rest_note = (
            f"  Note: resting angle ({s['resting_angle']}°) is higher than expected "
            f"({lo}–{hi}°); the patient may have started from a more extended position."
        )

    series_str = ", ".join(str(round(a, 1)) for a in angles[:30])
    if len(angles) > 30:
        series_str += f" … ({len(angles)} frames total)"

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

        flow_section = (
            "\nOPTICAL FLOW — ZONE LOAD DISTRIBUTION "
            "(% of total motion per zone, averaged across session):\n"
            f"- Zone 1 (left):   {avg_z1}%\n"
            f"- Zone 2 (center): {avg_z2}%\n"
            f"- Zone 3 (right):  {avg_z3}%\n"
            f"- Dominant motion zone: {dominant_zone}\n"
        )

    patient_section = _build_patient_section(patient_ctx)

    return f"""You are a physical therapy assistant analyzing knee motion data from a video session.

        PARADIGM: {PARADIGM_LABEL.upper()}
        The patient is seated. The knee starts in a resting flexed position and extends toward full straightening.
        - Higher angle = more extension (leg straighter).
        - Lower angle  = more flexion (leg more bent).
        - Normal resting flexion:  {REST_FLEXION_RANGE[0]}–{REST_FLEXION_RANGE[1]}°
        - Functional threshold:    ≥{FUNCTIONAL_THRESHOLD}° for basic activities (e.g. stair climbing)
        - Extension is classified by sensor-adjusted bands (NOT a hard 170–180° anatomical target,
        since real sensor readings at full extension typically land around 155–165°):
            ≥155°      → full extension (no deficit)
            140–154°   → mildly limited
            120–139°   → moderately limited (above functional threshold)
            <120°      → notably limited (below functional threshold)

        NOISE CAVEAT: Angles are predicted by a CNN and contain frame-to-frame noise from model uncertainty,
        occlusion, and rapid motion. ROM is reported using the 5th–95th percentile window (not raw min/max)
        to suppress outlier spikes. Smoothness uses the median per-frame delta for the same reason.
        Do not over-interpret individual frame values; focus on aggregate trends and percentile-bounded stats.

        {patient_section}
        SESSION STATS:
        - Duration: {s['duration_sec']}s ({s['n_frames']} frames at {fps} fps)
        - Resting angle (median, first 10% of frames): {s['resting_angle']}°{rest_note}
        - Peak extension reached: {s['peak_ext_angle']}° at frame {s['peak_ext_frame']} ({s['peak_ext_time']}s)
        - Extension classification: {ext_label} — {ext_note}
        - Robust ROM (p5–p95): {s['rom_robust']}°  (p5={s['p5']}°, p95={s['p95']}°)
        - Mean angle: {s['mean_angle']}° ± {s['std_angle']}°
        - Smoothness (median |Δangle|/frame): {s['smoothness']}°/frame  (lower = smoother)
        {flow_section}
        ANGLE SERIES (degrees, first 30 frames shown):
        {series_str}

        Respond with exactly two sections using these headers:

        CLINICAL INSIGHT:
        Write 3–5 sentences for a physiotherapist covering:
        1. ROM and extension adequacy: use the extension classification band already provided ("Extension classification" in the stats). Do NOT invent a numeric deficit against a hard target — the classification bands already account for real-world sensor readings.
        2. Movement quality: comment on smoothness and whether the std or motion pattern suggests hesitation, pain-avoidance, or consistent effort.
        3. Zone load distribution and what lateral/medial bias may indicate biomechanically.
        4. Any notable patterns or compensatory movement visible in the angle series.
        5. One specific, actionable recommendation for the clinician.
        Where relevant, factor in the patient's age, sex, BMI, and any clinical notes.

        SUMMARY:
        Write 1–2 sentences in plain language summarizing the key finding and the single most important action item. Avoid jargon — this may be shown to the patient directly.

        Be factual, professional, and avoid speculation beyond what the data supports. DO NOT USE MARKUP LANGUAGE AND ONLY OUTPUT PLAIN TEXT"""


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


def generate_and_store_insight(session_id: str, json_path: str, fps: int = 30) -> dict:
    """
    Reads predictions and flow data from the session JSON file,
    fetches patient demographics from Firestore, generates a Claude
    clinical insight and TL;DR summary, and returns the result dict.
    Saving to Firestore is handled by the caller via mark_insight_complete.
    """
    if not os.path.exists(json_path):
        raise ValueError(f"No analysis JSON found for session {session_id}. Run /analyze first.")

    with open(json_path, "r") as f:
        data = json.load(f)

    pred_list = data.get("predictions", [])
    flow_list = data.get("flow_results", [])

    if not pred_list:
        raise ValueError(f"No predictions found for session {session_id}. Run /analyze first.")

    patient_ctx = _get_patient_context(session_id)
    prompt = _build_prompt(pred_list, flow_list, fps, patient_ctx)

    response = _get_client().messages.create(
        model=MODEL,
        max_tokens=700,
        messages=[{"role": "user", "content": prompt}]
    )

    raw = response.content[0].text.strip()
    insight_text, summary_text = _parse_response(raw)

    return {
        "session_id":   session_id,
        "insight_text": insight_text,
        "summary_text": summary_text,
        "model_used":   MODEL,
    }