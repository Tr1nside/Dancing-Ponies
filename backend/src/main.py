from collections import defaultdict, deque
import time

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from src.routers import invites, wishes, wishlists, todos
from src.database import engine, Base
from src.config import config

TOO_MANY_REQUEST_ERROR_CODE = 429

app = FastAPI()

front_domain = config.get("FRONT_DOMAIN")
back_domain = config.get("BACK_DOMAIN")

origins = [front_domain] if front_domain else []
allowed_hosts = [back_domain] if back_domain else []

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=allowed_hosts,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

requests_by_ip = defaultdict(deque)
LIMIT = 100
WINDOW = 60

Base.metadata.create_all(bind=engine)
app.include_router(invites.router)
app.include_router(wishes.router)
app.include_router(wishlists.router)
app.include_router(todos.router)


@app.middleware("http")
async def debug_request(request: Request, call_next):
    print("ORIGIN:", request.headers.get("origin"))
    print("HOST:", request.headers.get("host"))
    print("ACRM:", request.headers.get("access-control-request-method"))
    print("ACRH:", request.headers.get("access-control-request-headers"))
    return await call_next(request)


@app.get("/")
async def root():
    return {}
