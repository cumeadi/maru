"""
Database session management.
Provides an async SQLAlchemy engine + session factory,
and a FastAPI dependency for injecting sessions into routes.
"""
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from core.models import Base

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql+asyncpg://maru:marupass@localhost:5432/marudb"
)

engine = create_async_engine(DATABASE_URL, echo=False, future=True)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def init_db():
    """Create all tables on startup (idempotent)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db() -> AsyncSession:
    """FastAPI dependency — yields a DB session and guarantees close."""
    async with AsyncSessionLocal() as session:
        yield session
