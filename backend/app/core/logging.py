"""
Loguru-based Structured Logging Configuration.

Replaces the standard-library logging system with Loguru's richer
formatting, automatic log rotation, and context-aware sinks.
Also intercepts uvicorn/SQLAlchemy stdlib logs so everything flows
through a single pipeline.
"""
import logging
import sys
from pathlib import Path

from loguru import logger

from app.core.config import settings


class _InterceptHandler(logging.Handler):
    """
    Redirect standard-library log records into Loguru.

    Uvicorn, SQLAlchemy, and other libraries emit stdlib log records.
    This handler intercepts them so they all flow through Loguru sinks.
    """

    def emit(self, record: logging.LogRecord) -> None:
        # Find the Loguru level name corresponding to the stdlib level
        try:
            level: str | int = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        # Walk the call stack to find the real origin frame
        frame, depth = sys._getframe(6), 6
        while frame and frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back  # type: ignore[assignment]
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(
            level, record.getMessage()
        )


def setup_logging() -> None:
    """
    Configure Loguru sinks and intercept stdlib loggers.

    Sinks:
    - sys.stderr: human-readable coloured output for development.
    - LOG_FILE:   structured, rotating file log for production audit.

    Call this exactly once during application startup.
    """
    # Remove Loguru's default handler before adding custom sinks
    logger.remove()

    # ── Console sink ────────────────────────────────────────────────────────
    log_format = (
        "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
        "<level>{message}</level>"
    )
    logger.add(
        sys.stderr,
        level=settings.LOG_LEVEL,
        format=log_format,
        colorize=True,
        backtrace=settings.DEBUG,
        diagnose=settings.DEBUG,
    )

    # ── File sink (rotating) ────────────────────────────────────────────────
    log_path = Path(settings.LOG_FILE)
    log_path.parent.mkdir(parents=True, exist_ok=True)

    logger.add(
        str(log_path),
        level=settings.LOG_LEVEL,
        format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | {name}:{function}:{line} | {message}",
        rotation=settings.LOG_ROTATION,
        retention=settings.LOG_RETENTION,
        compression="zip",
        encoding="utf-8",
        backtrace=True,
        diagnose=settings.DEBUG,
        enqueue=True,  # Thread-safe async writes
    )

    # ── Intercept stdlib loggers ─────────────────────────────────────────────
    stdlib_loggers = [
        "uvicorn",
        "uvicorn.error",
        "uvicorn.access",
        "fastapi",
        "sqlalchemy.engine",
        "sqlalchemy.pool",
    ]
    logging.basicConfig(handlers=[_InterceptHandler()], level=0, force=True)
    for name in stdlib_loggers:
        std_logger = logging.getLogger(name)
        std_logger.handlers = [_InterceptHandler()]
        std_logger.propagate = False

    logger.info(
        "Logging initialised | level={} | env={} | file={}",
        settings.LOG_LEVEL,
        settings.ENVIRONMENT,
        settings.LOG_FILE,
    )


# Re-export logger so all modules do:  from app.core.logging import logger
__all__ = ["logger", "setup_logging"]
