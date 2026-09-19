"""Pydantic schemas for video operations and responses."""

from pydantic import BaseModel, Field
from typing import Optional


class VideoUploadResponse(BaseModel):
    video_id: str = Field(..., description="Unique generated identifier for uploaded video")
    filename: str = Field(..., description="Sanitized original filename")
    status: str = Field("uploaded", description="Current status of the video")
    size_bytes: Optional[int] = Field(None, description="Size of the uploaded file in bytes")
    message: Optional[str] = Field(None, description="Optional informational message")


class HealthResponse(BaseModel):
    status: str = Field("ok", json_schema_extra={"example": "ok"})
    project: str = Field("SPARK", json_schema_extra={"example": "SPARK"})
    service: str = Field("badminton-shot-recognition-api", json_schema_extra={"example": "badminton-shot-recognition-api"})


class VideoAnalysisPlaceholder(BaseModel):
    video_id: str
    predicted_shot: Optional[str] = Field(None, description="Predicted class placeholder ('—')")
    confidence: Optional[float] = Field(None, description="Confidence placeholder ('—')")
    processing_time: Optional[float] = Field(None, description="Processing time placeholder ('—')")
    status: str = Field("pending_ml_integration", description="Inference integration scheduled for Day 19")
