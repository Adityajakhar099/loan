"""
Application Configuration Settings.

Loads and validates all environment variables using Pydantic V2 Settings.
Provides a single, typed, cached settings instance for the entire application.
"""
from functools import lru_cache
from typing import List, Union

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application configuration loaded from environment variables.
    All fields are strongly typed and validated at startup.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # ──────────────────────────────────────────────
    # Application Info
    # ──────────────────────────────────────────────
    PROJECT_NAME: str = "AI Loan Advisory Agent API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"

    # ──────────────────────────────────────────────
    # Server
    # ──────────────────────────────────────────────
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # ──────────────────────────────────────────────
    # CORS
    # ──────────────────────────────────────────────
    ALLOWED_ORIGINS: Union[str, List[str]] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        """Split comma-separated CORS origins into a list."""
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        if isinstance(v, list):
            return v
        raise ValueError(f"Invalid CORS origins format: {v}")

    # ──────────────────────────────────────────────
    # PostgreSQL Database
    # ──────────────────────────────────────────────
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres_password"
    POSTGRES_DB: str = "loan_ai_db"
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20
    DATABASE_ECHO: bool = False

    @property
    def ASYNC_DATABASE_URL(self) -> str:
        """Async PostgreSQL DSN for SQLAlchemy with asyncpg driver."""
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @property
    def SYNC_DATABASE_URL(self) -> str:
        """Sync PostgreSQL DSN for Alembic migrations."""
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    # ──────────────────────────────────────────────
    # File Upload
    # ──────────────────────────────────────────────
    UPLOAD_DIR: str = "app/uploads"
    MAX_FILE_SIZE_MB: int = 20
    ALLOWED_CONTENT_TYPES: Union[str, List[str]] = ["application/pdf"]

    @property
    def MAX_FILE_SIZE_BYTES(self) -> int:
        """Maximum allowed upload size in bytes."""
        return self.MAX_FILE_SIZE_MB * 1024 * 1024

    @field_validator("ALLOWED_CONTENT_TYPES", mode="before")
    @classmethod
    def assemble_content_types(cls, v: Union[str, List[str]]) -> List[str]:
        """Split comma-separated MIME types into a list."""
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        if isinstance(v, list):
            return v
        raise ValueError(f"Invalid ALLOWED_CONTENT_TYPES format: {v}")

    # ──────────────────────────────────────────────
    # RAG & Vector Search Configuration
    # ──────────────────────────────────────────────
    EMBEDDING_MODEL_NAME: str = "sentence-transformers/all-MiniLM-L6-v2"
    VECTOR_STORE_DIR: str = "app/vector_store"
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    RAG_TOP_K: int = 5

    # ──────────────────────────────────────────────
    # LLM (Google Gemini) Configuration
    # ──────────────────────────────────────────────
    GEMINI_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""
    GEMINI_MODEL_NAME: str = "gemini-2.5-flash"
    LLM_TEMPERATURE: float = 0.2
    LLM_MAX_TOKENS: int = 1024

    @property
    def EFFECTIVE_GEMINI_KEY(self) -> str:
        """Return whichever Gemini key is set in .env."""
        return self.GEMINI_API_KEY or self.GOOGLE_API_KEY or ""

    # ──────────────────────────────────────────────
    # Logging
    # ──────────────────────────────────────────────
    LOG_LEVEL: str = "DEBUG"
    LOG_FILE: str = "logs/app.log"
    LOG_ROTATION: str = "100 MB"
    LOG_RETENTION: str = "30 days"

    # ──────────────────────────────────────────────
    # Security (JWT – Prepared for Auth phase)
    # ──────────────────────────────────────────────
    SECRET_KEY: str = "super-secret-key-change-in-production-min-32-characters"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60


@lru_cache
def get_settings() -> Settings:
    """
    Return the cached Settings singleton.
    """
    return Settings()


# Module-level singleton for import convenience
settings = get_settings()
