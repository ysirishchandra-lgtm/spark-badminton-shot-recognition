"""
End-to-End Integration Test for SPARK Live Servers.
Verifies FastAPI backend, Next.js frontend, and Video Upload API live on ports 8000 and 3000.
"""

import sys
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import urllib.request
import json
import httpx
from backend.app.core.config import settings

def test_e2e_integration():
    print("\n--- 1. Testing FastAPI Root Endpoint ---")
    with urllib.request.urlopen("http://127.0.0.1:8000/") as resp:
        assert resp.status == 200
        data = json.loads(resp.read().decode())
        print(f"Root response: {data}")
        assert data["project"] == "SPARK"
        assert data["status"] == "online"

    print("\n--- 2. Testing FastAPI Health Endpoint ---")
    with urllib.request.urlopen("http://127.0.0.1:8000/health") as resp:
        assert resp.status == 200
        health = json.loads(resp.read().decode())
        print(f"Health response: {health}")
        assert health == {
            "status": "ok",
            "project": "SPARK",
            "service": "badminton-shot-recognition-api"
        }

    print("\n--- 3. Testing Next.js Frontend HTML ---")
    with urllib.request.urlopen("http://127.0.0.1:3000/") as resp:
        assert resp.status == 200
        html = resp.read().decode('utf-8')
        print(f"Frontend HTML length: {len(html)} bytes")
        assert "SPARK" in html
        assert "Badminton" in html
        assert "SMASH" in html
        assert "CLEAR" in html
        assert "DROP" in html
        assert "DRIVE" in html
        assert "NET SHOT" in html

    print("\n--- 4. Testing End-to-End Video Upload (POST /api/video/upload) ---")
    sample_video = Path("tests/test_sample.mp4")
    assert sample_video.exists(), "test_sample.mp4 must exist"
    
    with open(sample_video, "rb") as f:
        files = {"file": ("test_sample.mp4", f, "video/mp4")}
        client = httpx.Client(base_url="http://127.0.0.1:8000", timeout=10.0)
        res = client.post("/api/video/upload", files=files)
        print(f"Upload status code: {res.status_code}")
        print(f"Upload response: {res.json()}")
        assert res.status_code == 201
        upload_data = res.json()
        assert "video_id" in upload_data
        assert upload_data["filename"] == "test_sample.mp4"
        assert upload_data["status"] == "uploaded"
        
        # Verify file saved on disk
        stored_path = settings.UPLOAD_DIR / f"{upload_data['video_id']}_test_sample.mp4"
        assert stored_path.exists(), f"Stored file should exist at {stored_path}"
        assert stored_path.stat().st_size == sample_video.stat().st_size
        print(f"Verified stored video on disk: {stored_path.name} ({stored_path.stat().st_size} bytes)")
        
        # Clean up uploaded test artifact
        stored_path.unlink()
        print("Cleaned up uploaded test file from storage/uploads.")

    print("\n>>> ALL LIVE INTEGRATION TESTS PASSED SUCCESSFULLY! <<<\n")

if __name__ == "__main__":
    test_e2e_integration()
