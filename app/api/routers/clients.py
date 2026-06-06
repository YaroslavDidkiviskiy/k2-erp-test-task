from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.schemas.schemas import ClientCreate, ClientResponse
from app.services import client_service

router = APIRouter(prefix="/clients", tags=["Clients"])


@router.post("/", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
async def create_client(data: ClientCreate, db: AsyncSession = Depends(get_db)):
    try:
        return await client_service.create_client(db, data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/", response_model=list[ClientResponse])
async def get_clients(db: AsyncSession = Depends(get_db)):
    return await client_service.get_clients(db)


@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(client_id: str, db: AsyncSession = Depends(get_db)):
    client = await client_service.get_client(db, client_id)
    if not client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
    return client

@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(client_id: str, db: AsyncSession = Depends(get_db)):
    client = await client_service.get_client(db, client_id)
    if not client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
    await db.delete(client)
    await db.commit()
