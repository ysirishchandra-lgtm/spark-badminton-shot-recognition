"""
SPARK — AI-Powered Badminton Shot Recognition.
FastAPI Backend Application Entrypoint.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.api.video import router as video_router
from backend.app.schemas.video import HealthResponse

# Initialize FastAPI application
app = FastAPI(
    title="SPARK — AI-Powered Badminton Shot Recognition API",
    description=(
        "Backend service for badminton match video processing, shot recognition, "
        "and temporal video analysis. Powered by deep learning and spatial-temporal modeling."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for local development & frontend connectivity
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["system"])
async def root():
    """Root endpoint identifying the SPARK API service."""
    return {
        "project": "SPARK",
        "title": "AI-Powered Badminton Shot Recognition",
        "version": "1.0.0",
        "service": settings.SERVICE_NAME,
        "status": "online",
        "docs_url": "/docs",
        "message": "Welcome to the SPARK Badminton Shot Recognition API. Visit /docs for interactive API documentation."
    }


@app.get("/health", response_model=HealthResponse, tags=["system"])
async def health():
    """Health check endpoint conforming strictly to specification."""
    return {
        "status": "ok",
        "project": "SPARK",
        "service": "badminton-shot-recognition-api"
    }


# Mount API routers
app.include_router(video_router, prefix=settings.API_V1_PREFIX)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
