"""
ML Inference Engine, Loan Recommendation Rules & Risk Analysis.

Loads trained model artifacts from disk and computes:
  - Loan Eligibility status
  - Approval Probability
  - Financial Risk Level (Low, Medium, High)
  - Recommended Loan Type (Home Loan, Business Loan, Education Loan, Vehicle Loan, Personal Loan)
  - Top contributing factors & risk explanations
"""
import json
import math
import pickle
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple

from app.core.config import settings
from app.core.logging import logger
from app.ml.preprocessor import LoanPreprocessor

try:
    import joblib
except ImportError:
    joblib = None


class LoanPredictor:
    """
    Singleton inference predictor for loan approval and risk analysis.
    """

    _instance: Optional["LoanPredictor"] = None

    def __new__(cls) -> "LoanPredictor":
        if cls._instance is None:
            cls._instance = super(LoanPredictor, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self, models_dir: str = "app/ml/saved_models"):
        if getattr(self, "_initialized", False):
            return

        self.models_dir = Path(models_dir).resolve()
        self.best_model = None
        self.preprocessor = None
        self.metadata = {}
        self._initialized = True
        self.load_artifacts()

    def load_artifacts(self) -> bool:
        """
        Load trained model, preprocessor, and metadata from disk.
        If missing or invalid, triggers automated training.
        """
        model_path = self.models_dir / "best_model.pkl"
        preprocessor_path = self.models_dir / "preprocessor.pkl"
        meta_path = self.models_dir / "metadata.json"

        if not (model_path.exists() and preprocessor_path.exists()):
            logger.warning("ML model artifacts not found at '{}'. Running automated trainer...", self.models_dir)
            try:
                from app.ml.trainer import train_ml_pipeline
                train_ml_pipeline()
            except Exception as exc:
                logger.error("Failed to train initial ML model: {}", exc)
                return False

        try:
            if model_path.exists():
                try:
                    if joblib is not None:
                        self.best_model = joblib.load(model_path)
                    else:
                        with open(model_path, "rb") as f:
                            self.best_model = pickle.load(f)
                except Exception:
                    self.best_model = None

            if preprocessor_path.exists():
                try:
                    self.preprocessor = LoanPreprocessor.load(str(preprocessor_path))
                except Exception:
                    self.preprocessor = None

            if meta_path.exists():
                try:
                    with open(meta_path, "r", encoding="utf-8") as f:
                        self.metadata = json.load(f)
                except Exception:
                    self.metadata = {}

            logger.info("Loaded ML model artifacts from '{}'", self.models_dir)
            return True
        except Exception as exc:
            logger.error("Error loading model artifacts: {}", exc)
            return False

    def recommend_loan_type(
        self,
        income: float,
        co_income: float,
        loan_amount: float,
        loan_term: int,
        education: str,
        self_employed: str,
        property_area: str,
    ) -> str:
        """
        Rule-based recommendation engine for loan types.
        """
        total_income = income + co_income
        raw_loan_amount = loan_amount * 1000.0 if loan_amount < 2000 else loan_amount

        if self_employed.lower() == "yes" and total_income >= 50000:
            return "Business Loan"
        elif raw_loan_amount >= 400000 or property_area.lower() in ["urban", "semiurban"]:
            return "Home Loan"
        elif education.lower() == "graduate" and loan_term <= 120 and raw_loan_amount <= 300000:
            return "Education Loan"
        elif loan_term <= 84 and raw_loan_amount <= 500000:
            return "Vehicle Loan"
        else:
            return "Personal Loan"

    def calculate_risk_level(self, probability: float, credit_history: float, total_income: float, loan_amount_raw: float) -> Tuple[str, float]:
        """
        Determine Risk Level (Low, Medium, High) and overall confidence score.
        """
        debt_ratio = loan_amount_raw / (total_income + 1.0)

        if probability >= 0.75 and credit_history == 1 and debt_ratio <= 15.0:
            risk_level = "Low"
            confidence = round(min(0.99, probability + 0.05), 2)
        elif probability >= 0.45 and credit_history == 1:
            risk_level = "Medium"
            confidence = round(probability, 2)
        else:
            risk_level = "High"
            confidence = round(max(0.70, 1.0 - probability), 2)

        return risk_level, confidence

    def derive_top_factors(
        self,
        credit_history: float,
        total_income: float,
        loan_amount_raw: float,
        property_area: str,
        education: str,
        probability: float,
    ) -> List[str]:
        """
        Generate top contributing factor explanations for predictions.
        """
        factors = []

        if credit_history == 1:
            factors.append("Excellent Credit History")
        else:
            factors.append("Poor or Missing Credit History")

        debt_ratio = loan_amount_raw / (total_income + 1.0)
        if debt_ratio <= 10.0:
            factors.append("Low Debt-to-Income Ratio")
        elif debt_ratio > 20.0:
            factors.append("High Loan Amount relative to Income")
        else:
            factors.append("Manageable Loan-to-Income Ratio")

        if total_income >= 60000:
            factors.append("High Combined Income Stability")
        elif total_income < 30000:
            factors.append("Modest Household Income")

        if property_area.lower() in ["urban", "semiurban"]:
            factors.append(f"Favorable Property Location ({property_area})")

        if education.lower() == "graduate":
            factors.append("Higher Education Qualification")

        return factors[:3]

    def predict(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute full prediction pipeline for input feature dict.
        """
        gender = str(input_data.get("gender", "Male"))
        married = str(input_data.get("married", "Yes"))
        dependents = str(input_data.get("dependents", "0"))
        education = str(input_data.get("education", "Graduate"))
        self_employed = str(input_data.get("self_employed", "No"))
        
        income = float(input_data.get("income", 50000))
        co_income = float(input_data.get("co_income", 0))
        
        raw_loan = float(input_data.get("loan_amount", 200000))
        loan_amount_k = raw_loan / 1000.0 if raw_loan > 2000 else raw_loan
        loan_amount_raw = loan_amount_k * 1000.0

        loan_term = int(input_data.get("loan_term", 360))
        credit_history = float(input_data.get("credit_history", 1.0))
        property_area = str(input_data.get("property_area", "Urban"))

        proba = None
        if self.best_model is not None and self.preprocessor is not None and getattr(self.preprocessor, "is_fitted", False):
            try:
                import pandas as pd
                df_input = pd.DataFrame([{
                    "Gender": gender,
                    "Married": married,
                    "Dependents": dependents,
                    "Education": education,
                    "Self_Employed": self_employed,
                    "ApplicantIncome": income,
                    "CoapplicantIncome": co_income,
                    "LoanAmount": loan_amount_k,
                    "Loan_Amount_Term": loan_term,
                    "Credit_History": credit_history,
                    "Property_Area": property_area,
                }])
                X_vec = self.preprocessor.transform(df_input)
                if hasattr(self.best_model, "predict_proba"):
                    proba = float(self.best_model.predict_proba(X_vec)[0, 1])
                elif hasattr(self.best_model, "predict"):
                    proba = float(self.best_model.predict(X_vec)[0])
            except Exception as exc:
                logger.warning("Predictor fallback to analytical logit: {}", exc)

        if proba is None:
            total_income = income + co_income
            debt_ratio = loan_amount_raw / (total_income + 1.0)
            score = (
                (credit_history * 3.5)
                + (0.5 if education == "Graduate" else 0.0)
                + (0.4 if property_area in ["Urban", "Semiurban"] else 0.0)
                - (0.8 if debt_ratio > 15.0 else 0.0)
                + (0.6 if total_income >= 50000 else 0.0)
            )
            proba = 1.0 / (1.0 + math.exp(-(score - 2.5)))

        proba_rounded = round(float(proba), 2)
        eligible = bool(proba_rounded >= 0.48 and credit_history == 1.0) or bool(proba_rounded >= 0.60)

        recommended_loan = self.recommend_loan_type(
            income=income,
            co_income=co_income,
            loan_amount=loan_amount_raw,
            loan_term=loan_term,
            education=education,
            self_employed=self_employed,
            property_area=property_area,
        )

        risk_level, confidence = self.calculate_risk_level(
            probability=proba_rounded,
            credit_history=credit_history,
            total_income=income + co_income,
            loan_amount_raw=loan_amount_raw,
        )

        top_factors = self.derive_top_factors(
            credit_history=credit_history,
            total_income=income + co_income,
            loan_amount_raw=loan_amount_raw,
            property_area=property_area,
            education=education,
            probability=proba_rounded,
        )

        logger.info(
            "ML Prediction completed | Eligible={} | Prob={} | Risk={} | Recommended={}",
            eligible, proba_rounded, risk_level, recommended_loan
        )

        return {
            "eligible": eligible,
            "approval_probability": proba_rounded,
            "recommended_loan": recommended_loan,
            "risk_level": risk_level,
            "confidence": confidence,
            "top_factors": top_factors,
        }


# Global predictor instance
loan_predictor = LoanPredictor()
