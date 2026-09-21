"""
SPARK Model Inference Service.

End-to-end inference pipeline connecting raw badminton video to the verified EXP23_C visual-only model:
  raw video
  → frame extraction (OpenCV)
  → uniform temporal sampling (16 chronological frames)
  → ImageNet normalization (224x224, RGB)
  → frozen ResNet-18 spatial backbone (512-D per frame)
  → visual feature tensor [1, 16, 512]
  → BadmintonTransformerLSTMClassifier (EXP23_C checkpoint)
  → 5-class logits [1, 5]
  → softmax probabilities
  → structured API prediction response
"""

import os
import sys
import time
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
import cv2
import numpy as np
import torch
import torch.nn as nn
import torchvision.models as models

logger = logging.getLogger("spark.inference")

# Production-portable model path resolution (Linux container & local development compatible)
_BACKEND_DIR = Path(__file__).resolve().parents[2]
_PACKAGED_MODEL_PATH = _BACKEND_DIR / "model" / "EXP_23_C_best_model.pt"
_FALLBACK_RESEARCH_PATH = Path(r"D:\PS_DATA\PHASE_23_COMBINED_AUGMENTATION\03_CHECKPOINTS\EXP_23_C_best_model.pt")

CHECKPOINT_PATH = os.environ.get(
    "MODEL_PATH",
    str(_PACKAGED_MODEL_PATH if _PACKAGED_MODEL_PATH.exists() else _FALLBACK_RESEARCH_PATH)
)

_LOCAL_RESNET_PATH = Path(r"C:\Users\user\.cache\torch\hub\checkpoints\resnet18-f37072fd.pth")
RESNET_WEIGHTS_PATH = os.environ.get(
    "RESNET_WEIGHTS_PATH",
    str(_LOCAL_RESNET_PATH if _LOCAL_RESNET_PATH.exists() else "")
)

CLASS_NAMES = ["SMASH", "CLEAR", "DROP", "DRIVE", "NET_SHOT"]
NUM_SAMPLED_FRAMES = 16
FRAME_SIZE = (224, 224)

# Canonical ImageNet normalization constants verified in research
IMAGENET_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32).reshape(1, 1, 3)
IMAGENET_STD = np.array([0.229, 0.224, 0.225], dtype=np.float32).reshape(1, 1, 3)


def extract_sampled_frames(video_path: str, num_frames: int = NUM_SAMPLED_FRAMES) -> torch.Tensor:
    """
    Decodes raw video and extracts exactly `num_frames` uniformly spaced chronological frames.
    
    Preprocessing contract:
    - BGR to RGB
    - Resize directly to 224x224 via bilinear interpolation (INTER_LINEAR)
    - uint8 / 255.0 -> float32
    - ImageNet normalization: (x - mean) / std
    - HWC -> CHW
    
    Returns:
        torch.Tensor of shape [num_frames, 3, 224, 224] on CPU.
        
    Raises:
        FileNotFoundError: If the video file does not exist on disk.
        ValueError: If the video cannot be opened or contains fewer than `num_frames` decodable frames.
    """
    path = Path(video_path)
    if not path.exists():
        raise FileNotFoundError(f"Video file not found at {video_path}")

    cap = cv2.VideoCapture(str(path))
    if not cap.isOpened():
        raise ValueError(f"The video file could not be opened or decoded: {path.name}")

    frames_bgr = []
    try:
        while True:
            ret, frame = cap.read()
            if not ret or frame is None:
                break
            frames_bgr.append(frame)
    finally:
        cap.release()

    total_frames = len(frames_bgr)
    if total_frames < num_frames:
        raise ValueError(
            f"Video contains only {total_frames} decodable frames. "
            f"A minimum of {num_frames} frames is required for shot recognition analysis."
        )

    # Uniform temporal sampling spanning the video duration
    indices = np.linspace(0, total_frames - 1, num_frames, dtype=int)
    sampled_frames = [frames_bgr[idx] for idx in indices]

    preproc_list = []
    for frame in sampled_frames:
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        resized = cv2.resize(rgb, FRAME_SIZE, interpolation=cv2.INTER_LINEAR)
        norm = (resized.astype(np.float32) / 255.0 - IMAGENET_MEAN) / IMAGENET_STD
        chw = np.transpose(norm, (2, 0, 1))
        preproc_list.append(chw)

    tensor_stack = torch.tensor(np.stack(preproc_list), dtype=torch.float32)
    return tensor_stack


