from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import asyncio
from pathlib import Path
from app.core.database import engine, Base
from app.core.config import settings
from app.models import User, Production, Sales, Expense, Settings as SettingsModel
from app.models.login_log import LoginLog
from app.models.backup_schedule import BackupSchedule
from app.routers import auth, production, sales, expenses, dashboard, reports, backup, inventory, settings as settings_router, audit
from app.services.bootstrap import ensure_initial_superadmin, ensure_initial_settings
from app.services.backup import run_scheduled_backups
from app.core.database import SessionLocal

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
FRONTEND_DIST_DIR = PROJECT_ROOT / "frontend" / "dist"
FRONTEND_INDEX = FRONTEND_DIST_DIR / "index.html"
API_ONLY_PREFIXES = {"auth", "backup", "health", "settings", "audit"}
API_PREFIXES_WITH_FRONTEND_ROUTES = {
    "dashboard",
    "expenses",
    "production",
    "reports",
    "sales",
}

# Background task for scheduled backups
async def backup_scheduler():
    while True:
        try:
            db = SessionLocal()
            run_scheduled_backups(db)
            db.close()
        except Exception as e:
            print(f"Scheduler error: {e}")
        await asyncio.sleep(60 * 30)  # Check every 30 minutes

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        ensure_initial_superadmin(db)
        ensure_initial_settings(db)
    finally:
        db.close()
    asyncio.create_task(backup_scheduler())
    yield
    # Shutdown

app = FastAPI(
    title="DistillERP API",
    description="Factory Management System for Indian Distilleries",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url=None,
    lifespan=lifespan,
)

# Security middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

# Global error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again."}
    )

# Routers
app.include_router(auth.router)
app.include_router(production.router)
app.include_router(sales.router)
app.include_router(expenses.router)
app.include_router(dashboard.router)
app.include_router(reports.router)
app.include_router(backup.router)
app.include_router(inventory.router)
app.include_router(settings_router.router)
app.include_router(audit.router)

@app.get("/health")
def health():
    return {"status": "healthy", "environment": settings.ENVIRONMENT}

assets_dir = FRONTEND_DIST_DIR / "assets"
if assets_dir.exists():
    app.mount("/assets", StaticFiles(directory=assets_dir), name="frontend-assets")

@app.get("/", include_in_schema=False)
def root():
    if FRONTEND_INDEX.exists():
        return FileResponse(FRONTEND_INDEX)
    return {"message": "DistillERP API", "version": "1.0.0"}

@app.get("/{full_path:path}", include_in_schema=False)
def serve_frontend(full_path: str):
    first_segment = full_path.split("/", 1)[0]
    if first_segment in API_ONLY_PREFIXES:
        raise HTTPException(status_code=404, detail="Not found")
    if first_segment in API_PREFIXES_WITH_FRONTEND_ROUTES and "/" in full_path:
        raise HTTPException(status_code=404, detail="Not found")

    if not FRONTEND_INDEX.exists():
        raise HTTPException(status_code=404, detail="Frontend build not found")

    requested_path = (FRONTEND_DIST_DIR / full_path).resolve()
    try:
        requested_path.relative_to(FRONTEND_DIST_DIR.resolve())
    except ValueError:
        raise HTTPException(status_code=404, detail="Not found")

    if requested_path.is_file():
        return FileResponse(requested_path)

    return FileResponse(FRONTEND_INDEX)
