"""
Dataset Loader & Synthetic Generator for Loan Prediction Dataset.

Provides standard dataset loading from CSV or automated synthesis of 
the classic Loan Prediction dataset for training, validation, and benchmarking.
"""
import math
import random
from pathlib import Path
from typing import Dict, Any, List

from app.core.logging import logger

try:
    import numpy as np
    import pandas as pd
except ImportError:
    np = None
    pd = None


def generate_synthetic_loan_data(num_samples: int = 1200, random_seed: int = 42) -> Any:
    """
    Generate synthetic data matching the schema and distribution of the 
    classic Loan Prediction Dataset.
    """
    random.seed(random_seed)
    if np is not None:
        np.random.seed(random_seed)

    rows = []
    genders_opts = ["Male", "Female"]
    married_opts = ["Yes", "No"]
    dependents_opts = ["0", "1", "2", "3+"]
    education_opts = ["Graduate", "Not Graduate"]
    self_employed_opts = ["No", "Yes"]
    property_area_opts = ["Urban", "Semiurban", "Rural"]
    terms_opts = [12, 36, 60, 84, 120, 180, 240, 300, 360, 480]

    for i in range(1, num_samples + 1):
        gender = random.choices(genders_opts, weights=[0.81, 0.19])[0]
        married = random.choices(married_opts, weights=[0.65, 0.35])[0]
        dependents = random.choices(dependents_opts, weights=[0.57, 0.17, 0.17, 0.09])[0]
        education = random.choices(education_opts, weights=[0.78, 0.22])[0]
        self_employed = random.choices(self_employed_opts, weights=[0.86, 0.14])[0]

        app_inc = int(random.lognormvariate(8.4, 0.6))
        app_inc = max(1500, min(81000, app_inc))

        has_co = random.choices([0, 1], weights=[0.4, 0.6])[0]
        co_inc = int(random.lognormvariate(7.5, 0.8)) if has_co else 0
        co_inc = max(0, min(41667, co_inc))

        loan_amt = int(random.lognormvariate(4.8, 0.4))
        loan_amt = max(9, min(700, loan_amt))

        term = random.choices(terms_opts, weights=[0.01, 0.01, 0.02, 0.02, 0.03, 0.07, 0.05, 0.04, 0.73, 0.02])[0]
        credit_history = random.choices([1.0, 0.0], weights=[0.84, 0.16])[0]
        property_area = random.choices(property_area_opts, weights=[0.33, 0.38, 0.29])[0]

        score = (
            (credit_history * 4.0)
            + (0.5 if education == "Graduate" else 0.0)
            + (0.5 if property_area == "Semiurban" else 0.0)
            + ((app_inc + co_inc) / (loan_amt * 1000 + 1.0)) * 10.0
            - (0.4 if dependents == "3+" else 0.0)
        )
        prob_y = 1.0 / (1.0 + math.exp(-(score - 3.2)))
        status = "Y" if random.random() < prob_y else "N"

        row = {
            "Loan_ID": f"LP{i:06d}",
            "Gender": gender,
            "Married": married,
            "Dependents": dependents,
            "Education": education,
            "Self_Employed": self_employed,
            "ApplicantIncome": app_inc,
            "CoapplicantIncome": co_inc,
            "LoanAmount": loan_amt,
            "Loan_Amount_Term": term,
            "Credit_History": credit_history,
            "Property_Area": property_area,
            "Loan_Status": status,
        }
        rows.append(row)

    logger.info("Generated synthetic loan dataset with {} samples", len(rows))
    if pd is not None:
        return pd.DataFrame(rows)
    return rows


def load_loan_dataset(data_path: str | None = None) -> Any:
    """
    Load dataset from CSV path if provided and exists; otherwise return synthetic dataset.
    """
    if data_path and Path(data_path).exists() and pd is not None:
        logger.info("Loading dataset from file: {}", data_path)
        return pd.read_csv(data_path)
    
    logger.info("No external dataset found at '{}'. Generating synthetic Loan Prediction dataset.", data_path)
    return generate_synthetic_loan_data()
