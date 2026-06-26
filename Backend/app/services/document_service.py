import logging
import os
import uuid
from pathlib import Path

from sqlalchemy.orm import Session

from app.models.document_model import Document
from app.services.pdf_extractor import extract_text_from_pdf
from app.services.chunking_service import create_hierarchical_chunks
from app.services.pinecone_service import upsert_chunks_to_pinecone

logger = logging.getLogger(__name__)

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
        processing_status="pending",
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    return document


def process_and_store_vectors(
    db: Session,
    document: Document,
    file_bytes: bytes,
) -> Document:
    """
    Full pipeline: extract text → hierarchical chunking → embed & store in Pinecone.

    Updates the document's processing_status, total_pages, and total_chunks in the DB.
    """
    try:
        # Mark as processing
        document.processing_status = "processing"
        db.commit()

        # Step 1: Extract text from PDF using PyMuPDF
        logger.info(f"Extracting text from document_id={document.id}...")
        extracted = extract_text_from_pdf(file_bytes)

        document.total_pages = extracted.total_pages
        db.commit()

        # Step 2: Create hierarchical chunks
        logger.info(f"Chunking document_id={document.id} ({extracted.total_pages} pages)...")
        chunks = create_hierarchical_chunks(
            extracted_doc=extracted,
            document_id=document.id,
            user_id=document.user_id,
        )
        logger.info(f"Created {len(chunks)} chunks for document_id={document.id}")

        # Step 3: Embed and upsert to Pinecone
        logger.info(f"Upserting to Pinecone for document_id={document.id}...")
        total_upserted = upsert_chunks_to_pinecone(chunks)

        # Mark as completed
        document.total_chunks = total_upserted
        document.processing_status = "completed"
        db.commit()
        db.refresh(document)

        logger.info(
            f"Document {document.id} processed: "
            f"{extracted.total_pages} pages, {total_upserted} vectors"
        )

    except Exception as e:
        logger.error(f"Failed to process document_id={document.id}: {e}")
        document.processing_status = "failed"
        db.commit()
        raise

    return document


def get_user_documents(db: Session, user_id: int) -> list[Document]:
    """Return all documents belonging to the given user, newest first."""
    return (
        db.query(Document)
        .filter(Document.user_id == user_id)
        .order_by(Document.created_at.desc())
        .all()
    )
