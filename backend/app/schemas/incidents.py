"""Pydantic schemas for incidents and admin workflows."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class IncidentResponse(BaseModel):
    id: UUID
    analysis_id: UUID
    user_id: UUID
    risk_score: float
    escalation_level: str
    review_status: str
    assigned_admin_id: Optional[UUID] = None
    action_taken: str
    admin_notes: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    # joined fields
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    source_type: Optional[str] = None
    severity: Optional[str] = None
    category: Optional[str] = None
    confidence_score: Optional[float] = None
    original_text: Optional[str] = None
    transcript_text: Optional[str] = None
    explanation: Optional[str] = None
    suggested_action: Optional[str] = None

    class Config:
        from_attributes = True


class IncidentUpdateRequest(BaseModel):
    review_status: Optional[str] = None
    action_taken: Optional[str] = None
    admin_notes: Optional[str] = None
    assigned_admin_id: Optional[UUID] = None


class IncidentListResponse(BaseModel):
    items: list[IncidentResponse]
    total: int
    page: int
    limit: int
    pages: int


class IncidentListParams(BaseModel):
    page: int = Field(1, ge=1)
    limit: int = Field(20, ge=1, le=100)
    review_status: Optional[str] = None
    severity: Optional[str] = None
    category: Optional[str] = None
    search: Optional[str] = None
    sort: Optional[str] = "newest"
