import logging

from sqlalchemy.orm import Session

from app.models.document_model import Document
from app.services.context_injection_service import build_combined_context
from app.services.llm_service import generate_answer
from app.services.pinecone_service import search_chunks
from app.services.user_profile_service import get_user_profile

logger = logging.getLogger(__name__)


def query_document(
    db: Session,
    document_id: int,
    user_id: int,
    question: str,
    top_k: int,
) -> dict | None:
    """
    Returns:
      None                        → document not found / not owned by user (caller raises 404)
      {"status": "not_ready"}    → document still processing (caller raises 422)
      full payload dict           → success
    """
    document = (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == user_id)
        .first()
    )
    if document is None:
        return None

    if document.processing_status != "completed":
        return {"status": "not_ready"}

    profile = get_user_profile(db, user_id)
    chunks = search_chunks(
        question=question,
        document_id=document_id,
        user_id=user_id,
        top_k=top_k,
    )

    context = build_combined_context(profile=profile, chunks=chunks, question=question)
    answer = generate_answer(context["combined_context"])

    return {
        "document_id": document_id,
        "question": question,
        "results": chunks,
        "answer": answer,
        **context,
    }
