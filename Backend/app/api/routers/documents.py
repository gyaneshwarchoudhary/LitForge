from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.dependecies import get_current_user
from app.core.database import get_db
from app.models.user_model import User
from app.schema.document_schema import DocumentRead, DocumentUploadResponse
from app.services.document_service import get_user_documents, save_document

router = APIRouter(prefix="/documents", tags=["Documents"])

# ── Constants ─────────────────────────────────────────────────
MIN_FILE_SIZE = 1 * 1024 * 1024      # 1 MB
MAX_FILE_SIZE = 50 * 1024 * 1024     # 50 MB
ALLOWED_CONTENT_TYPES = {"application/pdf"}


# ── Upload PDF ────────────────────────────────────────────────


@router.post(
    "/upload",
    response_model=DocumentUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a PDF document (1–50 MB)",
)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload a PDF file. Only `.pdf` files between 1 MB and 50 MB are accepted."""
   
    # Validate content type
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed.",
        )
    
    # Read file content
    contents = await file.read()
    file_size = len(contents)

    # Validate file size
    if file_size < MIN_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too small. Minimum size is 1 MB, got {file_size / (1024*1024):.2f} MB.",
        )

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size is 50 MB, got {file_size / (1024*1024):.2f} MB.",
        )

    document = save_document(
        db=db,
        user_id=current_user.id,
        filename=file.filename,
        file_bytes=contents,
        content_type=file.content_type,
    )

    return DocumentUploadResponse(
        id=document.id,
        filename=document.filename,
        file_size=document.file_size,
        content_type=document.content_type,
        created_at=document.created_at,
    )


# ── List user's documents ────────────────────────────────────


@router.get(
    "/",
    response_model=list[DocumentRead],
    summary="List all documents uploaded by the current user",
)
def list_my_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all PDF documents belonging to the authenticated user."""
    return get_user_documents(db, current_user.id)


