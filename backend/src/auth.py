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
        relevant_users = db.query(User).filter(User.id == user["id"])
        db_user = relevant_users.first()
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
        msg = f"Failed to register a user with id={user['id']} in the system: {error}"

        logger.error(
            "Failed to register user with id={user_id}: {error}",
            user_id=user["id"],
            error=str(error),
        )

        raise AuthError(msg)
    finally:
        db.close()


async def get_current_user(x_init_data: str = Header(...)) -> dict:
    bot_token = BOT_TOKEN
    if not bot_token:
        raise HTTPException(
            status_code=INTERNAL_SERVER_ERROR_CODE, detail="Bot token not found"
        )

    if DEBUG == "true":
        user = _get_debug_user(x_init_data)
    else:
        try:
            user = validate_init_data(x_init_data, bot_token)
        except ValueError:
            raise HTTPException(
                status_code=UNAUTHORIZED_ERROR_CODE, detail="Unauthorized"
            )

    try:
        _register_user(user)
    except ValueError:
        raise HTTPException(status_code=UNAUTHORIZED_ERROR_CODE, detail="Unauthorized")

    return user


def _parse_signature(pairs: dict, bot_token: str):
    data_check_string = "\n".join(
        f"{pair_key}={pair_value}" for pair_key, pair_value in sorted(pairs.items())
    )
    secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
    signature = hmac.new(
        secret_key, data_check_string.encode(), hashlib.sha256
    ).hexdigest()
    return signature, pairs.pop("hash")


def _parse_init_data(init_data: str, bot_token: str) -> dict:
    pairs = dict(parse_qsl(init_data))
    signature, received_hash = _parse_signature(pairs=pairs, bot_token=bot_token)
    if not hmac.compare_digest(signature, received_hash):
        raise ValueError("Invalid initData")

    return json.loads(pairs["user"])


def validate_init_data(init_data: str, bot_token: str) -> dict:
    if not init_data:
        raise ValueError("init_data is empty")
    try:
        user = _parse_init_data(init_data=init_data, bot_token=bot_token)
    except (ValueError, KeyError) as error:
        msg = f"Failed to init data={init_data} with bot_token={bot_token}: {error}"

        logger.error(
            "Failed to init data={init_data} with bot_token={bot_token}: {error}",
            init_data=init_data,
            bot_token=bot_token,
            error=str(error),
        )

        raise HTTPException(status_code=INTERNAL_SERVER_ERROR_CODE, detail=msg)

    return user
