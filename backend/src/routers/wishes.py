import logging
import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from pathlib import Path
from uuid import uuid4
from io import BytesIO

from PIL import Image

from src.database import get_db
from src.models import Wish, Reaction
from src.schemas.wishes import WishResponse, CompleteWishRequest, WishUpdate
from src.auth import get_current_user

logger = logging.getLogger(__name__)

DEFAULT_UPLOADS_PATH = str(Path(__file__).parent.parent / "uploads")
UPLOAD_BASE_DIR = Path(os.getenv("UPLOADS_DIR", DEFAULT_UPLOADS_PATH))
UPLOAD_DIR = UPLOAD_BASE_DIR / "wishes"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

print(f"[wishes] UPLOAD_DIR = {UPLOAD_DIR.resolve()}")

MAX_IMAGE_SIZE = 550
NOT_FOUND_STATUS = 404
FORBIDDEN_STATUS = 403
NOT_FOUND_MSG = "Wish not found"
NO_ACCESS_MSG = "No access"

router = APIRouter(prefix="/wishes", tags=["wishes"])


def _check_access(user: dict, wish: Wish) -> bool:
    is_owner = user["id"] == wish.wishlist.owner_id
    is_member = user["id"] in [member.id for member in wish.wishlist.members]
    return is_owner or is_member


def _process_image(photo: UploadFile) -> str:
    suffix = Path(photo.filename).suffix if photo.filename else ".png"
    file_name = f"{uuid4().hex}{suffix}"
    file_path = UPLOAD_DIR / file_name
    image_data = photo.file.read()
    if not image_data:
        raise HTTPException(status_code=400, detail="Empty image file")
    image = Image.open(BytesIO(image_data))
    image.load()  # force read to catch corrupt images early
    width, height = image.size
    if width > MAX_IMAGE_SIZE or height > MAX_IMAGE_SIZE:
        if width < height:
            new_width = MAX_IMAGE_SIZE
            new_height = int(height * (MAX_IMAGE_SIZE / width))
        else:
            new_height = MAX_IMAGE_SIZE
            new_width = int(width * (MAX_IMAGE_SIZE / height))
        image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
    min_side = min(image.size)
    left = (image.size[0] - min_side) // 2
    top = (image.size[1] - min_side) // 2
    image = image.crop((left, top, left + min_side, top + min_side))
    image.save(str(file_path))
    return file_name


def _find_wish(wish_id: int, db: Session) -> Wish | None:
    return db.query(Wish).filter(Wish.id == wish_id).first()


def _attach_reactions(target_item, target_type: str, db: Session):
    target_item.reactions = (
        db.query(Reaction)
        .filter(
            Reaction.target_type == target_type, Reaction.target_id == target_item.id
        )
        .all()
    )
    return target_item


def _get_wish(wish_id: int, db: Session) -> Wish:
    wish = _find_wish(wish_id, db)
    if not wish:
        raise HTTPException(status_code=NOT_FOUND_STATUS, detail=NOT_FOUND_MSG)
    return wish


@router.get("/{wish_id}", response_model=WishResponse)
async def get_wish(
    wish_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> Wish:
    wish = _get_wish(wish_id, db)
    if not _check_access(current_user, wish):
        raise HTTPException(status_code=FORBIDDEN_STATUS, detail=NO_ACCESS_MSG)
    return _attach_reactions(wish, "wish", db)


@router.delete("/{wish_id}")
async def delete_wish(
    wish_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    wish = _get_wish(wish_id, db)
    if not _check_access(current_user, wish):
        raise HTTPException(status_code=FORBIDDEN_STATUS, detail=NO_ACCESS_MSG)
    db.delete(wish)
    db.commit()
    return {"deleted_id": wish.id}


@router.patch("/{wish_id}", response_model=WishResponse)
async def update_wish(
    wish_id: int,
    title: str | None = Form(None),
    description: str | None = Form(None),
    price: int | None = Form(None),
    url: str | None = Form(None),
    photo: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    wish = _get_wish(wish_id, db)
    if not _check_access(current_user, wish):
        raise HTTPException(status_code=FORBIDDEN_STATUS, detail=NO_ACCESS_MSG)

    update_data = WishUpdate(
        title=title,
        description=description,
        price=price,
        url=url,
    )

    fields_to_update = {
        k: v
        for k, v in update_data.model_dump(exclude_unset=True).items()
        if v is not None
    }
    print(update_data)
    print(fields_to_update)
    for field_name, field_value in fields_to_update.items():
        setattr(wish, field_name, field_value)

    if photo is not None:
        old_photo = wish.photo_file_name
        try:
            UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
            wish.photo_file_name = _process_image(photo)
        except HTTPException:
            raise
        except Exception as exc:
            logger.error("Failed to save photo: %s", exc)
            raise HTTPException(status_code=500, detail=f"Failed to save photo: {exc}")
        if old_photo:
            old_path = UPLOAD_DIR / old_photo
            try:
                old_path.unlink()
            except OSError as exc:
                logger.error("Failed to delete old photo: %s", exc)

    db.commit()
    db.refresh(wish)
    return _attach_reactions(wish, "wish", db)


@router.patch("/{wish_id}/complete")
async def complete_wish(
    wish_id: int,
    complete_data: CompleteWishRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> dict:
    wish = _get_wish(wish_id, db)
    if not _check_access(current_user, wish):
        raise HTTPException(status_code=FORBIDDEN_STATUS, detail=NO_ACCESS_MSG)
    wish.is_completed = complete_data.is_completed
    db.commit()
    return {"completed_id": wish.id}
