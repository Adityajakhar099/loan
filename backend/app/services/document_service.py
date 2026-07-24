"""
Document Service – Business Logic Layer.

Handles all operations relating to LoanDocument entities:
  - File validation (MIME type, magic bytes, max size)
  - SHA-256 checksum generation
  - Disk persistence via aiofiles
  - PDF metadata extraction via PyMuPDF (fitz)
  - Text extraction, semantic chunking, and FAISS indexing
  - Database CRUD via SQLAlchemy Async 2.0
  - Vector purge on deletion
"""
import hashlib
import uuid
from datetime import datetime, timezone
from math import ceil
from pathlib import Path

import aiofiles
import fitz  # PyMuPDF
from fastapi import UploadFile
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import (
    DatabaseException,
    FileStorageException,
    FileTooLargeException,
    InvalidFileTypeException,
    InvalidPDFException,
    NotFoundException,
)
from app.core.logging import logger
from app.models.document import LoanDocument
from app.schemas.document import (
    DocumentListResponse,
    DocumentMetaResponse,
    DocumentResponse,
    DocumentUploadResponse,
)
from app.schemas.response import PaginationMeta
from app.services.pdf_extractor import extract_pdf_pages
from app.services.text_chunker import chunk_document_pages
from app.services.vector_store import vector_store_manager

# PDF magic bytes – every valid PDF starts with %PDF
_PDF_MAGIC = b"%PDF"


def _validate_pdf_magic(data: bytes) -> bool:
    """Return True if the first 4 bytes match the PDF magic number."""
    return data[:4] == _PDF_MAGIC


def _compute_sha256(data: bytes) -> str:
    """Return the SHA-256 hex digest of data."""
    return hashlib.sha256(data).hexdigest()


def _get_upload_path() -> Path:
    """
    Return the resolved absolute upload directory, creating it if required.
    """
    path = Path(settings.UPLOAD_DIR).resolve()
    path.mkdir(parents=True, exist_ok=True)
    return path


async def _save_file_to_disk(original_filename: str, content: bytes) -> tuple[Path, str]:
    """
    Write content to the upload directory under a UUID-namespaced filename.
    """
    upload_dir = _get_upload_path()
    suffix = Path(original_filename).suffix.lower() or ".pdf"
    stored_name = f"{uuid.uuid4()}{suffix}"
    dest = upload_dir / stored_name

    try:
        async with aiofiles.open(dest, "wb") as f:
            await f.write(content)
        logger.info("File saved to disk | path={}", dest)
        return dest, stored_name
    except OSError as exc:
        logger.exception("Failed to write file to disk | path={} | error={}", dest, exc)
        raise FileStorageException(f"Could not save file to disk: {exc}") from exc


def _extract_pdf_metadata(content: bytes, file_size: int) -> DocumentMetaResponse:
    """
    Use PyMuPDF to open the in-memory PDF and extract document metadata.
    """
    try:
        doc = fitz.open(stream=content, filetype="pdf")
    except Exception as exc:
        logger.warning("PyMuPDF failed to open PDF | error={}", exc)
        raise InvalidPDFException() from exc

    meta = doc.metadata or {}
    page_count = len(doc)
    doc.close()

    file_size_mb = round(file_size / (1024 * 1024), 2)

    return DocumentMetaResponse(
        page_count=page_count,
        title=meta.get("title") or None,
        author=meta.get("author") or None,
        subject=meta.get("subject") or None,
        creation_date=meta.get("creationDate") or None,
        producer=meta.get("producer") or None,
        file_size=file_size,
        file_size_mb=file_size_mb,
    )


# In-memory document fallback store for DB-degraded mode
_in_memory_docs: dict[uuid.UUID, LoanDocument] = {}


