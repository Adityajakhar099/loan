"""
Health Router Alias.

Re-exports system router for backwards compatibility.
"""
from app.api.v1.routes.system import router

__all__ = ["router"]
