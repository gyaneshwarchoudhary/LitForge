from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.user_model import User
from app.schema.user_schema import UserCreate


def get_user_by_email(db: Session, email: str) -> User | None:
    """Look up a user by their email address."""
    return db.query(User).filter(User.email == email).first()


def get_user_by_username(db: Session, username: str) -> User | None:
    """Look up a user by their username."""
    return db.query(User).filter(User.username == username).first()


def get_user_by_id(db: Session, user_id: int) -> User | None:
    """Look up a user by their primary key."""
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, user_data: UserCreate) -> User:
    """
    Register a new user.

    Raises:
        ValueError: If the email or username is already taken.
    """
    # Check for existing email
    if get_user_by_email(db, user_data.email):
        raise ValueError("A user with this email already exists.")

    # Check for existing username
    if get_user_by_username(db, user_data.username):
        raise ValueError("A user with this username already exists.")

    user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    """
    Authenticate a user by email or username + password.

    Returns the User on success, or None if credentials are invalid.
    """
    user = (
        db.query(User)
        .filter(
            or_(User.email == email, User.username == email)
        )
        .first()
    )

    if user is None:
        return None

    if not verify_password(password, user.hashed_password):
        return None

    return user
