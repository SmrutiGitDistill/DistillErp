"""
Render pre-flight script.
Runs before gunicorn starts and validates that all required env vars are present.
If anything is missing it exits with a non-zero code so the deploy fails fast
rather than starting a broken server.
"""
import os
import sys
from pathlib import Path

# Ensure the backup directory exists (Render filesystem is ephemeral but /tmp is always writable)
backup_path = Path(os.getenv("BACKUP_PATH", "/tmp/distillerp-backups"))
backup_path.mkdir(parents=True, exist_ok=True)

from app.core.config import settings

try:
    settings.validate_for_startup()
except RuntimeError as exc:
    print(f"[render_start] FATAL: {exc}", flush=True)
    sys.exit(1)

print(f"[render_start] Environment : {settings.ENVIRONMENT}", flush=True)
print(f"[render_start] Render URL  : {settings.RENDER_EXTERNAL_URL or '(not set)'}", flush=True)
print(f"[render_start] CORS origins: {settings.origins_list}", flush=True)
print(f"[render_start] Backup path : {backup_path}", flush=True)
print("[render_start] Pre-flight passed — handing off to gunicorn", flush=True)
