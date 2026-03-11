"""Database models for ShieldSpeak."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean, Column, DateTime, Enum, ForeignKey, Integer, Numeric,
    String, Text, BigInteger
)
from sqlalchemy import JSON
from sqlalchemy import Uuid as UUID
from sqlalchemy.orm import relationship

from app.db.session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(
        Enum("user", "admin", name="user_role"),
        default="user",
        nullable=False,
    )
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    analyses = relationship("Analysis", back_populates="user", foreign_keys="Analysis.user_id")
    refresh_tokens = relationship("RefreshToken", back_populates="user")
    incidents = relationship("Incident", back_populates="user", foreign_keys="Incident.user_id")
    warning_events = relationship("UserWarningEvent", back_populates="user")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    token_hash = Column(String(255), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user = relationship("User", back_populates="refresh_tokens")


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    source_type = Column(
        Enum("text", "voice", name="source_type_enum"),
        nullable=False,
    )
    original_text = Column(Text, nullable=True)
    transcript_text = Column(Text, nullable=True)
    input_language = Column(String(20), nullable=True)
    status = Column(
        Enum("pending", "processing", "completed", "failed", name="analysis_status_enum"),
        default="pending",
        nullable=False,
    )
    is_bullying = Column(Boolean, nullable=True)
    severity = Column(
        Enum("low", "medium", "high", "critical", "none", name="severity_enum"),
        nullable=True,
    )
    category = Column(
        Enum(
            "insult", "harassment", "threat", "hate_speech", "shaming",
            "exclusion", "profanity", "sexual_harassment", "unknown", "none",
            name="category_enum",
        ),
        nullable=True,
    )
    confidence_score = Column(Numeric(5, 4), nullable=True)
    explanation = Column(Text, nullable=True)
    suggested_action = Column(Text, nullable=True)
    model_version = Column(String(100), nullable=True)
    processing_ms = Column(Integer, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user = relationship("User", back_populates="analyses")
    audio_upload = relationship("AudioUpload", back_populates="analysis", uselist=False)
    incident = relationship("Incident", back_populates="analysis", uselist=False)
    warning_events = relationship("UserWarningEvent", back_populates="analysis")


class AudioUpload(Base):
    __tablename__ = "audio_uploads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    analysis_id = Column(
        UUID(as_uuid=True), ForeignKey("analyses.id"), unique=True, nullable=False
    )
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_size_bytes = Column(BigInteger, nullable=False)
    duration_seconds = Column(Numeric(8, 2), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    analysis = relationship("Analysis", back_populates="audio_upload")


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    analysis_id = Column(
        UUID(as_uuid=True), ForeignKey("analyses.id"), unique=True, nullable=False
    )
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    risk_score = Column(Numeric(5, 2), nullable=False)
    escalation_level = Column(
        Enum("none", "warning", "admin_review", "urgent_review", name="escalation_level_enum"),
        default="warning",
        nullable=False,
    )
    review_status = Column(
        Enum("open", "in_review", "resolved", "dismissed", name="review_status_enum"),
        default="open",
        nullable=False,
    )
    assigned_admin_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    action_taken = Column(
        Enum(
            "none", "warned_user", "escalated", "monitored", "false_positive",
            name="action_taken_enum",
        ),
        default="none",
        nullable=False,
    )
    admin_notes = Column(Text, nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    analysis = relationship("Analysis", back_populates="incident")
    user = relationship("User", back_populates="incidents", foreign_keys=[user_id])
    assigned_admin = relationship("User", foreign_keys=[assigned_admin_id])
    audit_logs = relationship("IncidentAuditLog", back_populates="incident")


class IncidentAuditLog(Base):
    __tablename__ = "incident_audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    incident_id = Column(
        UUID(as_uuid=True), ForeignKey("incidents.id"), nullable=False
    )
    admin_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    event_type = Column(String(100), nullable=False)
    previous_value = Column(JSON, nullable=True)
    new_value = Column(JSON, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    incident = relationship("Incident", back_populates="audit_logs")
    admin = relationship("User")


class UserWarningEvent(Base):
    __tablename__ = "user_warning_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    analysis_id = Column(UUID(as_uuid=True), ForeignKey("analyses.id"), nullable=False)
    severity = Column(
        Enum("low", "medium", "high", "critical", name="warning_severity_enum"),
        nullable=False,
    )
    warning_message = Column(Text, nullable=False)
    shown_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user = relationship("User", back_populates="warning_events")
    analysis = relationship("Analysis", back_populates="warning_events")
