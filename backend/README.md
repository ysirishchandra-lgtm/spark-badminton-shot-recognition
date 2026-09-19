# SPARK Backend Service

FastAPI-powered backend service for the **SPARK Badminton Shot Recognition** application.

## Overview
Provides video upload handling, validation, sanitization, disk streaming, health monitoring, and CORS management for the Next.js frontend.

## Directory Structure
```
backend/
├── app/
│   ├── main.py               # FastAPI entrypoint, routes, and CORS setup
│   ├── api/
│   │   ├── __init__.py
│   │   └── video.py          # Video upload endpoint (POST /api/video/upload)
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py         # Configurable settings (MAX_UPLOAD_SIZE_MB, paths)
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── video.py          # Pydantic models for responses and health checks
│   ├── services/
│   │   ├── __init__.py
│   │   └── inference_service.py # Integration boundary for future ML inference
│   └── utils/
│       ├── __init__.py
│       └── security.py       # Filename sanitization, traversal protection, extensions
├── storage/
│   └── uploads/              # Local storage for received videos (.gitignored)
├── requirements.txt
└── README.md
```

## API Endpoints

| Method | Path | Description | Expected Status |
|---|---|---|---|
| `GET` | `/` | Service root & API metadata | 200 OK |
| `GET` | `/health` | System health check | 200 OK |
| `POST` | `/api/video/upload` | Multipart video upload (`.mp4`, `.mov`, `.avi`, `.mkv`, `.webm`) | 201 Created |
| `GET` | `/docs` | Interactive Swagger UI documentation | 200 OK |

## Configuration
All settings can be customized using environment variables or a `.env` file:
- `MAX_UPLOAD_SIZE_MB`: Maximum permitted upload size in megabytes (Default: `200`). Can be increased for raw-match videos.
- `CORS_ORIGINS`: Allowed client origins for CORS.

## Running the Backend

From the SPARK project root (`D:\PS_DATA\SPARK`):
```bash
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive documentation is available at `http://localhost:8000/docs`.
