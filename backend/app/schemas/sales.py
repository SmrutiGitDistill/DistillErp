from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class SalesCreate(BaseModel):
    date: date

    # Invoice
    invoice_number: str
    buyer_name: str
    buyer_address: Optional[str] = None
    destination: Optional[str] = None

    # Excise
    excise_permit_number: Optional[str] = None
    excise_permit_date: Optional[date] = None
    transport_pass_number: Optional[str] = None

    # Packaged
    qty_p1: float = 0
    qty_p2: float = 0
    qty_p3: float = 0
    rate_p1: float = 0
    rate_p2: float = 0
    rate_p3: float = 0
    label_p1: str = "Slab A"
    label_p2: str = "Slab B"
    label_p3: str = "Slab C"

    # Open
    qty_o1: float = 0
    qty_o2: float = 0
    qty_o3: float = 0
    rate_o1: float = 0
    rate_o2: float = 0
    rate_o3: float = 0
    label_o1: str = "Tier 1"
    label_o2: str = "Tier 2"
    label_o3: str = "Tier 3"

    # Extra
    excise_duty: float = 0
    payment_status: str = "outstanding"
    payment_mode: Optional[str] = None
    payment_date: Optional[date] = None
    amount_paid: float = 0
    notes: Optional[str] = None

class SalesUpdate(BaseModel):
    buyer_name: Optional[str] = None
    buyer_address: Optional[str] = None
    destination: Optional[str] = None
    excise_permit_number: Optional[str] = None
    excise_permit_date: Optional[date] = None
    transport_pass_number: Optional[str] = None
    qty_p1: Optional[float] = None
    qty_p2: Optional[float] = None
    qty_p3: Optional[float] = None
    rate_p1: Optional[float] = None
    rate_p2: Optional[float] = None
    rate_p3: Optional[float] = None
    qty_o1: Optional[float] = None
    qty_o2: Optional[float] = None
    qty_o3: Optional[float] = None
    rate_o1: Optional[float] = None
    rate_o2: Optional[float] = None
    rate_o3: Optional[float] = None
    excise_duty: Optional[float] = None
    payment_status: Optional[str] = None
    payment_mode: Optional[str] = None
    payment_date: Optional[date] = None
    amount_paid: Optional[float] = None
    notes: Optional[str] = None

class SalesOut(BaseModel):
    id: int
    date: date
    invoice_number: str
    buyer_name: str
    buyer_address: Optional[str]
    destination: Optional[str]
    excise_permit_number: Optional[str]
    excise_permit_date: Optional[date]
    transport_pass_number: Optional[str]
    qty_p1: float
    qty_p2: float
    qty_p3: float
    rate_p1: float
    rate_p2: float
    rate_p3: float
    label_p1: str
    label_p2: str
    label_p3: str
    qty_o1: float
    qty_o2: float
    qty_o3: float
    rate_o1: float
    rate_o2: float
    rate_o3: float
    label_o1: str
    label_o2: str
    label_o3: str
    subtotal: float
    excise_duty: float
    total_sales: float
    payment_status: str
    payment_mode: Optional[str]
    payment_date: Optional[date]
    amount_paid: float
    amount_due: float
    notes: Optional[str]
    created_by: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True