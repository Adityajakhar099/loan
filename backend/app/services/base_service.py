from typing import Generic, TypeVar, Optional, List, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

ModelType = TypeVar("ModelType")


class BaseService(Generic[ModelType]):
    """
    Abstract Base Service implementing common database CRUD operations.
    Follows Clean Architecture & SOLID principles.
    """

    def __init__(self, model: type[ModelType]):
        self.model = model

    async def get_by_id(self, db: AsyncSession, id: Any) -> Optional[ModelType]:
        """Fetch single record by ID."""
        result = await db.execute(select(self.model).where(self.model.id == id))
        return result.scalars().first()

    async def get_multi(
        self, db: AsyncSession, *, skip: int = 0, limit: int = 100
    ) -> List[ModelType]:
        """Fetch paginated list of records."""
        result = await db.execute(select(self.model).offset(skip).limit(limit))
        return list(result.scalars().all())

    async def count(self, db: AsyncSession) -> int:
        """Get total count of records in table."""
        result = await db.execute(select(func.count()).select_from(self.model))
        return result.scalar() or 0
