from sqlalchemy import or_
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database import get_db
from src.auth import get_current_user
from src.models import WishList, User, Invite, Wish, TodoItem, ListType, Reaction
from src.schemas.wishlists import WishListCreate, WishListResponse, WishListUpdate
from src.schemas.invites import InviteResponse
from src.schemas.wishes import WishCreate, WishResponse
from src.schemas.todos import TodoItemCreate, TodoItemResponse
import secrets
from datetime import datetime, timezone, timedelta

router = APIRouter(prefix="/wishlists", tags=["wishlists"])


def _attach_reactions(target_items, target_type: str, db: Session) -> list:
    if not target_items:
        return target_items
    target_ids = [target_item.id for target_item in target_items]
    reactions = (
        db.query(Reaction)
        .filter(Reaction.target_type == target_type, Reaction.target_id.in_(target_ids))
        .all()
    )
    by_target: dict[int, list] = {}
    for reaction in reactions:
        by_target.setdefault(reaction.target_id, []).append(reaction)
    for target_item in target_items:
        target_item.reactions = by_target.get(target_item.id, [])
    return target_items


NOT_FOUND_ERROR_CODE = 404
NOT_ACCESS_ERROR_CODE = 403
WRONG_LIST_TYPE_CODE = 422

TOKEN_LENGHT = 16
TOKEN_DAYS_LIFETIME = 90


