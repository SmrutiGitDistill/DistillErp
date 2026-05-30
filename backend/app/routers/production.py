from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.production import ProductionCreate, ProductionUpdate, ProductionOut
from app.services import production as production_service
from app.services.audit import log_action

router = APIRouter(prefix="/production", tags=["Production"])

@router.post("/", response_model=ProductionOut)
def create(
    data: ProductionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = production_service.get_production_by_date(db, data.date)
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Production entry already exists for {data.date}. Use PUT to update."
        )
    result = production_service.create_production(db, data, current_user.id)
    log_action(db, current_user, "CREATE", "production", result.id, f"Batch {result.batch_number}")
    return result

@router.get("/", response_model=List[ProductionOut])
def get_all(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return production_service.get_all_productions(db, skip, limit)

@router.get("/{entry_date}", response_model=ProductionOut)
def get_by_date(
    entry_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    production = production_service.get_production_by_date(db, entry_date)
    if not production:
        raise HTTPException(
            status_code=404,
            detail=f"No production entry found for {entry_date}"
        )
    return production

@router.put("/{entry_date}", response_model=ProductionOut)
def update(
    entry_date: date,
    data: ProductionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    production = production_service.update_production(db, entry_date, data)
    if not production:
        raise HTTPException(
            status_code=404,
            detail=f"No production entry found for {entry_date}"
        )
    log_action(db, current_user, "UPDATE", "production", production.id, f"Batch {production.batch_number}")
    return production

@router.delete("/{entry_date}")
def delete(
    entry_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = production_service.delete_production(db, entry_date)
    if not success:
        raise HTTPException(status_code=404, detail="Entry not found")
    log_action(db, current_user, "DELETE", "production", str(entry_date), f"Date {entry_date}")
    return {"message": "Production entry deleted successfully"}
