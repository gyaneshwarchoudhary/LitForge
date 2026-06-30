from pydantic import BaseModel, Field


class QueryRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=1000)
    top_k: int = Field(default=5, ge=1, le=20)


class ChunkResult(BaseModel):
    text: str
    score: float
    chunk_index: int
    title: str


class QueryResponse(BaseModel):
    document_id: int
    question: str
    answer: str
    profile_used: bool
    profile_context: str
    retrieved_context: str
    combined_context: str
    results: list[ChunkResult]
