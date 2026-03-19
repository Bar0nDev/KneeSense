# KneeSense

KneeSense is a visuotactile sensing system for estimating knee joint angles and analyzing quadriceps muscle deformation during movement. The platform combines machine learning inference with a web dashboard to enable real-time biomechanical monitoring and clinical analysis.

The system consists of a **Next.js frontend** for visualization and a **Flask backend** that handles ML inference, database storage, and API services.

---

# Repository Structure

```
kneesense/
│
├── frontend/                 # Next.js application
│   ├── app/
│   ├── public/
│   ├── package.json
│   └── next.config.js
│
├── backend/                  # Flask backend API
│   ├── .venv/
│   ├── run.py                # Flask entrypoint
│   ├── requirements.txt
│   ├── .env
│
│   └── app/
│       ├── __init__.py       # Flask app factory
│       ├── config.py         # configuration
│
│       ├── database/
│       │   ├── db.py         # SQLAlchemy instance
│       │   └── models.py     # database schema
│
│       ├── routes/           # Flask blueprints
│       │   ├── user_routes.py
│       │   ├── patient_routes.py
│       │   └── session_routes.py
│
│       ├── services/         # business logic
│       │   ├── inference_service.py
│       │   └── session_service.py
│
│       ├── models/           # ML inference code
│       │   └── inference.py
│
│       └── utils/            # shared utilities
│           └── preprocessing.py
│
└── README.md
```

---

# System Architecture

KneeSense separates **data ingestion, machine learning inference, and visualization**.

```
Visuotactile Sensor
        ↓
Flask Backend
(API + ML Inference + Database)
        ↓
Processed Data
        ↓
Next.js Frontend
(Dashboard + Visualization)
```

---

# Backend Responsibilities

The Flask backend handles:

* Sensor data ingestion
* Knee angle estimation using a temporal CNN
* Frame-level prediction storage
* Biomechanical analysis
* LLM-generated clinical insights
* User / practitioner / patient management
* API endpoints for frontend access

---

# Frontend Responsibilities

The Next.js frontend provides:

* interactive dashboards
* session visualization
* angle plots
* muscle deformation analytics
* clinician interaction tools

---

# Machine Learning Pipeline

KneeSense uses a **temporal CNN based on ResNet18** to estimate knee joint angles.

The model operates on **9-frame temporal windows** extracted from a 30 FPS visuotactile video stream.

```
9 frames
   ↓
Stacked tensor (27 channels)
   ↓
ResNet18 backbone
   ↓
Regression head
   ↓
Predicted knee angle
```

Predictions are stored per frame in the database for further analysis and visualization.

---

# Database Design

The backend uses **Flask-SQLAlchemy** for relational data storage.

Core entities:

```
User
   ↓
Practitioner
   ↓
Patients
   ↓
Sessions
   ↓
Frame Predictions
   ↓
LLM Insights
```

Example workflow:

```
Practitioner
     ↓
Creates patient
     ↓
Uploads session
     ↓
ML model predicts angles
     ↓
Predictions stored per frame
     ↓
LLM generates biomechanical insight
```

---

# API Design

All endpoints are exposed under:

```
/api/
```

Example routes:

```
POST /api/users/register
POST /api/users/login

POST /api/patients
GET  /api/patients/{id}

POST /api/sessions
GET  /api/patients/{id}/sessions

POST /api/sessions/{id}/predictions
POST /api/sessions/{id}/insight
```

The backend uses **Flask Blueprints** to modularize API routes by domain.

---

# Development Setup

## Clone the Repository

```
git clone https://github.com/your-org/kneesense.git
cd kneesense
```

---

# Backend Setup

Navigate to the backend directory and create a virtual environment.

```
cd backend
python -m venv .venv
```

Activate the environment.

Mac/Linux

```
source .venv/bin/activate
```

Windows

```
.venv\Scripts\activate
```

Install dependencies.

```
pip install -r requirements.txt
```

Run the backend server.

```
python run.py
```

Backend runs at:

```
http://localhost:5000
```

Backend API Documentation (SwaggerUI) runs at:

```
http://localhost:5000/apidocs/#/
```

---

# Frontend Setup

Install dependencies and start the development server.

```
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:3000
```

---

# Configuration

Backend configuration is managed via:

```
backend/app/config.py
```

Environment variables are loaded from:

```
backend/.env
```

Example `.env`:

```
DEBUG=True
SECRET_KEY=dev-secret

DATABASE_URL=sqlite:///kneesense.db

MODEL_PATH=models/knee_model.pt
DATA_DIR=data/
```

Environment variables should **never be committed to the repository**.

---

# Dependency Management

### Backend

Dependencies are tracked in:

```
backend/requirements.txt
```

Update dependencies:

```
pip freeze > requirements.txt
```

### Frontend

Dependencies are tracked in:

```
frontend/package.json
```

Install dependencies:

```
npm install
```

---

# Development Workflow

Run frontend and backend in separate terminals.

Terminal 1

```
cd backend
source .venv/bin/activate
python run.py
```

Terminal 2

```
cd frontend
npm run dev
```

---

# Contributing

1. Create a feature branch
2. Implement changes
3. Ensure backend and frontend run locally
4. Submit a pull request
