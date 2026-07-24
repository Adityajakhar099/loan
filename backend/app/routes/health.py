from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.health_schema import HealthCheckResponse
from app.schemas.response_schema import APIResponse
from app.database.connection import db_manager, get_db_session
from app.config.settings import settings

router = APIRouter(prefix="/health", tags=["Health"])


@router.get(
    "",
    response_model=APIResponse[HealthCheckResponse],
    summary="API & Database Health Check",
    description="Returns the status of the API, system environment, and PostgreSQL database connection."
)
async def check_health(db: AsyncSession = Depends(get_db_session)):
    db_ok = await db_manager.check_health()
    health_data = HealthCheckResponse(
        status="healthy" if db_ok else "degraded",
        timestamp=datetime.now(timezone.utc),
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        database_connected=db_ok,
        services={
            "database": "online" if db_ok else "offline",
            "api": "online"
        }
    )
    
    return APIResponse(
        success=db_ok,
        message="System health check completed.",
        data=health_data
    )
