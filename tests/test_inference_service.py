"""
Unit and service tests for SPARK inference service (ResNet-18 + EXP23_C temporal pipeline).
Validates model loading, frame sampling, preprocessing, inference execution, and error handling.
"""

import os
import sys
from pathlib import Path
import tempfile
import pytest
import cv2
import numpy as np
import torch

# Ensure SPARK root is on sys.path for test discovery
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.app.services.inference_service import (
    InferenceManager,
    extract_sampled_frames,
    analyze_video,
    CLASS_NAMES,
    NUM_SAMPLED_FRAMES
)


def create_synthetic_test_video(file_path: str, num_frames: int = 24, width: int = 320, height: int = 240) -> str:
    """Creates a temporary synthetic test video file with simple geometric frames."""
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    writer = cv2.VideoWriter(file_path, fourcc, 25.0, (width, height))
    for i in range(num_frames):
        frame = np.full((height, width, 3), fill_value=(i * 10) % 255, dtype=np.uint8)
        # Add simple pattern to vary spatial features
        cv2.circle(frame, (width // 2, height // 2), 30 + i, (255, 255, 255), -1)
        writer.write(frame)
    writer.release()
    return file_path


class TestInferenceService:
    @pytest.fixture(autouse=True)
    def setup_manager(self):
        self.manager = InferenceManager.get_instance()
        self.manager.load_models()

    def test_model_loaded_and_frozen(self):
        """Verify models load into memory with frozen weights and correct parameters."""
        assert self.manager._is_loaded is True
        assert self.manager.resnet is not None
        assert self.manager.temporal_model is not None

        # Verify ResNet is frozen
        for p in self.manager.resnet.parameters():
            assert not p.requires_grad

        # Verify temporal model is frozen and parameter count matches 330,885
        total_temporal_params = sum(p.numel() for p in self.manager.temporal_model.parameters())
        assert total_temporal_params == 330885
        for p in self.manager.temporal_model.parameters():
            assert not p.requires_grad

    def test_direct_temporal_forward_shape(self):
        """Verify temporal model produces [1, 5] logits and valid probabilities."""
        dummy_visual_features = torch.randn(1, 16, 512)
        with torch.no_grad():
            logits = self.manager.temporal_model(dummy_visual_features)
            probs = torch.softmax(logits, dim=1)

        assert logits.shape == (1, 5)
        assert probs.shape == (1, 5)
        assert torch.isfinite(logits).all()
        assert torch.isfinite(probs).all()
        assert abs(probs.sum().item() - 1.0) < 1e-4

    def test_class_mapping(self):
        """Verify class list conforms to project specification."""
        assert CLASS_NAMES == ["SMASH", "CLEAR", "DROP", "DRIVE", "NET_SHOT"]

    def test_extract_sampled_frames_valid(self):
        """Verify frame extraction produces exactly [16, 3, 224, 224] tensor from video."""
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
            tmp_path = tmp.name

        try:
            create_synthetic_test_video(tmp_path, num_frames=30)
            tensor = extract_sampled_frames(tmp_path, num_frames=16)

            assert tensor.shape == (16, 3, 224, 224)
            assert tensor.dtype == torch.float32
            assert torch.isfinite(tensor).all()
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

    def test_extract_sampled_frames_fewer_than_16_rejected(self):
        """Verify videos with fewer than 16 frames raise a descriptive ValueError."""
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
            tmp_path = tmp.name

        try:
            create_synthetic_test_video(tmp_path, num_frames=8)
            with pytest.raises(ValueError) as exc_info:
                extract_sampled_frames(tmp_path, num_frames=16)
            assert "fewer than 16 decodable frames" in str(exc_info.value) or "only 8 decodable frames" in str(exc_info.value)
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

    def test_extract_sampled_frames_missing_file(self):
        """Verify missing video file raises FileNotFoundError."""
        with pytest.raises(FileNotFoundError):
            extract_sampled_frames("D:/non_existent_file_path_xyz.mp4")

    def test_end_to_end_video_analysis(self):
        """Verify end-to-end video analysis on a temporary fixture video."""
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
            tmp_path = tmp.name

        try:
            create_synthetic_test_video(tmp_path, num_frames=25)
            result = analyze_video(tmp_path)

            assert result["status"] == "completed"
            assert result["frames_used"] == 16
            assert result["predicted_shot"] in CLASS_NAMES
            assert 0.0 <= result["confidence"] <= 1.0
            assert result["processing_time_ms"] > 0.0

            # Verify probability distribution
            probs = result["probabilities"]
            assert len(probs) == 5
            for c in CLASS_NAMES:
                assert c in probs
                assert 0.0 <= probs[c] <= 1.0

            total_prob = sum(probs.values())
            assert abs(total_prob - 1.0) < 1e-2  # Rounded to 4 decimals
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
