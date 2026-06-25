from pydantic import BaseModel
from datetime import datetime

from src.schemas.reactions import ReactionResponse


class TodoItemCreate(BaseModel):
    todolist_id: int
    title: str
    description: str | None = None
    due_date: datetime | None = None
    priority: int = 0


class TodoItemResponse(BaseModel):
    id: int
    todolist_id: int
    title: str
    description: str | None
    is_completed: bool
    due_date: datetime | None
    priority: int
    reactions: list[ReactionResponse] = []

    model_config = {"from_attributes": True}


class TodoItemUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    due_date: datetime | None = None
    priority: int | None = None


class CompleteTodoRequest(BaseModel):
    is_completed: bool
