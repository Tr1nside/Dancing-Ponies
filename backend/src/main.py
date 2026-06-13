from fastapi import FastAPI
from src.routers import invites, wishes, wishlists
from src.database import engine, Base
# import src.models as models

app = FastAPI()
Base.metadata.create_all(bind=engine)
app.include_router(invites.router)
app.include_router(wishes.router)
app.include_router(wishlists.router)


@app.get("/")
async def root():
    return {}
