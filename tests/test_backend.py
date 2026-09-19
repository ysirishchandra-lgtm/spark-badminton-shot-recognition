"""
Automated Pytest Suite for SPARK Backend API.
Tests root, health, video upload validation, sanitization, unique ID generation, and storage.
"""

import io
import pytest
from pathlib import Path
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.config import settings
from backend.app.utils.security import sanitize_filename, validate_video_file

client = TestClient(app)


def test_root_endpoint():
    """Verify GET / returns valid service metadata."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["project"] == "SPARK"
    assert data["status"] == "online"
    assert "badminton" in data["title"].lower()


def test_health_endpoint():
    """Verify GET /health conforms exactly to specification."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data == {
        "status": "ok",
        "project": "SPARK",
        "service": "badminton-shot-recognition-api"
    }


def test_video_upload_valid_mp4():
    """Verify valid .mp4 video upload succeeds and stores safely."""
    # Create mock 1KB video binary content
    fake_video_content = b"\x00\x00\x00\x1cftypisom" + b"A" * 1000
    file_payload = {
        "file": ("match_clip_01.mp4", io.BytesIO(fake_video_content), "video/mp4")
    }
    
    response = client.post("/api/video/upload", files=file_payload)
    assert response.status_code == 201
    data = response.json()
    assert "video_id" in data
    assert len(data["video_id"]) > 10
    assert data["filename"] == "match_clip_01.mp4"
    assert data["status"] == "uploaded"
    assert data["size_bytes"] == len(fake_video_content)
    
    # Verify file was actually saved to storage/uploads
    saved_file = settings.UPLOAD_DIR / f"{data['video_id']}_match_clip_01.mp4"
    assert saved_file.exists()
    assert saved_file.stat().st_size == len(fake_video_content)
    
    # Clean up test file
    saved_file.unlink()


def test_video_upload_other_supported_extensions():
    """Verify .mov, .avi, .mkv, .webm are all accepted."""
    for ext in [".mov", ".avi", ".mkv", ".webm"]:
        fake_content = b"TESTVIDEO" + b"X" * 100
        file_payload = {
            "file": (f"test_shot{ext}", io.BytesIO(fake_content), "application/octet-stream")
        }
        res = client.post("/api/video/upload", files=file_payload)
        assert res.status_code == 201
        vid = res.json()["video_id"]
        saved = settings.UPLOAD_DIR / f"{vid}_test_shot{ext}"
        if saved.exists():
            saved.unlink()


def test_video_upload_invalid_extension_rejected():
    """Verify unsupported file types (e.g. .exe, .txt, .pdf) are rejected with HTTP 400."""
    invalid_files = [("malicious.exe", b"MZ"), ("notes.txt", b"hello"), ("data.csv", b"a,b,c")]
    for filename, content in invalid_files:
        payload = {"file": (filename, io.BytesIO(content), "application/octet-stream")}
        response = client.post("/api/video/upload", files=payload)
        assert response.status_code == 400
        data = response.json()
        assert "Invalid file extension" in data["detail"]


def test_video_upload_missing_file():
    """Verify upload without file returns HTTP 422 Unprocessable Entity."""
    response = client.post("/api/video/upload", files={})
    assert response.status_code == 422


def test_filename_sanitization_and_traversal_defense():
    """Verify path traversal attacks and unsafe characters in filename are neutralized."""
    malicious_names = [
        ("../../etc/passwd.mp4", "passwd.mp4"),
        ("..\\..\\windows\\system32.mp4", "system32.mp4"),
        ("test shot; rm -rf.mp4", "test_shot__rm_-rf.mp4"),
    ]
    for raw_name, expected_base in malicious_names:
        sanitized = sanitize_filename(raw_name)
        assert ".." not in sanitized
        assert "/" not in sanitized
        assert "\\" not in sanitized
        assert sanitized.endswith(".mp4")


def test_unique_video_id_generation():
    """Verify each upload gets a distinct UUID."""
    ids = set()
    for _ in range(5):
        payload = {"file": ("rally.mp4", io.BytesIO(b"MOCK" * 20), "video/mp4")}
        res = client.post("/api/video/upload", files=payload)
        assert res.status_code == 201
        v_id = res.json()["video_id"]
        assert v_id not in ids
        ids.add(v_id)
        # Cleanup
        f = settings.UPLOAD_DIR / f"{v_id}_rally.mp4"
        if f.exists():
            f.unlink()
