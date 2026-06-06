from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import Client
from app.schemas.schemas import ClientCreate


async def create_client(db: AsyncSession, data: ClientCreate) -> Client:
    existing = await db.execute(select(Client).where(Client.email == data.email))
    if existing.scalar_one_or_none():
        raise ValueError(f"Client with email '{data.email}' already exists")

    client = Client(**data.model_dump())
    db.add(client)
    await db.commit()
    await db.refresh(client)
    return client


async def get_client(db: AsyncSession, client_id: str) -> Client | None:
    result = await db.execute(select(Client).where(Client.id == client_id))
    return result.scalar_one_or_none()


async def get_clients(db: AsyncSession) -> list[Client]:
    result = await db.execute(select(Client).order_by(Client.created_at.desc()))
    return list(result.scalars().all())
