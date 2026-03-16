# KneeSense

KneeSense is a visuotactile sensing system for estimating knee joint angles and analyzing quadriceps muscle deformation during movement. The project combines a machine learning backend with a modern web dashboard to enable real-time biomechanical monitoring and analysis.

## Architecture

The repository contains two main components:

```
kneesense/
├── frontend/    # Next.js frontend application
├── backend/     # Flask API and ML inference services
└── README.md
```

### Frontend

* Framework: **Next.js**
* Purpose: User interface, dashboards, and data visualization
* Responsibilities:

  * Display knee angle estimates
  * Visualize regional muscle deformation
  * Present AI-generated biomechanical insights
  * Interface for clinicians/researchers

### Backend

* Framework: **Flask**
* Purpose: Data processing, machine learning inference, and API services
* Responsibilities:

  * Process visuotactile sensor data
  * Run the knee angle estimation model
  * Serve API endpoints for the frontend
  * Generate biomechanical analysis

### System Flow

```
Sensor Input
     ↓
Flask Backend (API + ML Inference)
     ↓
Processed Data / Predictions
     ↓
Next.js Frontend (Visualization Dashboard)
```

## Development Setup

### 1. Clone the Repository

```
git clone https://github.com/your-org/kneesense.git
cd kneesense
```

---

## Backend Setup (Flask)

Create and activate a Python virtual environment inside the backend directory.

```
cd backend
python -m venv .venv
```

Activate the environment:

**Mac/Linux**

```
source .venv/bin/activate
```

**Windows**

```
.venv\Scripts\activate
```

Install dependencies:

```
pip install -r requirements.txt
```

Run the Flask development server:

```
python app.py
```

Backend will run at:

```
http://localhost:5000
```

---

## Frontend Setup (Next.js)

Install dependencies and start the development server.

```
cd frontend
npm install
npm run dev
```

Frontend will run at:

```
http://localhost:3000
```

---

## API Communication

The Next.js frontend communicates with the Flask backend via HTTP requests.

Example request:

```
GET /api/angle
```

Example response:

```
{
  "angle": 42
}
```

During development, the frontend expects the backend to run locally on:

```
http://localhost:5000
```

---

## Environment Variables

Environment variables should not be committed to the repository.

Create `.env` files as needed.

Example backend configuration:

```
backend/.env
MODEL_PATH=models/knee_model.pt
```

Example frontend configuration:

```
frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Dependency Management

### Backend

Dependencies are managed with `pip` and tracked in:

```
backend/requirements.txt
```

Update dependencies with:

```
pip freeze > requirements.txt
```

### Frontend

Dependencies are managed with `npm` and tracked in:

```
frontend/package.json
```

---

## Recommended Development Workflow

Run backend and frontend in separate terminals:

Terminal 1:

```
cd backend
source .venv/bin/activate
python app.py
```

Terminal 2:

```
cd frontend
npm run dev
```

---

## Contributing

1. Create a feature branch.
2. Implement changes.
3. Ensure backend and frontend both run locally.
4. Submit a pull request.