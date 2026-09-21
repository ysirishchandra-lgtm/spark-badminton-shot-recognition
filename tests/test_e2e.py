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
import io
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

    print("\n--- 4. Testing End-to-End Video Upload & Inference (POST /api/video/upload & analyze) ---")
    import cv2
    import numpy as np
    import tempfile
    import os

    # Generate a temporary valid 24-frame mp4 video
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp_vid:
        tmp_vid_path = tmp_vid.name

    try:
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        writer = cv2.VideoWriter(tmp_vid_path, fourcc, 25.0, (320, 240))
        for i in range(24):
            frame = np.full((240, 320, 3), fill_value=(i * 10) % 255, dtype=np.uint8)
            cv2.circle(frame, (160, 120), 40, (0, 255, 0), -1)
            writer.write(frame)
        writer.release()

        with open(tmp_vid_path, "rb") as f:
            video_bytes = f.read()

        client = httpx.Client(base_url="http://127.0.0.1:8000", timeout=30.0)
        files = {"file": ("e2e_sample.mp4", io.BytesIO(video_bytes), "video/mp4")}
        res = client.post("/api/video/upload", files=files)
        print(f"Upload status code: {res.status_code}")
        assert res.status_code == 201
        upload_data = res.json()
        print(f"Upload response: {upload_data}")
        assert "video_id" in upload_data
        video_id = upload_data["video_id"]
        assert upload_data["status"] == "uploaded"

        # Verify file saved on disk
        stored_path = settings.UPLOAD_DIR / f"{video_id}_e2e_sample.mp4"
        assert stored_path.exists(), f"Stored file should exist at {stored_path}"
        print(f"Verified stored video on disk: {stored_path.name} ({stored_path.stat().st_size} bytes)")

        # Test analyze endpoint live
        analyze_res = client.post("/api/video/analyze", json={"video_id": video_id})
        print(f"Analyze status code: {analyze_res.status_code}")
        assert analyze_res.status_code == 200
        analysis_data = analyze_res.json()
        print(f"Analysis result: {analysis_data}")
        assert analysis_data["video_id"] == video_id
        assert analysis_data["status"] == "completed"
        assert analysis_data["predicted_shot"] in ["SMASH", "CLEAR", "DROP", "DRIVE", "NET_SHOT"]
        assert 0.0 <= analysis_data["confidence"] <= 1.0
        assert analysis_data["frames_used"] == 16
        assert len(analysis_data["probabilities"]) == 5
        assert abs(sum(analysis_data["probabilities"].values()) - 1.0) < 1e-3

        # Clean up uploaded test artifact
        if stored_path.exists():
            stored_path.unlink()
            print("Cleaned up uploaded test file from storage/uploads.")

    finally:
        if os.path.exists(tmp_vid_path):
            os.remove(tmp_vid_path)

    print("\n>>> ALL LIVE INTEGRATION TESTS PASSED SUCCESSFULLY! <<<\n")

if __name__ == "__main__":
    import io
    test_e2e_integration()

