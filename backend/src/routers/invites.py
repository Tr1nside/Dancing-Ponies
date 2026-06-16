from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database import get_db
from src.models import Invite, User
from src.auth import get_current_user

router = APIRouter(prefix="/invites", tags=["invites"])


@router.post("/{token}/accept")
async def accept_invite(
    token: str,
    accepted_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    user_id: int = accepted_user["id"]
    invite = db.query(Invite).filter(Invite.token == token).first()
    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found")

    wishlist = invite.wishlist
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user in wishlist.members or user == wishlist.owner:
        raise HTTPException(status_code=400, detail="Already a member")

    wishlist.members.append(user)
    db.delete(invite)
    db.commit()

    return {"wishlist_id": wishlist.id}
