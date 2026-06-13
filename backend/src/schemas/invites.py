from pydantic import BaseModel
from datetime import datetime


class InviteResponse(BaseModel):
    id: int
    token: str
    created_at: datetime

    model_config = {"from_attributes": True}
