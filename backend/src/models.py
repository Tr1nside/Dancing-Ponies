from sqlalchemy import Table, Column, Enum as SAEnum
from sqlalchemy import ForeignKey, String, Integer, DateTime, Boolean
from sqlalchemy.orm import relationship, Mapped, mapped_column
from src.database import Base
from datetime import datetime, timezone
import enum


class ListType(str, enum.Enum):
    wishlist = "wishlist"
    todolist = "todolist"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    first_name: Mapped[str] = mapped_column(String)
    username: Mapped[str | None] = mapped_column(String, nullable=True)


wishlist_members = Table(
    "wishlist_members",
    Base.metadata,
    Column("wishlist_id", ForeignKey("wishlists.id"), primary_key=True),
    Column("user_id", ForeignKey("users.id"), primary_key=True),
)


class WishList(Base):
    __tablename__ = "wishlists"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String)
    list_type: Mapped[ListType] = mapped_column(
        SAEnum(ListType), default=ListType.wishlist
    )

    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    owner: Mapped[User] = relationship("User", foreign_keys=[owner_id])
    members: Mapped[list[User]] = relationship("User", secondary=wishlist_members)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    emoji: Mapped[str] = mapped_column(String(1))


class Wish(Base):
    __tablename__ = "wish"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    photo_file_name: Mapped[str | None] = mapped_column(String, nullable=True)
    wishlist_id: Mapped[int] = mapped_column(ForeignKey("wishlists.id"))
    wishlist: Mapped[WishList] = relationship("WishList")
    title: Mapped[str] = mapped_column(String)
    description: Mapped[str | None] = mapped_column(String, nullable=True)
    url: Mapped[str | None] = mapped_column(String, nullable=True)
    price: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)


class TodoItem(Base):
    __tablename__ = "todo_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    todolist_id: Mapped[int] = mapped_column(ForeignKey("wishlists.id"))
    todolist: Mapped[WishList] = relationship("WishList")
    title: Mapped[str] = mapped_column(String)
    description: Mapped[str | None] = mapped_column(String, nullable=True)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    due_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    priority: Mapped[int] = mapped_column(Integer, default=0)


class Invite(Base):
    __tablename__ = "invite"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    wishlist_id: Mapped[int] = mapped_column(ForeignKey("wishlists.id"))
    wishlist: Mapped[WishList] = relationship("WishList")
    token: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )
