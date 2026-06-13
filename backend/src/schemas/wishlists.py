from pydantic import BaseModel

from datetime import datetime


class WishListCreate(BaseModel):
    owner_id: int
    title: str
    emoji: str


class WishListResponse(BaseModel):
    id: int
    owner_id: int
    title: str
    emoji: str
    created_at: datetime

    model_config = {"from_attributes": True}
