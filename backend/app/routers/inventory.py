from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from app.core.database import get_db
from app.core.deps import get_current_user, require_superadmin
from app.models.user import User
from app.services.audit import log_action
from app.models.inventory import (
    RawMaterialMaster, RawMaterialTransaction,
    SKUMaster, PackagingMaterial, PackagingTransaction,
    InProcessStock
)
from app.schemas.inventory import (
    RawMaterialCreate, RawMaterialOut,
    RawMaterialTxCreate, RawMaterialTxOut,
    SKUCreate, SKUOut,
    PackagingCreate, PackagingOut,
    InProcessCreate, InProcessOut
)

router = APIRouter(prefix="/inventory", tags=["Inventory"])

# ─── RAW MATERIALS ───────────────────────────────────────

@router.get("/raw-materials", response_model=List[RawMaterialOut])
def get_raw_materials(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    materials = db.query(RawMaterialMaster).filter(
        RawMaterialMaster.is_active == True
    ).all()
    result = []
    for m in materials:
        m_dict = {
            "id": m.id,
            "name": m.name,
            "unit": m.unit,
            "reorder_level": m.reorder_level,
            "current_stock": m.current_stock,
            "is_active": m.is_active,
            "is_low": m.current_stock <= m.reorder_level
        }
        result.append(m_dict)
    return result

@router.post("/raw-materials", response_model=RawMaterialOut)
def create_raw_material(
    data: RawMaterialCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    material = RawMaterialMaster(**data.model_dump())
    db.add(material)
    db.commit()
    db.refresh(material)
    log_action(db, current_user, "CREATE", "raw_material", material.id, material.name)
    return {**material.__dict__, "is_low": material.current_stock <= material.reorder_level}

@router.put("/raw-materials/{material_id}", response_model=RawMaterialOut)
def update_raw_material(
    material_id: int,
    data: RawMaterialCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    material = db.query(RawMaterialMaster).filter(
        RawMaterialMaster.id == material_id
    ).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    for field, value in data.model_dump().items():
        setattr(material, field, value)
    db.commit()
    db.refresh(material)
    return {**material.__dict__, "is_low": material.current_stock <= material.reorder_level}

@router.delete("/raw-materials/{material_id}")
def delete_raw_material(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    material = db.query(RawMaterialMaster).filter(
        RawMaterialMaster.id == material_id
    ).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    material.is_active = False
    db.commit()
    return {"message": "Material deactivated"}

@router.post("/raw-materials/transaction")
def add_transaction(
    data: RawMaterialTxCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    material = db.query(RawMaterialMaster).filter(
        RawMaterialMaster.id == data.material_id
    ).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    tx = RawMaterialTransaction(
        **data.model_dump(),
        created_by=current_user.id
    )
    db.add(tx)

    # Update current stock
    if data.transaction_type in ["received", "opening"]:
        material.current_stock += data.quantity
    elif data.transaction_type == "consumed":
        if material.current_stock < data.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock. Available: {material.current_stock} {material.unit}"
            )
        material.current_stock -= data.quantity
    elif data.transaction_type == "adjusted":
        material.current_stock = data.quantity

    db.commit()
    log_action(db, current_user, "CREATE", "raw_material_tx", tx.id, f"{data.transaction_type} {data.quantity} {material.name}")
    return {"message": "Transaction recorded", "current_stock": material.current_stock}

@router.get("/raw-materials/{material_id}/transactions")
def get_transactions(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    txs = db.query(RawMaterialTransaction).filter(
        RawMaterialTransaction.material_id == material_id
    ).order_by(RawMaterialTransaction.date.desc()).all()
    return txs

# ─── SKU MASTER ──────────────────────────────────────────

@router.get("/sku", response_model=List[SKUOut])
def get_skus(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    skus = db.query(SKUMaster).filter(SKUMaster.is_active == True).all()
    return [
        {**s.__dict__, "is_low": s.current_stock_bottles <= s.reorder_level}
        for s in skus
    ]

@router.post("/sku", response_model=SKUOut)
def create_sku(
    data: SKUCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(SKUMaster).filter(
        SKUMaster.sku_code == data.sku_code
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="SKU code already exists")
    sku = SKUMaster(**data.model_dump())
    db.add(sku)
    db.commit()
    db.refresh(sku)
    log_action(db, current_user, "CREATE", "sku", sku.id, f"{sku.brand_name} {sku.sku_code}")
    return {**sku.__dict__, "is_low": sku.current_stock_bottles <= sku.reorder_level}

@router.put("/sku/{sku_id}", response_model=SKUOut)
def update_sku(
    sku_id: int,
    data: SKUCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sku = db.query(SKUMaster).filter(SKUMaster.id == sku_id).first()
    if not sku:
        raise HTTPException(status_code=404, detail="SKU not found")
    for field, value in data.model_dump().items():
        setattr(sku, field, value)
    db.commit()
    db.refresh(sku)
    return {**sku.__dict__, "is_low": sku.current_stock_bottles <= sku.reorder_level}

@router.put("/sku/{sku_id}/stock")
def update_sku_stock(
    sku_id: int,
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sku = db.query(SKUMaster).filter(SKUMaster.id == sku_id).first()
    if not sku:
        raise HTTPException(status_code=404, detail="SKU not found")
    qty = data.get("quantity", 0)
    tx_type = data.get("type", "received")
    if tx_type == "received":
        sku.current_stock_bottles += qty
    elif tx_type == "sold":
        if sku.current_stock_bottles < qty:
            raise HTTPException(status_code=400, detail="Insufficient stock")
        sku.current_stock_bottles -= qty
    elif tx_type == "adjusted":
        sku.current_stock_bottles = qty
    db.commit()
    return {"message": "Stock updated", "current_stock": sku.current_stock_bottles}

@router.delete("/sku/{sku_id}")
def delete_sku(
    sku_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sku = db.query(SKUMaster).filter(SKUMaster.id == sku_id).first()
    if not sku:
        raise HTTPException(status_code=404, detail="SKU not found")
    sku.is_active = False
    db.commit()
    return {"message": "SKU deactivated"}

# ─── PACKAGING MATERIALS ─────────────────────────────────

@router.get("/packaging", response_model=List[PackagingOut])
def get_packaging(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    materials = db.query(PackagingMaterial).filter(
        PackagingMaterial.is_active == True
    ).all()
    return [
        {**m.__dict__, "is_low": m.current_stock <= m.reorder_level}
        for m in materials
    ]

@router.post("/packaging", response_model=PackagingOut)
def create_packaging(
    data: PackagingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    material = PackagingMaterial(**data.model_dump())
    db.add(material)
    db.commit()
    db.refresh(material)
    log_action(db, current_user, "CREATE", "packaging", material.id, material.name)
    return {**material.__dict__, "is_low": material.current_stock <= material.reorder_level}

@router.put("/packaging/{material_id}/stock")
def update_packaging_stock(
    material_id: int,
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    material = db.query(PackagingMaterial).filter(
        PackagingMaterial.id == material_id
    ).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    qty = data.get("quantity", 0)
    tx_type = data.get("type", "received")
    if tx_type == "received":
        material.current_stock += qty
    elif tx_type == "consumed":
        material.current_stock -= qty
    elif tx_type == "adjusted":
        material.current_stock = qty
    db.commit()
    return {"message": "Stock updated", "current_stock": material.current_stock}

# ─── IN PROCESS STOCK ────────────────────────────────────

@router.post("/in-process", response_model=InProcessOut)
def create_in_process(
    data: InProcessCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = InProcessStock(**data.model_dump(), created_by=current_user.id)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

@router.get("/in-process/{entry_date}")
def get_in_process(
    entry_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from sqlalchemy import func
    record = db.query(InProcessStock).filter(
        func.date(InProcessStock.date) == entry_date
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="No record found")
    return record

# ─── ALERTS ──────────────────────────────────────────────

@router.get("/alerts")
def get_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    low_raw = db.query(RawMaterialMaster).filter(
        RawMaterialMaster.is_active == True,
        RawMaterialMaster.current_stock <= RawMaterialMaster.reorder_level
    ).all()

    low_sku = db.query(SKUMaster).filter(
        SKUMaster.is_active == True,
        SKUMaster.current_stock_bottles <= SKUMaster.reorder_level
    ).all()

    low_pkg = db.query(PackagingMaterial).filter(
        PackagingMaterial.is_active == True,
        PackagingMaterial.current_stock <= PackagingMaterial.reorder_level
    ).all()

    return {
        "total_alerts": len(low_raw) + len(low_sku) + len(low_pkg),
        "low_raw_materials": [
            {"name": m.name, "current": m.current_stock,
             "reorder": m.reorder_level, "unit": m.unit}
            for m in low_raw
        ],
        "low_sku": [
            {"name": f"{s.brand_name} {s.bottle_size_ml}ml",
             "current": s.current_stock_bottles, "reorder": s.reorder_level}
            for s in low_sku
        ],
        "low_packaging": [
            {"name": m.name, "current": m.current_stock,
             "reorder": m.reorder_level, "unit": m.unit}
            for m in low_pkg
        ]
    }