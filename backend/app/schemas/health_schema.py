from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class HealthCheckResponse(BaseModel):
    """Schema for API Health Check response."""
    status: str = Field(..., example="healthy")
    timestamp: datetime = Field(..., example="2026-07-24T09:46:31Z")
    version: str = Field(..., example="1.0.0")
    environment: str = Field(..., example="development")
    database_connected: bool = Field(..., example=True)
    services: Dict[str, Any] = Field(default_factory=dict)
