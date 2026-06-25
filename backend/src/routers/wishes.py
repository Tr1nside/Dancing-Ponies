from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from pathlib import Path
from uuid import uuid4
from io import BytesIO

from PIL import Image

from src.database import get_db
from src.models import Wish
from src.schemas.wishes import WishResponse, CompleteWishRequest, WishUpdate
from src.auth import get_current_user


UPLOAD_DIR = Path(__file__).parent.parent / "uploads" / "wishes"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

MAX_IMAGE_SIZE = 550


router = APIRouter(prefix="/wishes", tags=["wishes"])

NOT_FOUND_ERROR_CODE = 404
NOT_ACCESS_ERROR_CODE = 403


def _check_acces(current_user: dict, wish: Wish):
    if current_user["id"] != wish.wishlist.owner_id and current_user["id"] not in [
        member.id for member in wish.wishlist.members
    ]:
        return False
    return True


def _resize_image(image: Image.Image) -> Image.Image:
    width, height = image.size
    if width <= MAX_IMAGE_SIZE and height <= MAX_IMAGE_SIZE:
        return image
    if width < height:
        new_height = MAX_IMAGE_SIZE
        new_width = int(width * (MAX_IMAGE_SIZE / height))
    else:
        new_width = MAX_IMAGE_SIZE
        new_height = int(height * (MAX_IMAGE_SIZE / width))
    return image.resize((new_width, new_height), Image.Resampling.LANCZOS)


def _save_photo(photo: UploadFile) -> str:
    suffix = Path(photo.filename).suffix if photo.filename else ".png"
    file_name = f"{uuid4().hex}{suffix}"
    file_path = UPLOAD_DIR / file_name
    image = Image.open(BytesIO(photo.file.read()))
    image = _resize_image(image)
    image.save(file_path)
    return file_name


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
    title: str | None = Form(None),
    description: str | None = Form(None),
    price: int | None = Form(None),
    url: str | None = Form(None),
    photo: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    wish = db.query(Wish).filter(Wish.id == wish_id).first()
    if not wish:
        raise HTTPException(status_code=404, detail="Wish not found")
    if not _check_acces(current_user, wish):
        raise HTTPException(status_code=403, detail="No access")

    update_data = WishUpdate(
        title=title,
        description=description,
        price=price,
        url=url,
    )

    values = update_data.model_dump(exclude_unset=True)
    for key, value in values.items():
        setattr(wish, key, value)

    if photo is not None:
        wish.photo_file_name = _save_photo(photo)

    db.commit()
    db.refresh(wish)
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
