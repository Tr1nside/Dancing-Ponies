from fastapi import APIRouter

router = APIRouter(prefix="/wishlists", tags=["wishlists"])


@router.get("/")
async def get_wishlists() -> list:
    return []


@router.post("/")
async def create_wishlist() -> dict:
    return {}


@router.delete("/{wishlist_id}")
async def delete_wishlist(wishlist_id: int) -> dict:
    return {"deleted_id": wishlist_id}


@router.delete("/{wishlist_id}/members/{user_id}")
async def kick_member(wishlist_id: int, user_id: int) -> dict:
    return {"wishlist_id": wishlist_id, "kicked_user": user_id}


@router.post("/{wishlist_id}/invite")
async def create_invite(wishlist_id: int) -> dict:
    link = "beb.com/dfsdfkjlasdhklsafd"
    return {"invite_link": link}


@router.get("/{wish_id}/wishes")
async def get_wishes(wish_id: int) -> list:
    return []


@router.post("/{wish_id}/wishes")
async def create_wish(wish_id: int) -> dict:
    return {}
