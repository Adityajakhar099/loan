"""
Async SQLAlchemy 2.0 Database Connection Manager.

Provides:
  - An AsyncEngine and session factory wired to the PostgreSQL URL.
  - A `get_db_session` FastAPI dependency yielding a transactional session.
  - `init_db` / `close_db` lifecycle helpers called by the FastAPI lifespan.
"""
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings
from app.core.exceptions import DatabaseException
from app.core.logging import logger


# ─────────────────────────────────────────────────────────────────────────────
# Declarative Base
# ─────────────────────────────────────────────────────────────────────────────

class Base(DeclarativeBase):
    """
    All ORM models must inherit from this base.

    Provides consistent metadata for Alembic autogenerate.
    """


# ─────────────────────────────────────────────────────────────────────────────
# Engine & Session Factory
# ─────────────────────────────────────────────────────────────────────────────

def _create_engine() -> AsyncEngine:
    """Build the async SQLAlchemy engine from settings."""
    return create_async_engine(
        settings.ASYNC_DATABASE_URL,
        pool_size=settings.DATABASE_POOL_SIZE,
        max_overflow=settings.DATABASE_MAX_OVERFLOW,
        echo=settings.DATABASE_ECHO,
        pool_pre_ping=True,  # Recycle stale connections automatically
        pool_recycle=3600,   # Recycle connections after 1 hour
    )


engine: AsyncEngine = _create_engine()

AsyncSessionLocal: async_sessionmaker[AsyncSession] = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


# ─────────────────────────────────────────────────────────────────────────────
# Lifecycle Helpers
# ─────────────────────────────────────────────────────────────────────────────

async def init_db() -> None:
    """
    Verify database connectivity on startup.

    Does NOT create tables – that is Alembic's responsibility.
    """
    try:
        async with engine.begin() as conn:
            from sqlalchemy import text
            await conn.execute(text("SELECT 1"))
        logger.info("Database connection verified successfully.")
    except SQLAlchemyError as exc:
        logger.error("Database connectivity check failed: {}", exc)
        raise DatabaseException(
            "Unable to connect to the database. Check POSTGRES_* settings."
        ) from exc


async def close_db() -> None:
    """Gracefully dispose of all pooled database connections on shutdown."""
    await engine.dispose()
    logger.info("Database connection pool disposed.")


# ─────────────────────────────────────────────────────────────────────────────
# FastAPI Dependency
# ─────────────────────────────────────────────────────────────────────────────

async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that yields a transactional async session.

    Automatically commits on success, rolls back on any exception,
    and always closes the session to return it to the pool.

    Usage::

        @router.get("/example")
        async def example(db: AsyncSession = Depends(get_db_session)):
            ...
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except SQLAlchemyError as exc:
            await session.rollback()
            logger.exception("Session rollback due to SQLAlchemy error: {}", exc)
            raise DatabaseException() from exc
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# ─────────────────────────────────────────────────────────────────────────────
# Context Manager (for use outside request/response lifecycle)
# ─────────────────────────────────────────────────────────────────────────────

@asynccontextmanager
async def get_db_context() -> AsyncGenerator[AsyncSession, None]:
    """
    Async context manager providing a transactional session.

    For use in scripts, background tasks, or Alembic seeds that run
    outside the FastAPI dependency-injection system.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
