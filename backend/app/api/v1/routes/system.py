"""
System API Router (system.py).

Provides health check, system status, and readiness probes:
  GET /health   Returns Server status, Database status, API version, and Timestamp.
"""
import time
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.logging import logger
from app.database.connection import get_db_session
from app.schemas.response import APIResponse, success_response

router = APIRouter(prefix="", tags=["System"])

_START_TIME = time.time()


@router.get(
    "/health",
    response_model=APIResponse[dict],
    status_code=status.HTTP_200_OK,
    summary="Health check endpoint (/api/v1/health)",
    description="Returns server status, database status, API version, and timestamp.",
)
async def get_health(
    db: AsyncSession = Depends(get_db_session),
) -> APIResponse[dict]:
    """
    Health check endpoint.

    Returns:
        server_status: "online" | "degraded"
        database_status: "connected" | "disconnected"
        api_version: settings.VERSION
        timestamp: UTC ISO format string
    """
    db_connected = False
    db_message = "connected"

    try:
        await db.execute(text("SELECT 1"))
        db_connected = True
    except Exception as exc:
        db_message = f"disconnected: {exc}"
        logger.warning("Database check failed during health probe: {}", exc)

    server_status = "online" if db_connected else "degraded"
    uptime_seconds = round(time.time() - _START_TIME, 2)

    return success_response(
        data={
            "server_status": server_status,
            "database_status": db_message,
            "api_version": settings.VERSION,
            "project_name": settings.PROJECT_NAME,
            "environment": settings.ENVIRONMENT,
            "uptime_seconds": uptime_seconds,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
        message="System health status retrieved successfully.",
    )
