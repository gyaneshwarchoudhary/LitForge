from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependecies import get_current_user
from app.core.database import get_db
from app.models.user_model import User
from app.schema.query_schema import QueryRequest, QueryResponse
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
    inject user profile context, and return the combined context + top chunks.
    """
    result = query_document(
        db=db,
        document_id=document_id,
        user_id=current_user.id,
        question=body.question,
        top_k=body.top_k,
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
