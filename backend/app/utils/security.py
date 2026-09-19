"""
Security and validation utilities for file uploads.
Prevents path traversal, malicious filenames, and unauthorized extensions.
"""

import re
import uuid
from pathlib import Path
from typing import Tuple
from backend.app.core.config import settings


# Regex to keep safe alphanumeric, dash, underscore, and dots
SAFE_FILENAME_REGEX = re.compile(r"[^a-zA-Z0-9_\-\.]")


def sanitize_filename(original_name: str) -> str:
    """
    Sanitize an uploaded filename against path traversal and risky characters.
    Extracts only the basename, removes path delimiters, and strips risky characters.
    """
    if not original_name:
        return f"video_{uuid.uuid4().hex[:8]}.mp4"
    
    # Strip any directory components
    base_name = Path(original_name).name
    
    # Remove null bytes or non-printable chars
    base_name = base_name.replace("\0", "").strip()
    
    # Replace unsafe characters with an underscore
    safe_name = SAFE_FILENAME_REGEX.sub("_", base_name)
    
    # Prevent leading dots (hidden files on unix / dotfiles)
    safe_name = safe_name.lstrip(".")
    
    # Fallback if empty after sanitization
    if not safe_name:
        safe_name = f"upload_{uuid.uuid4().hex[:8]}"
        
    return safe_name


def validate_video_file(filename: str) -> Tuple[bool, str]:
    """
    Validate that the file has an allowed video extension.
    Returns (is_valid, normalized_extension).
    """
    if not filename or "." not in filename:
        return False, ""
        
    ext = Path(filename).suffix.lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        return False, ext
        
    return True, ext


def generate_video_id() -> str:
    """Generate a unique UUIDv4 string for the video."""
    return str(uuid.uuid4())
