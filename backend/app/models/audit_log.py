from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_email = Column(String, nullable=True)
    action = Column(String, nullable=False)        # CREATE / UPDATE / DELETE
    entity_type = Column(String, nullable=False)   # production, sales, expense, etc.
    entity_id = Column(String, nullable=True)
    summary = Column(String, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
