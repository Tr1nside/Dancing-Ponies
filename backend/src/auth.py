import json
import hmac
import hashlib
import logging
from urllib.parse import parse_qsl
from fastapi import Header, HTTPException
import os


logger = logging.getLogger(__name__)


async def get_current_user(x_init_data: str = Header(...)) -> dict:

    print(f"DEBUG ENV: {os.getenv('DEBUG')!r}")
    print(f"INIT DATA: {x_init_data!r}")
    logging.error(f"DEBUG ENV: {os.getenv('DEBUG')!r}")
    logging.error(f"INIT DATA: {x_init_data!r}")

    # DEV MODE - если передали "test123", возвращаем фейкового юзера
    if x_init_data == "test123" and os.getenv("DEBUG") == "true":
        logging.error(f"DEBUG ENV: {os.getenv('DEBUG')!r}")
        logging.error(f"INIT DATA: {x_init_data!r}")
        return {"id": 123456789, "first_name": "Dev", "username": "devuser"}

    bot_token = os.getenv("BOT_TOKEN")
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
