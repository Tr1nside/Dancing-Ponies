from datetime import timedelta

from fastapi import Header, HTTPException
from loguru import logger
from telegram_webapp_auth.auth import TelegramAuthenticator, generate_secret_key
from telegram_webapp_auth.errors import ExpiredInitDataError, InvalidInitDataError

from src.config import config
from src.database import SessionLocal
from src.models import User

DEBUG = str(config.get("DEBUG", "false")).lower() == "true"
BOT_TOKEN = config.get("BOT_TOKEN")

UNAUTHORIZED_ERROR_CODE = 401
INTERNAL_SERVER_ERROR_CODE = 500

authenticator = (
    TelegramAuthenticator(generate_secret_key(BOT_TOKEN)) if BOT_TOKEN else None
)


def _get_debug_user(x_init_data: str) -> dict:
    try:
        user_id = int(x_init_data)
    except ValueError:
        user_id = 123456789
    return {"id": user_id, "first_name": "Dev", "username": "devuser"}


def _register_user(user: dict) -> None:
    db = SessionLocal()
    try:
        db_user = db.query(User).filter(User.id == user["id"]).first()
        if db_user:
            db_user.first_name = user.get("first_name", db_user.first_name)
            db_user.username = user.get("username", db_user.username)
        else:
            db_user = User(
                id=user["id"],
                first_name=user.get("first_name", ""),
                username=user.get("username"),
            )
            db.add(db_user)

        db.commit()
    except Exception as error:
        db.rollback()
        logger.error(
            "Failed to register user with id={user_id}: {error}",
            user_id=user.get("id"),
            error=str(error),
        )
        raise HTTPException(
            status_code=INTERNAL_SERVER_ERROR_CODE,
            detail="Failed to register user",
        )
    finally:
        db.close()


async def get_current_user(x_init_data: str = Header(...)) -> dict:
    if not BOT_TOKEN or authenticator is None:
        raise HTTPException(
            status_code=INTERNAL_SERVER_ERROR_CODE,
            detail="Bot token not found",
        )

    if DEBUG:
        user = _get_debug_user(x_init_data)
    else:
        try:
            init_data = authenticator.validate(
                init_data=x_init_data,
                expr_in=timedelta(minutes=5),
            )
            telegram_user = init_data.user
            if telegram_user is None:
                raise HTTPException(
                    status_code=UNAUTHORIZED_ERROR_CODE,
                    detail="Unauthorized",
                )
            user = {
                "id": telegram_user.id,
                "first_name": telegram_user.first_name,
                "username": telegram_user.username,
            }
        except ExpiredInitDataError:
            raise HTTPException(
                status_code=UNAUTHORIZED_ERROR_CODE,
                detail="Telegram init data has expired",
            )
        except InvalidInitDataError:
            raise HTTPException(
                status_code=UNAUTHORIZED_ERROR_CODE,
                detail="Unauthorized",
            )

    _register_user(user)
    return user
