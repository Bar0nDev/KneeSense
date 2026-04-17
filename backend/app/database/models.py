from datetime import datetime, UTC
from .db import db


# =========================
# USER AUTH
# =========================

class User(db.Model):
    __tablename__ = "users"

    # for firebase uuid
    id = db.Column(db.String(64), primary_key=True)

    name = db.Column(db.String(120), nullable=False)

    username = db.Column(db.String(80), unique=True, nullable=False)

    email = db.Column(db.String(120), unique=True)

    password_hash = db.Column(db.String(255), nullable=False)

    role = db.Column(
        db.String(20),
        nullable=False,
        default="practitioner"
    )  # practitioner, patient, manager, admin

    is_active = db.Column(db.Boolean, nullable=False, default=True)

    created_at = db.Column(
        db.DateTime,
        default=datetime.now(UTC)
    )

    practitioner_profile = db.relationship(
        "Practitioner",
        backref="user",
        uselist=False
    )

    patient_profile = db.relationship(
        "Patient",
        backref="user",
        uselist=False,
        foreign_keys="Patient.user_id"
    )


# =========================
# PRACTITIONER
# =========================

class Practitioner(db.Model):
    __tablename__ = "practitioners"

    id = db.Column(db.String(64), primary_key=True)

    user_id = db.Column(
        db.String(64),
        db.ForeignKey("users.id"),
        nullable=False
    )

    clinic_name = db.Column(db.String(200))

    specialization = db.Column(db.String(200))

    created_at = db.Column(
        db.DateTime,
        default=datetime.now(UTC)
    )

    patients = db.relationship(
        "Patient",
        backref="practitioner",
        lazy=True
    )


# =========================
# PATIENT
# =========================

class Patient(db.Model):
    __tablename__ = "patients"

    id = db.Column(db.String(64), primary_key=True)

    # Set when patient self-registered; null when practitioner created them manually
    user_id = db.Column(
        db.String(64),
        db.ForeignKey("users.id"),
        nullable=True,
        unique=True
    )

    # Null until a practitioner assigns/claims them
    practitioner_id = db.Column(
        db.String(64),
        db.ForeignKey("practitioners.id"),
        nullable=True
    )

    name = db.Column(db.String(120), nullable=False)

    birthday = db.Column(db.Date)

    sex = db.Column(db.String(10))

    height_cm = db.Column(db.Float)

    weight_kg = db.Column(db.Float)

    notes = db.Column(db.Text)

    is_active = db.Column(db.Boolean, nullable=False, default=True)

    created_at = db.Column(
        db.DateTime,
        default=datetime.now(UTC)
    )

    sessions = db.relationship(
        "Session",
        backref="patient",
        lazy=True
    )


# =========================
# SESSION
# =========================

class Session(db.Model):
    __tablename__ = "sessions"

    id = db.Column(db.String(64), primary_key=True)

    patient_id = db.Column(
        db.String(64),
        db.ForeignKey("patients.id"),
        nullable=False
    )

    # Nullable — patient may not have a practitioner yet when uploading
    practitioner_id = db.Column(
        db.String(64),
        db.ForeignKey("practitioners.id"),
        nullable=True
    )

    video_path = db.Column(db.String(255))

    fps = db.Column(db.Integer, default=30)

    notes = db.Column(db.Text)

    created_at = db.Column(
        db.DateTime,
        default=datetime.now(UTC)
    )

    frame_predictions = db.relationship(
        "FramePrediction",
        backref="session",
        lazy=True
    )

    llm_insights = db.relationship(
        "LLMInsight",
        backref="session",
        lazy=True
    )

    optical_flow_results = db.relationship(
        "OpticalFlowResult",
        backref="session",
        lazy=True
    )


# =========================
# EXERCISE LIBRARY
# =========================

class Exercise(db.Model):
    __tablename__ = "exercises"

    id = db.Column(db.Integer, primary_key=True)

    practitioner_id = db.Column(
        db.Integer,
        db.ForeignKey("practitioners.id"),
        nullable=False
    )

    name = db.Column(db.String(200), nullable=False)

    instructions = db.Column(db.Text)

    difficulty = db.Column(db.String(20))  # Beginner, Intermediate, Advanced

    default_sets = db.Column(db.Integer, default=3)

    default_reps = db.Column(db.Integer, default=10)

    reps_min = db.Column(db.Integer)

    reps_max = db.Column(db.Integer)

    media_url = db.Column(db.String(500))

    patient_featured = db.Column(db.Boolean, default=False)

    is_favorite = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, default=datetime.now(UTC))


# =========================
# TEMPLATE LIBRARY
# =========================

class Template(db.Model):
    __tablename__ = "templates"

    id = db.Column(db.Integer, primary_key=True)

    practitioner_id = db.Column(
        db.Integer,
        db.ForeignKey("practitioners.id"),
        nullable=False
    )

    name = db.Column(db.String(200), nullable=False)

    sub_label = db.Column(db.String(200))

    is_favorite = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, default=datetime.now(UTC))

    exercises = db.relationship(
        "TemplateExercise",
        backref="template",
        lazy=True,
        cascade="all, delete-orphan",
        order_by="TemplateExercise.position"
    )


class TemplateExercise(db.Model):
    __tablename__ = "template_exercises"

    id = db.Column(db.Integer, primary_key=True)

    template_id = db.Column(
        db.Integer,
        db.ForeignKey("templates.id"),
        nullable=False
    )

    exercise_id = db.Column(
        db.Integer,
        db.ForeignKey("exercises.id"),
        nullable=False
    )

    position = db.Column(db.Integer, default=0)

    sets_override = db.Column(db.Integer)

    reps_override = db.Column(db.Integer)

    exercise_ref = db.relationship("Exercise", lazy="joined")


# =========================
# FRAME PREDICTIONS
# =========================

class FramePrediction(db.Model):
    __tablename__ = "frame_predictions"

    id = db.Column(db.String(64), primary_key=True)

    session_id = db.Column(
        db.String(64),
        db.ForeignKey("sessions.id"),
        nullable=False
    )

    frame_index = db.Column(db.Integer, nullable=False)

    predicted_angle = db.Column(db.Float)

    created_at = db.Column(
        db.DateTime,
        default=datetime.now(UTC)
    )


# =========================
# LLM INSIGHTS
# =========================

class LLMInsight(db.Model):
    __tablename__ = "llm_insights"

    id = db.Column(db.String(64), primary_key=True)

    session_id = db.Column(
        db.String(64),
        db.ForeignKey("sessions.id"),
        nullable=False
    )

    insight_text = db.Column(db.Text)
    summary_text = db.Column(db.Text)

    model_used = db.Column(db.String(100))

    created_at = db.Column(
        db.DateTime,
        default=datetime.now(UTC)
    )

# =========================
# OPTICAL FLOW RESULTS
# =========================

class OpticalFlowResult(db.Model):
    __tablename__ = "optical_flow_results"

    id = db.Column(db.String(64), primary_key=True)

    session_id = db.Column(
        db.String(64),
        db.ForeignKey("sessions.id"),
        nullable=False,
        index=True
    )

    frame_index = db.Column(db.Integer, nullable=False)

    zone1_score   = db.Column(db.Float, nullable=False)
    zone2_score   = db.Column(db.Float, nullable=False)
    zone3_score   = db.Column(db.Float, nullable=False)

    zone1_percent = db.Column(db.Float, nullable=False)
    zone2_percent = db.Column(db.Float, nullable=False)
    zone3_percent = db.Column(db.Float, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.now(UTC))