async def upload_document(
    file: UploadFile,
    db: AsyncSession,
) -> DocumentUploadResponse:
    """
    Validate, store, process, chunk, embed, and persist a loan-policy PDF.
    Supports in-memory document metadata fallback if the database connection is offline.
    """
    original_filename = file.filename or "uploaded_document.pdf"

    # 1. Extension check
    if not original_filename.lower().endswith(".pdf"):
        raise InvalidFileTypeException(
            f"File '{original_filename}' is not a PDF. Only .pdf files are allowed."
        )

    # 2. MIME type check
    content_type = file.content_type or "application/pdf"
    if content_type not in settings.ALLOWED_CONTENT_TYPES and content_type != "application/octet-stream":
        raise InvalidFileTypeException(
            f"MIME type '{content_type}' is not allowed. Only PDF files are accepted."
        )

    # 3. Read bytes
    content = await file.read()
    file_size = len(content)
    logger.debug("Read {} bytes from upload '{}'", file_size, original_filename)

    # 4. Size check (20MB limit)
    if file_size > settings.MAX_FILE_SIZE_BYTES:
        raise FileTooLargeException(max_mb=settings.MAX_FILE_SIZE_MB)

    # 5. Magic-byte check (%PDF)
    if not _validate_pdf_magic(content):
        raise InvalidPDFException("File content does not start with the PDF magic header (%PDF).")

    # 6. SHA-256 Checksum
    checksum = _compute_sha256(content)
    logger.debug("Checksum computed | sha256={}", checksum)

    # 7. PDF metadata extraction via PyMuPDF
    pdf_meta = _extract_pdf_metadata(content, file_size)
    logger.info(
        "PDF metadata extracted | pages={} | title={}",
        pdf_meta.page_count,
        pdf_meta.title,
    )

    # 8. Disk persistence
    stored_path, stored_filename = await _save_file_to_disk(original_filename, content)

    # 9. Database record creation (with in-memory fallback)
    now = datetime.now(timezone.utc)
    doc_id = uuid.uuid4()
    document = LoanDocument(
        id=doc_id,
        filename=stored_filename,
        original_filename=original_filename,
        storage_path=str(stored_path),
        file_size=file_size,
        file_type="application/pdf",
        upload_date=now,
        created_at=now,
        updated_at=now,
        page_count=pdf_meta.page_count,
        status="PROCESSING",
        title=pdf_meta.title,
        author=pdf_meta.author,
        subject=pdf_meta.subject,
        creation_date=pdf_meta.creation_date,
        producer=pdf_meta.producer,
        checksum=checksum,
        is_processed=False,
        is_active=True,
    )

    is_db_connected = True
    try:
        db.add(document)
        await db.flush()
        await db.refresh(document)
    except Exception as exc:
        is_db_connected = False
        logger.warning("Database unavailable during document upload | fallback=in-memory | error={}", exc)
        _in_memory_docs[doc_id] = document

    # 10. RAG Pipeline: Extract Text -> Chunk Text -> Embed & Store in FAISS
    try:
        pages = extract_pdf_pages(content)
        if pages:
            chunks = chunk_document_pages(
                pages=pages,
                document_id=str(document.id),
                original_filename=original_filename,
            )
            vector_store_manager.add_chunks(chunks)

        document.status = "PROCESSED"
        document.is_processed = True
        if is_db_connected:
            await db.flush()
    except Exception as exc:
        logger.error("RAG indexing failed for document_id={}: {}", document.id, exc)
        document.status = "FAILED"

    doc_response = DocumentResponse.model_validate(document)
    logger.info(
        "Document processing & indexing complete | id={} | status={} | original_filename={}",
        document.id,
        document.status,
        document.original_filename,
    )

    return DocumentUploadResponse(
        document_id=document.id,
        filename=document.filename,
        original_filename=document.original_filename,
        pages=document.page_count,
        status=document.status,
        file_size=document.file_size,
        metadata=pdf_meta,
        document=doc_response,
    )