class InferenceManager:
    """
    Singleton manager for loading, caching, and running the ResNet-18 + EXP23_C model pipeline.
    """
    _instance: Optional["InferenceManager"] = None

    def __init__(self):
        self.resnet: Optional[nn.Module] = None
        self.temporal_model: Optional[nn.Module] = None
        self._is_loaded: bool = False

    @classmethod
    def get_instance(cls) -> "InferenceManager":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load_models(self) -> None:
        """Loads both ResNet-18 and BadmintonTransformerLSTMClassifier into memory (CPU)."""
        if self._is_loaded:
            return

        logger.info("Initializing SPARK inference pipeline models...")
        t0 = time.perf_counter()

        # 1. Load ResNet-18 spatial feature extractor
        if RESNET_WEIGHTS_PATH and os.path.exists(RESNET_WEIGHTS_PATH):
            logger.info(f"Loading local ResNet-18 weights from {RESNET_WEIGHTS_PATH}")
            resnet = models.resnet18(weights=None)
            state_dict = torch.load(RESNET_WEIGHTS_PATH, map_location="cpu", weights_only=False)
            resnet.load_state_dict(state_dict)
        else:
            logger.info("Loading canonical PyTorch ImageNet ResNet-18 weights...")
            resnet = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)

        resnet.fc = nn.Identity()  # Truncate at penultimate 512-D pooling layer
        resnet.eval()
        for param in resnet.parameters():
            param.requires_grad = False
        self.resnet = resnet

        # 2. Load BadmintonTransformerLSTMClassifier temporal model
        if not os.path.exists(CHECKPOINT_PATH):
            raise FileNotFoundError(f"EXP23_C checkpoint not found at {CHECKPOINT_PATH}")

        # Import packaged architecture (self-contained, no external research directory needed)
        from backend.app.models.architecture import BadmintonTransformerLSTMClassifier

        logger.info(f"Loading EXP_23_C checkpoint from {CHECKPOINT_PATH}...")
        temporal_model = BadmintonTransformerLSTMClassifier()
        ckpt = torch.load(CHECKPOINT_PATH, map_location="cpu", weights_only=False)
        temporal_model.load_state_dict(ckpt["model_state_dict"])
        temporal_model.eval()
        for param in temporal_model.parameters():
            param.requires_grad = False
        self.temporal_model = temporal_model

        self._is_loaded = True
        elapsed_ms = (time.perf_counter() - t0) * 1000
        logger.info(f"SPARK models loaded successfully in {elapsed_ms:.1f} ms.")

    def analyze_video(self, video_path: str) -> Dict[str, Any]:
        """
        Executes full inference on an uploaded video.
        
        Returns:
            Dict containing predicted_shot, confidence, probabilities, frames_used, processing_time_ms.
        """
        t_start = time.perf_counter()

        # Ensure models are loaded
        if not self._is_loaded:
            self.load_models()

        # Step 1: Decode and sample frames
        frames_tensor = extract_sampled_frames(video_path, num_frames=NUM_SAMPLED_FRAMES)  # [16, 3, 224, 224]

        # Step 2: Extract spatial features via frozen ResNet-18
        with torch.no_grad():
            visual_features = self.resnet(frames_tensor)  # [16, 512]
            feature_sequence = visual_features.unsqueeze(0)  # [1, 16, 512]

            # Step 3: Forward pass through EXP23_C temporal model
            logits = self.temporal_model(feature_sequence)  # [1, 5]
            probabilities = torch.softmax(logits, dim=1)[0]  # [5]

        # Step 4: Map predictions and format output
        probs_list = probabilities.numpy().tolist()
        pred_idx = int(torch.argmax(probabilities).item())
        pred_class = CLASS_NAMES[pred_idx]
        confidence = float(probs_list[pred_idx])

        probabilities_dict = {
            cls_name: round(float(probs_list[i]), 4)
            for i, cls_name in enumerate(CLASS_NAMES)
        }

        total_latency_ms = (time.perf_counter() - t_start) * 1000

        return {
            "status": "completed",
            "predicted_shot": pred_class,
            "confidence": round(confidence, 4),
            "probabilities": probabilities_dict,
            "frames_used": NUM_SAMPLED_FRAMES,
            "processing_time_ms": round(total_latency_ms, 2),
            "message": "Video analysis completed successfully."
        }


def get_inference_manager() -> InferenceManager:
    """Returns the singleton InferenceManager instance."""
    return InferenceManager.get_instance()


def analyze_video(video_path: str) -> Dict[str, Any]:
    """Convenience entry point for video analysis."""
    manager = get_inference_manager()
    return manager.analyze_video(video_path)
