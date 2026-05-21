import pytest
import asyncio
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.database import async_session, Base, engine
from app.core.security import hash_password, create_access_token
from app.models.user import User


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(autouse=True)
async def setup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest.fixture
async def test_user(client):
    async with async_session() as db:
        user = User(
            username="testuser",
            email="test@example.com",
            hashed_password=hash_password("TestPass123!"),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        token = create_access_token({"sub": str(user.id)})
        return {"user": user, "token": token}


@pytest.fixture
def auth_headers(test_user):
    return {"Authorization": f"Bearer {test_user['token']}"}
