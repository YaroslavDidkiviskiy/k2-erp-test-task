# ERP Orders

Модуль обліку замовлень для бізнес-системи. FastAPI + SQLAlchemy + SQLite + Docker.

## Стек

- **Python 3.12** / **FastAPI** — асинхронний веб-фреймворк
- **SQLAlchemy 2.0** (async) — ORM з підтримкою `asyncio`
- **SQLite + aiosqlite** — база даних (легко замінити на PostgreSQL через `DATABASE_URL`)
- **Pydantic v2** — валідація даних
- **pytest + pytest-asyncio + httpx** — тести
- **Vite + TypeScript** — фронтенд
- **nginx** — сервить фронтенд і проксіює запити до API
- **Docker + Docker Compose** — контейнеризація

## Структура проєкту
erp-orders/
├── app/
│   ├── api/
│   │   ├── deps.py              # залежності (get_db)
│   │   └── routers/
│   │       ├── clients.py       # ендпоінти клієнтів
│   │       ├── products.py      # ендпоінти товарів
│   │       └── orders.py        # ендпоінти замовлень
│   ├── core/
│   │   ├── config.py            # налаштування (pydantic-settings)
│   │   └── database.py          # engine, session, Base
│   ├── models/
│   │   └── models.py            # SQLAlchemy моделі
│   ├── schemas/
│   │   └── schemas.py           # Pydantic схеми
│   ├── services/
│   │   ├── client_service.py    # бізнес-логіка клієнтів
│   │   ├── product_service.py   # бізнес-логіка товарів
│   │   └── order_service.py     # бізнес-логіка замовлень
│   └── main.py                  # FastAPI app, lifespan, middleware
├── frontend/
│   ├── src/
│   │   ├── types.ts             # TypeScript інтерфейси
│   │   ├── api.ts               # HTTP клієнт
│   │   ├── app.ts               # UI логіка
│   │   └── main.ts              # точка входу
│   ├── index.html
│   ├── nginx.conf
│   ├── Dockerfile
│   └── vite.config.ts
├── tests/
│   ├── conftest.py              # fixtures, test DB setup
│   ├── test_clients.py
│   ├── test_products.py
│   └── test_orders.py
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── .env.example

## Запуск через Docker

```bash
docker compose up --build
```

- Фронтенд: http://localhost
- API docs (Swagger): http://localhost:8000/docs
- Health check: http://localhost:8000/health

## Запуск локально

```bash
# Python 3.12
python -m venv venv
source venv/Scripts/activate  # Windows
# source venv/bin/activate    # Linux/Mac

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Фронтенд окремо:
```bash
cd frontend
npm install
npm run dev
```

## Змінні середовища

Створи `.env` файл (або використай `.env.example`):

```env
DATABASE_URL=sqlite+aiosqlite:////data/erp_orders.db
```

Для PostgreSQL:
```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/erp_orders
```

## Тести

```bash
pytest -v
```

## API

| Метод | Ендпоінт | Опис |
|-------|----------|------|
| POST | `/api/clients/` | Створити клієнта |
| GET | `/api/clients/` | Список клієнтів |
| GET | `/api/clients/{id}` | Клієнт по ID |
| DELETE | `/api/clients/{id}` | Видалити клієнта |
| POST | `/api/products/` | Створити товар |
| GET | `/api/products/` | Список товарів |
| GET | `/api/products/{id}` | Товар по ID |
| DELETE | `/api/products/{id}` | Видалити товар |
| POST | `/api/orders/` | Створити замовлення |
| GET | `/api/orders/{id}` | Замовлення по ID |
| GET | `/api/orders/client/{client_id}` | Замовлення клієнта |

## Бізнес-правила

- Замовлення без клієнта — `400 Bad Request`
- Замовлення без товарів — `422 Unprocessable Entity`
- Сума замовлення розраховується автоматично на основі `unit_price × quantity`
- `unit_price` фіксується в момент створення замовлення — зміна ціни товару не впливає на існуючі замовлення
- Email клієнта унікальний
- Телефон валідується за форматом E.164 (`+380991234567`)

## Чому такий підхід

**FastAPI** — async з коробки, автоматична документація через Swagger, нативна інтеграція з Pydantic.

**SQLAlchemy 2.0 async** — повноцінний ORM з типізованими моделями (`Mapped[]`), підтримка async сесій, легкий свап БД через `DATABASE_URL`.

**SQLite** — нульова інфраструктура для тестового завдання, але архітектура готова до PostgreSQL без змін в коді.

**Розділення на шари** (router → service → model) — роутери тонкі, вся бізнес-логіка в сервісах, легко тестувати і розширювати.

**UUID як PK** — стандарт для ERP систем, уникає конфліктів при міграції даних між середовищами.