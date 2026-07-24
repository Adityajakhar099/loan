from datetime import datetime, timezone
import uuid


def generate_uuid() -> str:
    """Generates a string representation of a random UUID v4."""
    return str(uuid.uuid4())


def get_utc_now() -> datetime:
    """Returns the current timezone-aware UTC datetime."""
    return datetime.now(timezone.utc)
