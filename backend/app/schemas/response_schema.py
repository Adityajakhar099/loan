from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel, Field

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    """
    Standardized API Response wrapper format for all successful endpoint outputs.
    """
    success: bool = Field(True, example=True)
    message: str = Field("Operation completed successfully.", example="Success")
    data: Optional[T] = Field(None)


class APIErrorDetails(BaseModel):
    """Details object inside ErrorResponse."""
    error_code: str = Field("INTERNAL_SERVER_ERROR", example="NOT_FOUND")
    details: Optional[Any] = Field(None)


class APIErrorResponse(BaseModel):
    """
    Standardized API Error Response format for exception handlers.
    """
    success: bool = Field(False, example=False)
    message: str = Field(..., example="Requested resource was not found.")
    error: APIErrorDetails
