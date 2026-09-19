"""Video upload, analysis, and processing endpoints."""

import os
import glob
import logging
from pathlib import Path
from fastapi import APIRouter, File, UploadFile, HTTPException, status

from backend.app.core.config import settings
from backend.app.schemas.video import (
    VideoUploadResponse,
    VideoAnalysisRequest,
    VideoAnalysisResponse
)
from backend.app.utils.security import sanitize_filename, validate_video_file, generate_video_id
from backend.app.services.inference_service import analyze_video

logger = logging.getLogger("spark.api.video")

router = APIRouter(prefix="/video", tags=["video"])

# 1MB chunk size for streamed file saving
CHUNK_SIZE = 1024 * 1024


def resolve_video_path(video_id: str) -> Path:
    """
    Securely resolves a video_id to an existing uploaded file in settings.UPLOAD_DIR.
    Prevents path traversal attacks by searching only within the configured upload directory.
    """
    clean_id = sanitize_filename(video_id).strip()
    if not clean_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid video ID provided."
        )

    # Search for files starting with {clean_id}_
    candidates = list(settings.UPLOAD_DIR.glob(f"{clean_id}_*"))
    if not candidates:
        # Check exact ID with extension
        candidates = list(settings.UPLOAD_DIR.glob(f"{clean_id}.*"))

    if not candidates or not candidates[0].is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Video with ID '{clean_id}' was not found."
        )

    target_file = candidates[0].resolve()
    # Path traversal safety check
    if not str(target_file).startswith(str(settings.UPLOAD_DIR.resolve())):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access to specified video path is restricted."
        )

    return target_file


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
        logger.error(f"Error persisting uploaded file: {exc}")
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
        message="Video uploaded successfully and ready for analysis."
    )


@router.post(
    "/analyze",
    response_model=VideoAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze uploaded badminton video",
    description="Executes ResNet-18 feature extraction and EXP23_C temporal inference on 16 chronological frames sampled from the video."
)
async def analyze_video_endpoint(request: VideoAnalysisRequest):
    """
    Locates the video by video_id, runs the EXP23_C inference pipeline,
    and returns predicted shot class and confidence distribution.
    """
    target_path = resolve_video_path(request.video_id)

    try:
        result = analyze_video(str(target_path))
    except ValueError as exc:
        logger.warning(f"Video validation error during analysis: {exc}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc)
        )
    except Exception as exc:
        logger.error(f"Internal inference failure on video {request.video_id}: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during video analysis."
        )

    return VideoAnalysisResponse(
        video_id=request.video_id,
        status=result["status"],
        predicted_shot=result["predicted_shot"],
        confidence=result["confidence"],
        probabilities=result["probabilities"],
        frames_used=result["frames_used"],
        processing_time_ms=result["processing_time_ms"],
        message=result["message"]
    )
