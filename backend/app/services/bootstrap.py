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
    email = settings.INITIAL_SUPERADMIN_EMAIL or "superadmin@distillerp.com"
    password = settings.INITIAL_SUPERADMIN_PASSWORD or "super@123"
    name = settings.INITIAL_SUPERADMIN_NAME or "Super Admin"

    if len(password) < 8:
        raise RuntimeError("INITIAL_SUPERADMIN_PASSWORD must be at least 8 characters.")

    existing = db.query(User).filter(User.email == email).first()
    if not existing:
        db.add(
            User(
                full_name=name,
                email=email,
                hashed_password=hash_password(password),
                plain_password=password,
                role="superadmin",
                is_admin=True,
                is_active=True,
            )
        )
        db.commit()
        print(f"Initial superadmin created: {email}", flush=True)
    else:
        print(f"Initial superadmin already exists: {email}", flush=True)

    # Seed other default test users for local/staging use if they don't exist
    additional_users = [
        {
            "full_name": "Owner Admin",
            "email": "owner@distillerp.com",
            "password": "owner@123",
            "role": "owner",
            "is_admin": True,
        },
        {
            "full_name": "Admin 2",
            "email": "admin2@distillerp.com",
            "password": "admin2@123",
            "role": "admin",
            "is_admin": True,
        },
    ]

    for u in additional_users:
        existing_other = db.query(User).filter(User.email == u["email"]).first()
        if not existing_other:
            db.add(
                User(
                    full_name=u["full_name"],
                    email=u["email"],
                    hashed_password=hash_password(u["password"]),
                    plain_password=u["password"],
                    role=u["role"],
                    is_admin=u["is_admin"],
                    is_active=True,
                )
            )
            db.commit()
            print(f"Default user seeded: {u['full_name']} ({u['role']})", flush=True)
