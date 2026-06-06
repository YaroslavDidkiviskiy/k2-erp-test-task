import pytest
from httpx import AsyncClient


async def create_client(client: AsyncClient, email: str = "client@example.com"):
    res = await client.post("/api/clients/", json={"name": "Клієнт", "email": email})
    return res.json()["id"]


async def create_product(client: AsyncClient, price: float = 100.0):
    res = await client.post("/api/products/", json={"name": "Товар", "price": price})
    return res.json()["id"]


@pytest.mark.asyncio
async def test_create_order(client: AsyncClient):
    client_id = await create_client(client)
    product_id = await create_product(client, price=500.0)

    res = await client.post("/api/orders/", json={
        "client_id": client_id,
        "items": [{"product_id": product_id, "quantity": 2}],
    })
    assert res.status_code == 201
    data = res.json()
    assert float(data["total_amount"]) == 1000.0
    assert len(data["items"]) == 1


@pytest.mark.asyncio
async def test_order_total_calculated_correctly(client: AsyncClient):
    client_id = await create_client(client)
    p1 = await create_product(client, price=100.0)
    p2 = await create_product(client, price=250.0)

    res = await client.post("/api/orders/", json={
        "client_id": client_id,
        "items": [
            {"product_id": p1, "quantity": 3},
            {"product_id": p2, "quantity": 1},
        ],
    })
    assert res.status_code == 201
    assert float(res.json()["total_amount"]) == 550.0


@pytest.mark.asyncio
async def test_create_order_without_client(client: AsyncClient):
    product_id = await create_product(client)
    res = await client.post("/api/orders/", json={
        "client_id": "non-existent-id",
        "items": [{"product_id": product_id, "quantity": 1}],
    })
    assert res.status_code == 400


@pytest.mark.asyncio
async def test_create_order_empty_items(client: AsyncClient):
    client_id = await create_client(client)
    res = await client.post("/api/orders/", json={
        "client_id": client_id,
        "items": [],
    })
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_get_orders_by_client(client: AsyncClient):
    client_id = await create_client(client)
    product_id = await create_product(client)

    await client.post("/api/orders/", json={
        "client_id": client_id,
        "items": [{"product_id": product_id, "quantity": 1}],
    })
    await client.post("/api/orders/", json={
        "client_id": client_id,
        "items": [{"product_id": product_id, "quantity": 2}],
    })

    res = await client.get(f"/api/orders/client/{client_id}")
    assert res.status_code == 200
    assert len(res.json()) == 2


@pytest.mark.asyncio
async def test_get_orders_invalid_client(client: AsyncClient):
    res = await client.get("/api/orders/client/non-existent-id")
    assert res.status_code == 404
