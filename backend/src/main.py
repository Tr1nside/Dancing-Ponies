import logging
from fastapi import FastAPI
from src.routers import invites, wishes, wishlists
from src.database import engine, Base
from src.config import config
from fastapi.middleware.cors import CORSMiddleware

logger = logging.getLogger(__name__)

logger.info("\n\n\n")
logger.info(config)
logger.info("\n\n\n")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # потом заменишь на конкретные домены
    allow_methods=["*"],
    allow_headers=["*"],
)
Base.metadata.create_all(bind=engine)
app.include_router(invites.router)
app.include_router(wishes.router)
app.include_router(wishlists.router)

print(config)


@app.get("/")
async def root():
    return {}
