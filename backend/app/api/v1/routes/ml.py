"""
ML Loan Approval Prediction API Router.

POST /api/v1/ml/predict — Evaluates applicant features to predict:
  - Loan Eligibility status
  - Approval Probability
  - Recommended Loan Type
  - Financial Risk Level
  - Confidence Score
  - Top contributing decision factors
"""
from typing import List, Union

from fastapi import APIRouter, status
from pydantic import BaseModel, Field

from app.core.logging import logger
from app.ml.predictor import loan_predictor
from app.schemas.response import APIResponse, success_response

router = APIRouter(prefix="/ml", tags=["Machine Learning"])


class LoanPredictionRequest(BaseModel):
    """Input parameters for loan approval prediction."""

    gender: str = Field(default="Male", description="Gender (Male, Female).", examples=["Male"])
    married: str = Field(default="Yes", description="Marital status (Yes, No).", examples=["Yes"])
    dependents: Union[int, str] = Field(default=1, description="Number of dependents (0, 1, 2, 3+).", examples=[1])
    education: str = Field(default="Graduate", description="Education level (Graduate, Not Graduate).", examples=["Graduate"])
    self_employed: str = Field(default="No", description="Self employment status (Yes, No).", examples=["No"])
    income: float = Field(..., ge=0, description="Applicant monthly/annual income.", examples=[65000])
    co_income: float = Field(default=0.0, ge=0, description="Co-applicant income.", examples=[20000])
    loan_amount: float = Field(..., ge=1000, description="Requested loan amount.", examples=[800000])
    loan_term: int = Field(default=360, ge=12, le=480, description="Loan term in months.", examples=[240])
    credit_history: float = Field(default=1.0, description="Credit history meets guidelines (1.0 or 0.0).", examples=[1.0])
    property_area: str = Field(default="Urban", description="Property area type (Urban, Semiurban, Rural).", examples=["Urban"])


class LoanPredictionResponse(BaseModel):
    """Output prediction payload."""

    eligible: bool = Field(..., description="Calculated loan eligibility status.")
    approval_probability: float = Field(..., description="Estimated approval probability (0.0 to 1.0).")
    recommended_loan: str = Field(..., description="Recommended loan type (Home, Business, Education, Vehicle, Personal).")
    risk_level: str = Field(..., description="Assessed financial risk level (Low, Medium, High).")
    confidence: float = Field(..., description="Model prediction confidence score.")
    top_factors: List[str] = Field(..., description="Top contributing factors for prediction.")


@router.post(
    "/predict",
    response_model=APIResponse[LoanPredictionResponse],
    status_code=status.HTTP_200_OK,
    summary="Predict Loan Eligibility & Financial Risk",
    description="Evaluates applicant financial metrics using ML models (XGBoost/LightGBM/CatBoost/RF) to predict approval probability, risk level, and loan recommendations.",
)
async def predict_loan_approval(body: LoanPredictionRequest) -> APIResponse[LoanPredictionResponse]:
    """Execute ML prediction pipeline for loan applicant data."""
    logger.info("Received ML prediction request for income={} | loan_amount={}", body.income, body.loan_amount)

    input_dict = body.model_dump()
    result = loan_predictor.predict(input_dict)

    response_payload = LoanPredictionResponse(**result)
    return success_response(
        data=response_payload,
        message="Loan prediction completed successfully.",
        status_code=status.HTTP_200_OK,
    )
