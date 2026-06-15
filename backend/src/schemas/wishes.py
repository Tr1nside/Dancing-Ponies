from pydantic import BaseModel


class CompleteWishRequest(BaseModel):
    is_completed: bool


class WishCreate(BaseModel):
    title: str
    wishlist_id: int
    description: str | None = None
    url: str | None = None
    price: int | None = None


class WishResponse(BaseModel):
    id: int
    title: str
    wishlist_id: int
    description: str | None
    url: str | None
    price: int | None
    is_completed: bool

    model_config = {"from_attributes": True}


class WishUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    price: float | None = None
    url: str | None = None
