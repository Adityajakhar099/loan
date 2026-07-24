"""
API v1 Router Aggregator.

Assembles all v1 sub-routers into a single ``api_router``.
"""
from fastapi import APIRouter

from app.api.v1.routes.chat import router as chat_router
from app.api.v1.routes.document import router as document_router
from app.api.v1.routes.ml import router as ml_router
from app.api.v1.routes.system import router as system_router

api_router = APIRouter()

api_router.include_router(system_router)
api_router.include_router(document_router)
api_router.include_router(chat_router)
api_router.include_router(ml_router)

__all__ = ["api_router"]
