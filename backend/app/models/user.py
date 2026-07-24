"""
User Model (user.py).

Defines user accounts, authentication credentials, and role permissions.
"""
from sqlalchemy import Boolean, Column, String
from app.database.connection import Base
from app.models.base_model import BaseModelMixin


class User(Base, BaseModelMixin):
    """
    SQLAlchemy User model for authenticating platform users.
    """

    __tablename__ = "users"

    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}', is_active={self.is_active})>"
