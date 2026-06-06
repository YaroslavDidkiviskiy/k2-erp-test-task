from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.models import Order, OrderItem
from app.schemas.schemas import OrderCreate
from app.services.client_service import get_client
from app.services.product_service import get_product


async def create_order(db: AsyncSession, data: OrderCreate) -> Order:
    client = await get_client(db, data.client_id)
    if not client:
        raise ValueError(f"Client '{data.client_id}' not found")

    order = Order(client_id=data.client_id, comment=data.comment)
    db.add(order)
    await db.flush()

    total = Decimal("0.00")

    for item_data in data.items:
        product = await get_product(db, item_data.product_id)
        if not product:
            raise ValueError(f"Product '{item_data.product_id}' not found")

        unit_price = product.price
        total += unit_price * item_data.quantity

        order_item = OrderItem(
            order_id=order.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity,
            unit_price=unit_price,
        )
        db.add(order_item)

    order.total_amount = total
    await db.commit()
    await db.refresh(order)

    result = await db.execute(
        select(Order)
        .where(Order.id == order.id)
        .options(selectinload(Order.client), selectinload(Order.items))
    )
    return result.scalar_one()


async def get_orders_by_client(db: AsyncSession, client_id: str) -> list[Order]:
    client = await get_client(db, client_id)
    if not client:
        raise ValueError(f"Client '{client_id}' not found")

    result = await db.execute(
        select(Order)
        .where(Order.client_id == client_id)
        .options(selectinload(Order.client), selectinload(Order.items))
        .order_by(Order.created_at.desc())
    )
    return list(result.scalars().all())


async def get_order(db: AsyncSession, order_id: str) -> Order | None:
    result = await db.execute(
        select(Order)
        .where(Order.id == order_id)
        .options(selectinload(Order.client), selectinload(Order.items))
    )
    return result.scalar_one_or_none()
