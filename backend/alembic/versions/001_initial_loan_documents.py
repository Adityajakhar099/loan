"""Initial migration – create loan_documents table.

Revision ID: 001
Revises: 
Create Date: 2026-07-24 00:00:00.000000
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "loan_documents",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("filename", sa.String(length=512), nullable=False),
        sa.Column("original_filename", sa.String(length=512), nullable=False),
        sa.Column("file_size", sa.BigInteger(), nullable=False),
        sa.Column("file_type", sa.String(length=128), nullable=False, server_default="application/pdf"),
        sa.Column("upload_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("page_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("status", sa.String(length=64), nullable=False, server_default="UPLOADED"),
        sa.Column("storage_path", sa.String(length=1024), nullable=False),
        sa.Column("title", sa.String(length=512), nullable=True),
        sa.Column("author", sa.String(length=256), nullable=True),
        sa.Column("subject", sa.Text(), nullable=True),
        sa.Column("creation_date", sa.String(length=128), nullable=True),
        sa.Column("producer", sa.String(length=256), nullable=True),
        sa.Column("checksum", sa.String(length=64), nullable=True),
        sa.Column("is_processed", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_loan_documents_id"), "loan_documents", ["id"], unique=False)
    op.create_index(op.f("ix_loan_documents_checksum"), "loan_documents", ["checksum"], unique=False)
    op.create_index(op.f("ix_loan_documents_is_active"), "loan_documents", ["is_active"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_loan_documents_is_active"), table_name="loan_documents")
    op.drop_index(op.f("ix_loan_documents_checksum"), table_name="loan_documents")
    op.drop_index(op.f("ix_loan_documents_id"), table_name="loan_documents")
    op.drop_table("loan_documents")
