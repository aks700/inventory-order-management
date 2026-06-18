# Inventory & Order Management System

A full-stack application for managing products, customers, orders, and inventory tracking.

## Architecture

- **Backend**: Python FastAPI with SQLAlchemy ORM
- **Frontend**: React with Vite, Axios, and React Router
- **Database**: PostgreSQL
- **Containerization**: Docker & Docker Compose

## Project Structure

```
├── backend/          # FastAPI backend API
├── frontend/         # React frontend application
├── docker-compose.yml
└── README.md
```

## Features

- Product management with unique SKU enforcement
- Customer management with unique email enforcement
- Order creation with automatic inventory validation and stock reduction
- Responsive UI for managing all entities
- Dockerized deployment

## Quick Start

### Prerequisites
- Docker & Docker Compose installed

### Run with Docker Compose
```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Environment Variables

See `.env.example` for required environment variables.

## Business Rules

1. Product SKUs must be unique
2. Customer emails must be unique
3. Orders cannot be placed if product stock is insufficient
4. Stock is automatically reduced when an order is placed

## Status

- [x] Backend API (FastAPI)
- [x] Frontend (React)
- [x] PostgreSQL Database
- [x] Docker & Docker Compose
- [x] Business Rules Implementation
