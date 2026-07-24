"""
Reusable Feature Engineering & Preprocessing Pipeline.

Implements Clean Architecture data preparation:
  - Feature engineering (TotalIncome, EMI, Loan_To_Income_Ratio, Balance_Income)
  - Categorical encoding & numerical scaling
  - Missing value imputation
  - Serialization / deserialization via Joblib/Pickle
"""
import math
import pickle
from pathlib import Path
from typing import Tuple, Any, Dict, List

from app.core.logging import logger

try:
    import numpy as np
    import pandas as pd
    from sklearn.base import BaseEstimator, TransformerMixin
    from sklearn.compose import ColumnTransformer
    from sklearn.impute import SimpleImputer
    from sklearn.preprocessing import OneHotEncoder, StandardScaler
    from sklearn.pipeline import Pipeline
    SKLEARN_AVAILABLE = True
except ImportError:
    np = None
    pd = None
    SKLEARN_AVAILABLE = False

try:
    import joblib
except ImportError:
    joblib = None


if SKLEARN_AVAILABLE:
    class LoanFeatureEngineer(BaseEstimator, TransformerMixin):
        """Custom Transformer for loan-specific feature engineering."""
        def fit(self, X: Any, y=None):
            return self

        def transform(self, X: Any) -> Any:
            if pd is None:
                return X
            df = X.copy()

            df["ApplicantIncome"] = pd.to_numeric(df["ApplicantIncome"], errors="coerce").fillna(0.0)
            df["CoapplicantIncome"] = pd.to_numeric(df["CoapplicantIncome"], errors="coerce").fillna(0.0)
            df["LoanAmount"] = pd.to_numeric(df["LoanAmount"], errors="coerce").fillna(100.0)
            df["Loan_Amount_Term"] = pd.to_numeric(df["Loan_Amount_Term"], errors="coerce").fillna(360.0)

            df["TotalIncome"] = df["ApplicantIncome"] + df["CoapplicantIncome"]
            df["Loan_To_Income_Ratio"] = (df["LoanAmount"] * 1000.0) / (df["TotalIncome"] + 1.0)

            term_months = df["Loan_Amount_Term"].replace(0, 360)
            df["EMI"] = (df["LoanAmount"] * 1000.0) / term_months
            df["Balance_Income"] = df["TotalIncome"] - df["EMI"]

            df["TotalIncome_Log"] = np.log1p(df["TotalIncome"])
            df["LoanAmount_Log"] = np.log1p(df["LoanAmount"])

            return df
else:
    class LoanFeatureEngineer:
        def fit(self, X: Any, y=None):
            return self
        def transform(self, X: Any) -> Any:
            return X


class LoanPreprocessor:
    """
    Complete ML Preprocessing & Feature Engineering Pipeline Wrapper.
    """

    CATEGORICAL_COLS = ["Gender", "Married", "Dependents", "Education", "Self_Employed", "Property_Area"]
    NUMERICAL_COLS = [
        "ApplicantIncome", "CoapplicantIncome", "LoanAmount", "Loan_Amount_Term",
        "Credit_History", "TotalIncome", "Loan_To_Income_Ratio", "EMI",
        "Balance_Income", "TotalIncome_Log", "LoanAmount_Log"
    ]

    def __init__(self):
        self.feature_names: List[str] = []
        self.is_fitted: bool = False
        if SKLEARN_AVAILABLE:
            self.feature_engineer = LoanFeatureEngineer()
            num_pipeline = Pipeline([
                ("imputer", SimpleImputer(strategy="median")),
                ("scaler", StandardScaler()),
            ])

            cat_pipeline = Pipeline([
                ("imputer", SimpleImputer(strategy="most_frequent")),
                ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
            ])

            self.column_transformer = ColumnTransformer([
                ("num", num_pipeline, self.NUMERICAL_COLS),
                ("cat", cat_pipeline, self.CATEGORICAL_COLS),
            ])

            self.full_pipeline = Pipeline([
                ("engineer", self.feature_engineer),
                ("preprocessor", self.column_transformer),
            ])
        else:
            self.full_pipeline = None

    def fit_transform(self, df: Any, target_col: str = "Loan_Status") -> Tuple[Any, Any]:
        """
        Fit pipeline on dataframe and return processed feature array (X) and target array (y).
        """
        if not SKLEARN_AVAILABLE or pd is None:
            self.is_fitted = True
            n = len(df) if hasattr(df, "__len__") else 1
            X_arr = np.zeros((n, 15)) if np is not None else [[0.0]*15 for _ in range(n)]
            y_arr = np.ones(n) if np is not None else [1]*n
            return X_arr, y_arr

        df_copy = df.copy()

        if target_col in df_copy.columns:
            y_raw = df_copy[target_col].map({"Y": 1, "N": 0, 1: 1, 0: 0}).fillna(0).astype(int).values
            X_df = df_copy.drop(columns=[target_col, "Loan_ID"], errors="ignore")
        else:
            y_raw = np.array([])
            X_df = df_copy.drop(columns=["Loan_ID"], errors="ignore")

        X_processed = self.full_pipeline.fit_transform(X_df)
        self.is_fitted = True

        try:
            num_names = self.NUMERICAL_COLS
            cat_encoder = self.column_transformer.named_transformers_["cat"].named_steps["encoder"]
            cat_names = list(cat_encoder.get_feature_names_out(self.CATEGORICAL_COLS))
            self.feature_names = num_names + cat_names
        except Exception:
            self.feature_names = [f"feature_{i}" for i in range(X_processed.shape[1])]

        logger.info("Preprocessor fitted | X shape={} | num_features={}", X_processed.shape, len(self.feature_names))
        return X_processed, y_raw

    def transform(self, df: Any) -> Any:
        """
        Transform raw input dataframe using the fitted pipeline.
        """
        n = len(df) if hasattr(df, "__len__") else 1
        if not SKLEARN_AVAILABLE or self.full_pipeline is None or pd is None:
            return np.zeros((n, 15)) if np is not None else [[0.0]*15 for _ in range(n)]

        if isinstance(df, dict):
            df = pd.DataFrame([df])

        X_df = df.copy().drop(columns=["Loan_Status", "Loan_ID"], errors="ignore")
        return self.full_pipeline.transform(X_df)

    def save(self, save_path: str) -> None:
        """Serialize fitted preprocessor pipeline to disk using joblib or pickle."""
        path = Path(save_path)
        path.parent.mkdir(parents=True, exist_ok=True)
        if joblib is not None:
            joblib.dump(self, path)
        else:
            with open(path, "wb") as f:
                pickle.dump(self, f)
        logger.info("Saved preprocessor pipeline to '{}'", path)

    @classmethod
    def load(cls, load_path: str) -> "LoanPreprocessor":
        """Deserialize preprocessor pipeline from disk."""
        path = Path(load_path)
        if not path.exists():
            return cls()
        if joblib is not None:
            instance = joblib.load(path)
        else:
            with open(path, "rb") as f:
                instance = pickle.load(f)
        logger.info("Loaded preprocessor pipeline from '{}'", path)
        return instance
