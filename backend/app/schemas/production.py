from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class ProductionCreate(BaseModel):
    date: date
    shift: str
    operator: str

    # Raw materials
    mahua: float = 0
    sugar: float = 0
    molasses: float = 0
    grains: float = 0
    yeast: float = 0
    water: float = 0

    # Fermentation
    wash_volume: float = 0
    fermentation_hours: float = 0
    wash_abv: float = 0

    # Output
    open_produced: float = 0
    pkg_produced: float = 0
    opening_stock: float = 0

    # Quality
    spirit_abv: float = 0
    low_wine_volume: float = 0

    # Wastage
    wastage_litres: float = 0
    wastage_reason: Optional[str] = None

    notes: Optional[str] = None

class ProductionUpdate(BaseModel):
    shift: Optional[str] = None
    operator: Optional[str] = None
    mahua: Optional[float] = None
    sugar: Optional[float] = None
    molasses: Optional[float] = None
    grains: Optional[float] = None
    yeast: Optional[float] = None
    water: Optional[float] = None
    wash_volume: Optional[float] = None
    fermentation_hours: Optional[float] = None
    wash_abv: Optional[float] = None
    open_produced: Optional[float] = None
    pkg_produced: Optional[float] = None
    opening_stock: Optional[float] = None
    spirit_abv: Optional[float] = None
    low_wine_volume: Optional[float] = None
    wastage_litres: Optional[float] = None
    wastage_reason: Optional[str] = None
    notes: Optional[str] = None

class ProductionOut(BaseModel):
    id: int
    date: date
    batch_number: str
    shift: str
    operator: str
    mahua: float
    sugar: float
    molasses: float
    grains: float
    yeast: float
    water: float
    wash_volume: float
    fermentation_hours: float
    wash_abv: float
    open_produced: float
    pkg_produced: float
    opening_stock: float
    spirit_abv: float
    low_wine_volume: float
    wastage_litres: float
    wastage_reason: Optional[str]
    yield_percentage: float
    notes: Optional[str]
    created_by: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True