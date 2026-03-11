"""Auth API routes."""

from fastapi import APIRouter, Depends, HTTPException, Response, Cookie, status
from sqlalchemy.orm import Session
from typing import Optional

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.models import User
from app.schemas.auth import (
    AuthResponse,
    PasswordUpdateRequest,
    UserLoginRequest,
    UserResponse,
    UserSignupRequest,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])

COOKIE_PARAMS = {
    "httponly": True,
    "samesite": "lax",
    "secure": False,  # Set to True in production
    "path": "/",
}


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(body: UserSignupRequest, response: Response, db: Session = Depends(get_db)):
    service = AuthService(db)
    try:
        user = service.create_user(body.full_name, body.email, body.password)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))

    access, refresh = service.issue_tokens(user)

    response.set_cookie("access_token", access, max_age=1800, **COOKIE_PARAMS)
    response.set_cookie("refresh_token", refresh, max_age=604800, **COOKIE_PARAMS)

    return user


@router.post("/login", response_model=UserResponse)
def login(body: UserLoginRequest, response: Response, db: Session = Depends(get_db)):
    service = AuthService(db)
    user = service.authenticate_user(body.email, body.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access, refresh = service.issue_tokens(user)

    response.set_cookie("access_token", access, max_age=1800, **COOKIE_PARAMS)
    response.set_cookie("refresh_token", refresh, max_age=604800, **COOKIE_PARAMS)

    return user


@router.post("/refresh", response_model=UserResponse)
def refresh_token(
    response: Response,
    refresh_token: Optional[str] = Cookie(None),
    db: Session = Depends(get_db),
):
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No refresh token",
        )

    service = AuthService(db)
    result = service.rotate_refresh_token(refresh_token)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    access, new_refresh, user = result

    response.set_cookie("access_token", access, max_age=1800, **COOKIE_PARAMS)
    response.set_cookie("refresh_token", new_refresh, max_age=604800, **COOKIE_PARAMS)

    return user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    response: Response,
    refresh_token: Optional[str] = Cookie(None),
    db: Session = Depends(get_db),
):
    if refresh_token:
        service = AuthService(db)
        service.logout_user(refresh_token)

    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/password", status_code=status.HTTP_204_NO_CONTENT)
def update_password(
    body: PasswordUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AuthService(db)
    success = service.update_password(current_user, body.current_password, body.new_password)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
