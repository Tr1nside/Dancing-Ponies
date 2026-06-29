from collections import defaultdict, deque
import os
import time
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from src.routers import invites, wishes, wishlists, todos, reactions
from src.database import engine, Base

app = FastAPI()

# Use the directory from env if provided, otherwise default to ./backend/src/uploads
DEFAULT_UPLOADS_DIR = str(Path(__file__).parent / "uploads")
UPLOADS_DIR = Path(os.getenv("UPLOADS_DIR", DEFAULT_UPLOADS_DIR))
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

requests_by_ip = defaultdict(deque)
LIMIT = 1000
WINDOW = 30
TOO_MANY_REQUEST_STATUS = 429

Base.metadata.create_all(bind=engine)
app.include_router(invites.router)
app.include_router(wishes.router)
app.include_router(wishlists.router)
app.include_router(todos.router)
app.include_router(reactions.router)


@app.middleware("http")
async def rate_limit_and_security_headers(request: Request, call_next):
    ip = request.client.host if request.client else "unknown"
    now = time.time()
    bucket = requests_by_ip[ip]

    while bucket and now - bucket[0] > WINDOW:
        bucket.popleft()

    if len(bucket) >= LIMIT:
        return JSONResponse(
            status_code=TOO_MANY_REQUEST_STATUS,
            content={"detail": "Too Many Requests"},
        )

    bucket.append(now)

    response = await call_next(request)
    return response


@app.get("/")
async def root():
    return {}
