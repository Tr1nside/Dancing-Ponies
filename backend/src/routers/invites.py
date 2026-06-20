from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database import get_db
from src.models import Invite, User
from src.auth import get_current_user

router = APIRouter(prefix="/invites", tags=["invites"])

NOT_FOUND_ERROR_CODE = 404
CONFLICT_ERROR_CODE = 409


@router.post("/{token}/accept")
async def accept_invite(
    token: str,
    accepted_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    user_id: int = accepted_user["id"]
    invite = db.query(Invite).filter(Invite.token == token).first()
    if not invite:
        raise HTTPException(status_code=NOT_FOUND_ERROR_CODE, detail="Invite not found")

    wishlist = invite.wishlist
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=NOT_FOUND_ERROR_CODE, detail="User not found")

    if user in wishlist.members or user == wishlist.owner_id:
        raise HTTPException(status_code=CONFLICT_ERROR_CODE, detail="Already a member")

    wishlist.members.append(user)
    db.delete(invite)
    db.commit()

    return {"wishlist_id": wishlist.id}
