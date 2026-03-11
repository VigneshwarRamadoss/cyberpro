"""Analytics API routes (admin only)."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import require_admin
from app.db.session import get_db
from app.models.models import User
from app.schemas.analytics import (
    AnalyticsSummary,
    CategoryDistribution,
    SeverityDistribution,
    TrendPoint,
)
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
def get_summary(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    service = AnalyticsService(db)
    return service.get_summary()


@router.get("/severity-distribution", response_model=list[SeverityDistribution])
def get_severity_distribution(
    admin: User = Depends(require_admin), db: Session = Depends(get_db)
):
    service = AnalyticsService(db)
    return service.get_severity_distribution()


@router.get("/category-distribution", response_model=list[CategoryDistribution])
def get_category_distribution(
    admin: User = Depends(require_admin), db: Session = Depends(get_db)
):
    service = AnalyticsService(db)
    return service.get_category_distribution()


@router.get("/trends", response_model=list[TrendPoint])
def get_trends(
    days: int = 30,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    service = AnalyticsService(db)
    return service.get_trends(days=days)
