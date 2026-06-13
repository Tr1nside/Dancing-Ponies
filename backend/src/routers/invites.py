from fastapi import APIRouter

router = APIRouter(prefix="/invites", tags=["invites"])


@router.post("/{token}/accept")
async def accept_invite(token: str) -> dict:
    return {}
