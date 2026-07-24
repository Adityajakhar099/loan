"""
Auth API Router (auth.py).

Provides user registration, JWT login authentication, and user profile endpoints.
"""
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.connection import get_db_session
from app.models.user import User
from app.services.auth_service import authenticate_user, get_current_user, register_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


class RegisterRequest(BaseModel):
    email: EmailStr = Field(..., description="User email address", examples=["borrower@example.com"])
    password: str = Field(..., min_length=6, description="User password (min 6 chars)", examples=["SecurePass123!"])
    full_name: Optional[str] = Field(default=None, description="Full legal name", examples=["Jane Doe"])


class LoginRequest(BaseModel):
    email: str = Field(..., description="User email address", examples=["borrower@example.com"])
    password: str = Field(..., description="User password", examples=["SecurePass123!"])


class UserDTO(BaseModel):
    id: uuid.UUID
    email: str
    full_name: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserDTO


class APIEnvelope(BaseModel):
    success: bool = True
    message: str
    data: Optional[dict] = None


@router.post("/register", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    payload: RegisterRequest,
    db: AsyncSession = Depends(get_db_session),
):
    """
    Register a new platform user account and issue a JWT access token.
    """
    user = await register_user(
        email=payload.email,
        password=payload.password,
        full_name=payload.full_name,
        db=db,
    )
    authenticated_user, token = await authenticate_user(
        email=payload.email,
        password=payload.password,
        db=db,
    )

    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserDTO.model_validate(authenticated_user),
    )


@router.post("/login", response_model=AuthTokenResponse)
async def login(
    payload: LoginRequest,
    db: AsyncSession = Depends(get_db_session),
):
    """
    Authenticate user credentials and issue a signed JWT access token.
    """
    user, token = await authenticate_user(
        email=payload.email,
        password=payload.password,
        db=db,
    )

    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserDTO.model_validate(user),
    )


@router.get("/me", response_model=UserDTO)
async def me(
    current_user: Optional[User] = Depends(get_current_user),
):
    """
    Get current authenticated user profile.
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )
    return UserDTO.model_validate(current_user)
