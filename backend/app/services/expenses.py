from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.expenses import Expense
from app.schemas.expenses import ExpenseCreate, ExpenseUpdate
from datetime import date
from typing import Optional

CATEGORIES = [
    "salary", "diesel", "petrol", "meals",
    "raw_material", "maintenance", "excise_duty",
    "transport", "misc"
]

def create_expense(db: Session, data: ExpenseCreate, user_id: int) -> Expense:
    expense = Expense(**data.model_dump(), created_by=user_id)
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense

def get_expense_by_id(db: Session, expense_id: int):
    return db.query(Expense).filter(Expense.id == expense_id).first()

def get_expenses_by_date(db: Session, entry_date: date):
    return db.query(Expense).filter(
        func.date(Expense.date) == entry_date
    ).all()

def get_all_expenses(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    payment_status: Optional[str] = None
):
    query = db.query(Expense)
    if category:
        query = query.filter(Expense.category == category)
    if payment_status:
        query = query.filter(Expense.payment_status == payment_status)
    return query.order_by(Expense.date.desc()).offset(skip).limit(limit).all()

def get_expenses_by_batch(db: Session, batch_id: int):
    return db.query(Expense).filter(Expense.batch_id == batch_id).all()

def get_summary(db: Session, from_date: date, to_date: date) -> dict:
    expenses = db.query(Expense).filter(
        Expense.date >= from_date,
        Expense.date <= to_date
    ).all()

    total = sum(e.amount for e in expenses)

    by_category = {}
    for e in expenses:
        by_category[e.category] = by_category.get(e.category, 0) + e.amount

    by_payment_mode = {}
    for e in expenses:
        mode = e.payment_mode or "cash"
        by_payment_mode[mode] = by_payment_mode.get(mode, 0) + e.amount

    pending = [e for e in expenses if e.payment_status == "pending"]

    return {
        "total": total,
        "by_category": by_category,
        "by_payment_mode": by_payment_mode,
        "pending_count": len(pending),
        "pending_amount": sum(e.amount for e in pending)
    }

def update_expense(db: Session, expense_id: int, data: ExpenseUpdate) -> Expense:
    expense = get_expense_by_id(db, expense_id)
    if not expense:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(expense, field, value)
    db.commit()
    db.refresh(expense)
    return expense

def delete_expense(db: Session, expense_id: int) -> bool:
    expense = get_expense_by_id(db, expense_id)
    if not expense:
        return False
    db.delete(expense)
    db.commit()
    return True