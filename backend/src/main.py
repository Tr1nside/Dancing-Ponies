from fastapi import FastAPI
from src.routers import invites, wishes, wishlists

app = FastAPI()

app.include_router(invites.router)
app.include_router(wishes.router)
app.include_router(wishlists.router)


@app.get("/")
async def root():
    return {}
