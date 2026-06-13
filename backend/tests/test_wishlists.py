from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.main import app
from src.database import Base, get_db

engine = create_engine("sqlite:///./test.db")
TestingSessionLocal = sessionmaker(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

Base.metadata.create_all(bind=engine)

client = TestClient(app)


def test_create_wishlist():
    response = client.post(
        "/wishlists/",
        json={
            "title": "Мой список",
            "emoji": "🎁",
            "owner_id": 1,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Мой список"
    assert "id" in data


def test_get_wishlists():
    responses = [
        client.post(
            "/wishlists/",
            json={
                "title": "Мой список1",
                "emoji": "🎁",
                "owner_id": 1,
            },
        ),
        client.post(
            "/wishlists/",
            json={
                "title": "Мой список2",
                "emoji": "🎁",
                "owner_id": 1,
            },
        ),
    ]

    for response in responses:
        assert response.status_code == 200

    response = client.get("/wishlists/?user_id=1")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_delete_wishlist():
    response = client.post(
        "/wishlists/",
        json={"title": "Мой список", "emoji": "🎁", "owner_id": 1},
    )
    wishlist_id = response.json()["id"]  # берём реальный id

    response = client.delete(f"/wishlists/{wishlist_id}")
    assert response.status_code == 200
    assert response.json()["deleted_id"] == wishlist_id
