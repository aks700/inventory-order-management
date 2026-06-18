# Backend - FastAPI

## Tech Stack
- Python 3.11
- FastAPI
- SQLAlchemy (ORM)
- Pydantic (validation)
- PostgreSQL (database)
- Uvicorn (ASGI server)
- Alembic (migrations)

## API Endpoints

### Products
- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Customers
- `GET /api/customers` - List all customers
- `GET /api/customers/{id}` - Get customer by ID
- `POST /api/customers` - Create customer
- `PUT /api/customers/{id}` - Update customer
- `DELETE /api/customers/{id}` - Delete customer

### Orders
- `GET /api/orders` - List all orders
- `GET /api/orders/{id}` - Get order by ID
- `POST /api/orders` - Create order (validates stock, reduces inventory)
- `PUT /api/orders/{id}/status` - Update order status

## Local Development

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string

## Status
- [x] Project setup
- [x] Database models
- [x] CRUD endpoints
- [x] Business rules (stock validation, unique SKU/email)
- [x] Dockerized
