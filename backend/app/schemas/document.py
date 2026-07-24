"""
Pydantic V2 Schemas for the LoanDocument domain.

Provides strongly typed schemas for requests, responses, and lists,
supporting full validation and OpenAPI doc generation.
"""
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class _BaseSchema(BaseModel):
    """Shared Pydantic config for all document schemas."""

    model_config = {
        "from_attributes": True,
        "arbitrary_types_allowed": True,
        "populate_by_name": True,
    }


class DocumentMetaResponse(_BaseSchema):
    """
    Extracted PyMuPDF metadata payload returned after PDF upload.
    """

    page_count: int = Field(..., ge=0, description="Total page count of the document.")
    title: Optional[str] = Field(None, description="PDF title metadata.")
    author: Optional[str] = Field(None, description="PDF author metadata.")
    subject: Optional[str] = Field(None, description="PDF subject/description metadata.")
    creation_date: Optional[str] = Field(None, description="PDF creation date metadata.")
    producer: Optional[str] = Field(None, description="PDF producer application metadata.")
    file_size: int = Field(..., ge=0, description="File size in bytes.")
    file_size_mb: float = Field(..., ge=0, description="File size in MB (rounded to 2 decimal places).")

    @field_validator("file_size_mb", mode="before")
    @classmethod
    def round_mb(cls, v: float) -> float:
        return round(v, 2)


class DocumentResponse(_BaseSchema):
    """Full document schema returned by detail / upload / list endpoints."""

    id: uuid.UUID = Field(..., description="Unique document ID.")
    filename: str = Field(..., description="Stored unique filename on disk.")
    original_filename: str = Field(..., description="Original uploaded filename.")
    file_size: int = Field(..., description="File size in bytes.")
    file_type: str = Field(..., description="MIME type of the file.")
    upload_date: datetime = Field(..., description="Timestamp when the file was uploaded.")
    page_count: int = Field(..., description="Page count extracted via PyMuPDF.")
    status: str = Field(..., description="Processing status (UPLOADED, PROCESSED, FAILED).")
    title: Optional[str] = Field(None, description="PDF title.")
    author: Optional[str] = Field(None, description="PDF author.")
    subject: Optional[str] = Field(None, description="PDF subject.")
    checksum: Optional[str] = Field(None, description="SHA-256 hash digest.")
    is_processed: bool = Field(..., description="True if RAG processing is finished.")
    is_active: bool = Field(..., description="True if document is active (not soft-deleted).")
    created_at: datetime = Field(..., description="Creation timestamp.")
    updated_at: datetime = Field(..., description="Last update timestamp.")

    @property
    def file_name(self) -> str:
        """Alias for original_filename for backwards compatibility."""
        return self.original_filename

    @property
    def file_size_mb(self) -> float:
        return round(self.file_size / (1024 * 1024), 2)


class DocumentUploadResponse(_BaseSchema):
    """Response returned upon successful PDF upload (201 Created)."""

    document_id: uuid.UUID = Field(..., description="Unique ID of the stored document.")
    filename: str = Field(..., description="Stored unique filename.")
    original_filename: str = Field(..., description="Original filename.")
    pages: int = Field(..., description="Total pages in the PDF.")
    status: str = Field(..., description="Upload/Processing status.")
    file_size: int = Field(..., description="File size in bytes.")
    metadata: DocumentMetaResponse = Field(..., description="Extracted PyMuPDF metadata.")
    document: DocumentResponse = Field(..., description="Complete database record.")


class DocumentListResponse(_BaseSchema):
    """Slim model for document list responses."""

    id: uuid.UUID
    filename: str
    original_filename: str
    file_size: int
    file_type: str
    page_count: int
    status: str
    upload_date: datetime
    title: Optional[str] = None
    author: Optional[str] = None
    is_processed: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime


class DocumentDeleteResponse(_BaseSchema):
    """Response envelope for document deletion."""

    id: uuid.UUID = Field(..., description="ID of deleted document.")
    message: str = Field("Document deleted successfully.", description="Status message.")
