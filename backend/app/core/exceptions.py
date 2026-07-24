"""
Custom Exception Hierarchy and Global FastAPI Exception Handlers.

All application exceptions extend BaseAppException so they can be caught
by a single handler and converted into the standard JSON response envelope.
"""
from typing import Any

from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.logging import logger


# ─────────────────────────────────────────────────────────────────────────────
# Custom Exception Classes
# ─────────────────────────────────────────────────────────────────────────────

class BaseAppException(Exception):
    """Base class for all application-specific exceptions."""

    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        error_code: str = "INTERNAL_SERVER_ERROR",
        details: Any = None,
    ) -> None:
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        self.details = details
        super().__init__(message)


class NotFoundException(BaseAppException):
    """Raised when a requested resource does not exist."""

    def __init__(self, message: str = "Requested resource was not found.", details: Any = None) -> None:
        super().__init__(
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
            error_code="NOT_FOUND",
            details=details,
        )


class BadRequestException(BaseAppException):
    """Raised when the client sends invalid or malformed data."""

    def __init__(self, message: str = "Invalid request.", details: Any = None) -> None:
        super().__init__(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="BAD_REQUEST",
            details=details,
        )


class FileTooLargeException(BaseAppException):
    """Raised when an uploaded file exceeds the maximum permitted size."""

    def __init__(self, max_mb: int = 20) -> None:
        super().__init__(
            message=f"Uploaded file exceeds the maximum allowed size of {max_mb} MB.",
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            error_code="FILE_TOO_LARGE",
        )


class InvalidFileTypeException(BaseAppException):
    """Raised when an uploaded file is not a valid PDF."""

    def __init__(self, message: str = "Only PDF files are accepted.") -> None:
        super().__init__(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="INVALID_FILE_TYPE",
        )


class InvalidPDFException(BaseAppException):
    """Raised when a file passes extension check but is not a valid PDF."""

    def __init__(self, message: str = "The uploaded file is not a valid or readable PDF.") -> None:
        super().__init__(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="INVALID_PDF",
        )


class DatabaseException(BaseAppException):
    """Raised on database connection or query failures."""

    def __init__(self, message: str = "A database error occurred. Please try again later.") -> None:
        super().__init__(
            message=message,
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            error_code="DATABASE_ERROR",
        )


class FileStorageException(BaseAppException):
    """Raised when the file system cannot save or delete a document."""

    def __init__(self, message: str = "File storage operation failed.") -> None:
        super().__init__(
            message=message,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="FILE_STORAGE_ERROR",
        )


# ─────────────────────────────────────────────────────────────────────────────
# Response Builder Helper
# ─────────────────────────────────────────────────────────────────────────────

def _error_response(
    status_code: int,
    message: str,
    error_code: str = "ERROR",
    details: Any = None,
) -> JSONResponse:
    """Build a standardised JSON error envelope."""
    from datetime import datetime, timezone

    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "message": message,
            "data": None,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "errors": {
                "error_code": error_code,
                "details": details,
            },
        },
    )


# ─────────────────────────────────────────────────────────────────────────────
# FastAPI Exception Handlers
# ─────────────────────────────────────────────────────────────────────────────

async def app_exception_handler(request: Request, exc: BaseAppException) -> JSONResponse:
    """Handle all BaseAppException subclasses."""
    logger.warning(
        "Application exception | code={} | path={} | msg={}",
        exc.error_code,
        request.url.path,
        exc.message,
    )
    return _error_response(
        status_code=exc.status_code,
        message=exc.message,
        error_code=exc.error_code,
        details=exc.details,
    )


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """Handle Starlette/FastAPI HTTP exceptions (404, 405, etc.)."""
    logger.warning(
        "HTTP exception | status={} | path={} | detail={}",
        exc.status_code,
        request.url.path,
        exc.detail,
    )
    return _error_response(
        status_code=exc.status_code,
        message=str(exc.detail),
        error_code=f"HTTP_{exc.status_code}",
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handle Pydantic request validation errors (422)."""
    logger.warning(
        "Validation error | path={} | errors={}",
        request.url.path,
        exc.errors(),
    )
    return _error_response(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        message="Request validation failed. Please check your input.",
        error_code="VALIDATION_ERROR",
        details=exc.errors(),
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all handler for unexpected server errors."""
    logger.exception(
        "Unhandled exception | path={} | exc={}",
        request.url.path,
        repr(exc),
    )
    from app.core.config import settings as _settings

    return _error_response(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        message="An unexpected internal server error occurred.",
        error_code="INTERNAL_SERVER_ERROR",
        details=str(exc) if _settings.DEBUG else None,
    )
