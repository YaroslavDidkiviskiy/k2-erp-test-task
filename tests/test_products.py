import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_product(client: AsyncClient):
    res = await client.post("/api/products/", json={
        "name": "Ноутбук",
        "price": 25000.00,
    })
    assert res.status_code == 201
    assert res.json()["name"] == "Ноутбук"


@pytest.mark.asyncio
async def test_create_product_invalid_price(client: AsyncClient):
    res = await client.post("/api/products/", json={
        "name": "Товар",
        "price": -100,
    })
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_get_products(client: AsyncClient):
    await client.post("/api/products/", json={"name": "Ноутбук", "price": 100})
    await client.post("/api/products/", json={"name": "Монітор", "price": 200})
    res = await client.get("/api/products/")
    assert res.status_code == 200
    assert len(res.json()) == 2
