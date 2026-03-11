"""Incident and moderation service."""

import math
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.models import Analysis, Incident, IncidentAuditLog, User


class IncidentService:
    def __init__(self, db: Session):
        self.db = db

    def list_incidents(
        self,
        page: int = 1,
        limit: int = 20,
        review_status: Optional[str] = None,
        severity: Optional[str] = None,
        category: Optional[str] = None,
        search: Optional[str] = None,
        sort: str = "newest",
    ):
        query = (
            self.db.query(Incident)
            .join(Analysis, Incident.analysis_id == Analysis.id)
            .join(User, Incident.user_id == User.id)
        )

        if review_status:
            query = query.filter(Incident.review_status == review_status)
        if severity:
            query = query.filter(Analysis.severity == severity)
        if category:
            query = query.filter(Analysis.category == category)
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (User.full_name.ilike(search_term))
                | (User.email.ilike(search_term))
                | (Analysis.original_text.ilike(search_term))
                | (Analysis.transcript_text.ilike(search_term))
            )

        if sort == "highest_severity":
            from sqlalchemy import case
            severity_order = case(
                (Analysis.severity == "critical", 4),
                (Analysis.severity == "high", 3),
                (Analysis.severity == "medium", 2),
                (Analysis.severity == "low", 1),
                else_=0,
            )
            query = query.order_by(severity_order.desc())
        else:
            query = query.order_by(Incident.created_at.desc())

        total = query.count()
        pages = math.ceil(total / limit) if total > 0 else 1
        incidents = (
            query.offset((page - 1) * limit).limit(limit).all()
        )

        items = []
        for inc in incidents:
            analysis = inc.analysis
            user = inc.user
            items.append({
                "id": inc.id,
                "analysis_id": inc.analysis_id,
                "user_id": inc.user_id,
                "risk_score": float(inc.risk_score),
                "escalation_level": inc.escalation_level,
                "review_status": inc.review_status,
                "assigned_admin_id": inc.assigned_admin_id,
                "action_taken": inc.action_taken,
                "admin_notes": inc.admin_notes,
                "reviewed_at": inc.reviewed_at,
                "created_at": inc.created_at,
                "updated_at": inc.updated_at,
                "user_name": user.full_name if user else None,
                "user_email": user.email if user else None,
                "source_type": analysis.source_type if analysis else None,
                "severity": analysis.severity if analysis else None,
                "category": analysis.category if analysis else None,
                "confidence_score": float(analysis.confidence_score) if analysis and analysis.confidence_score else None,
                "original_text": analysis.original_text if analysis else None,
                "transcript_text": analysis.transcript_text if analysis else None,
                "explanation": analysis.explanation if analysis else None,
                "suggested_action": analysis.suggested_action if analysis else None,
            })

        return {
            "items": items,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": pages,
        }

    def get_incident(self, incident_id: UUID) -> Optional[dict]:
        inc = self.db.query(Incident).filter(Incident.id == incident_id).first()
        if not inc:
            return None

        analysis = inc.analysis
        user = inc.user

        return {
            "id": inc.id,
            "analysis_id": inc.analysis_id,
            "user_id": inc.user_id,
            "risk_score": float(inc.risk_score),
            "escalation_level": inc.escalation_level,
            "review_status": inc.review_status,
            "assigned_admin_id": inc.assigned_admin_id,
            "action_taken": inc.action_taken,
            "admin_notes": inc.admin_notes,
            "reviewed_at": inc.reviewed_at,
            "created_at": inc.created_at,
            "updated_at": inc.updated_at,
            "user_name": user.full_name if user else None,
            "user_email": user.email if user else None,
            "source_type": analysis.source_type if analysis else None,
            "severity": analysis.severity if analysis else None,
            "category": analysis.category if analysis else None,
            "confidence_score": float(analysis.confidence_score) if analysis and analysis.confidence_score else None,
            "original_text": analysis.original_text if analysis else None,
            "transcript_text": analysis.transcript_text if analysis else None,
            "explanation": analysis.explanation if analysis else None,
            "suggested_action": analysis.suggested_action if analysis else None,
        }

    def update_incident_review(
        self,
        incident_id: UUID,
        admin_id: UUID,
        review_status: Optional[str] = None,
        action_taken: Optional[str] = None,
        admin_notes: Optional[str] = None,
        assigned_admin_id: Optional[UUID] = None,
    ) -> Optional[dict]:
        inc = self.db.query(Incident).filter(Incident.id == incident_id).first()
        if not inc:
            return None

        previous = {
            "review_status": inc.review_status,
            "action_taken": inc.action_taken,
            "admin_notes": inc.admin_notes,
        }

        if review_status:
            inc.review_status = review_status
        if action_taken:
            inc.action_taken = action_taken
        if admin_notes is not None:
            inc.admin_notes = admin_notes
        if assigned_admin_id:
            inc.assigned_admin_id = assigned_admin_id

        inc.reviewed_at = datetime.now(timezone.utc)

        new_values = {
            "review_status": inc.review_status,
            "action_taken": inc.action_taken,
            "admin_notes": inc.admin_notes,
        }

        # Create audit log
        audit = IncidentAuditLog(
            incident_id=incident_id,
            admin_id=admin_id,
            event_type="review_update",
            previous_value=previous,
            new_value=new_values,
        )
        self.db.add(audit)
        self.db.commit()

        return self.get_incident(incident_id)
