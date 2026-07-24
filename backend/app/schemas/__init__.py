"""Schemas package."""
from app.schemas.document import (
    DocumentDeleteResponse,
    DocumentListResponse,
    DocumentMetaResponse,
    DocumentResponse,
    DocumentUploadResponse,
)
from app.schemas.response import APIResponse, PaginationMeta, error_response, success_response

__all__ = [
    "APIResponse",
    "PaginationMeta",
    "success_response",
    "error_response",
    "DocumentResponse",
    "DocumentMetaResponse",
    "DocumentUploadResponse",
    "DocumentListResponse",
    "DocumentDeleteResponse",
]
