from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependecies import get_current_user
from app.core.database import get_db
from app.models.user_model import User
from app.schema.user_profile_schema import UserProfileCreate, UserProfileRead, UserProfileUpdate
from app.services.user_profile_service import (
    create_user_profile,
    delete_user_profile,
    get_user_profile,
    update_user_profile,
)

router = APIRouter(prefix="/profile", tags=["User Profile"])


# ── Get Profile ───────────────────────────────────────────────


@router.get(
    "/",
    response_model=UserProfileRead,
    summary="Get my profile",
)
def read_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the onboarding profile of the currently authenticated user."""
    profile = get_user_profile(db, current_user.id)
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found.",
        )
    return profile


# ── Create Profile ────────────────────────────────────────────


@router.post(
    "/",
    response_model=UserProfileRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create my profile",
)
def create_my_profile(
    profile_data: UserProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create an onboarding profile for the currently authenticated user."""
    try:
        profile = create_user_profile(db, current_user.id, profile_data)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )
    return profile


# ── Upsert Profile ────────────────────────────────────────────


@router.put(
    "/",
    response_model=UserProfileRead,
    summary="Upsert my profile",
)
def upsert_my_profile(
    profile_data: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create or fully replace the onboarding profile for the currently authenticated user."""
    return update_user_profile(db, current_user.id, profile_data)


# ── Delete Profile ────────────────────────────────────────────


@router.delete(
    "/",
    summary="Delete my profile",
)
def delete_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete the onboarding profile of the currently authenticated user."""
    deleted = delete_user_profile(db, current_user.id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found.",
        )
    return {"message": "Profile deleted successfully."}
