from sqlalchemy import Column, Integer, Float, Date, DateTime, ForeignKey, String, Boolean, Text
from sqlalchemy.sql import func
from app.core.database import Base

class Sales(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)

    # Invoice details
    invoice_number = Column(String, unique=True, nullable=False)
    buyer_name = Column(String, nullable=False)
    buyer_address = Column(String, nullable=True)
    destination = Column(String, nullable=True)

    # Excise
    excise_permit_number = Column(String, nullable=True)
    excise_permit_date = Column(Date, nullable=True)
    transport_pass_number = Column(String, nullable=True)

    # Packaged bottles
    qty_p1 = Column(Float, default=0)
    qty_p2 = Column(Float, default=0)
    qty_p3 = Column(Float, default=0)
    rate_p1 = Column(Float, default=0)
    rate_p2 = Column(Float, default=0)
    rate_p3 = Column(Float, default=0)
    label_p1 = Column(String, default="Slab A")
    label_p2 = Column(String, default="Slab B")
    label_p3 = Column(String, default="Slab C")

    # Open liquor
    qty_o1 = Column(Float, default=0)
    qty_o2 = Column(Float, default=0)
    qty_o3 = Column(Float, default=0)
    rate_o1 = Column(Float, default=0)
    rate_o2 = Column(Float, default=0)
    rate_o3 = Column(Float, default=0)
    label_o1 = Column(String, default="Tier 1")
    label_o2 = Column(String, default="Tier 2")
    label_o3 = Column(String, default="Tier 3")

    # Totals
    subtotal = Column(Float, default=0)
    excise_duty = Column(Float, default=0)
    total_sales = Column(Float, default=0)

    # Payment
    payment_status = Column(String, default="outstanding")  # paid, outstanding, partial
    payment_mode = Column(String, nullable=True)  # cash, bank, upi
    payment_date = Column(Date, nullable=True)
    amount_paid = Column(Float, default=0)
    amount_due = Column(Float, default=0)

    notes = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())