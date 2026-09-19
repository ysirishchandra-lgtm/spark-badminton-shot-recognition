"""
SPARK Model Inference Service Boundary.

Day 18 scope: Interface definition and architecture boundary.
NOTE: This service does NOT execute inference or return fabricated predictions today.
The verified EXP24 multimodal transformer-BiLSTM model checkpoint will be integrated
through this exact boundary during Day 19.
"""

from pathlib import Path
from typing import Dict, Any


def analyze_video(video_path: str) -> Dict[str, Any]:
    """
    Placeholder boundary interface for badminton shot recognition inference.
    
    Args:
        video_path: Path to the validated video file on disk.
        
    Raises:
        NotImplementedError: Real ML model integration is scheduled for Day 19.
    """
    path = Path(video_path)
    if not path.exists():
        raise FileNotFoundError(f"Video file not found at {video_path}")
        
    raise NotImplementedError(
        "Day 18 Scope: Application Foundation. Full EXP24 multimodal inference "
        "pipeline will be connected to this service boundary on Day 19. "
        "No fabricated predictions are permitted."
    )
