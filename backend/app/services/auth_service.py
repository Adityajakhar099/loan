"""
Authentication Service – Business Logic Layer.

Handles user registration, login verification, password hashing,
JWT token generation, and current-user dependency resolution.
Supports in-memory user registry fallback when DB is disconnected.
"""
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BaseAppException
from app.core.logging import logger
from app.core.security import create_access_token, decode_access_token, get_password_hash, verify_password
from app.database.connection import get_db_session
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

# In-memory user fallback store for DB-degraded mode
_in_memory_users: dict[str, User] = {}


async def register_user(
    email: str,
    password: str,
    full_name: Optional[str],
    db: AsyncSession,
) -> User:
    """
    Register a new user account.
    """
    normalized_email = email.lower().strip()

    # Check if user already exists
    user_exists = False
    try:
        stmt = select(User).where(User.email == normalized_email)
        result = await db.execute(stmt)
        if result.scalar_one_or_none() is not None:
            user_exists = True
    except Exception as exc:
        logger.warning("DB query failed in register_user, checking in-memory store: {}", exc)
        if normalized_email in _in_memory_users:
            user_exists = True

    if user_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"An account with email '{email}' already exists.",
        )

    now = datetime.now(timezone.utc)
    hashed_pwd = get_password_hash(password)
    user = User(
        id=uuid.uuid4(),
        email=normalized_email,
        hashed_password=hashed_pwd,
        full_name=full_name,
        is_active=True,
        is_superuser=False,
        created_at=now,
        updated_at=now,
    )

    try:
        db.add(user)
        await db.flush()
        await db.refresh(user)
    except Exception as exc:
        logger.warning("Database unavailable during user registration | fallback=in-memory | error={}", exc)
        _in_memory_users[normalized_email] = user

    logger.info("User registered successfully | email={} | id={}", user.email, user.id)
    return user


async def authenticate_user(
    email: str,
    password: str,
    db: AsyncSession,
) -> tuple[User, str]:
    """
    Authenticate user credentials and issue signed JWT access token.
    """
    normalized_email = email.lower().strip()
    user = None

    try:
        stmt = select(User).where(User.email == normalized_email)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
    except Exception as exc:
        logger.warning("DB query failed in authenticate_user, checking in-memory store: {}", exc)
        user = _in_memory_users.get(normalized_email)

    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is inactive.",
        )

    access_token = create_access_token(
        subject=str(user.id),
        extra_claims={"email": user.email, "full_name": user.full_name},
    )

    logger.info("User authenticated successfully | email={} | id={}", user.email, user.id)
    return user, access_token


async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db_session),
) -> Optional[User]:
    """
    FastAPI dependency resolving the current authenticated user from bearer JWT.
    """
    if not token:
        return None

    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id_str = payload.get("sub")
    email_str = payload.get("email")
    if not user_id_str:
        return None

    try:
        user_id = uuid.UUID(user_id_str)
        stmt = select(User).where(User.id == user_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
    except Exception as exc:
        logger.warning("DB query failed in get_current_user, checking in-memory store: {}", exc)
        user = _in_memory_users.get(email_str.lower() if email_str else "")

    return user
