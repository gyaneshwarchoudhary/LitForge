from datetime import datetime

from pydantic import BaseModel


class ConversationTurnOut(BaseModel):
    id: int
    question: str
    answer: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationOut(BaseModel):
    id: int
    document_id: int
    created_at: datetime
    turns: list[ConversationTurnOut]

    model_config = {"from_attributes": True}


class ConversationSummary(BaseModel):
    id: int
    document_id: int
    created_at: datetime
    turn_count: int
