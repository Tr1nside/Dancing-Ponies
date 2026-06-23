from collections import defaultdict, deque
import time

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from src.routers import invites, wishes, wishlists, todos
from src.database import engine, Base
from src.config import config

app = FastAPI()

front_domain = config.get("FRONT_DOMEN")
back_domain = config.get("BACK_DOMEN")

origins = [front_domain] if front_domain else []
allowed_hosts = [back_domain] if back_domain else []

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=allowed_hosts,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
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
async def rate_limit_and_security_headers(request: Request, call_next):
    ip = request.client.host if request.client else "unknown"
    now = time.time()
    bucket = requests_by_ip[ip]

    while bucket and now - bucket[0] > WINDOW:
        bucket.popleft()

    if len(bucket) >= LIMIT:
        return JSONResponse(
            status_code=429,
            content={"detail": "Too Many Requests"},
        )

    bucket.append(now)

    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    response.headers["Strict-Transport-Security"] = (
        "max-age=31536000; includeSubDomains"
    )
    return response


@app.get("/")
async def root():
    return {}
