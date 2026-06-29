import logging

from sqlalchemy.orm import Session

from app.models.document_model import Document
from app.services.pinecone_service import search_chunks

logger = logging.getLogger(__name__)


def query_document(
    db: Session,
    document_id: int,
    user_id: int,
    question: str,
    top_k: int,
) -> list[dict]:
    """Verify ownership then search Pinecone for relevant chunks."""
    document = (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == user_id)
        .first()
    )
    if document is None:
        return None  # caller raises 404

    if document.processing_status != "completed":
        return []  # caller raises 422

    return search_chunks(
        question=question,
        document_id=document_id,
        user_id=user_id,
        top_k=top_k,
    )
