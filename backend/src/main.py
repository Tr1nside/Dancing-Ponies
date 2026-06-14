from fastapi import FastAPI
from src.routers import invites, wishes, wishlists
from src.database import engine, Base
from fastapi.middleware.cors import CORSMiddleware
# import src.models as models

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


@app.get("/")
async def root():
    return {}
