from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field

# ── Enums ─────────────────────────────────────────────────────


class LearningStyle(str, Enum):
    visual = "visual"
    auditory = "auditory"
    reading_writing = "reading_writing"
    kinesthetic = "kinesthetic"
    mixed = "mixed"


# ── Create ────────────────────────────────────────────────────


class UserProfileCreate(BaseModel):
    """Used for initial creation — all fields optional."""

    goals: list[str] = []
    current_challenges: list[str] = []
    personality_traits: list[str] = []
    preferred_learning_style: LearningStyle | None = None
    available_time_per_week_hours: float | None = Field(None, ge=0, le=168)
    environment_constraints: list[str] = []
    existing_habits: list[str] = []
    areas_to_improve: list[str] = []
    bio: str | None = Field(None, max_length=500)


# ── Update ────────────────────────────────────────────────────


class UserProfileUpdate(UserProfileCreate):
    """Used for partial updates — identical structure to Create."""

    pass


# ── Read / Response ───────────────────────────────────────────


class UserProfileRead(UserProfileCreate):
    """Response schema — includes DB metadata."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
