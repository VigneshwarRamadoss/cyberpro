"""Authentication service."""

from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    hash_token,
    verify_password,
)
from app.core.config import settings
from app.models.models import RefreshToken, User


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def create_user(self, full_name: str, email: str, password: str, role: str = "user") -> User:
        existing = self.db.query(User).filter(User.email == email).first()
        if existing:
            raise ValueError("Email already registered")

        user = User(
            full_name=full_name,
            email=email,
            password_hash=hash_password(password),
            role=role,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        user = self.db.query(User).filter(User.email == email).first()
        if not user or not verify_password(password, user.password_hash):
            return None
        if not user.is_active:
            return None
        return user

    def issue_tokens(self, user: User) -> tuple[str, str]:
        access = create_access_token(str(user.id), user.role)
        refresh = create_refresh_token(str(user.id))

        # Store refresh token hash
        refresh_record = RefreshToken(
            user_id=user.id,
            token_hash=hash_token(refresh),
            expires_at=datetime.now(timezone.utc)
            + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS),
        )
        self.db.add(refresh_record)
        self.db.commit()

        return access, refresh

    def rotate_refresh_token(self, old_refresh: str) -> Optional[tuple[str, str, User]]:
        payload = decode_token(old_refresh)
        user_id = payload.get("sub")
        token_type = payload.get("type")

        if not user_id or token_type != "refresh":
            return None

        old_hash = hash_token(old_refresh)
        token_record = (
            self.db.query(RefreshToken)
            .filter(
                RefreshToken.token_hash == old_hash,
                RefreshToken.revoked_at.is_(None),
            )
            .first()
        )

        if not token_record:
            return None

        if token_record.expires_at < datetime.now(timezone.utc):
            return None

        # Revoke old token
        token_record.revoked_at = datetime.now(timezone.utc)

        user = self.db.query(User).filter(User.id == UUID(user_id)).first()
        if not user or not user.is_active:
            return None

        access, refresh = self.issue_tokens(user)
        self.db.commit()

        return access, refresh, user

    def logout_user(self, refresh_token: str) -> None:
        old_hash = hash_token(refresh_token)
        token_record = (
            self.db.query(RefreshToken)
            .filter(RefreshToken.token_hash == old_hash)
            .first()
        )
        if token_record:
            token_record.revoked_at = datetime.now(timezone.utc)
            self.db.commit()

    def update_password(self, user: User, current_password: str, new_password: str) -> bool:
        if not verify_password(current_password, user.password_hash):
            return False
        user.password_hash = hash_password(new_password)
        self.db.commit()
        return True
