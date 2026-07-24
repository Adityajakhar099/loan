"""
Document API Router (document.py).

Provides endpoints for loan policy PDF documents:
  POST   /documents/upload      Upload a new PDF
  POST   /documents/            Upload a new PDF
  GET    /documents/            List all documents (paginated, sorted, searchable)
  GET    /documents/{id}        Retrieve document details by ID
  DELETE /documents/{id}        Delete document (soft or hard)
"""
import uuid
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, File, Query, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import logger
from app.database.connection import get_db_session
from app.schemas.document import (
    DocumentDeleteResponse,
    DocumentListResponse,
    DocumentResponse,
    DocumentUploadResponse,
)
from app.schemas.response import APIResponse, success_response
from app.services import document_service

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post(
    "/upload",
    response_model=APIResponse[DocumentUploadResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Upload a loan policy PDF document (/upload)",
    description="Uploads a PDF document (max 20MB), extracts PyMuPDF metadata, saves to disk and DB.",
)
@router.post(
    "/",
    response_model=APIResponse[DocumentUploadResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Upload a loan policy PDF document (/)",
    description="Uploads a PDF document (max 20MB), extracts PyMuPDF metadata, saves to disk and DB.",
)
async def upload_document(
    file: Annotated[UploadFile, File(description="PDF file to upload (max 20MB).")],
    db: AsyncSession = Depends(get_db_session),
) -> APIResponse[DocumentUploadResponse]:
    """Upload and process a loan policy PDF document."""
    logger.info("Document upload initiated | filename={}", file.filename)

    result = await document_service.upload_document(file=file, db=db)

    logger.info(
        "Document upload complete | id={} | pages={}",
        result.document_id,
        result.pages,
    )
    return success_response(
        data=result,
        message=f"Document '{result.original_filename}' uploaded successfully.",
        status_code=status.HTTP_201_CREATED,
    )


@router.get(
    "/",
    response_model=APIResponse[list[DocumentListResponse]],
    status_code=status.HTTP_200_OK,
    summary="List all uploaded PDFs",
    description="Supports pagination, sorting, search by filename/title/author.",
)
async def list_documents(
    db: AsyncSession = Depends(get_db_session),
    page: int = Query(default=1, ge=1, description="Page number (1-indexed)."),
    page_size: int = Query(default=20, ge=1, le=100, description="Items per page."),
    search: Optional[str] = Query(default=None, description="Search query string."),
    sort_by: str = Query(default="created_at", description="Sort field (created_at, filename, file_size)."),
    sort_order: str = Query(default="desc", description="Sort order (asc, desc)."),
    include_inactive: bool = Query(default=False, description="Include soft-deleted documents."),
) -> APIResponse[list[DocumentListResponse]]:
    """Return a paginated list of documents with optional filtering and sorting."""
    documents, pagination = await document_service.list_documents(
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
        include_inactive=include_inactive,
    )
    return success_response(
        data=documents,
        message=f"Retrieved {len(documents)} document(s).",
        pagination=pagination,
    )


@router.get(
    "/{document_id}",
    response_model=APIResponse[DocumentResponse],
    status_code=status.HTTP_200_OK,
    summary="Retrieve document metadata by ID",
    description="Returns metadata and details for a single document by UUID.",
)
async def get_document(
    document_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
) -> APIResponse[DocumentResponse]:
    """Retrieve details for a single loan document by ID."""
    document = await document_service.get_document_by_id(document_id=document_id, db=db)
    return success_response(
        data=document,
        message="Document retrieved successfully.",
    )


@router.delete(
    "/{document_id}",
    response_model=APIResponse[DocumentDeleteResponse],
    status_code=status.HTTP_200_OK,
    summary="Delete a document by ID",
    description="Soft-deletes document by default. Use ?hard=true for physical removal.",
)
async def delete_document(
    document_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
    hard: bool = Query(default=False, description="If true, permanently delete record and file."),
) -> APIResponse[DocumentDeleteResponse]:
    """Delete a document by ID."""
    result = await document_service.delete_document(
        document_id=document_id, db=db, hard_delete=hard
    )
    return success_response(
        data=DocumentDeleteResponse(id=result["id"], message=result["message"]),
        message=result["message"],
    )
