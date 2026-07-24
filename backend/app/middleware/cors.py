from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings


def setup_cors(app: FastAPI) -> None:
    """
    Configures Cross-Origin Resource Sharing (CORS) middleware for the FastAPI application.
    Allows specified frontend domains to access API resources safely.
    """
    origins = settings.ALLOWED_ORIGINS
    if isinstance(origins, str):
        origins = [origins]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
