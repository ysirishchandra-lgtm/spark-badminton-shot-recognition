"""Video upload and processing endpoints."""

import os
import shutil
from pathlib import Path
from fastapi import APIRouter, File, UploadFile, HTTPException, status
from backend.app.core.config import settings
from backend.app.schemas.video import VideoUploadResponse
from backend.app.utils.security import sanitize_filename, validate_video_file, generate_video_id

router = APIRouter(prefix="/video", tags=["video"])

# 1MB chunk size for streamed file saving
CHUNK_SIZE = 1024 * 1024


@router.post(
    "/upload",
    response_model=VideoUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload badminton match video",
    description="Accepts video file (.mp4, .mov, .avi, .mkv, .webm), validates format and size, safely persists to disk, and returns a unique video_id."
)
async def upload_video(file: UploadFile = File(...)):
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided in the upload request."
        )
    
    # 1. Validate file extension
    is_valid, ext = validate_video_file(file.filename)
    if not is_valid:
        allowed = ", ".join(sorted(settings.ALLOWED_EXTENSIONS))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file extension '{ext or 'none'}'. Supported video formats are: {allowed}"
        )
    
    # 2. Sanitize original filename & generate secure video_id
    sanitized_name = sanitize_filename(file.filename)
    video_id = generate_video_id()
    
    # Unique server-side stored filename prevents collisions and execution
    server_filename = f"{video_id}_{sanitized_name}"
    target_path = settings.UPLOAD_DIR / server_filename
    
    # 3. Stream to disk and enforce configurable MAX_UPLOAD_SIZE_MB
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    total_bytes = 0
    
    try:
        with open(target_path, "wb") as out_file:
            while chunk := await file.read(CHUNK_SIZE):
                total_bytes += len(chunk)
                if total_bytes > max_bytes:
                    out_file.close()
                    if target_path.exists():
                        target_path.unlink()
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File exceeds maximum allowed upload size of {settings.MAX_UPLOAD_SIZE_MB}MB."
                    )
                out_file.write(chunk)
    except HTTPException:
        raise
    except Exception as exc:
        if target_path.exists():
            target_path.unlink()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while saving the uploaded video."
        ) from exc
    finally:
        await file.close()
        
    return VideoUploadResponse(
        video_id=video_id,
        filename=sanitized_name,
        status="uploaded",
        size_bytes=total_bytes,
        message="Video uploaded successfully and queued for analysis."
    )
