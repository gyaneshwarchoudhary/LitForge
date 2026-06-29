from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.types import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class UserProfile(Base):
    """Onboarding / personalization profile for an authenticated user."""

    __tablename__ = "user_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    # List fields stored as JSON arrays
    goals: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    current_challenges: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    personality_traits: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    environment_constraints: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    existing_habits: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    areas_to_improve: Mapped[list] = mapped_column(JSON, nullable=False, default=list)

    # Scalar fields
    preferred_learning_style: Mapped[str | None] = mapped_column(String(30), nullable=True)
    available_time_per_week_hours: Mapped[float | None] = mapped_column(Float, nullable=True)
    bio: Mapped[str | None] = mapped_column(String(500), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # relationship back to user
    user = relationship("User", back_populates="profile")

    def __repr__(self) -> str:
        return f"<UserProfile id={self.id} user_id={self.user_id}>"
