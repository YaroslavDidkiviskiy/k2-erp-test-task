import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_client(client: AsyncClient):
    res = await client.post("/api/clients/", json={
        "name": "Тест Юзер",
        "email": "test@example.com",
        "phone": "+380991234567",
    })
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == "test@example.com"
    assert data["phone"] == "+380991234567"


@pytest.mark.asyncio
async def test_create_client_duplicate_email(client: AsyncClient):
    payload = {"name": "Юзер", "email": "dup@example.com"}
    await client.post("/api/clients/", json=payload)
    res = await client.post("/api/clients/", json=payload)
    assert res.status_code == 400


@pytest.mark.asyncio
async def test_create_client_invalid_phone(client: AsyncClient):
    res = await client.post("/api/clients/", json={
        "name": "Юзер",
        "email": "phone@example.com",
        "phone": "abc123",
    })
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_get_clients(client: AsyncClient):
    await client.post("/api/clients/", json={"name": "Андрій", "email": "a@example.com"})
    await client.post("/api/clients/", json={"name": "Богдан", "email": "b@example.com"})
    res = await client.get("/api/clients/")
    assert res.status_code == 200
    assert len(res.json()) == 2


@pytest.mark.asyncio
async def test_delete_client(client: AsyncClient):
    res = await client.post("/api/clients/", json={"name": "Андрій", "email": "a@example.com"})
    assert res.status_code == 201
    client_id = res.json()["id"]
    del_res = await client.delete(f"/api/clients/{client_id}")
    assert del_res.status_code == 204
    get_res = await client.get(f"/api/clients/{client_id}")
    assert get_res.status_code == 404