from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.sales import Sales
from app.schemas.sales import SalesCreate, SalesUpdate
from datetime import date

def generate_invoice_number(db: Session, entry_date: date) -> str:
    date_str = entry_date.strftime("%y%m%d")
    count = db.query(Sales).filter(
        func.date(Sales.date) == entry_date
    ).count()
    seq = str(count + 1).zfill(3)
    return f"INV-{date_str}-{seq}"

def calculate_totals(data: dict) -> dict:
    pkg = (
        data.get("qty_p1", 0) * data.get("rate_p1", 0) +
        data.get("qty_p2", 0) * data.get("rate_p2", 0) +
        data.get("qty_p3", 0) * data.get("rate_p3", 0)
    )
    open_liq = (
        data.get("qty_o1", 0) * data.get("rate_o1", 0) +
        data.get("qty_o2", 0) * data.get("rate_o2", 0) +
        data.get("qty_o3", 0) * data.get("rate_o3", 0)
    )
    subtotal = pkg + open_liq
    excise_duty = data.get("excise_duty", 0)
    total = subtotal + excise_duty
    amount_paid = data.get("amount_paid", 0)
    amount_due = total - amount_paid

    # Auto set payment status
    if amount_paid >= total:
        payment_status = "paid"
    elif amount_paid > 0:
        payment_status = "partial"
    else:
        payment_status = data.get("payment_status", "outstanding")

    return {
        "subtotal": subtotal,
        "total_sales": total,
        "amount_due": amount_due,
        "payment_status": payment_status
    }

def create_sales(db: Session, data: SalesCreate, user_id: int) -> Sales:
    data_dict = data.model_dump()

    # Auto generate invoice if not provided
    if not data_dict.get("invoice_number"):
        data_dict["invoice_number"] = generate_invoice_number(db, data.date)

    totals = calculate_totals(data_dict)
    data_dict.update(totals)

    sales = Sales(**data_dict, created_by=user_id)
    db.add(sales)
    db.commit()
    db.refresh(sales)
    return sales

def get_sales_by_date(db: Session, entry_date: date):
    return db.query(Sales).filter(
        func.date(Sales.date) == entry_date
    ).all()

def get_sales_by_id(db: Session, sale_id: int):
    return db.query(Sales).filter(Sales.id == sale_id).first()

def get_all_sales(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Sales).order_by(
        Sales.date.desc()
    ).offset(skip).limit(limit).all()

def get_outstanding_sales(db: Session):
    return db.query(Sales).filter(
        Sales.payment_status.in_(["outstanding", "partial"])
    ).order_by(Sales.date.desc()).all()

def update_sales(db: Session, sale_id: int, data: SalesUpdate) -> Sales:
    sales = get_sales_by_id(db, sale_id)
    if not sales:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(sales, field, value)

    totals = calculate_totals({
        "qty_p1": sales.qty_p1, "rate_p1": sales.rate_p1,
        "qty_p2": sales.qty_p2, "rate_p2": sales.rate_p2,
        "qty_p3": sales.qty_p3, "rate_p3": sales.rate_p3,
        "qty_o1": sales.qty_o1, "rate_o1": sales.rate_o1,
        "qty_o2": sales.qty_o2, "rate_o2": sales.rate_o2,
        "qty_o3": sales.qty_o3, "rate_o3": sales.rate_o3,
        "excise_duty": sales.excise_duty,
        "amount_paid": sales.amount_paid,
        "payment_status": sales.payment_status
    })
    for k, v in totals.items():
        setattr(sales, k, v)

    db.commit()
    db.refresh(sales)
    return sales

def delete_sales(db: Session, sale_id: int) -> bool:
    sales = get_sales_by_id(db, sale_id)
    if not sales:
        return False
    db.delete(sales)
    db.commit()
    return True