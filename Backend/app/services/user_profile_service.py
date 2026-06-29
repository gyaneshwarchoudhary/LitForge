import logging

from sqlalchemy.orm import Session

from app.models.user_profile_model import UserProfile
from app.schema.user_profile_schema import UserProfileCreate, UserProfileUpdate

logger = logging.getLogger(__name__)


# ── Fetch ─────────────────────────────────────────────────────


def get_user_profile(db: Session, user_id: int) -> UserProfile | None:
    """Fetch profile for a given user, or None if not created yet."""
    return db.query(UserProfile).filter(UserProfile.user_id == user_id).first()


# ── Create ────────────────────────────────────────────────────


def create_user_profile(db: Session, user_id: int, data: UserProfileCreate) -> UserProfile:
    """
    Create a new profile for the user.

    Raises:
        ValueError: If a profile already exists for this user.
    """
    existing = get_user_profile(db, user_id)
    if existing is not None:
        raise ValueError("A profile already exists for this user.")

    profile = UserProfile(user_id=user_id, **data.model_dump())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    logger.info("Created profile for user_id=%s", user_id)
    return profile


# ── Update / Upsert ───────────────────────────────────────────


def update_user_profile(db: Session, user_id: int, data: UserProfileUpdate) -> UserProfile:
    """
    Update existing profile with provided data.

    If no profile exists yet, create one (upsert behaviour).
    Uses model_dump(exclude_unset=False) to allow explicit null/empty resets.
    """
    profile = get_user_profile(db, user_id)

    if profile is None:
        logger.info("No existing profile for user_id=%s — creating via upsert", user_id)
        return create_user_profile(db, user_id, data)

    for field, value in data.model_dump(exclude_unset=False).items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    logger.info("Updated profile for user_id=%s", user_id)
    return profile


# ── Delete ────────────────────────────────────────────────────


def delete_user_profile(db: Session, user_id: int) -> bool:
    """
    Delete the profile for the given user.

    Returns True if deleted, False if not found.
    """
    profile = get_user_profile(db, user_id)
    if profile is None:
        return False

    db.delete(profile)
    db.commit()
    logger.info("Deleted profile for user_id=%s", user_id)
    return True
