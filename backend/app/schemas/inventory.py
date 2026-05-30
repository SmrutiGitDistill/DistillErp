from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List

# Raw Material Master
class RawMaterialCreate(BaseModel):
    name: str
    unit: str = "kg"
    reorder_level: float = 0
    current_stock: float = 0

class RawMaterialOut(BaseModel):
    id: int
    name: str
    unit: str
    reorder_level: float
    current_stock: float
    is_active: bool
    is_low: bool = False

    class Config:
        from_attributes = True

# Raw Material Transaction
class RawMaterialTxCreate(BaseModel):
    material_id: int
    date: date
    transaction_type: str
    quantity: float
    vendor: Optional[str] = None
    batch_id: Optional[int] = None
    notes: Optional[str] = None

class RawMaterialTxOut(BaseModel):
    id: int
    material_id: int
    date: date
    transaction_type: str
    quantity: float
    vendor: Optional[str]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# SKU Master
class SKUCreate(BaseModel):
    brand_name: str
    sku_code: str
    bottle_size_ml: int
    bottles_per_case: int = 12
    rate_per_bottle: float = 0
    rate_per_case: float = 0
    current_stock_bottles: float = 0
    reorder_level: int = 0

class SKUOut(BaseModel):
    id: int
    brand_name: str
    sku_code: str
    bottle_size_ml: int
    bottles_per_case: int
    rate_per_bottle: float
    rate_per_case: float
    current_stock_bottles: float
    reorder_level: int
    is_active: bool
    is_low: bool = False

    class Config:
        from_attributes = True

# Packaging Material
class PackagingCreate(BaseModel):
    name: str
    unit: str = "pcs"
    current_stock: float = 0
    reorder_level: float = 0

class PackagingOut(BaseModel):
    id: int
    name: str
    unit: str
    current_stock: float
    reorder_level: float
    is_active: bool
    is_low: bool = False

    class Config:
        from_attributes = True

# In Process Stock
class InProcessCreate(BaseModel):
    date: date
    wash_volume: float = 0
    low_wine_volume: float = 0
    spirit_volume: float = 0
    abv: float = 0
    batch_id: Optional[int] = None
    notes: Optional[str] = None

class InProcessOut(BaseModel):
    id: int
    date: date
    wash_volume: float
    low_wine_volume: float
    spirit_volume: float
    abv: float
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True