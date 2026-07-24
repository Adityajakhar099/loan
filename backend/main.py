"""
Root Entry Point for Uvicorn.

Re-exports the FastAPI app instance from app.main.
Allows running the server with either:
  uvicorn main:app --reload
  uvicorn app.main:app --reload
"""
from app.main import app

__all__ = ["app"]
