from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependecies import get_current_user
from app.core.database import get_db
from app.models.user_model import User
from app.schema.conversation_schema import ConversationOut, ConversationSummary
from app.schema.query_schema import QueryRequest, QueryResponse
from app.services.conversation_service import (
    get_conversation_with_turns,
    list_conversations_for_document,
)
from app.services.query_service import query_document

router = APIRouter(prefix="/query", tags=["Query"])


@router.post(
    "/{document_id}",
    response_model=QueryResponse,
    summary="Ask a question about a specific document",
)
def query_document_endpoint(
    document_id: int,
    body: QueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Embed the question, search Pinecone scoped to the given document,
    inject user profile context and conversation history, then return the answer.

    Pass `conversation_id` to continue an existing conversation; omit it to start a new one.
    The response always includes `conversation_id` for follow-up requests.
    """
    result = query_document(
        db=db,
        document_id=document_id,
        user_id=current_user.id,
        question=body.question,
        top_k=body.top_k,
        conversation_id=body.conversation_id,
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or does not belong to you.",
        )

    if result.get("status") == "not_ready":
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Document is not ready for querying. Check processing_status.",
        )

    return QueryResponse(**result)


@router.get(
    "/{document_id}/conversations",
    response_model=list[ConversationSummary],
    summary="List all conversations for a document",
)
def list_conversations(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all conversation sessions the current user has started on this document."""
    conversations = list_conversations_for_document(
        db, user_id=current_user.id, document_id=document_id
    )
    return [
        ConversationSummary(
            id=c.id,
            document_id=c.document_id,
            created_at=c.created_at,
            turn_count=len(c.turns),
        )
        for c in conversations
    ]


@router.get(
    "/{document_id}/conversations/{conversation_id}",
    response_model=ConversationOut,
    summary="Fetch full history of a conversation",
)
def get_conversation_history(
    document_id: int,
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all turns for a specific conversation, in chronological order."""
    return get_conversation_with_turns(
        db,
        conversation_id=conversation_id,
        user_id=current_user.id,
        document_id=document_id,
    )
