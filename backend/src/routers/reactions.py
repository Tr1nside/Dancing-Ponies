from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from src.database import get_db
from src.auth import get_current_user
from src.models import Reaction
from src.schemas.reactions import ReactionCreate, ReactionResponse

router = APIRouter(prefix="/reactions", tags=["reactions"])

NOT_FOUND_STATUS = 404
FORBIDDEN_STATUS = 403


@router.get("/", response_model=list[ReactionResponse])
async def list_reactions(
    target_type: str = Query(...),
    target_id: int = Query(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> list[Reaction]:
    return (
        db.query(Reaction)
        .filter(Reaction.target_type == target_type, Reaction.target_id == target_id)
        .all()
    )


@router.get("/all", response_model=list[ReactionResponse])
async def list_reactions_for_many(
    target_type: str = Query(...),
    target_ids: str = Query(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> list[Reaction]:
    ids = [int(i) for i in target_ids.split(",") if i.strip()]
    if not ids:
        return []
    return (
        db.query(Reaction)
        .filter(Reaction.target_type == target_type, Reaction.target_id.in_(ids))
        .all()
    )


@router.post("/", response_model=ReactionResponse)
async def upsert_reaction(
    reaction_data: ReactionCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> Reaction:
    user_id: int = current_user["id"]
    existing = (
        db.query(Reaction)
        .filter(
            Reaction.user_id == user_id,
            Reaction.target_type == reaction_data.target_type,
            Reaction.target_id == reaction_data.target_id,
        )
        .first()
    )
    if existing:
        existing.emoji = reaction_data.emoji
        db.commit()
        db.refresh(existing)
        return existing

    reaction = Reaction(
        emoji=reaction_data.emoji,
        user_id=user_id,
        target_type=reaction_data.target_type,
        target_id=reaction_data.target_id,
    )
    db.add(reaction)
    db.commit()
    db.refresh(reaction)
    return reaction


@router.delete("/{reaction_id}")
async def delete_reaction(
    reaction_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    reaction = db.query(Reaction).filter(Reaction.id == reaction_id).first()
    if not reaction:
        raise HTTPException(status_code=NOT_FOUND_STATUS, detail="Reaction not found")
    if reaction.user_id != current_user["id"]:
        raise HTTPException(status_code=FORBIDDEN_STATUS, detail="No access")
    db.delete(reaction)
    db.commit()
    return {"deleted_id": reaction.id}
