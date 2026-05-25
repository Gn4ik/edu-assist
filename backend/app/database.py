from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import get_settings

settings = get_settings()


def _get_engine_options(db_url: str) -> dict:
    options = {"echo": settings.DEBUG, "pool_pre_ping": True}
    if "postgresql" in db_url:
        options.update({"pool_size": 10, "max_overflow": 20})
    elif "sqlite" in db_url:
        options.update({"connect_args": {"check_same_thread": False}})
    return options


engine = create_async_engine(settings.DATABASE_URL, **_get_engine_options(settings.DATABASE_URL))

async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)