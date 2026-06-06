from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import Product
from app.schemas.schemas import ProductCreate


async def create_product(db: AsyncSession, data: ProductCreate) -> Product:
    product = Product(**data.model_dump())
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product


async def get_product(db: AsyncSession, product_id: str) -> Product | None:
    result = await db.execute(select(Product).where(Product.id == product_id))
    return result.scalar_one_or_none()


async def get_products(db: AsyncSession) -> list[Product]:
    result = await db.execute(select(Product).order_by(Product.created_at.desc()))
    return list(result.scalars().all())
