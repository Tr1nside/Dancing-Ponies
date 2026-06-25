from pydantic import BaseModel


class ReactionCreate(BaseModel):
    emoji: str
    target_type: str
    target_id: int


class ReactionResponse(BaseModel):
    id: int
    emoji: str
    user_id: int
    target_type: str
    target_id: int

    model_config = {"from_attributes": True}
