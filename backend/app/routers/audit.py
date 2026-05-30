from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import require_admin_or_above
from app.models.user import User
from app.models.audit_log import AuditLog

router = APIRouter(prefix="/audit", tags=["Audit"])

@router.get("/logs")
def get_audit_logs(
    limit: int = 200,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_above)
):
    logs = db.query(AuditLog).order_by(
        AuditLog.timestamp.desc()
    ).limit(limit).all()
    return logs
