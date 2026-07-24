import logging
import logging.config
import sys
from app.config.settings import settings


def setup_logging() -> None:
    """
    Configures production-ready structured logging for the application.
    Adjusts log levels based on DEBUG/ENVIRONMENT setting.
    """
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO

    logging_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
            "detailed": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "stream": sys.stdout,
                "formatter": "detailed" if settings.DEBUG else "default",
            },
        },
        "root": {
            "level": log_level,
            "handlers": ["console"],
        },
        "loggers": {
            "uvicorn": {"level": "INFO", "handlers": ["console"], "propagate": False},
            "uvicorn.error": {"level": "INFO", "handlers": ["console"], "propagate": False},
            "uvicorn.access": {"level": "INFO", "handlers": ["console"], "propagate": False},
            "sqlalchemy.engine": {"level": "WARNING", "handlers": ["console"], "propagate": False},
        },
    }

    logging.config.dictConfig(logging_config)
    logging.getLogger(__name__).info(
        f"Logging initialized. Level: {logging.getLevelName(log_level)}, Env: {settings.ENVIRONMENT}"
    )
