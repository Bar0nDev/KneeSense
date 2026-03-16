# KneeSense

KneeSense is a visuotactile sensing system for estimating knee joint angles and analyzing quadriceps muscle deformation during movement. The platform combines a machine learning backend with a modern web dashboard to enable real-time biomechanical monitoring and analysis.

The project consists of a **Next.js frontend** for visualization and a **Flask backend** for machine learning inference and data processing.

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
│   │
│   └── app/
│       ├── __init__.py       # Flask app factory
│       ├── config.py         # application configuration
│       │
│       ├── routes/           # API endpoints
│       │   └── angle_routes.py
│       │
│       ├── services/         # business logic
│       │   └── angle_service.py
│       │
│       ├── models/           # ML inference code
│       │   └── inference.py
│       │
│       ├── utils/            # helper utilities
│       │   └── preprocessing.py
│       │
│       └── schemas/          # request/response schemas
│
└── README.md
```

---

# Architecture

The system separates **user interface**, **API logic**, and **machine learning inference**.

```
Visuotactile Sensor
        ↓
Flask Backend
(API + ML Inference)
        ↓
Processed Data
        ↓
Next.js Frontend
(Dashboard + Visualization)
```

### Backend Responsibilities

* Sensor data ingestion
* Knee angle estimation
* ML inference
* Biomechanical analysis
* API endpoints for frontend consumption

### Frontend Responsibilities

* Visualization dashboards
* Data plots and charts
* Muscle deformation display
* User interaction and control

---

# Development Setup

## 1. Clone Repository

```
git clone https://github.com/your-org/kneesense.git
cd kneesense
```

---

# Backend Setup (Flask)

Navigate to the backend directory and create a virtual environment.

```
cd backend
python -m venv .venv
```

Activate the environment.

Mac/Linux:

```
source .venv/bin/activate
```

Windows:

```
.venv\Scripts\activate
```

Install dependencies.

```
pip install -r requirements.txt
```

Run the Flask development server.

```
python run.py
```

Backend runs at:

```
http://localhost:5000
```

---

# Frontend Setup (Next.js)

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

# API Structure

All backend endpoints are exposed under:

```
/api/
```

Example endpoint:

```
GET /api/angle
```

Example response:

```
{
  "angle": 42
}
```

---

# Configuration

Backend configuration is managed through:

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

MODEL_PATH=models/knee_model.pt
DATA_DIR=data/
```

Environment variables should **never be committed to the repository**.

---

# Backend Design

The backend follows a **layered architecture**.

### Routes

Defines API endpoints and handles HTTP requests.

```
routes/
```

### Services

Contains business logic and orchestrates operations.

```
services/
```

### Models

Machine learning inference code.

```
models/
```

### Utilities

Shared helper functions and preprocessing logic.

```
utils/
```

### Schemas

Defines structured request and response formats.

```
schemas/
```

Example request flow:

```
Frontend Request
       ↓
routes/angle_routes.py
       ↓
services/angle_service.py
       ↓
models/inference.py
       ↓
Return prediction
```

---

# Dependency Management

## Backend

Dependencies are tracked in:

```
backend/requirements.txt
```

Update dependencies:

```
pip freeze > requirements.txt
```

## Frontend

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

Terminal 1:

```
cd backend
source .venv/bin/activate
python run.py
```

Terminal 2:

```
cd frontend
npm run dev
```

---

# Contributing

1. Create a feature branch
2. Implement changes
3. Verify frontend and backend both run locally
4. Submit a pull request
