"""Pydantic schemas for video operations, analysis requests, and responses."""

from typing import Optional, Dict
from pydantic import BaseModel, Field


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
    status: str = Field("pending_ml_integration", description="Inference integration status")


class VideoAnalysisRequest(BaseModel):
    video_id: str = Field(..., description="Unique identifier of previously uploaded video file")


class VideoAnalysisResponse(BaseModel):
    video_id: str = Field(..., description="Unique identifier of analyzed video")
    status: str = Field("completed", description="Status of inference ('completed' or 'error')")
    predicted_shot: str = Field(..., description="Predicted badminton shot category")
    confidence: float = Field(..., description="Confidence probability of predicted shot (0.0 to 1.0)")
    probabilities: Dict[str, float] = Field(..., description="Softmax probabilities for all 5 shot categories")
    frames_used: int = Field(16, description="Number of chronological frames sampled for inference")
    processing_time_ms: float = Field(..., description="Total pipeline execution latency in milliseconds")
    message: str = Field("Video analysis completed successfully.", description="Informational message")
