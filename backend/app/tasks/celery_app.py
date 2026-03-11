"""Celery application and background tasks."""

from celery import Celery

from app.core.config import settings

celery_app = Celery(
    "shieldspeak",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
)


@celery_app.task(name="transcribe_and_analyze")
def transcribe_and_analyze_task(analysis_id: str, file_path: str):
    """Background task for voice transcription and analysis."""
    from app.db.session import SessionLocal
    from app.services.analysis_service import AnalysisService
    from app.services.transcription_service import transcribe_audio_file
    from uuid import UUID

    db = SessionLocal()
    try:
        transcript = transcribe_audio_file(file_path)
        service = AnalysisService(db)
        service.complete_voice_analysis(UUID(analysis_id), transcript)
    except Exception:
        service = AnalysisService(db)
        service.fail_analysis(UUID(analysis_id))
    finally:
        db.close()
