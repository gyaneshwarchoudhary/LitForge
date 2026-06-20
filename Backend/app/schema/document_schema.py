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
    created_at: datetime


class DocumentUploadResponse(BaseModel):
    """Response after a successful upload."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    filename: str
    file_size: int
    content_type: str
    created_at: datetime
    message: str = "File uploaded successfully"
