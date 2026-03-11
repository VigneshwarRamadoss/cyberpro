"""Pydantic schemas for analytics."""

from pydantic import BaseModel


class AnalyticsSummary(BaseModel):
    total_incidents: int
    open_incidents: int
    resolved_incidents: int
    critical_incidents: int
    repeat_users_count: int


class SeverityDistribution(BaseModel):
    severity: str
    count: int


class CategoryDistribution(BaseModel):
    category: str
    count: int


class TrendPoint(BaseModel):
    date: str
    count: int
