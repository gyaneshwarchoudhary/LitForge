import logging
import os
import uuid
from pathlib import Path

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.document_model import Document
from app.services.pdf_extractor import extract_text_from_pdf
from app.services.chunking_service import create_chunks
from app.services.pinecone_service import (
    delete_document_vectors,
    upsert_chunks_to_pinecone,
)

logger = logging.getLogger(__name__)

UPLOAD_DIR = Path("/app/uploads")


def save_document(
    db: Session,
    user_id: int,
    filename: str,
    file_bytes: bytes,
    content_type: str,
) -> Document:
    """Save PDF to disk + create DB record."""
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    ext = os.path.splitext(filename)[1]
    unique_name = f"{uuid.uuid4().hex}{ext}"
    filepath = UPLOAD_DIR / unique_name
    filepath.write_bytes(file_bytes)

    document = Document(
        user_id=user_id,
        filename=filename,
        filepath=str(filepath),
        file_size=len(file_bytes),
        content_type=content_type,
        processing_status="pending",
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return document


def process_and_store_vectors(
    db: Session,
    document: Document,
) -> Document:
    """Extract text → chunk → embed → store in Pinecone."""
    try:
        document.processing_status = "extracting"
        db.commit()

        # 1. Extract text
        logger.info(f"Extracting text from document {document.id}...")
        file_bytes = Path(document.filepath).read_bytes()
        extracted = extract_text_from_pdf(file_bytes)
        document.total_pages = extracted.total_pages
        db.commit()

        # 2. Chunk
        document.processing_status = "chunking"
        db.commit()
        logger.info(
            f"Chunking document {document.id} ({extracted.total_pages} pages)..."
        )
        chunks = create_chunks(
            text=extracted.text,
            document_id=document.id,
            user_id=document.user_id,
            title=extracted.title,
        )
        logger.info(f"Created {len(chunks)} chunks for document {document.id}")
        document.total_chunks = len(chunks)
        db.commit()

        if not chunks:
            document.processing_status = "completed"
            db.commit()
            db.refresh(document)
            logger.info(f"Document {document.id} completed with no extractable text")
            return document

        # 3. Embed + upsert to Pinecone
        document.processing_status = "embedding"
        db.commit()
        logger.info(f"Upserting to Pinecone for document {document.id}...")
        total_upserted = upsert_chunks_to_pinecone(chunks)

        # Done
        document.total_chunks = total_upserted
        document.processing_status = "completed"
        db.commit()
        db.refresh(document)
        logger.info(
            f"Document {document.id} done: {extracted.total_pages} pages, {total_upserted} vectors"
        )

    except Exception as e:
        logger.error(f"Failed to process document {document.id}: {e}")
        document.processing_status = "failed"
        db.commit()
        raise

    return document


def get_user_documents(db: Session, user_id: int) -> list[Document]:
    return (
        db.query(Document)
        .filter(Document.user_id == user_id)
        .order_by(Document.created_at.desc())
        .all()
    )


def delete_document(db: Session, document_id: int, user_id: int) -> None:
    """Delete a document: Pinecone vectors, then the DB row, then the file on disk."""
    document = db.query(Document).filter(Document.id == document_id).first()
    if document is None or document.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or does not belong to you.",
        )

    try:
        delete_document_vectors(document_id)
    except Exception as e:
        logger.error(
            f"Failed to delete Pinecone vectors for document {document_id}: {e}"
        )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to delete document vectors. Document was not deleted.",
        )

    filepath = document.filepath
    db.delete(document)
    db.commit()

    if filepath and os.path.exists(filepath):
        os.remove(filepath)

    logger.info(f"Deleted document {document_id} for user {user_id}")
