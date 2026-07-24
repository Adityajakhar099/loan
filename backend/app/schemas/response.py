"""
Standardised API Response Schemas.

Every endpoint returns a consistent JSON envelope so that clients can
always depend on a predictable structure regardless of the endpoint.

Success envelope::

    {
      "success": true,
      "message": "Documents retrieved successfully.",
      "data": { ... },
      "timestamp": "2024-01-01T00:00:00+00:00",
      "pagination": { "page": 1, "page_size": 20, "total": 42, "total_pages": 3 }
    }

Error envelope::

    {
      "success": false,
      "message": "Request validation failed.",
      "data": null,
      "timestamp": "2024-01-01T00:00:00+00:00",
      "errors": { "error_code": "VALIDATION_ERROR", "details": [ ... ] }
    }
"""
from datetime import datetime, timezone
from typing import Any, Generic, Optional, TypeVar

from pydantic import BaseModel, Field

DataT = TypeVar("DataT")


# ─────────────────────────────────────────────────────────────────────────────
# Pagination Metadata
# ─────────────────────────────────────────────────────────────────────────────

class PaginationMeta(BaseModel):
    """Pagination metadata for list endpoints."""

    page: int = Field(..., ge=1, description="Current page number (1-indexed).")
    page_size: int = Field(..., ge=1, le=100, description="Items per page.")
    total: int = Field(..., ge=0, description="Total number of matching items.")
    total_pages: int = Field(..., ge=0, description="Total number of pages.")

    model_config = {"frozen": True}


# ─────────────────────────────────────────────────────────────────────────────
# Error Detail
# ─────────────────────────────────────────────────────────────────────────────

class ErrorDetail(BaseModel):
    """Structured error information embedded in the error envelope."""

    error_code: str = Field(..., description="Machine-readable error code.")
    details: Optional[Any] = Field(None, description="Contextual error details.")


# ─────────────────────────────────────────────────────────────────────────────
# Generic API Response
# ─────────────────────────────────────────────────────────────────────────────

class APIResponse(BaseModel, Generic[DataT]):
    """
    Generic response envelope returned by every API endpoint.

    Type-parameter ``DataT`` is the shape of the ``data`` field.
    """

    success: bool = Field(..., description="Whether the operation succeeded.")
    message: str = Field(..., description="Human-readable result description.")
    data: Optional[DataT] = Field(None, description="Payload returned by the endpoint.")
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="UTC timestamp of the response.",
    )
    pagination: Optional[PaginationMeta] = Field(
        None, description="Present only on list endpoints."
    )
    errors: Optional[ErrorDetail] = Field(
        None, description="Present only when success=False."
    )

    model_config = {"arbitrary_types_allowed": True}


# ─────────────────────────────────────────────────────────────────────────────
# Factory Helpers
# ─────────────────────────────────────────────────────────────────────────────

def success_response(
    data: Any = None,
    message: str = "Operation completed successfully.",
    pagination: Optional[PaginationMeta] = None,
    status_code: int = 200,
) -> APIResponse[Any]:
    """
    Build a successful API response envelope.

    Args:
        data:        The payload to return in the ``data`` field.
        message:     Human-readable description of the result.
        pagination:  Optional pagination metadata for list endpoints.
        status_code: HTTP status code (informational – not set here).

    Returns:
        Populated ``APIResponse`` with ``success=True``.
    """
    return APIResponse(
        success=True,
        message=message,
        data=data,
        pagination=pagination,
    )


def error_response(
    message: str,
    error_code: str = "ERROR",
    details: Any = None,
) -> APIResponse[None]:
    """
    Build a failed API response envelope.

    Args:
        message:    Human-readable error description.
        error_code: Machine-readable identifier for the failure type.
        details:    Optional structured context (e.g. validation errors).

    Returns:
        Populated ``APIResponse`` with ``success=False``.
    """
    return APIResponse(
        success=False,
        message=message,
        data=None,
        errors=ErrorDetail(error_code=error_code, details=details),
    )
