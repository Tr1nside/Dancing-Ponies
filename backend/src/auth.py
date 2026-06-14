import json
import hmac
import hashlib
from urllib.parse import parse_qsl
from fastapi import Header, HTTPException
from src.config import config


DEBUG = config["DEBUG"]
BOT_TOKEN = config["BOT_TOKEN"]


async def get_current_user(x_init_data: str = Header(...)) -> dict:

    if x_init_data == "test123" and DEBUG == "true":
        return {"id": 123456789, "first_name": "Dev", "username": "devuser"}

    bot_token = BOT_TOKEN
    if not bot_token:
        raise HTTPException(status_code=401, detail="Bot token not found")

    try:
        user = validate_init_data(x_init_data, bot_token)
        return user
    except ValueError:
        raise HTTPException(status_code=401, detail="Unauthorized")


def validate_init_data(init_data: str, bot_token: str) -> dict:
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
