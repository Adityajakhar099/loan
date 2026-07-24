"""
Alembic Environment Configuration.

Wires the application settings and ORM Base metadata into Alembic
so that `alembic revision --autogenerate` produces correct migrations.
"""
import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# ── Import settings and models so Alembic sees the metadata ───────────────
from app.core.config import settings
from app.database.connection import Base

# Import all models here to ensure Alembic's autogenerate picks them up
import app.models  # noqa: F401

# ─────────────────────────────────────────────────────────────────────────────
# Alembic Config Object
# ─────────────────────────────────────────────────────────────────────────────

config = context.config

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Override sqlalchemy.url from the application settings (sync DSN for Alembic)
config.set_main_option("sqlalchemy.url", settings.SYNC_DATABASE_URL)

target_metadata = Base.metadata


# ─────────────────────────────────────────────────────────────────────────────
# Offline Migrations (no live DB required)
# ─────────────────────────────────────────────────────────────────────────────

def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode.

    Configures the context with a URL only (no Engine required).
    Calls to context.execute() emit the SQL literally.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


# ─────────────────────────────────────────────────────────────────────────────
# Online Migrations (live DB connection)
# ─────────────────────────────────────────────────────────────────────────────

def do_run_migrations(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Run migrations using an async engine."""
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """Run migrations against a live database."""
    asyncio.run(run_async_migrations())


# ─────────────────────────────────────────────────────────────────────────────
# Entry Point
# ─────────────────────────────────────────────────────────────────────────────

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
