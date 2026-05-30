from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.production import Production
from app.schemas.production import ProductionCreate, ProductionUpdate
from datetime import date

def generate_batch_number(db: Session, entry_date: date) -> str:
    date_str = entry_date.strftime("%y%m%d")
    count = db.query(Production).filter(
        func.date(Production.date) == entry_date
    ).count()
    seq = str(count + 1).zfill(3)
    return f"B-{date_str}-{seq}"

def calculate_yield(open_produced: float, molasses: float, mahua: float, grains: float) -> float:
    total_raw = molasses + mahua + grains
    if total_raw == 0:
        return 0
    return round((open_produced / total_raw) * 100, 2)

def create_production(db: Session, data: ProductionCreate, user_id: int) -> Production:
    batch = generate_batch_number(db, data.date)
    data_dict = data.model_dump()
    yield_pct = calculate_yield(
        data.open_produced,
        data.molasses,
        data.mahua,
        data.grains
    )
    production = Production(
        **data_dict,
        batch_number=batch,
        yield_percentage=yield_pct,
        created_by=user_id
    )
    db.add(production)
    db.commit()
    db.refresh(production)
    return production

def get_production_by_date(db: Session, entry_date: date):
    return db.query(Production).filter(
        func.date(Production.date) == entry_date
    ).first()

def get_all_productions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Production).order_by(
        Production.date.desc()
    ).offset(skip).limit(limit).all()

def update_production(db: Session, entry_date: date, data: ProductionUpdate) -> Production:
    production = get_production_by_date(db, entry_date)
    if not production:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(production, field, value)
    production.yield_percentage = calculate_yield(
        production.open_produced,
        production.molasses,
        production.mahua,
        production.grains
    )
    db.commit()
    db.refresh(production)
    return production

def delete_production(db: Session, entry_date: date) -> bool:
    production = get_production_by_date(db, entry_date)
    if not production:
        return False
    db.delete(production)
    db.commit()
    return True