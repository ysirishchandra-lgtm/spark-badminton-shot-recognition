"""
Video Transcoding Service.

Provides automatic server-side conversion of unsupported MP4 containers/codecs (e.g. FMP4/mp4v)
to browser-compatible H.264 MP4 using platform-native hardware encoders (MSMF on Windows).
Kept completely modular and non-blocking.
"""

import os
import logging
from pathlib import Path
from typing import Optional, Tuple
import cv2

logger = logging.getLogger("spark.transcode")

# Supported browser fourcc codes (H.264 / AVC)
BROWSER_COMPATIBLE_FOURCC = {
    875967080: "h264",
    1635148593: "avc1",
    828601953: "avc1",
}

MAX_TRANSCODE_FRAMES = 1500  # Cap at 60s @ 25fps for safety


def inspect_video_codec(video_path: Path) -> Tuple[bool, str]:
    """
    Inspects the fourcc codec of a video file.
    Returns (is_browser_compatible, codec_name).
    """
    if not video_path.exists():
        return False, "missing"

    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        return False, "unreadable"

    try:
        fourcc_int = int(cap.get(cv2.CAP_PROP_FOURCC))
        codec_name = fourcc_int.to_bytes(4, "little").decode("latin1", errors="ignore").strip()
    finally:
        cap.release()

    is_compatible = fourcc_int in BROWSER_COMPATIBLE_FOURCC or codec_name.lower() in ["h264", "avc1"]
    return is_compatible, codec_name


def transcode_to_h264(input_path: Path, output_path: Path) -> bool:
    """
    Transcodes input video to standard H.264 MP4 using cv2.CAP_MSMF.
    Returns True if transcode succeeded and output exists with size > 0.
    """
    if not input_path.exists():
        logger.error(f"Transcode source not found: {input_path}")
        return False

    cap = cv2.VideoCapture(str(input_path))
    if not cap.isOpened():
        logger.error(f"Cannot open video for transcoding: {input_path}")
        return False

    try:
        fps = cap.get(cv2.CAP_PROP_FPS)
        if not fps or fps <= 0 or fps > 120:
            fps = 25.0

        w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        if w <= 0 or h <= 0:
            logger.error(f"Invalid video dimensions: {w}x{h}")
            return False

        # Attempt MSMF hardware H.264 encoder on Windows
        writer = None
        if cv2.videoio_registry.hasBackend(cv2.CAP_MSMF):
            writer = cv2.VideoWriter(
                str(output_path),
                cv2.CAP_MSMF,
                cv2.VideoWriter_fourcc(*"H264"),
                fps,
                (w, h)
            )

        if not writer or not writer.isOpened():
            # Fallback to default backend
            writer = cv2.VideoWriter(
                str(output_path),
                cv2.VideoWriter_fourcc(*"avc1"),
                fps,
                (w, h)
            )

        if not writer or not writer.isOpened():
            logger.warning(f"Unable to open H.264 video writer for {output_path}")
            return False

        frame_idx = 0
        while frame_idx < MAX_TRANSCODE_FRAMES:
            ret, frame = cap.read()
            if not ret or frame is None:
                break
            writer.write(frame)
            frame_idx += 1

        writer.release()
        logger.info(f"Transcoded {frame_idx} frames to {output_path.name}")
    finally:
        cap.release()

    return output_path.exists() and output_path.stat().st_size > 0
