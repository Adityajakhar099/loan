"""
Request Logging Middleware.

Intercepts every HTTP request to record HTTP method, path, client host,
response status code, and execution latency in milliseconds.
"""
import time

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response

from app.core.logging import logger


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware that logs every incoming HTTP request and records execution duration.
    Also adds an `X-Process-Time-Ms` header to response.
    """

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        start_time = time.time()
        client_host = request.client.host if request.client else "unknown"

        try:
            response = await call_next(request)
            process_time_ms = (time.time() - start_time) * 1000

            logger.info(
                "HTTP {} {} | status={} | client={} | time={:.2f}ms",
                request.method,
                request.url.path,
                response.status_code,
                client_host,
                process_time_ms,
            )
            response.headers["X-Process-Time-Ms"] = f"{process_time_ms:.2f}"
            return response
        except Exception as exc:
            process_time_ms = (time.time() - start_time) * 1000
            logger.error(
                "HTTP {} {} FAILED | client={} | time={:.2f}ms | error={}",
                request.method,
                request.url.path,
                client_host,
                process_time_ms,
                exc,
            )
            raise
