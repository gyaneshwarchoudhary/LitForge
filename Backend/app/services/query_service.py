import logging

from sqlalchemy.orm import Session

from app.models.document_model import Document
from app.services.context_injection_service import build_combined_context
from app.services.conversation_service import (
    build_history_text,
    create_conversation,
    get_and_validate_conversation,
    get_recent_turns,
    store_turn,
)
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
    conversation_id: int | None = None,
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

    # ── Conversation setup ────────────────────────────────────
    if conversation_id is None:
        conversation = create_conversation(db, user_id=user_id, document_id=document_id)
    else:
        conversation = get_and_validate_conversation(
            db, conversation_id=conversation_id, user_id=user_id, document_id=document_id
        )

    recent_turns = get_recent_turns(db, conversation_id=conversation.id)
    history_text = build_history_text(recent_turns)

    # ── Retrieval ─────────────────────────────────────────────
    profile = get_user_profile(db, user_id)
    chunks = search_chunks(
        question=question,
        document_id=document_id,
        user_id=user_id,
        top_k=top_k,
    )

    # ── Context assembly (profile + chunks + history + question) ──
    context = build_combined_context(
        profile=profile,
        chunks=chunks,
        question=question,
        history_text=history_text,
    )

    # ── LLM generation ────────────────────────────────────────
    answer = generate_answer(context["combined_context"])

    # ── Persist the completed turn ────────────────────────────
    store_turn(
        db=db,
        conversation_id=conversation.id,
        user_id=user_id,
        document_id=document_id,
        question=question,
        answer=answer,
        combined_context=context["combined_context"],
    )

    return {
        "document_id": document_id,
        "conversation_id": conversation.id,
        "question": question,
        "results": chunks,
        "answer": answer,
        **context,
    }
