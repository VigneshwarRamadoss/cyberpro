"""Analytics service for admin dashboard."""

from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import and_, func
from sqlalchemy.orm import Session

from app.models.models import Analysis, Incident, User


class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db

    def get_summary(self) -> dict:
        total = self.db.query(func.count(Incident.id)).scalar() or 0
        open_count = (
            self.db.query(func.count(Incident.id))
            .filter(Incident.review_status == "open")
            .scalar() or 0
        )
        resolved = (
            self.db.query(func.count(Incident.id))
            .filter(Incident.review_status == "resolved")
            .scalar() or 0
        )
        critical = (
            self.db.query(func.count(Incident.id))
            .join(Analysis)
            .filter(Analysis.severity == "critical")
            .scalar() or 0
        )
        repeat_users = (
            self.db.query(func.count(func.distinct(Incident.user_id)))
            .filter(
                Incident.user_id.in_(
                    self.db.query(Incident.user_id)
                    .group_by(Incident.user_id)
                    .having(func.count(Incident.id) > 1)
                )
            )
            .scalar() or 0
        )

        return {
            "total_incidents": total,
            "open_incidents": open_count,
            "resolved_incidents": resolved,
            "critical_incidents": critical,
            "repeat_users_count": repeat_users,
        }

    def get_severity_distribution(self) -> list[dict]:
        results = (
            self.db.query(
                Analysis.severity,
                func.count(Incident.id).label("count"),
            )
            .join(Incident, Incident.analysis_id == Analysis.id)
            .group_by(Analysis.severity)
            .all()
        )
        return [{"severity": r[0] or "unknown", "count": r[1]} for r in results]

    def get_category_distribution(self) -> list[dict]:
        results = (
            self.db.query(
                Analysis.category,
                func.count(Incident.id).label("count"),
            )
            .join(Incident, Incident.analysis_id == Analysis.id)
            .group_by(Analysis.category)
            .all()
        )
        return [{"category": r[0] or "unknown", "count": r[1]} for r in results]

    def get_trends(self, days: int = 30) -> list[dict]:
        start_date = datetime.now(timezone.utc) - timedelta(days=days)
        results = (
            self.db.query(
                func.date(Incident.created_at).label("date"),
                func.count(Incident.id).label("count"),
            )
            .filter(Incident.created_at >= start_date)
            .group_by(func.date(Incident.created_at))
            .order_by(func.date(Incident.created_at))
            .all()
        )
        return [{"date": str(r[0]), "count": r[1]} for r in results]
