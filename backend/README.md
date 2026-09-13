# RhythmIN Backend

The starter backend is a FastAPI service with SQLite metadata, local file storage, a bounded in-process job runner, and an explicit demo processor.

## Local setup

```bash
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8787
```

Health check:

```bash
curl http://127.0.0.1:8787/api/health
```

The backend is intentionally safe to run without credentials. Configure `RHYTHMIN_ALLOWED_ORIGINS` and `RHYTHMIN_DATA_DIR` in `.env` when needed.

## Deployment notes

Supabase is the planned free persistence layer. Edge Functions should orchestrate uploads and jobs, not run Demucs. A real Demucs/FFmpeg worker must run in a compatible Python environment and communicate through the documented processor contract.
