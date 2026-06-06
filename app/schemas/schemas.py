from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, EmailStr, Field, field_validator


# ── Client ──────────────────────────────────────────────────────────────────

class ClientCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    phone: str | None = Field(None, max_length=50)


class ClientResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Product ──────────────────────────────────────────────────────────────────

class ProductCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    description: str | None = None
    price: Decimal = Field(..., gt=0, decimal_places=2)


class ProductResponse(BaseModel):
    id: str
    name: str
    description: str | None
    price: Decimal
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Order ────────────────────────────────────────────────────────────────────

class OrderItemCreate(BaseModel):
    product_id: str
    quantity: int = Field(..., gt=0)


class OrderCreate(BaseModel):
    client_id: str
    items: list[OrderItemCreate] = Field(..., min_length=1)
    comment: str | None = None

    @field_validator("items")
    @classmethod
    def items_not_empty(cls, v: list) -> list:
        if not v:
            raise ValueError("Order must contain at least one item")
        return v


class OrderItemResponse(BaseModel):
    id: str
    product_id: str
    quantity: int
    unit_price: Decimal

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: str
    client_id: str
    client: ClientResponse
    items: list[OrderItemResponse]
    total_amount: Decimal
    comment: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class OrderListResponse(BaseModel):
    id: str
    client_id: str
    total_amount: Decimal
    comment: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
