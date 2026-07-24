from fastapi import APIRouter
from app.routes import health

api_router = APIRouter()

# Include version 1 routers
api_router.include_router(health.router)
