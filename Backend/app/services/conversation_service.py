"""
Conversation lifecycle management:
  - create / validate conversations
  - fetch bounded recent history
  - persist completed turns
  - build history text for prompt injection
"""

import logging

from fastapi import HTTPException, status
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.conversation_model import Conversation
from app.models.conversation_turn_model import ConversationTurn

logger = logging.getLogger(__name__)


def create_conversation(db: Session, user_id: int, document_id: int) -> Conversation:
    conv = Conversation(user_id=user_id, document_id=document_id)
    db.add(conv)
    db.commit()
    db.refresh(conv)
    logger.info("Created conversation id=%d for user=%d document=%d", conv.id, user_id, document_id)
    return conv


def get_and_validate_conversation(
    db: Session, conversation_id: int, user_id: int, document_id: int
) -> Conversation:
    """Fetch conversation and assert it belongs to this user and document."""
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if conv is None or conv.user_id != user_id or conv.document_id != document_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found or does not belong to you.",
        )
    return conv


def get_recent_turns(
    db: Session,
    conversation_id: int,
    max_turns: int = settings.CONVERSATION_MAX_TURNS,
    max_chars: int = settings.CONVERSATION_MAX_HISTORY_CHARS,
) -> list[ConversationTurn]:
    """Return the most recent turns in chronological order, bounded by count and char budget."""
    rows = (
        db.query(ConversationTurn)
        .filter(ConversationTurn.conversation_id == conversation_id)
        .order_by(desc(ConversationTurn.created_at))
        .limit(max_turns)
        .all()
    )
    # rows are newest-first; reverse so they are oldest-first for the prompt
    rows = list(reversed(rows))

    # trim to char budget (measured on question + answer)
    budget = max_chars
    trimmed: list[ConversationTurn] = []
    for turn in rows:
        needed = len(turn.question) + len(turn.answer)
        if budget - needed < 0:
            break
        trimmed.append(turn)
        budget -= needed

    return trimmed


def build_history_text(turns: list[ConversationTurn]) -> str:
    """Render recent turns as a readable block for the LLM prompt."""
    if not turns:
        return ""
    lines = ["## Conversation History"]
    for i, turn in enumerate(turns, 1):
        lines.append(f"\n[Turn {i}]")
        lines.append(f"User: {turn.question}")
        lines.append(f"Assistant: {turn.answer}")
    return "\n".join(lines)


def store_turn(
    db: Session,
    conversation_id: int,
    user_id: int,
    document_id: int,
    question: str,
    answer: str,
    combined_context: str,
) -> ConversationTurn:
    turn = ConversationTurn(
        conversation_id=conversation_id,
        user_id=user_id,
        document_id=document_id,
        question=question,
        answer=answer,
        combined_context=combined_context,
    )
    db.add(turn)
    db.commit()
    db.refresh(turn)
    return turn


def list_conversations_for_document(
    db: Session, user_id: int, document_id: int
) -> list[Conversation]:
    return (
        db.query(Conversation)
        .filter(Conversation.user_id == user_id, Conversation.document_id == document_id)
        .order_by(desc(Conversation.created_at))
        .all()
    )


def get_conversation_with_turns(
    db: Session, conversation_id: int, user_id: int, document_id: int
) -> Conversation:
    conv = get_and_validate_conversation(db, conversation_id, user_id, document_id)
    # eagerly load turns (already ordered by created_at via relationship)
    _ = conv.turns
    return conv
