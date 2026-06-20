from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependecies import get_current_user
from app.core.database import get_db
from app.core.security import create_access_token
from app.models.user_model import User
from app.schema.user_schema import Token, UserCreate, UserLogin, UserRead
from app.services.auth_service import authenticate_user, create_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ── Signup ────────────────────────────────────────────────────


@router.post(
    "/signup",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """Create a new user account with username, email, and password."""
    try:
        user = create_user(db, user_data)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )
    return user


# ── Login ─────────────────────────────────────────────────────


@router.post(
    "/login",
    response_model=Token,
    summary="Authenticate and receive a JWT token",
)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Authenticate with email/username and password. Returns a JWT access token."""
    user = authenticate_user(db, credentials.email, credentials.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"user_id": user.id, "sub": user.email}
    )
    return Token(access_token=access_token)


# ── Current User ──────────────────────────────────────────────


@router.get(
    "/me",
    response_model=UserRead,
    summary="Get the currently authenticated user",
)
def read_current_user(current_user: User = Depends(get_current_user)):
    """Return the profile of the currently authenticated user."""
    return current_user
