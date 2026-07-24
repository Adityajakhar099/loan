"""
FastAPI Application Factory and Entry Point.

Implements Clean Architecture lifecycle management:
  - Initialises Loguru logging before any other module import.
  - Registers custom exception handlers.
  - Mounts the v1 API router.
  - Configures CORS middleware & Request Logging Middleware.
  - Verifies the database connection on startup.
  - Auto-reloads FAISS vector store index on startup.
  - Auto-loads ML model artifacts on startup.
"""
import sys
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

# ── Logging must be the very first import ──────────────────────────────────
from app.core.logging import logger, setup_logging

setup_logging()

# ── After logging is configured, import everything else ───────────────────
from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import (
    BaseAppException,
    app_exception_handler,
    http_exception_handler,
    unhandled_exception_handler,
    validation_exception_handler,
)
from app.database.connection import close_db, init_db
from app.middleware.logging_middleware import RequestLoggingMiddleware
from app.services.vector_store import vector_store_manager
from app.ml.predictor import loan_predictor


# ─────────────────────────────────────────────────────────────────────────────
# Application Lifespan
# ─────────────────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    FastAPI lifespan context manager.

    Startup:
      - Verifies database connectivity.
      - Auto-loads FAISS vector index from disk.
      - Auto-loads ML prediction model artifacts.
      - Logs application configuration summary.

    Shutdown:
      - Disposes the connection pool gracefully.
    """
    logger.info("=" * 60)
    logger.info("  {} v{}", settings.PROJECT_NAME, settings.VERSION)
    logger.info("  Environment : {}", settings.ENVIRONMENT)
    logger.info("  Debug       : {}", settings.DEBUG)
    logger.info("  Host        : {}:{}", settings.HOST, settings.PORT)
    logger.info("=" * 60)

    try:
        await init_db()
    except Exception as exc:
        logger.critical("Startup aborted – database unavailable: {}", exc)
        logger.warning("Continuing startup in degraded mode (no DB connection).")

    # Load FAISS vector store from disk if available
    try:
        vector_store_manager.initialize_store()
    except Exception as exc:
        logger.error("Failed to initialize FAISS vector store: {}", exc)

    # Load ML prediction model artifacts
    try:
        loan_predictor.load_artifacts()
    except Exception as exc:
        logger.error("Failed to initialize ML loan predictor: {}", exc)

    logger.info("Application startup complete. Serving requests.")
    yield

    logger.info("Application shutdown initiated.")
    await close_db()
    logger.info("Application shutdown complete.")


# ─────────────────────────────────────────────────────────────────────────────
# Application Factory
# ─────────────────────────────────────────────────────────────────────────────

def create_application() -> FastAPI:
    """
    Construct and configure the FastAPI application instance.
    """
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description=(
            "Production-grade AI Loan Advisory Agent API with full RAG and Machine Learning integration. "
            "Provides PDF policy ingestion, FAISS vector search, Gemini 2.5 Flash query answering, "
            "and ML Loan Eligibility & Approval Probability prediction."
        ),
        docs_url=f"{settings.API_V1_STR}/docs",
        redoc_url=f"{settings.API_V1_STR}/redoc",
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        lifespan=lifespan,
    )

    # ── Custom Request Logging Middleware ────────────────────────────────────
    app.add_middleware(RequestLoggingMiddleware)

    # ── CORS Middleware ──────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Exception Handlers ──────────────────────────────────────────────────
    app.add_exception_handler(BaseAppException, app_exception_handler)          # type: ignore[arg-type]
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)   # type: ignore[arg-type]
    app.add_exception_handler(RequestValidationError, validation_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(Exception, unhandled_exception_handler)           # type: ignore[arg-type]

    # ── Routers ─────────────────────────────────────────────────────────────
    app.include_router(api_router, prefix=settings.API_V1_STR)

    return app


# ─────────────────────────────────────────────────────────────────────────────
# Application Instance
# ─────────────────────────────────────────────────────────────────────────────

app = create_application()


# ─────────────────────────────────────────────────────────────────────────────
# Root redirect → docs
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/", include_in_schema=False)
async def root() -> dict:
    """Root path – returns minimal API info."""
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": f"{settings.API_V1_STR}/docs",
    }
