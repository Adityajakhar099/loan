"""
conftest.py – Pytest fixtures for the backend test suite.

Provides:
  - async_client: A TestClient wired to a test database session.
  - db_session: An isolated async database session per test.
"""
import asyncio
from typing import AsyncGenerator

import pytest
import pytest_asyncio
from fastapi import FastAPI
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.database.connection import Base, get_db_session
from app.main import app as main_app

# Use an in-memory SQLite database for tests (no PostgreSQL required)
TEST_DATABASE_URL = "sqlite+aiosqlite:///./test.db"


@pytest.fixture(scope="session")
def event_loop():
    """Create an event loop for the entire test session."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session")
async def test_engine():
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """Yield a fresh session per test, rolled back on exit."""
    session_factory = async_sessionmaker(bind=test_engine, expire_on_commit=False)
    async with session_factory() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def async_client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Return an async HTTP test client with DB dependency overridden."""

    async def _override_db():
        yield db_session

    main_app.dependency_overrides[get_db_session] = _override_db

    async with AsyncClient(
        transport=ASGITransport(app=main_app),
        base_url="http://test",
    ) as client:
        yield client

    main_app.dependency_overrides.clear()
