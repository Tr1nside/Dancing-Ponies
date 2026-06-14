from pydantic import BaseModel

from datetime import datetime


class WishListCreate(BaseModel):
    title: str
    emoji: str


class WishListResponse(BaseModel):
    id: int
    title: str
    emoji: str
    owner_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
