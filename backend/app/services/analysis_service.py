"""Analysis service for text and voice analysis workflows."""

import math
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy import and_, func
from sqlalchemy.orm import Session

from app.ml.classifier import classify_text
from app.models.models import Analysis, Incident, UserWarningEvent


class AnalysisService:
    def __init__(self, db: Session):
        self.db = db

    def create_text_analysis(self, user_id: UUID, text: str) -> Analysis:
        """Run NLP analysis on text and store results."""
        analysis = Analysis(
            user_id=user_id,
            source_type="text",
            original_text=text,
            status="processing",
        )
        self.db.add(analysis)
        self.db.flush()

        result = classify_text(text)

        analysis.is_bullying = result["is_bullying"]
        analysis.severity = result["severity"]
        analysis.category = result["category"]
        analysis.confidence_score = result["confidence_score"]
        analysis.explanation = result["explanation"]
        analysis.suggested_action = result["suggested_action"]
        analysis.model_version = result.get("model_version")
        analysis.processing_ms = result.get("processing_ms")
        analysis.status = "completed"

        self.db.flush()

        if result["is_bullying"]:
            risk_score = self._compute_risk_score(analysis, user_id)
            self._create_incident_if_needed(analysis, user_id, risk_score)
            self._create_warning_if_needed(analysis, user_id)

        self.db.commit()
        self.db.refresh(analysis)
        return analysis

    def create_voice_analysis_record(self, user_id: UUID) -> Analysis:
        """Create a pending voice analysis record."""
        analysis = Analysis(
            user_id=user_id,
            source_type="voice",
            status="pending",
        )
        self.db.add(analysis)
        self.db.commit()
        self.db.refresh(analysis)
        return analysis

    def complete_voice_analysis(self, analysis_id: UUID, transcript: str) -> Analysis:
        """Run NLP analysis on voice transcript."""
        analysis = self.db.query(Analysis).filter(Analysis.id == analysis_id).first()
        if not analysis:
            raise ValueError("Analysis not found")

        analysis.transcript_text = transcript
        analysis.status = "processing"
        self.db.flush()

        result = classify_text(transcript)

        analysis.is_bullying = result["is_bullying"]
        analysis.severity = result["severity"]
        analysis.category = result["category"]
        analysis.confidence_score = result["confidence_score"]
        analysis.explanation = result["explanation"]
        analysis.suggested_action = result["suggested_action"]
        analysis.model_version = result.get("model_version")
        analysis.processing_ms = result.get("processing_ms")
        analysis.status = "completed"

        self.db.flush()

        if result["is_bullying"]:
            risk_score = self._compute_risk_score(analysis, analysis.user_id)
            self._create_incident_if_needed(analysis, analysis.user_id, risk_score)
            self._create_warning_if_needed(analysis, analysis.user_id)

        self.db.commit()
        self.db.refresh(analysis)
        return analysis

    def fail_analysis(self, analysis_id: UUID) -> None:
        analysis = self.db.query(Analysis).filter(Analysis.id == analysis_id).first()
        if analysis:
            analysis.status = "failed"
            self.db.commit()

    def get_analysis(self, analysis_id: UUID, user_id: Optional[UUID] = None) -> Optional[Analysis]:
        query = self.db.query(Analysis).filter(Analysis.id == analysis_id)
        if user_id:
            query = query.filter(Analysis.user_id == user_id)
        return query.first()

    def list_user_analyses(
        self,
        user_id: UUID,
        page: int = 1,
        limit: int = 20,
        source_type: Optional[str] = None,
        severity: Optional[str] = None,
        status: Optional[str] = None,
        from_date: Optional[str] = None,
        to_date: Optional[str] = None,
    ):
        query = self.db.query(Analysis).filter(Analysis.user_id == user_id)

        if source_type:
            query = query.filter(Analysis.source_type == source_type)
        if severity:
            query = query.filter(Analysis.severity == severity)
        if status:
            query = query.filter(Analysis.status == status)
        if from_date:
            query = query.filter(Analysis.created_at >= from_date)
        if to_date:
            query = query.filter(Analysis.created_at <= to_date)

        total = query.count()
        pages = math.ceil(total / limit) if total > 0 else 1
        items = (
            query.order_by(Analysis.created_at.desc())
            .offset((page - 1) * limit)
            .limit(limit)
            .all()
        )

        return {
            "items": items,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": pages,
        }

    def _compute_risk_score(self, analysis: Analysis, user_id: UUID) -> float:
        severity_scores = {"low": 25, "medium": 50, "high": 75, "critical": 90}
        base_score = severity_scores.get(analysis.severity, 10)

        confidence_factor = float(analysis.confidence_score or 0.5)
        base_score *= confidence_factor

        # Check repeat flagging for this user
        prior_flags = (
            self.db.query(func.count(Analysis.id))
            .filter(
                and_(
                    Analysis.user_id == user_id,
                    Analysis.is_bullying == True,
                    Analysis.id != analysis.id,
                )
            )
            .scalar()
        )

        repeat_boost = min(prior_flags * 5, 20)
        risk_score = min(base_score + repeat_boost, 100)

        return round(risk_score, 2)

    def _create_incident_if_needed(
        self, analysis: Analysis, user_id: UUID, risk_score: float
    ) -> Optional[Incident]:
        if risk_score < 40:
            return None

        if risk_score < 65:
            escalation = "warning"
        elif risk_score < 85:
            escalation = "admin_review"
        else:
            escalation = "urgent_review"

        incident = Incident(
            analysis_id=analysis.id,
            user_id=user_id,
            risk_score=risk_score,
            escalation_level=escalation,
            review_status="open",
        )
        self.db.add(incident)
        self.db.flush()
        return incident

    def _create_warning_if_needed(
        self, analysis: Analysis, user_id: UUID
    ) -> Optional[UserWarningEvent]:
        if analysis.severity in ("medium", "high", "critical"):
            messages = {
                "medium": "This message may contain language that could be hurtful. Please consider revising.",
                "high": "This message has been flagged for potentially harmful content. A moderator may review it.",
                "critical": "This message contains content that has been flagged as high-risk. It has been escalated for review.",
            }
            warning = UserWarningEvent(
                user_id=user_id,
                analysis_id=analysis.id,
                severity=analysis.severity,
                warning_message=messages.get(analysis.severity, ""),
            )
            self.db.add(warning)
            self.db.flush()
            return warning
        return None
