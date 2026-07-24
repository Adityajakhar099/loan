"""
Documents Router Alias.

Re-exports the router from document.py for module naming compatibility.
"""
from app.api.v1.routes.document import router

__all__ = ["router"]
