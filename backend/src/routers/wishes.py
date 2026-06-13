from fastapi import APIRouter

router = APIRouter(prefix="/wishes", tags=["wishes"])


@router.get("/{wish_id}")
async def get_wish(wish_id: int) -> dict:
    return {}


@router.delete("/{wish_id}")
async def delete_wish(wish_id: int) -> dict:
    return {"deleted_id": wish_id}


@router.patch("/{wish_id}/complete")
async def complete_wish(wish_id: int) -> dict:
    return {"completed_id": wish_id}
