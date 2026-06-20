from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database import get_db
from src.models import Wish
from src.schemas.wishes import WishResponse, CompleteWishRequest, WishUpdate
from src.auth import get_current_user

router = APIRouter(prefix="/wishes", tags=["wishes"])

NOT_FOUND_ERROR_CODE = 404
NOT_ACCESS_ERROR_CODE = 403


def _check_acces(current_user: dict, wish: Wish):
    if current_user["id"] != wish.wishlist.owner_id and current_user["id"] not in [
        member.id for member in wish.wishlist.members
    ]:
        return False
    return True


@router.get("/{wish_id}", response_model=WishResponse)
async def get_wish(
    wish_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> Wish:
    wish = db.query(Wish).filter(Wish.id == wish_id).first()
    if not wish:
        raise HTTPException(status_code=NOT_FOUND_ERROR_CODE, detail="Wish not found")
    if not _check_acces(current_user, wish):
        raise HTTPException(status_code=NOT_ACCESS_ERROR_CODE, detail="No access")

    return wish


@router.delete("/{wish_id}")
async def delete_wish(
    wish_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    wish = db.query(Wish).filter(Wish.id == wish_id).first()
    if not wish:
        raise HTTPException(status_code=NOT_FOUND_ERROR_CODE, detail="Wish not found")
    if not _check_acces(current_user, wish):
        raise HTTPException(status_code=NOT_ACCESS_ERROR_CODE, detail="No access")
    db.delete(wish)
    db.commit()
    return {"deleted_id": wish.id}


@router.patch("/{wish_id}", response_model=WishResponse)
async def update_wish(
    wish_id: int,
    update_data: WishUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    wish = db.query(Wish).filter(Wish.id == wish_id).first()
    if not wish:
        raise HTTPException(status_code=NOT_FOUND_ERROR_CODE, detail="Wish not found")

    if not _check_acces(current_user, wish):
        raise HTTPException(status_code=NOT_ACCESS_ERROR_CODE, detail="No access")

    updated_values = update_data.model_dump(exclude_unset=True)
    for key, updated_value in updated_values.items():
        setattr(wish, key, updated_value)

    db.commit()

    return wish


@router.patch("/{wish_id}/complete")
async def complete_wish(
    wish_id: int,
    complete_data: CompleteWishRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    wish = db.query(Wish).filter(Wish.id == wish_id).first()
    if not wish:
        raise HTTPException(status_code=NOT_FOUND_ERROR_CODE, detail="Wish not found")

    if not _check_acces(current_user, wish):
        raise HTTPException(status_code=NOT_ACCESS_ERROR_CODE, detail="No access")

    wish.is_completed = complete_data.is_completed
    db.commit()
    return {"completed_id": wish.id}
