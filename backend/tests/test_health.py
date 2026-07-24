"""
Integration tests for the health check endpoints.
"""
import pytest


@pytest.mark.asyncio
async def test_health_endpoint(async_client):
    """GET /api/v1/health should return 200 with server and DB status."""
    response = await async_client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "server_status" in data["data"]
    assert "database_status" in data["data"]
    assert "api_version" in data["data"]
    assert "timestamp" in data["data"]