def _check_member(user_id: int, wishlist: WishList) -> bool:
    if wishlist.owner_id == user_id:
        return True
    if user_id in [member.id for member in wishlist.members]:
        return True
    return False


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
async def create_wishlist(
    created_data: WishListCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    wishlist = WishList(
        title=created_data.title,
        emoji=created_data.emoji,
        list_type=created_data.list_type,
        owner_id=current_user["id"],
    )
    db.add(wishlist)
    db.commit()
    db.refresh(wishlist)
    return wishlist


@router.get("/{wishlist_id}", response_model=WishListResponse)
async def get_wishlist(
    wishlist_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
) -> WishList:
    wishlist = db.query(WishList).filter(WishList.id == wishlist_id).first()
    if wishlist is None:
        raise HTTPException(
            status_code=NOT_FOUND_ERROR_CODE, detail="WishList not found"
        )
    if not _check_member(user["id"], wishlist):
        raise HTTPException(status_code=NOT_ACCESS_ERROR_CODE, detail="Forbidden")
    return wishlist


@router.patch("/{wishlist_id}", response_model=WishListResponse)
async def update_wishlist(
    wishlist_id: int,
    updated_data: WishListUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> WishList:
    wishlist = db.query(WishList).filter(WishList.id == wishlist_id).first()
    if wishlist is None:
        raise HTTPException(
            status_code=NOT_FOUND_ERROR_CODE, detail="WishList not found"
        )
    if current_user["id"] != wishlist.owner_id:
        raise HTTPException(status_code=NOT_ACCESS_ERROR_CODE, detail="No access")

    if updated_data.title is not None:
        wishlist.title = updated_data.title
    if updated_data.emoji is not None:
        wishlist.emoji = updated_data.emoji

    db.commit()
    db.refresh(wishlist)
    return wishlist


@router.delete("/{wishlist_id}", response_model=dict)
async def delete_wishlist(
    wishlist_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    wishlist = db.query(WishList).filter(WishList.id == wishlist_id).first()
    if wishlist is None:
        raise HTTPException(
            status_code=NOT_FOUND_ERROR_CODE, detail="WishList not found"
        )
    if current_user["id"] != wishlist.owner_id:
        raise HTTPException(status_code=NOT_ACCESS_ERROR_CODE, detail="No access")

    db.query(Wish).filter(Wish.wishlist_id == wishlist_id).delete()
    db.query(TodoItem).filter(TodoItem.todolist_id == wishlist_id).delete()
    db.delete(wishlist)
    db.commit()
    return {"deleted_id": wishlist.id}


@router.delete("/{wishlist_id}/members/{user_id}", response_model=dict)
async def kick_member(
    wishlist_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    wishlist = db.query(WishList).filter(WishList.id == wishlist_id).first()
    if wishlist is None:
        raise HTTPException(
            status_code=NOT_FOUND_ERROR_CODE, detail="WishList not found"
        )
    if current_user["id"] != wishlist.owner_id:
        raise HTTPException(status_code=NOT_ACCESS_ERROR_CODE, detail="No access")

    kicked_user = db.query(User).filter(User.id == user_id).first()
    if kicked_user is None or kicked_user not in wishlist.members:
        raise HTTPException(
            status_code=NOT_FOUND_ERROR_CODE, detail="User not found in wishlist"
        )

    wishlist.members.remove(kicked_user)
    db.commit()
    return {"wishlist_id": wishlist.id, "kicked_user": kicked_user.id}


@router.post("/{wishlist_id}/invite", response_model=InviteResponse)
async def create_invite(
    wishlist_id: int,
    db: Session = Depends(get_db),
) -> Invite:
    token = secrets.token_urlsafe(TOKEN_LENGHT)
    invite = Invite(wishlist_id=wishlist_id, token=token)

    three_months_ago = datetime.now(timezone.utc) - timedelta(days=TOKEN_DAYS_LIFETIME)
    db.query(Invite).filter(Invite.created_at < three_months_ago).delete()

    db.add(invite)
    db.commit()
    db.refresh(invite)
    return invite


@router.get("/{wishlist_id}/wishes", response_model=list[WishResponse])
async def get_wishes(
    wishlist_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> list:
    wishlist = db.query(WishList).filter(WishList.id == wishlist_id).first()
    if wishlist is None or not _check_member(current_user["id"], wishlist):
        raise HTTPException(status_code=NOT_ACCESS_ERROR_CODE, detail="No access")
    if wishlist.list_type != ListType.wishlist:
        raise HTTPException(
            status_code=WRONG_LIST_TYPE_CODE, detail="This list is not a wishlist"
        )
    wishes = db.query(Wish).filter(Wish.wishlist_id == wishlist_id).all()
    return _attach_reactions(wishes, "wish", db)


@router.post("/{wishlist_id}/wishes", response_model=WishResponse)
async def create_wish(
    wishlist_id: int,
    created_data: WishCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> Wish:
    wishlist = db.query(WishList).filter(WishList.id == wishlist_id).first()
    if wishlist is None or not _check_member(current_user["id"], wishlist):
        raise HTTPException(status_code=NOT_ACCESS_ERROR_CODE, detail="No access")
    if wishlist.list_type != ListType.wishlist:
        raise HTTPException(
            status_code=WRONG_LIST_TYPE_CODE, detail="This list is not a wishlist"
        )
    wish = Wish(
        wishlist_id=wishlist_id,
        title=created_data.title,
        description=created_data.description,
        url=created_data.url,
        price=created_data.price,
    )
    db.add(wish)
    db.commit()
    db.refresh(wish)
    return wish


@router.get("/{wishlist_id}/todos", response_model=list[TodoItemResponse])
async def get_todos(
    wishlist_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> list:
    wishlist = db.query(WishList).filter(WishList.id == wishlist_id).first()
    if wishlist is None or not _check_member(current_user["id"], wishlist):
        raise HTTPException(status_code=NOT_ACCESS_ERROR_CODE, detail="No access")
    if wishlist.list_type != ListType.todolist:
        raise HTTPException(
            status_code=WRONG_LIST_TYPE_CODE, detail="This list is not a todolist"
        )
    todo_items = db.query(TodoItem).filter(TodoItem.todolist_id == wishlist_id).all()
    return _attach_reactions(todo_items, "todo", db)


@router.post("/{wishlist_id}/todos", response_model=TodoItemResponse)
async def create_todo(
    wishlist_id: int,
    created_data: TodoItemCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> TodoItem:
    wishlist = db.query(WishList).filter(WishList.id == wishlist_id).first()
    if wishlist is None or not _check_member(current_user["id"], wishlist):
        raise HTTPException(status_code=NOT_ACCESS_ERROR_CODE, detail="No access")
    if wishlist.list_type != ListType.todolist:
        raise HTTPException(
            status_code=WRONG_LIST_TYPE_CODE, detail="This list is not a todolist"
        )
    todo_item = TodoItem(
        todolist_id=wishlist_id,
        title=created_data.title,
        description=created_data.description,
        due_date=created_data.due_date,
        priority=created_data.priority,
    )
    db.add(todo_item)
    db.commit()
    db.refresh(todo_item)
    return todo_item
