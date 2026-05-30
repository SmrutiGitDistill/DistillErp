from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List

class ExpenseCreate(BaseModel):
    date: date
    category: str
    sub_category: Optional[str] = None
    description: str
    vendor_name: Optional[str] = None
    vendor_contact: Optional[str] = None
    amount: float
    payment_mode: str = "cash"
    payment_status: str = "paid"
    payment_reference: Optional[str] = None
    batch_id: Optional[int] = None
    batch_number: Optional[str] = None
    notes: Optional[str] = None

class ExpenseUpdate(BaseModel):
    date: Optional[date] = None
    category: Optional[str] = None
    sub_category: Optional[str] = None
    description: Optional[str] = None
    vendor_name: Optional[str] = None
    vendor_contact: Optional[str] = None
    amount: Optional[float] = None
    payment_mode: Optional[str] = None
    payment_status: Optional[str] = None
    payment_reference: Optional[str] = None
    batch_id: Optional[int] = None
    batch_number: Optional[str] = None
    notes: Optional[str] = None

class ExpenseOut(BaseModel):
    id: int
    date: date
    category: str
    sub_category: Optional[str]
    description: str
    vendor_name: Optional[str]
    vendor_contact: Optional[str]
    amount: float
    payment_mode: str
    payment_status: str
    payment_reference: Optional[str]
    batch_id: Optional[int]
    batch_number: Optional[str]
    notes: Optional[str]
    created_by: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True

class ExpenseSummary(BaseModel):
    total: float
    by_category: dict
    by_payment_mode: dict
    pending_count: int
    pending_amount: float