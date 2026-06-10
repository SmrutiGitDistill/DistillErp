# Render Backend Deployment

This file is for testing on Render's free tier. The app will run as a native Python web service from the `backend/` directory and connect to an external PostgreSQL database (such as a free Neon DB database).

## Blueprint Deploy

1. Push this repository to GitHub.
2. In Render, choose **New > Blueprint**.
3. Select this repository. Render will read `render.yaml` from the repo root.
4. When prompted for `INITIAL_SUPERADMIN_PASSWORD`, enter a temporary password with at least 8 characters.
5. Deploy.

The blueprint creates:

- `distillerp-backend`: free Python web service

During blueprint creation, Render will prompt you for the `DATABASE_URL` (where you should paste your Neon database connection string). Render will generate `SECRET_KEY`, run `pip install -r requirements.txt`, and start the API with:

```bash
python render_start.py && uvicorn main:app --host 0.0.0.0 --port ${PORT:-10000}
```

## Manual Web Service Setup

If you do not use the blueprint:

```text
Root Directory: backend
Runtime: Python
Instance Type: Free
Build Command: pip install -r requirements.txt
Start Command: python render_start.py && uvicorn main:app --host 0.0.0.0 --port ${PORT:-10000}
Health Check Path: /health
```

Set these environment variables:

```text
PYTHON_VERSION=3.11.11
DATABASE_URL=<your Neon/PostgreSQL connection string>
SECRET_KEY=<long random secret>
ENVIRONMENT=production
ALLOWED_ORIGINS=https://distillerp.vercel.app,http://localhost:5173,http://127.0.0.1:5173
BACKUP_PATH=/tmp/distillerp-backups
INITIAL_SUPERADMIN_EMAIL=superadmin@distillerp.com
INITIAL_SUPERADMIN_PASSWORD=<temporary password, 8+ chars>
INITIAL_SUPERADMIN_NAME=Test Super Admin
```

## Free Tier Notes

- Free web services spin down after 15 minutes without traffic and take about a minute to wake up.
- Free web service files are ephemeral, so local JSON backups in `/tmp` are only for short tests.
- By using an external database like Neon DB, you avoid the 30-day expiration limit of Render's free Postgres database.
- `RENDER_EXTERNAL_URL` is automatically added to CORS origins by the backend.
- The deployed Vercel frontend, `https://distillerp.vercel.app`, must be present in the backend service's `ALLOWED_ORIGINS`.
- If testing from the local React frontend, keep `http://localhost:5173` in `ALLOWED_ORIGINS`.