async def list_documents(
    db: AsyncSession,
    page: int = 1,
    page_size: int = 20,
    search: str | None = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    include_inactive: bool = False,
) -> tuple[list[DocumentListResponse], PaginationMeta]:
    """
    Return a paginated, search-filtered, and sorted list of stored documents.
    """
    try:
        offset = (page - 1) * page_size

        base_query = select(LoanDocument)
        if not include_inactive:
            base_query = base_query.where(LoanDocument.is_active == True)  # noqa: E712

        if search:
            search_pattern = f"%{search}%"
            base_query = base_query.where(
                (LoanDocument.original_filename.ilike(search_pattern))
                | (LoanDocument.title.ilike(search_pattern))
                | (LoanDocument.author.ilike(search_pattern))
            )

        # Sorting
        sort_col = getattr(LoanDocument, sort_by, LoanDocument.created_at)
        if sort_order.lower() == "desc":
            base_query = base_query.order_by(sort_col.desc())
        else:
            base_query = base_query.order_by(sort_col.asc())

        # Count total
        count_query = select(func.count()).select_from(base_query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar_one()

        # Fetch page
        paginated = base_query.offset(offset).limit(page_size)
        result = await db.execute(paginated)
        documents = result.scalars().all()

        doc_list = [DocumentListResponse.model_validate(d) for d in documents]
        pagination = PaginationMeta(
            page=page,
            page_size=page_size,
            total=total,
            total_pages=ceil(total / page_size) if total > 0 else 0,
        )

        logger.debug("Listed {} documents | page={} | total={}", len(doc_list), page, total)
        return doc_list, pagination

    except Exception as exc:
        logger.warning("DB query failed in list_documents. Falling back to in-memory store: {}", exc)
        filtered = [d for d in _in_memory_docs.values() if include_inactive or d.is_active]
        if search:
            s = search.lower()
            filtered = [
                d for d in filtered
                if s in d.original_filename.lower() or (d.title and s in d.title.lower())
            ]
        total = len(filtered)
        doc_list = [DocumentListResponse.model_validate(d) for d in filtered]
        pagination = PaginationMeta(
            page=page,
            page_size=page_size,
            total=total,
            total_pages=ceil(total / page_size) if total > 0 else 0,
        )
        return doc_list, pagination


async def get_document_by_id(
    document_id: uuid.UUID,
    db: AsyncSession,
    include_inactive: bool = False,
) -> DocumentResponse:
    """
    Retrieve a single document by its UUID.
    """
    try:
        stmt = select(LoanDocument).where(LoanDocument.id == document_id)
        if not include_inactive:
            stmt = stmt.where(LoanDocument.is_active == True)  # noqa: E712

        result = await db.execute(stmt)
        document = result.scalar_one_or_none()
    except Exception as exc:
        logger.warning("DB query failed in get_document_by_id. Falling back to in-memory store: {}", exc)
        document = _in_memory_docs.get(document_id)
        if document and not include_inactive and not document.is_active:
            document = None

    if not document:
        raise NotFoundException(f"Document with ID '{document_id}' was not found.")

    return DocumentResponse.model_validate(document)


async def delete_document(
    document_id: uuid.UUID,
    db: AsyncSession,
    hard_delete: bool = False,
) -> dict:
    """
    Delete a document (soft-delete by default, hard-delete on request).
    Also automatically purges document vectors from the FAISS index.
    """
    document = None
    try:
        stmt = select(LoanDocument).where(
            LoanDocument.id == document_id,
            LoanDocument.is_active == True,  # noqa: E712
        )
        result = await db.execute(stmt)
        document = result.scalar_one_or_none()
    except Exception as exc:
        logger.warning("DB query failed in delete_document. Checking in-memory store: {}", exc)
        document = _in_memory_docs.get(document_id)

    if not document:
        raise NotFoundException(f"Document with ID '{document_id}' was not found.")

    # Purge vectors from FAISS index
    try:
        vector_store_manager.delete_document_vectors(str(document_id))
        logger.info("Purged FAISS vectors for document_id={}", document_id)
    except Exception as exc:
        logger.error("Failed to purge FAISS vectors for document_id={}: {}", document_id, exc)

    if hard_delete:
        file_path = Path(document.storage_path)
        if file_path.exists():
            try:
                file_path.unlink()
                logger.info("Physical file deleted | path={}", file_path)
            except OSError as exc:
                logger.exception("Failed to delete file | path={} | error={}", file_path, exc)
                raise FileStorageException(f"Could not delete file: {exc}") from exc
        try:
            await db.delete(document)
        except Exception:
            _in_memory_docs.pop(document_id, None)
        message = "Document permanently deleted and vectors purged."
    else:
        document.is_active = False
        document.updated_at = datetime.now(timezone.utc)
        try:
            await db.flush()
        except Exception:
            _in_memory_docs[document_id] = document
        message = "Document soft-deleted successfully and vectors purged."

    logger.info(
        "Document deleted | id={} | hard_delete={} | msg={}",
        document_id,
        hard_delete,
        message,
    )
    return {"id": document_id, "message": message}
