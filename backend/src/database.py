from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import DeclarativeBase
from loguru import logger
from src.config import config


class Base(DeclarativeBase):
    """Base declarative class."""


bd_path = config.get("BD_PATH", "dancing_ponies.db")

engine = create_engine(f"sqlite:///{bd_path}")
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception as error:
        logger.error("Database receipt error: {error}", error=error)
    finally:
        db.close()
