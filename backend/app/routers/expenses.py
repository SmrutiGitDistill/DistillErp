from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.expenses import ExpenseCreate, ExpenseUpdate, ExpenseOut
from app.services import expenses as expense_service
from app.services.audit import log_action

router = APIRouter(prefix="/expenses", tags=["Expenses"])

CATEGORIES = [
    "salary", "diesel", "petrol", "meals",
    "raw_material", "maintenance", "excise_duty",
    "transport", "misc"
]

@router.get("/categories")
def get_categories():
    return {"categories": CATEGORIES}

@router.post("/", response_model=ExpenseOut)
def create(
    data: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = expense_service.create_expense(db, data, current_user.id)
    log_action(db, current_user, "CREATE", "expense", result.id, f"{result.category} - ₹{result.amount}")
    return result

@router.get("/", response_model=List[ExpenseOut])
def get_all(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = Query(None),
    payment_status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return expense_service.get_all_expenses(db, skip, limit, category, payment_status)

@router.get("/summary")
def get_summary(
    from_date: date = Query(...),
    to_date: date = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return expense_service.get_summary(db, from_date, to_date)

@router.get("/date/{entry_date}", response_model=List[ExpenseOut])
def get_by_date(
    entry_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return expense_service.get_expenses_by_date(db, entry_date)

@router.get("/batch/{batch_id}", response_model=List[ExpenseOut])
def get_by_batch(
    batch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return expense_service.get_expenses_by_batch(db, batch_id)

@router.get("/{expense_id}", response_model=ExpenseOut)
def get_by_id(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = expense_service.get_expense_by_id(db, expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense

@router.put("/{expense_id}", response_model=ExpenseOut)
def update(
    expense_id: int,
    data: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = expense_service.update_expense(db, expense_id, data)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    log_action(db, current_user, "UPDATE", "expense", expense.id, f"{expense.category} - ₹{expense.amount}")
    return expense

@router.delete("/{expense_id}")
def delete(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = expense_service.delete_expense(db, expense_id)
    if not success:
        raise HTTPException(status_code=404, detail="Expense not found")
    log_action(db, current_user, "DELETE", "expense", expense_id, f"Expense #{expense_id}")
    return {"message": "Expense deleted"}
