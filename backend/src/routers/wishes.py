from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database import get_db
from src.models import Wish
from src.schemas.wishes import WishResponse

router = APIRouter(prefix="/wishes", tags=["wishes"])


@router.get("/{wish_id}", response_model=WishResponse)
async def get_wish(wish_id: int, db: Session = Depends(get_db)) -> Wish:
    wish = db.query(Wish).filter(Wish.id == wish_id).first()
    if not wish:
        raise HTTPException(status_code=404, detail="Wish not found")
    return wish


@router.delete("/{wish_id}")
async def delete_wish(wish_id: int, db: Session = Depends(get_db)) -> dict:
    wish = db.query(Wish).filter(Wish.id == wish_id).first()
    if not wish:
        raise HTTPException(status_code=404, detail="Wish not found")
    db.delete(wish)
    db.commit()
    return {"deleted_id": wish.id}


@router.patch("/{wish_id}/complete")
async def complete_wish(wish_id: int, db: Session = Depends(get_db)) -> dict:
    wish = db.query(Wish).filter(Wish.id == wish_id).first()
    if not wish:
        raise HTTPException(status_code=404, detail="Wish not found")
    wish.is_complete = True
    db.commit()
    return {"completed_id": wish.id}
