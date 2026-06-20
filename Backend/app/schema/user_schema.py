from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ── Signup ────────────────────────────────────────────────────


class UserCreate(BaseModel):
    """Schema for user registration."""

    username: str = Field(
        min_length=3,
        max_length=50,
        description="Alphanumeric username (underscores allowed)",
    )
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


# ── Login ─────────────────────────────────────────────────────


class UserLogin(BaseModel):
    """Schema for user login — accepts email or username."""

    email: str = EmailStr
    password: str = Field(min_length=8, max_length=128)


# ── Read / Response ──────────────────────────────────────────


class UserRead(BaseModel):
    """Public-facing user representation (no password)."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: EmailStr
    is_active: bool
    created_at: datetime


# ── JWT Token ─────────────────────────────────────────────────


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: int | None = None
    email: EmailStr | None = None
