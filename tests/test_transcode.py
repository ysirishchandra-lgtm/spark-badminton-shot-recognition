"""
Tests for Video Streaming and Transcoding API endpoints.
Validates codec inspection, streaming response, and automatic transcoding to H.264 MP4.
"""

import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.app.main import app
from backend.app.core.config import settings
from backend.app.services.transcode_service import inspect_video_codec, transcode_to_h264

client = TestClient(app)


def test_inspect_video_codec_on_sample():
    """Verify inspect_video_codec identifies H.264 sample correctly."""
    sample_path = ROOT_DIR / "demo_badminton_match16.mp4"
    if sample_path.exists():
        is_compat, codec = inspect_video_codec(sample_path)
        assert is_compat is True
        assert codec.lower() in ["h264", "avc1"]


def test_stream_video_endpoint():
    """Verify /api/video/stream/{video_id} returns 200 with video/mp4 media type."""
    # Find an existing video in UPLOAD_DIR
    files = list(settings.UPLOAD_DIR.glob("*.*"))
    test_files = [f for f in files if f.is_file() and not f.name.startswith(".")]
    if not test_files:
        pytest.skip("No test files in uploads directory.")

    first_file = test_files[0]
    # Extract video_id (before the first underscore or dot)
    video_id = first_file.name.split("_")[0]
    res = client.get(f"/api/video/stream/{video_id}")
    assert res.status_code == 200
    assert res.headers.get("content-type") == "video/mp4"


def test_transcode_endpoint():
    """Verify /api/video/transcode/{video_id} returns a valid stream_url."""
    files = list(settings.UPLOAD_DIR.glob("*.*"))
    test_files = [f for f in files if f.is_file() and not f.name.startswith(".")]
    if not test_files:
        pytest.skip("No test files in uploads directory.")

    first_file = test_files[0]
    video_id = first_file.name.split("_")[0]
    res = client.post(f"/api/video/transcode/{video_id}")
    assert res.status_code == 200
    data = res.json()
    assert "status" in data
    if data["status"] == "ready":
        assert "stream_url" in data
