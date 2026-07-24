"""
Loan Application Model (application.py).

Stores borrower application records, financial metrics, and ML prediction results.
"""
from sqlalchemy import Boolean, Column, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from app.database.connection import Base
from app.models.base_model import BaseModelMixin


class LoanApplication(Base, BaseModelMixin):
    """
    SQLAlchemy model storing borrower loan applications.
    """

    __tablename__ = "loan_applications"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # Financial Inputs
    applicant_income = Column(Float, nullable=False)
    co_applicant_income = Column(Float, default=0.0, nullable=False)
    loan_amount = Column(Float, nullable=False)
    loan_term = Column(Integer, default=360, nullable=False)
    credit_history = Column(Float, default=1.0, nullable=False)
    property_area = Column(String(50), default="Urban", nullable=False)
    education = Column(String(50), default="Graduate", nullable=False)
    self_employed = Column(String(10), default="No", nullable=False)

    # ML & Rule Engine Outputs
    eligible = Column(Boolean, nullable=False)
    approval_probability = Column(Float, nullable=False)
    risk_level = Column(String(20), nullable=False)
    recommended_loan = Column(String(100), nullable=False)
    
    # Status Workflow
    status = Column(String(50), default="SUBMITTED", nullable=False, index=True)

    def __repr__(self) -> str:
        return f"<LoanApplication(id={self.id}, loan_amount={self.loan_amount}, status='{self.status}')>"
