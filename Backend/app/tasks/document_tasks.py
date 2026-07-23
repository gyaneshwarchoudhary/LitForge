import logging

from app.core.celery_app import celery_app
from app.core.database import SessionLocal
from app.models.document_model import Document
from app.services.document_service import process_and_store_vectors

logger = logging.getLogger(__name__)


@celery_app.task(name="process_document")
def process_document_task(document_id: int) -> None:
    """Load the document by id and run the extraction/chunking/embedding pipeline."""
    db = SessionLocal()
    try:
        document = db.query(Document).filter(Document.id == document_id).first()
        if document is None:
            logger.error(f"Document {document_id} not found for processing")
            return
        process_and_store_vectors(db=db, document=document)
    finally:
        db.close()
