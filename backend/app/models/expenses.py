from sqlalchemy import Column, Integer, Float, Date, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.sql import func
from app.core.database import Base

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)

    # Category
    category = Column(String, nullable=False)  # salary, diesel, petrol, meals, raw_material, maintenance, excise_duty, transport, misc
    sub_category = Column(String, nullable=True)

    # Details
    description = Column(String, nullable=False)
    vendor_name = Column(String, nullable=True)
    vendor_contact = Column(String, nullable=True)

    # Amount
    amount = Column(Float, nullable=False)

    # Payment
    payment_mode = Column(String, default="cash")  # cash, bank, upi, cheque
    payment_status = Column(String, default="paid")  # paid, pending
    payment_reference = Column(String, nullable=True)  # UTR, cheque no etc

    # Link to batch
    batch_id = Column(Integer, ForeignKey("production.id"), nullable=True)
    batch_number = Column(String, nullable=True)

    notes = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())