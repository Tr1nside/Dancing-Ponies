from pydantic import BaseModel
from datetime import datetime


class WishListCreate(BaseModel):
    title: str
    emoji: str


class UserResponse(BaseModel):
    id: int
    first_name: str
    username: str | None = None

    model_config = {"from_attributes": True}


class WishListResponse(BaseModel):
    id: int
    title: str
    emoji: str
    owner_id: int
    owner: UserResponse
    created_at: datetime
    members: list[UserResponse] = []

    model_config = {"from_attributes": True}


class WishListUpdate(BaseModel):
    title: str | None = None
    emoji: str | None = None
