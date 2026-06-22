import json
import hmac
import hashlib
from urllib.parse import parse_qsl
from fastapi import Header, HTTPException
from loguru import logger
from src.config import config
from src.models import User
from src.database import SessionLocal

DEBUG = config.get("DEBUG", False)
BOT_TOKEN = config["BOT_TOKEN"]

UNAUTHORIZED_ERROR_CODE = 401
INTERNAL_SERVER_ERROR_CODE = 500


class AuthError(Exception):
    def __init__(
        self,
        message: str = "Authentication error",
        status_code: int = UNAUTHORIZED_ERROR_CODE,
    ):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


def _get_debug_user(x_init_data: str):
    try:
        user_id = int(x_init_data)
    except ValueError:
        user_id = 123456789
    return {"id": user_id, "first_name": "Dev", "username": "devuser"}


def _register_user(user: dict[str, str]):
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
        msg = f"Failed to register user with id={user['id']}: {error}"
        logger.error(msg)
        raise AuthError(msg, status_code=INTERNAL_SERVER_ERROR_CODE)
    finally:
        db.close()


def _build_data_check_string(pairs: dict[str, str]) -> str:
    pairs = pairs.copy()
    pairs.pop("hash", None)
    pairs.pop("signature", None)
    return "\n".join(f"{k}={v}" for k, v in sorted(pairs.items()))


def _parse_init_data(init_data: str, bot_token: str) -> dict:
    pairs = dict(parse_qsl(init_data, keep_blank_values=True))

    received_hash = pairs.get("hash")
    if not received_hash:
        raise ValueError("Missing hash")

    data_check_string = _build_data_check_string(pairs)
    secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
    calculated_hash = hmac.new(
        secret_key,
        data_check_string.encode(),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(calculated_hash, received_hash):
        raise ValueError("Invalid initData")

    user_raw = pairs.get("user")
    if not user_raw:
        raise ValueError("Missing user")

    return json.loads(user_raw)


def validate_init_data(init_data: str, bot_token: str) -> dict:
    if not init_data:
        raise ValueError("init_data is empty")
    return _parse_init_data(init_data=init_data, bot_token=bot_token)


async def get_current_user(x_init_data: str = Header(...)) -> dict:
    if not BOT_TOKEN:
        raise HTTPException(
            status_code=INTERNAL_SERVER_ERROR_CODE,
            detail="Bot token not found",
        )

    if DEBUG == "true":
        user = _get_debug_user(x_init_data)
    else:
        try:
            user = validate_init_data(x_init_data, BOT_TOKEN)
        except ValueError as error:
            logger.warning("Invalid init data: {error}", error=str(error))
            raise HTTPException(
                status_code=UNAUTHORIZED_ERROR_CODE,
                detail="Unauthorized",
            )

    try:
        _register_user(user)
    except AuthError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)

    return user
