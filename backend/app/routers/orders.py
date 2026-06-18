from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Order, OrderItem, Product, Customer
from app.schemas import OrderCreate, OrderStatusUpdate, OrderResponse

router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.get("/", response_model=List[OrderResponse])
def list_orders(db: Session = Depends(get_db)):
    return db.query(Order).all()


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("/", response_model=OrderResponse, status_code=201)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    # Validate customer exists
    customer = db.query(Customer).filter(Customer.id == order_data.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Validate products and stock availability
    total_amount = 0.0
    order_items = []

    for item in order_data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product with id {item.product_id} not found"
            )
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for product '{product.name}'. "
                       f"Available: {product.stock}, Requested: {item.quantity}"
            )
        order_items.append((product, item.quantity))
        total_amount += product.price * item.quantity

    # Create order
    order = Order(
        customer_id=order_data.customer_id,
        total_amount=total_amount
    )
    db.add(order)
    db.flush()  # Get order ID without committing

    # Create order items and reduce stock
    for product, quantity in order_items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=quantity,
            unit_price=product.price
        )
        db.add(order_item)
        # Reduce stock
        product.stock -= quantity

    db.commit()
    db.refresh(order)
    return order


@router.put("/{order_id}/status", response_model=OrderResponse)
def update_order_status(order_id: int, status_data: OrderStatusUpdate, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = status_data.status
    db.commit()
    db.refresh(order)
    return order
