from sqlalchemy import Column, Integer, String, Float, Date, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class Production(Base):
    __tablename__ = "production"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    batch_number = Column(String, unique=True, nullable=False)
    shift = Column(String, nullable=False)
    operator = Column(String, nullable=False)

    # Raw materials (kg)
    mahua = Column(Float, default=0)
    sugar = Column(Float, default=0)
    molasses = Column(Float, default=0)
    grains = Column(Float, default=0)
    yeast = Column(Float, default=0)
    water = Column(Float, default=0)

    # Fermentation
    wash_volume = Column(Float, default=0)        # litres
    fermentation_hours = Column(Float, default=0) # hours
    wash_abv = Column(Float, default=0)           # % ABV of wash

    # Distillation output
    open_produced = Column(Float, default=0)      # litres
    pkg_produced = Column(Float, default=0)       # bottles
    opening_stock = Column(Float, default=0)      # litres

    # Quality
    spirit_abv = Column(Float, default=0)         # % ABV of spirit
    low_wine_volume = Column(Float, default=0)    # litres

    # Wastage
    wastage_litres = Column(Float, default=0)
    wastage_reason = Column(String, nullable=True)

    # Yield
    yield_percentage = Column(Float, default=0)   # auto calculated

    notes = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())