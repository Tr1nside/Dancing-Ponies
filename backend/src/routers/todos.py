from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database import get_db
from src.models import TodoItem
from src.schemas.todos import TodoItemResponse, CompleteTodoRequest, TodoItemUpdate
from src.auth import get_current_user

router = APIRouter(prefix="/todos", tags=["todos"])

NOT_FOUND_ERROR_CODE = 404
NOT_ACCESS_ERROR_CODE = 403


def _check_access(current_user: dict, item: TodoItem) -> bool:
    todolist = item.todolist
    if current_user["id"] == todolist.owner_id:
        return True
    if current_user["id"] in [member.id for member in todolist.members]:
        return True
    return False


@router.get("/{todo_id}", response_model=TodoItemResponse)
async def get_todo(
    todo_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> TodoItem:
    item = db.query(TodoItem).filter(TodoItem.id == todo_id).first()
    if not item:
        raise HTTPException(status_code=NOT_FOUND_ERROR_CODE, detail="Todo not found")
    if not _check_access(current_user, item):
        raise HTTPException(status_code=NOT_ACCESS_ERROR_CODE, detail="No access")
    return item


@router.delete("/{todo_id}")
async def delete_todo(
    todo_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    item = db.query(TodoItem).filter(TodoItem.id == todo_id).first()
    if not item:
        raise HTTPException(status_code=NOT_FOUND_ERROR_CODE, detail="Todo not found")
    if not _check_access(current_user, item):
        raise HTTPException(status_code=NOT_ACCESS_ERROR_CODE, detail="No access")
    db.delete(item)
    db.commit()
    return {"deleted_id": item.id}


@router.patch("/{todo_id}", response_model=TodoItemResponse)
async def update_todo(
    todo_id: int,
    update_data: TodoItemUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> TodoItem:
    item = db.query(TodoItem).filter(TodoItem.id == todo_id).first()
    if not item:
        raise HTTPException(status_code=NOT_FOUND_ERROR_CODE, detail="Todo not found")
    if not _check_access(current_user, item):
        raise HTTPException(status_code=NOT_ACCESS_ERROR_CODE, detail="No access")

    updated_values = update_data.model_dump(exclude_unset=True)
    for key, value in updated_values.items():
        setattr(item, key, value)

    db.commit()
    return item


@router.patch("/{todo_id}/complete")
async def complete_todo(
    todo_id: int,
    complete_data: CompleteTodoRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    item = db.query(TodoItem).filter(TodoItem.id == todo_id).first()
    if not item:
        raise HTTPException(status_code=NOT_FOUND_ERROR_CODE, detail="Todo not found")
    if not _check_access(current_user, item):
        raise HTTPException(status_code=NOT_ACCESS_ERROR_CODE, detail="No access")

    item.is_completed = complete_data.is_completed
    db.commit()
    return {"completed_id": item.id}
