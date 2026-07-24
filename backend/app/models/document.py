"""
LoanDocument ORM Model.

Represents a PDF policy document uploaded into the system.
Includes metadata extracted via PyMuPDF and file storage attributes.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import BigInteger, Boolean, DateTime, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database.connection import Base


class LoanDocument(Base):
    """
    Persisted representation of an uploaded loan-policy PDF document.

    Fields as specified in system design:
        id:                 UUID primary key.
        filename:           Unique stored filename on disk.
        original_filename:  Original filename supplied by client.
        file_size:          Size in bytes.
        file_type:          MIME type (e.g., application/pdf).
        upload_date:        Timestamp of upload.
        page_count:         Total pages extracted via PyMuPDF.
        status:             Upload/processing status ("UPLOADED", "PROCESSING", "PROCESSED", "FAILED").
        created_at:         UTC creation timestamp.
        updated_at:         UTC update timestamp.
        storage_path:       Absolute or relative disk path.
        title:              PDF metadata title (optional).
        author:             PDF metadata author (optional).
        subject:            PDF metadata subject (optional).
        creation_date:      PDF internal creation date (optional).
        producer:           PDF producer tool (optional).
        checksum:           SHA-256 hash digest.
        is_processed:       Flag indicating processing completion.
        is_active:          Soft-delete status.
    """

    __tablename__ = "loan_documents"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    filename: Mapped[str] = mapped_column(String(512), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(512), nullable=False)
    file_size: Mapped[int] = mapped_column(BigInteger, nullable=False)
    file_type: Mapped[str] = mapped_column(
        String(128), nullable=False, default="application/pdf"
    )
    upload_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    page_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    status: Mapped[str] = mapped_column(String(64), nullable=False, default="UPLOADED")

    # Additional storage & metadata attributes
    storage_path: Mapped[str] = mapped_column(String(1024), nullable=False)
    title: Mapped[str | None] = mapped_column(String(512), nullable=True)
    author: Mapped[str | None] = mapped_column(String(256), nullable=True)
    subject: Mapped[str | None] = mapped_column(Text, nullable=True)
    creation_date: Mapped[str | None] = mapped_column(String(128), nullable=True)
    producer: Mapped[str | None] = mapped_column(String(256), nullable=True)
    checksum: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    is_processed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Legacy/compatibility alias
    @property
    def file_name(self) -> str:
        return self.original_filename

    def __repr__(self) -> str:
        return (
            f"<LoanDocument id={self.id} filename={self.filename!r} "
            f"original_filename={self.original_filename!r} status={self.status}>"
        )
