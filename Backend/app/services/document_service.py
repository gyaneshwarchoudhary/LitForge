import os
from fastapi import Response
import uuid
from pathlib import Path

from sqlalchemy.orm import Session

from app.models.document_model import Document

# Directory where uploaded PDFs are stored
UPLOAD_DIR = Path("/app/uploads")


def save_document(
    db: Session,
    user_id: int,
    filename: str,
    file_bytes: bytes,
    content_type: str,
) -> Document:
    """
    Persist the uploaded PDF to disk and create a database record.
    """
    # Ensure upload directory exists
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    # Generate a unique filename to avoid collisions
    ext = os.path.splitext(filename)[1]  # .pdf
    unique_name = f"{uuid.uuid4().hex}{ext}"
    filepath = UPLOAD_DIR / unique_name

    # Write file to disk
    filepath.write_bytes(file_bytes)

    # Create DB record
    document = Document(
        user_id=user_id,
        filename=filename,
        filepath=str(filepath),
        file_size=len(file_bytes),
        content_type=content_type,
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    return document


def get_user_documents(db: Session, user_id: int) -> list[Document]:
    """Return all documents belonging to the given user, newest first."""
    return (
        db.query(Document)
        .filter(Document.user_id == user_id)
        .order_by(Document.created_at.desc())
        .all()
    )
