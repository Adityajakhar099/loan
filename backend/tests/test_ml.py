"""
Comprehensive Test Suite for ML Module (Data Loader, Preprocessor, Trainer, Predictor, API Endpoint).
"""
import pytest
from app.ml.data_loader import generate_synthetic_loan_data
from app.ml.preprocessor import LoanPreprocessor
from app.ml.trainer import LoanModelTrainer
from app.ml.predictor import loan_predictor


def test_data_loader():
    """Test synthetic loan dataset generation."""
    data = generate_synthetic_loan_data(num_samples=100)
    assert len(data) == 100
    if hasattr(data, "columns"):
        assert "Loan_Status" in data.columns
        assert "ApplicantIncome" in data.columns
        assert "Credit_History" in data.columns


def test_preprocessor():
    """Test feature engineering, scaling, and encoding pipeline."""
    df = generate_synthetic_loan_data(num_samples=50)
    preprocessor = LoanPreprocessor()
    X, y = preprocessor.fit_transform(df, target_col="Loan_Status")
    
    assert len(X) == 50
    assert len(y) == 50

    # Transform new data
    df_new = generate_synthetic_loan_data(num_samples=10)
    X_new = preprocessor.transform(df_new)
    assert len(X_new) == 10


def test_model_trainer(tmp_path):
    """Test training, cross-validation, and artifact saving."""
    models_dir = tmp_path / "saved_models"
    trainer = LoanModelTrainer(saved_models_dir=str(models_dir))
    
    metadata = trainer.train_and_evaluate_all()
    assert "best_model_name" in metadata
    assert "metrics" in metadata
    assert (models_dir / "best_model.pkl").exists()
    assert (models_dir / "preprocessor.pkl").exists()
    assert (models_dir / "metadata.json").exists()


def test_ml_predictor():
    """Test ML predictor inference, risk level, loan recommendation, and factors."""
    input_data = {
        "gender": "Male",
        "married": "Yes",
        "dependents": 1,
        "education": "Graduate",
        "self_employed": "No",
        "income": 65000,
        "co_income": 20000,
        "loan_amount": 800000,
        "loan_term": 240,
        "credit_history": 1.0,
        "property_area": "Urban",
    }

    result = loan_predictor.predict(input_data)
    assert "eligible" in result
    assert "approval_probability" in result
    assert "recommended_loan" in result
    assert "risk_level" in result
    assert "confidence" in result
    assert "top_factors" in result

    assert isinstance(result["eligible"], bool)
    assert 0.0 <= result["approval_probability"] <= 1.0
    assert result["recommended_loan"] in ["Home Loan", "Business Loan", "Education Loan", "Vehicle Loan", "Personal Loan"]
    assert result["risk_level"] in ["Low", "Medium", "High"]
    assert len(result["top_factors"]) >= 1


@pytest.mark.asyncio
async def test_ml_api_endpoint(async_client):
    """Test POST /api/v1/ml/predict API endpoint."""
    payload = {
        "gender": "Male",
        "married": "Yes",
        "dependents": 1,
        "education": "Graduate",
        "self_employed": "No",
        "income": 65000,
        "co_income": 20000,
        "loan_amount": 800000,
        "loan_term": 240,
        "credit_history": 1,
        "property_area": "Urban",
    }

    response = await async_client.post("/api/v1/ml/predict", json=payload)
    assert response.status_code == 200
    json_resp = response.json()

    assert json_resp["success"] is True
    data = json_resp["data"]
    assert "eligible" in data
    assert "approval_probability" in data
    assert "recommended_loan" in data
    assert "risk_level" in data
    assert "confidence" in data
    assert "top_factors" in data
