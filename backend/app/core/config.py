"""
Application Configuration for SPARK Backend.
Supports dynamic environment overrides via .env or system environment variables.
"""

from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "SPARK"
    SERVICE_NAME: str = "badminton-shot-recognition-api"
    API_V1_PREFIX: str = "/api"
    
    # Configurable upload size limit in Megabytes (default: 200MB, easily overridden for raw match videos)
    MAX_UPLOAD_SIZE_MB: int = 200
    
    # Supported video formats for upload
    ALLOWED_EXTENSIONS: set = {".mp4", ".mov", ".avi", ".mkv", ".webm"}
    
    # Storage directories (resolved relative to backend root)
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    UPLOAD_DIR: Path = BASE_DIR / "storage" / "uploads"
    
    # CORS configuration for development frontend
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "https://plots-only-antivirus-wilderness.trycloudflare.com"
    ]
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()

# Ensure upload directory exists
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
