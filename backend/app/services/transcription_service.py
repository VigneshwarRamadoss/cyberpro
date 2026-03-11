"""Transcription service using OpenAI Whisper."""

import os
import tempfile
from typing import Optional

from app.core.config import settings

_whisper_model = None


def _load_whisper():
    global _whisper_model
    try:
        import whisper
        _whisper_model = whisper.load_model(settings.WHISPER_MODEL_SIZE)
    except Exception:
        _whisper_model = None


def validate_audio(file_name: str, file_size: int, mime_type: str) -> Optional[str]:
    """Validate audio file before processing. Returns error message or None."""
    max_bytes = settings.MAX_AUDIO_UPLOAD_MB * 1024 * 1024

    if file_size > max_bytes:
        return f"File size exceeds {settings.MAX_AUDIO_UPLOAD_MB}MB limit"

    allowed_types = [
        "audio/wav", "audio/mpeg", "audio/mp3", "audio/mp4",
        "audio/ogg", "audio/webm", "audio/flac", "audio/x-wav",
    ]
    if mime_type not in allowed_types:
        return f"Unsupported audio format: {mime_type}. Supported: WAV, MP3, OGG, WebM, FLAC"

    return None


def transcribe_audio_file(file_path: str) -> str:
    """Transcribe audio file to text using Whisper.

    Falls back to a placeholder if Whisper is not available.
    """
    global _whisper_model

    if _whisper_model is None:
        _load_whisper()

    if _whisper_model is None:
        return "[Transcription unavailable - Whisper model not loaded. This is a placeholder transcript for demo purposes.]"

    try:
        result = _whisper_model.transcribe(file_path)
        return result.get("text", "").strip()
    except Exception as e:
        raise RuntimeError(f"Transcription failed: {str(e)}")
