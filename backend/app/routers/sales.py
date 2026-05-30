from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.sales import SalesCreate, SalesUpdate, SalesOut
from app.services import sales as sales_service
from app.services.audit import log_action

router = APIRouter(prefix="/sales", tags=["Sales"])

@router.post("/", response_model=SalesOut)
def create(
    data: SalesCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = sales_service.create_sales(db, data, current_user.id)
    log_action(db, current_user, "CREATE", "sales", result.id, f"Invoice {result.invoice_number}")
    return result

@router.get("/", response_model=List[SalesOut])
def get_all(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return sales_service.get_all_sales(db, skip, limit)

@router.get("/outstanding", response_model=List[SalesOut])
def get_outstanding(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return sales_service.get_outstanding_sales(db)

@router.get("/date/{entry_date}", response_model=List[SalesOut])
def get_by_date(
    entry_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return sales_service.get_sales_by_date(db, entry_date)

@router.get("/{sale_id}", response_model=SalesOut)
def get_by_id(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sale = sales_service.get_sales_by_id(db, sale_id)
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale

@router.put("/{sale_id}", response_model=SalesOut)
def update(
    sale_id: int,
    data: SalesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sale = sales_service.update_sales(db, sale_id, data)
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    log_action(db, current_user, "UPDATE", "sales", sale.id, f"Invoice {sale.invoice_number}")
    return sale

@router.delete("/{sale_id}")
def delete(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = sales_service.delete_sales(db, sale_id)
    if not success:
        raise HTTPException(status_code=404, detail="Sale not found")
    log_action(db, current_user, "DELETE", "sales", sale_id, f"Sale #{sale_id}")
    return {"message": "Sale deleted successfully"}
