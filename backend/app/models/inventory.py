from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.sql import func
from app.core.database import Base

class RawMaterialMaster(Base):
    __tablename__ = "raw_material_master"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    unit = Column(String, default="kg")  # kg, litre, ton
    reorder_level = Column(Float, default=0)
    current_stock = Column(Float, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class RawMaterialTransaction(Base):
    __tablename__ = "raw_material_transactions"

    id = Column(Integer, primary_key=True, index=True)
    material_id = Column(Integer, ForeignKey("raw_material_master.id"))
    date = Column(Date, nullable=False)
    transaction_type = Column(String, nullable=False)  # opening, received, consumed, adjusted
    quantity = Column(Float, nullable=False)
    vendor = Column(String, nullable=True)
    batch_id = Column(Integer, ForeignKey("production.id"), nullable=True)
    notes = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class SKUMaster(Base):
    __tablename__ = "sku_master"

    id = Column(Integer, primary_key=True, index=True)
    brand_name = Column(String, nullable=False)
    sku_code = Column(String, unique=True, nullable=False)
    bottle_size_ml = Column(Integer, nullable=False)  # 180, 375, 750 etc
    bottles_per_case = Column(Integer, default=12)
    rate_per_bottle = Column(Float, default=0)
    rate_per_case = Column(Float, default=0)
    current_stock_bottles = Column(Float, default=0)
    reorder_level = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class PackagingMaterial(Base):
    __tablename__ = "packaging_materials"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)  # Labels, Caps, Cartons
    unit = Column(String, default="pcs")
    current_stock = Column(Float, default=0)
    reorder_level = Column(Float, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class PackagingTransaction(Base):
    __tablename__ = "packaging_transactions"

    id = Column(Integer, primary_key=True, index=True)
    material_id = Column(Integer, ForeignKey("packaging_materials.id"))
    date = Column(Date, nullable=False)
    transaction_type = Column(String, nullable=False)  # received, consumed, adjusted
    quantity = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class InProcessStock(Base):
    __tablename__ = "in_process_stock"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    wash_volume = Column(Float, default=0)      # litres
    low_wine_volume = Column(Float, default=0)  # litres
    spirit_volume = Column(Float, default=0)    # litres
    abv = Column(Float, default=0)              # % strength
    batch_id = Column(Integer, ForeignKey("production.id"), nullable=True)
    notes = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())