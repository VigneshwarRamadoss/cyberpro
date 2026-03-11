"""Analysis API routes."""

import os
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.models import AudioUpload, User
from app.schemas.analysis import (
    AnalysisListResponse,
    AnalysisResponse,
    TextAnalysisRequest,
)
from app.services.analysis_service import AnalysisService
from app.services.transcription_service import (
    transcribe_audio_file,
    validate_audio,
)

router = APIRouter(prefix="/analyses", tags=["Analysis"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/text", response_model=AnalysisResponse, status_code=status.HTTP_201_CREATED)
def analyze_text(
    body: TextAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AnalysisService(db)
    analysis = service.create_text_analysis(current_user.id, body.text)
    return analysis


@router.post("/voice", response_model=AnalysisResponse, status_code=status.HTTP_201_CREATED)
def analyze_voice(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Read file content
    content = file.file.read()
    file_size = len(content)

    # Validate audio
    error = validate_audio(file.filename or "unknown", file_size, file.content_type or "")
    if error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    service = AnalysisService(db)
    analysis = service.create_voice_analysis_record(current_user.id)

    # Save file
    ext = os.path.splitext(file.filename or "audio.wav")[1]
    file_name = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, file_name)

    with open(file_path, "wb") as f:
        f.write(content)

    # Create audio upload record
    audio = AudioUpload(
        analysis_id=analysis.id,
        file_name=file.filename or "unknown",
        file_path=file_path,
        mime_type=file.content_type or "audio/wav",
        file_size_bytes=file_size,
    )
    db.add(audio)
    db.commit()

    # Transcribe and analyze (synchronous for MVP)
    try:
        transcript = transcribe_audio_file(file_path)
        analysis = service.complete_voice_analysis(analysis.id, transcript)
    except Exception as e:
        service.fail_analysis(analysis.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Voice analysis failed: {str(e)}",
        )

    return analysis


@router.get("/{analysis_id}", response_model=AnalysisResponse)
def get_analysis(
    analysis_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AnalysisService(db)
    analysis = service.get_analysis(analysis_id, current_user.id)
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
    return analysis


@router.get("", response_model=AnalysisListResponse)
def list_analyses(
    page: int = 1,
    limit: int = 20,
    source_type: str = None,
    severity: str = None,
    analysis_status: str = None,
    from_date: str = None,
    to_date: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AnalysisService(db)
    result = service.list_user_analyses(
        user_id=current_user.id,
        page=page,
        limit=limit,
        source_type=source_type,
        severity=severity,
        status=analysis_status,
        from_date=from_date,
        to_date=to_date,
    )
    return result
