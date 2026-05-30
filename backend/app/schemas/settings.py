from pydantic import BaseModel
from typing import Optional

class SettingsUpdate(BaseModel):
    company_name: Optional[str] = None
    location: Optional[str] = None
    excise_licence: Optional[str] = None
    gst_number: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    default_shift: Optional[str] = None
    rate_p1: Optional[float] = None
    label_p1: Optional[str] = None
    rate_p2: Optional[float] = None
    label_p2: Optional[str] = None
    rate_p3: Optional[float] = None
    label_p3: Optional[str] = None
    rate_o1: Optional[float] = None
    label_o1: Optional[str] = None
    rate_o2: Optional[float] = None
    label_o2: Optional[str] = None
    rate_o3: Optional[float] = None
    label_o3: Optional[str] = None

class SettingsOut(BaseModel):
    id: int
    company_name: str
    location: Optional[str]
    excise_licence: Optional[str]
    gst_number: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    default_shift: str
    rate_p1: float
    label_p1: str
    rate_p2: float
    label_p2: str
    rate_p3: float
    label_p3: str
    rate_o1: float
    label_o1: str
    rate_o2: float
    label_o2: str
    rate_o3: float
    label_o3: str

    class Config:
        from_attributes = True
