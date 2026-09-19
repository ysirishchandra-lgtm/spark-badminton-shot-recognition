"""
Integration tests for SPARK video upload -> inference API pipeline.
Tests POST /api/video/upload followed by POST /api/video/analyze.
"""

import io
import os
import sys
from pathlib import Path
import tempfile
import pytest
import cv2
import numpy as np
from fastapi.testclient import TestClient

# Ensure SPARK root is on sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.app.main import app
from backend.app.core.config import settings
from backend.app.services.inference_service import CLASS_NAMES

client = TestClient(app)


def generate_test_mp4_bytes(num_frames: int = 24, width: int = 320, height: int = 240) -> bytes:
    """Generates an in-memory MP4 video with `num_frames` using OpenCV."""
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        writer = cv2.VideoWriter(tmp_path, fourcc, 25.0, (width, height))
        for i in range(num_frames):
            frame = np.full((height, width, 3), fill_value=(i * 10) % 255, dtype=np.uint8)
            cv2.rectangle(frame, (50, 50), (150, 150), (0, 255, 0), -1)
            writer.write(frame)
        writer.release()

        with open(tmp_path, "rb") as f:
            video_bytes = f.read()
        return video_bytes
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


class TestApiInference:
    def test_upload_then_analyze_flow(self):
        """Verify full upload -> analyze API flow."""
        # 1. Upload temporary synthetic video
        video_bytes = generate_test_mp4_bytes(num_frames=24)
        files = {
            "file": ("rally_test_clip.mp4", io.BytesIO(video_bytes), "video/mp4")
        }
        upload_res = client.post("/api/video/upload", files=files)
        assert upload_res.status_code == 201
        upload_data = upload_res.json()
        assert "video_id" in upload_data
        video_id = upload_data["video_id"]

        try:
            # 2. Call analyze endpoint
            analyze_res = client.post("/api/video/analyze", json={"video_id": video_id})
            assert analyze_res.status_code == 200

            data = analyze_res.json()
            assert data["video_id"] == video_id
            assert data["status"] == "completed"
            assert data["predicted_shot"] in CLASS_NAMES
            assert 0.0 <= data["confidence"] <= 1.0
            assert data["frames_used"] == 16
            assert data["processing_time_ms"] > 0.0
            assert "probabilities" in data

            probs = data["probabilities"]
            assert len(probs) == 5
            for cls_name in CLASS_NAMES:
                assert cls_name in probs
                assert 0.0 <= probs[cls_name] <= 1.0

            prob_sum = sum(probs.values())
            assert abs(prob_sum - 1.0) < 1e-2

        finally:
            # Clean up uploaded test file from storage
            for p in settings.UPLOAD_DIR.glob(f"{video_id}_*"):
                try:
                    p.unlink()
                except Exception:
                    pass

    def test_analyze_non_existent_video_id(self):
        """Verify analyzing non-existent video_id returns 404."""
        res = client.post("/api/video/analyze", json={"video_id": "non_existent_id_12345"})
        assert res.status_code == 404
        assert "not found" in res.json()["detail"].lower()

    def test_analyze_video_fewer_than_16_frames(self):
        """Verify video with fewer than 16 frames returns 400 Bad Request."""
        short_video_bytes = generate_test_mp4_bytes(num_frames=8)
        files = {
            "file": ("too_short.mp4", io.BytesIO(short_video_bytes), "video/mp4")
        }
        upload_res = client.post("/api/video/upload", files=files)
        assert upload_res.status_code == 201
        video_id = upload_res.json()["video_id"]

        try:
            analyze_res = client.post("/api/video/analyze", json={"video_id": video_id})
            assert analyze_res.status_code == 400
            assert "minimum of 16 frames" in analyze_res.json()["detail"].lower() or "fewer than 16" in analyze_res.json()["detail"].lower()
        finally:
            for p in settings.UPLOAD_DIR.glob(f"{video_id}_*"):
                try:
                    p.unlink()
                except Exception:
                    pass


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
