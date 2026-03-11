"""Incident / moderation API routes (admin only)."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import require_admin
from app.db.session import get_db
from app.models.models import User
from app.schemas.incidents import (
    IncidentListResponse,
    IncidentResponse,
    IncidentUpdateRequest,
)
from app.services.incident_service import IncidentService

router = APIRouter(prefix="/incidents", tags=["Incidents"])


@router.get("", response_model=IncidentListResponse)
def list_incidents(
    page: int = 1,
    limit: int = 20,
    review_status: str = None,
    severity: str = None,
    category: str = None,
    search: str = None,
    sort: str = "newest",
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    service = IncidentService(db)
    return service.list_incidents(
        page=page,
        limit=limit,
        review_status=review_status,
        severity=severity,
        category=category,
        search=search,
        sort=sort,
    )


@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(
    incident_id: uuid.UUID,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    service = IncidentService(db)
    incident = service.get_incident(incident_id)
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
    return incident


@router.patch("/{incident_id}", response_model=IncidentResponse)
def update_incident(
    incident_id: uuid.UUID,
    body: IncidentUpdateRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    service = IncidentService(db)
    incident = service.update_incident_review(
        incident_id=incident_id,
        admin_id=admin.id,
        review_status=body.review_status,
        action_taken=body.action_taken,
        admin_notes=body.admin_notes,
        assigned_admin_id=body.assigned_admin_id,
    )
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
    return incident
