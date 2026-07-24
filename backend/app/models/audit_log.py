"""
Audit Log Model (audit_log.py).

Records system events, RAG queries, PDF document uploads, and ML risk predictions for compliance tracking.
"""
from sqlalchemy import Column, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from app.database.connection import Base
from app.models.base_model import BaseModelMixin


class AuditLog(Base, BaseModelMixin):
    """
    SQLAlchemy model storing system audit trails.
    """

    __tablename__ = "audit_logs"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(String(100), nullable=False, index=True)  # RAG_QUERY, DOCUMENT_UPLOAD, ML_PREDICTION
    query_text = Column(Text, nullable=True)
    response_summary = Column(Text, nullable=True)
    confidence_score = Column(Float, nullable=True)
    ip_address = Column(String(50), nullable=True)

    def __repr__(self) -> str:
        return f"<AuditLog(id={self.id}, action='{self.action}')>"
