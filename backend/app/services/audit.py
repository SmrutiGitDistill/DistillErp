from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog

def log_action(
    db: Session,
    user,
    action: str,
    entity_type: str,
    entity_id=None,
    summary: str = None,
):
    entry = AuditLog(
        user_id=user.id,
        user_email=user.email,
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id) if entity_id is not None else None,
        summary=summary,
    )
    db.add(entry)
    db.commit()
