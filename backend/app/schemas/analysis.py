"""Pydantic schemas for analysis."""

from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class TextAnalysisRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)


class AnalysisResult(BaseModel):
    is_bullying: bool
    severity: str
    category: str
    confidence_score: float
    explanation: str
    suggested_action: str


class AnalysisResponse(BaseModel):
    id: UUID
    user_id: UUID
    source_type: str
    original_text: Optional[str] = None
    transcript_text: Optional[str] = None
    status: str
    is_bullying: Optional[bool] = None
    severity: Optional[str] = None
    category: Optional[str] = None
    confidence_score: Optional[float] = None
    explanation: Optional[str] = None
    suggested_action: Optional[str] = None
    model_version: Optional[str] = None
    processing_ms: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AnalysisListResponse(BaseModel):
    items: list[AnalysisResponse]
    total: int
    page: int
    limit: int
    pages: int


class AnalysisListParams(BaseModel):
    page: int = Field(1, ge=1)
    limit: int = Field(20, ge=1, le=100)
    source_type: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    from_date: Optional[str] = None
    to_date: Optional[str] = None
