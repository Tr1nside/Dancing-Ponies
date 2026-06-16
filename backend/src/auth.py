import json
import hmac
import hashlib
from urllib.parse import parse_qsl
from fastapi import Header, HTTPException
from src.config import config
from src.models import User
from src.database import SessionLocal

DEBUG = config["DEBUG"]
BOT_TOKEN = config["BOT_TOKEN"]


async def get_current_user(x_init_data: str = Header(...)) -> dict:
    bot_token = BOT_TOKEN
    if not bot_token:
        raise HTTPException(status_code=401, detail="Bot token not found")

    if DEBUG == "true":
        try:
            user_id = int(x_init_data)
        except Exception:
            user_id = 123456789
        user = {"id": user_id, "first_name": "Dev", "username": "devuser"}
    else:
        try:
            user = validate_init_data(x_init_data, bot_token)
            print(user["id"])
        except ValueError:
            raise HTTPException(status_code=401, detail="Unauthorized")

    try:
        db = SessionLocal()
        try:
            db_user = db.query(User).filter(User.id == user["id"]).first()
            if not db_user:
                db_user = User(
                    id=user["id"],
                    first_name=user.get("first_name", ""),
                    username=user.get("username"),
                )
                db.add(db_user)
            else:
                db_user.first_name = user.get("first_name", db_user.first_name)
                db_user.username = user.get("username", db_user.username)
            db.commit()
        finally:
            db.close()

        return user
    except ValueError:
        raise HTTPException(status_code=401, detail="Unauthorized")


def validate_init_data(init_data: str, bot_token: str) -> dict:
    if not init_data:
        raise ValueError("init_data is empty")

    pairs = dict(parse_qsl(init_data))

    received_hash = pairs.pop("hash")
    data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(pairs.items()))
    secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
    signature = hmac.new(
        secret_key, data_check_string.encode(), hashlib.sha256
    ).hexdigest()
    if not hmac.compare_digest(signature, received_hash):
        raise ValueError("Invalid initData")
    user = json.loads(pairs["user"])

    return user
