from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database import get_db
from src.models import Wish
from src.schemas.wishes import WishResponse, CompleteWishRequest, WishUpdate
from src.auth import get_current_user

router = APIRouter(prefix="/wishes", tags=["wishes"])


@router.get("/{wish_id}", response_model=WishResponse)
async def get_wish(
    wish_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> Wish:
    wish = db.query(Wish).filter(Wish.id == wish_id).first()
    if not wish:
        raise HTTPException(status_code=404, detail="Wish not found")
    if (
        current_user != wish.wishlist.owner
        and current_user not in wish.wishlist.members
    ):
        raise HTTPException(status_code=403, detail="No access")

    return wish


@router.delete("/{wish_id}")
async def delete_wish(
    wish_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    wish = db.query(Wish).filter(Wish.id == wish_id).first()
    if not wish:
        raise HTTPException(status_code=404, detail="Wish not found")
    if (
        current_user != wish.wishlist.owner
        and current_user not in wish.wishlist.members
    ):
        raise HTTPException(status_code=403, detail="No access")
    db.delete(wish)
    db.commit()
    return {"deleted_id": wish.id}


@router.patch("/{wish_id}", response_model=WishResponse)
async def update_wish(
    wish_id: int,
    data: WishUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    wish = db.query(Wish).filter(Wish.id == wish_id).first()
    if not wish:
        raise HTTPException(status_code=404, detail="Wish not found")

    if (
        current_user != wish.wishlist.owner
        and current_user not in wish.wishlist.members
    ):
        raise HTTPException(status_code=403, detail="No access")

    values = data.model_dump(exclude_unset=True)
    for key, value in values.items():
        setattr(wish, key, value)

    db.commit()

    return wish


@router.patch("/{wish_id}/complete")
async def complete_wish(
    wish_id: int,
    data: CompleteWishRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    wish = db.query(Wish).filter(Wish.id == wish_id).first()
    if not wish:
        raise HTTPException(status_code=404, detail="Wish not found")

    if (
        current_user != wish.wishlist.owner
        and current_user not in wish.wishlist.members
    ):
        raise HTTPException(status_code=403, detail="No access")

    wish.is_completed = data.is_completed
    db.commit()
    return {"completed_id": wish.id}
