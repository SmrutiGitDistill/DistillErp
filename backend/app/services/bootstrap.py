from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.models.user import User
from app.models.settings import Settings


def ensure_initial_settings(db: Session) -> None:
    if not db.query(Settings).first():
        db.add(Settings())
        db.commit()
        print("Default settings row created.", flush=True)


def ensure_initial_superadmin(db: Session) -> None:
    email = settings.INITIAL_SUPERADMIN_EMAIL
    password = settings.INITIAL_SUPERADMIN_PASSWORD

    if not email or not password:
        print(
            "Initial superadmin seed skipped. Set INITIAL_SUPERADMIN_EMAIL and "
            "INITIAL_SUPERADMIN_PASSWORD if this is a fresh test database.",
            flush=True,
        )
        return

    if len(password) < 8:
        raise RuntimeError("INITIAL_SUPERADMIN_PASSWORD must be at least 8 characters.")

    existing = db.query(User).filter(User.email == email).first()
    if existing:
        print(f"Initial superadmin already exists: {email}", flush=True)
        return

    db.add(
        User(
            full_name=settings.INITIAL_SUPERADMIN_NAME,
            email=email,
            hashed_password=hash_password(password),
            role="superadmin",
            is_admin=True,
            is_active=True,
        )
    )
    db.commit()
    print(f"Initial superadmin created: {email}", flush=True)
