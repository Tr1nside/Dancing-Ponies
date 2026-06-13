from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import DeclarativeBase
from src.config import config


class Base(DeclarativeBase):
    pass


bd_path = config.get("BD_PATH", "dancing_ponies.db")

engine = create_engine(f"sqlite:///{bd_path}")
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
