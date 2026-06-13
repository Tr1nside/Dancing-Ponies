from sqlalchemy import or_
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database import get_db
from src.auth import get_current_user
from src.models import WishList, User, Invite, Wish
from src.schemas.wishlists import WishListCreate, WishListResponse
from src.schemas.invites import InviteResponse
from src.schemas.wishes import WishCreate, WishResponse
import secrets

router = APIRouter(prefix="/wishlists", tags=["wishlists"])


@router.get("/", response_model=list[WishListResponse])
async def get_wishlists(
    db: Session = Depends(get_db), user: dict = Depends(get_current_user)
) -> list[WishList]:
    user_id: int = user["id"]
    return (
        db.query(WishList)
        .filter(
            or_(WishList.owner_id == user_id, WishList.members.any(User.id == user_id))
        )
        .all()
    )


@router.post("/", response_model=WishListResponse)
async def create_wishlists(data: WishListCreate, db: Session = Depends(get_db)):
    wishlist = WishList(
        title=data.title,
        emoji=data.emoji,
        owner_id=data.owner_id,
    )
    db.add(wishlist)
    db.commit()
    db.refresh(wishlist)
    return wishlist


@router.delete("/{wishlist_id}", response_model=dict)
async def delete_wishlist(wishlist_id: int, db: Session = Depends(get_db)) -> dict:
    wishlist = db.query(WishList).filter(WishList.id == wishlist_id).first()
    if wishlist is None:
        raise HTTPException(status_code=404, detail="WishList not found")

    db.delete(wishlist)
    db.commit()
    return {"deleted_id": wishlist.id}


@router.delete("/{wishlist_id}/members/{user_id}", response_model=dict)
async def kick_member(
    wishlist_id: int, user_id: int, db: Session = Depends(get_db)
) -> dict:
    wishlist = db.query(WishList).filter(WishList.id == wishlist_id).first()
    if wishlist is None:
        raise HTTPException(status_code=404, detail="WishList not found")

    kicked_user = db.query(User).filter(User.id == user_id).first()
    if kicked_user is None or kicked_user not in wishlist.members:
        raise HTTPException(status_code=404, detail="User not found in wishlist")

    wishlist.members.remove(kicked_user)
    db.commit()

    return {"wishlist_id": wishlist.id, "kicked_user": kicked_user.id}


@router.post("/{wishlist_id}/invite", response_model=InviteResponse)
async def create_invite(wishlist_id: int, db: Session = Depends(get_db)) -> Invite:
    token = secrets.token_urlsafe(16)
    invite = Invite(wishlist_id=wishlist_id, token=token)
    db.add(invite)
    db.commit()
    db.refresh(invite)
    return invite


@router.get("/{wishlist_id}/wishes")
async def get_wishes(wishlist_id: int, db: Session = Depends(get_db)) -> list:
    wishes = db.query(Wish).filter(Wish.wishlist_id == wishlist_id).all()
    return wishes


@router.post("/{wishlist_id}/wishes", response_model=WishResponse)
async def create_wish(data: WishCreate, db: Session = Depends(get_db)) -> Wish:
    wish = Wish(
        wishlist_id=data.wishlist_id,
        title=data.title,
        description=data.description,
        url=data.url,
        price=data.price,
    )
    db.add(wish)
    db.commit()
    db.refresh(wish)
    return wish
