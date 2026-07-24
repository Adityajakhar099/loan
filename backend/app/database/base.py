"""
Base Model Registry for Alembic and SQLAlchemy.
Imports all models so metadata is registered cleanly when tables are created in future phases.
"""
from app.database.connection import Base
from app.models.base_model import BaseModelMixin
import app.models  # noqa: F401

__all__ = ["Base", "BaseModelMixin"]

