import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration"""

    # Flask settings
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    DEBUG = os.getenv("DEBUG", "False") == "True"

    # API settings
    API_PREFIX = "/api"

    # Model configuration
    MODEL_PATH = os.getenv("MODEL_PATH", "models/knee_model.pth")

    # Data storage
    DATA_DIR = os.getenv("DATA_DIR", "data/")

    # Sensor settings
    SENSOR_FRAME_RATE = int(os.getenv("SENSOR_FRAME_RATE", 30))

    # CORS settings
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*")

    # Database settings
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "sqlite:///kneesense.db"
    )

    # Firebase settings
    FIREBASE_KEY_PATH = os.getenv(
        "FIREBASE_KEY_PATH",
        "app/database/firebase/firebase-key.json"
    )

    #LLM-Insights settings
    DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")

    SQLALCHEMY_TRACK_MODIFICATIONS = False