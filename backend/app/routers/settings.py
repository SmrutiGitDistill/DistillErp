from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user, require_admin_or_above
from app.models.user import User
from app.models.settings import Settings
from app.schemas.settings import SettingsOut, SettingsUpdate

router = APIRouter(prefix="/settings", tags=["Settings"])

def _get_or_create_settings(db: Session) -> Settings:
    s = db.query(Settings).first()
    if not s:
        s = Settings()
        db.add(s)
        db.commit()
        db.refresh(s)
    return s

@router.get("/", response_model=SettingsOut)
def get_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return _get_or_create_settings(db)

@router.put("/", response_model=SettingsOut)
def update_settings(
    payload: SettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_above)
):
    s = _get_or_create_settings(db)
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(s, field, value)
    db.commit()
    db.refresh(s)
    return s
