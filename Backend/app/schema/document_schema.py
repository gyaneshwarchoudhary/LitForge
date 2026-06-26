from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DocumentRead(BaseModel):
    """Public-facing document representation."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    filename: str
    file_size: int
    content_type: str
    total_pages: int | None = None
    total_chunks: int | None = None
    processing_status: str
    created_at: datetime


class DocumentUploadResponse(BaseModel):
    """Response after a successful upload."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    filename: str
    file_size: int
    content_type: str
    total_pages: int | None = None
    total_chunks: int | None = None
    processing_status: str
    created_at: datetime
    message: str = "File uploaded and processed successfully"
