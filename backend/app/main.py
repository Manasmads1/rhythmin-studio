from __future__ import annotations

import asyncio
import hashlib
import json
import mimetypes
import os
import shutil
import threading
import time
import uuid
from pathlib import Path

from fastapi import BackgroundTasks, FastAPI, File, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel, Field

from .store import Store

ROOT = os.getenv("RHYTHMIN_DATA_DIR", str(Path(__file__).resolve().parents[1] / "data"))
MAX_BYTES = int(os.getenv("RHYTHMIN_MAX_UPLOAD_BYTES", str(100 * 1024 * 1024)))
PROCESSOR = os.getenv("RHYTHMIN_PROCESSOR", "demo")
ORIGINS = [item.strip() for item in os.getenv("RHYTHMIN_ALLOWED_ORIGINS", "http://localhost:8000").split(",") if item.strip()]
store = Store(ROOT)
app = FastAPI(title="RhythmIN API", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=ORIGINS, allow_credentials=False, allow_methods=["*"], allow_headers=["*"])


class SeparateRequest(BaseModel):
    fileId: str
    projectId: str | None = None
    stems: list[str] = Field(default_factory=lambda: ["vocals", "drums", "bass", "other"])
    model: str = "demo"
    format: str = "wav"


class ErrorResponse(BaseModel):
    code: str
    message: str


def row_job(row):
    if not row:
        raise HTTPException(404, "Job not found")
    return {
        "id": row["id"], "projectId": row["project_id"], "type": row["type"],
        "processor": row["processor"], "status": row["status"], "progress": row["progress"],
        "stage": row["stage"], "input": json.loads(row["input_json"]),
        "outputs": json.loads(row["outputs_json"]) if row["outputs_json"] else {},
        "error": json.loads(row["error_json"]) if row["error_json"] else None,
        "createdAt": row["created_at"], "updatedAt": row["updated_at"],
    }


def safe_name(name: str) -> str:
    base = Path(name or "audio.bin").name.replace(" ", "_")
    allowed = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._-"
    return "".join(char for char in base if char in allowed)[:160] or "audio.bin"


def process_demo(job_id: str, file_id: str, project_id: str, roles: list[str], fmt: str):
    source = store.file(file_id)
    if not source:
        store.update_job(job_id, status="failed", stage="missing input", error_json=json.dumps({"code": "MISSING_FILE", "message": "Input file was not found"}))
        return
    source_path = store.path_for(source["storage_key"])
    if not source_path.exists():
        store.update_job(job_id, status="failed", stage="missing input", error_json=json.dumps({"code": "MISSING_FILE", "message": "Stored input file was not found"}))
        return
    try:
        stages = [("validate", 10), ("decode", 25), ("analyze", 40), ("separate", 72), ("render", 92)]
        store.update_job(job_id, status="processing", stage="validate", progress=2)
        for stage, progress in stages:
            current = store.job(job_id)
            if current and current["cancel_requested"]:
                store.update_job(job_id, status="cancelled", stage="cancelled", progress=progress)
                return
            store.update_job(job_id, status="processing", stage=stage, progress=progress)
            time.sleep(0.12)
        outputs = {}
        for role in roles:
            output_id = str(uuid.uuid4())
            key = f"outputs/{job_id}/{role}.{fmt if fmt in {'wav','mp3','flac','ogg'} else 'wav'}"
            target = store.path_for(key)
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(source_path, target)
            store.add_file(project_id, output_id, f"{role}.{target.suffix.lstrip('.')}", mimetypes.guess_type(target.name)[0] or "audio/wav", target.stat().st_size, "", key)
            store.add_stem(project_id, job_id, role, output_id, 0.0)
            outputs[role] = {"fileId": output_id, "url": f"/files/{key}"}
        store.update_job(job_id, status="completed", stage="complete", progress=100, outputs_json=json.dumps(outputs))
    except Exception as exc:
        store.update_job(job_id, status="failed", stage="error", error_json=json.dumps({"code": "PROCESSING_FAILED", "message": str(exc)}))


@app.get("/api/health")
def health():
    return {"ok": True, "service": "rhythmin-api", "processor": PROCESSOR, "storage": "local", "version": app.version}


@app.post("/api/upload")
def upload(file: UploadFile = File(...), x_rhythmin_session: str | None = Header(default=None)):
    name = safe_name(file.filename or "audio.bin")
    mime = file.content_type or mimetypes.guess_type(name)[0] or "application/octet-stream"
    if not mime.startswith("audio/") and Path(name).suffix.lower() not in {".wav", ".mp3", ".flac", ".ogg", ".m4a", ".aac"}:
        raise HTTPException(415, "Only audio files are supported")
    file_id = str(uuid.uuid4())
    session_id = x_rhythmin_session or "anonymous"
    project_id = store.create_project(session_id, Path(name).stem or "Untitled track")
    key = f"uploads/{project_id}/{file_id}-{name}"
    target = store.path_for(key)
    target.parent.mkdir(parents=True, exist_ok=True)
    digest = hashlib.sha256()
    total = 0
    with target.open("wb") as out:
        while True:
            chunk = file.file.read(1024 * 1024)
            if not chunk:
                break
            total += len(chunk)
            if total > MAX_BYTES:
                target.unlink(missing_ok=True)
                raise HTTPException(413, "File exceeds the 100 MB limit")
            digest.update(chunk)
            out.write(chunk)
    store.add_file(project_id, file_id, name, mime, total, digest.hexdigest(), key)
    return {"fileId": file_id, "projectId": project_id, "name": name, "bytes": total, "mime": mime, "url": f"/files/{key}"}


@app.post("/api/separate")
def separate(payload: SeparateRequest, background_tasks: BackgroundTasks):
    source = store.file(payload.fileId)
    if not source:
        raise HTTPException(404, "File not found")
    if not payload.stems:
        raise HTTPException(400, "Select at least one stem")
    project_id = payload.projectId or source["project_id"]
    job_id = store.create_job(project_id, PROCESSOR, {"type": "separate", "fileId": payload.fileId, "projectId": project_id, "stems": payload.stems, "model": payload.model, "format": payload.format})
    background_tasks.add_task(process_demo, job_id, payload.fileId, project_id, payload.stems, payload.format)
    return {"jobId": job_id, "processor": PROCESSOR}


@app.get("/api/jobs/{job_id}")
def get_job(job_id: str):
    return row_job(store.job(job_id))


@app.post("/api/jobs/{job_id}/cancel")
def cancel_job(job_id: str):
    row_job(store.job(job_id))
    store.cancel(job_id)
    return {"ok": True}


@app.get("/api/jobs/{job_id}/stream")
async def stream_job(job_id: str):
    row_job(store.job(job_id))
    async def events():
        last = None
        for _ in range(300):
            payload = row_job(store.job(job_id))
            serialized = json.dumps(payload)
            if serialized != last:
                yield f"data: {serialized}\n\n"
                last = serialized
            if payload["status"] in {"completed", "failed", "cancelled"}:
                break
            await asyncio.sleep(0.25)
    return StreamingResponse(events(), media_type="text/event-stream")


@app.get("/api/stems/{project_id}")
def get_stems(project_id: str):
    return [{"id": row["id"], "role": row["role"], "confidence": row["confidence"], "url": f"/files/{row['storage_key']}", "name": row["name"], "mime": row["mime"]} for row in store.stems(project_id)]


@app.get("/files/{key:path}")
def file_download(key: str):
    path = store.public_file(key)
    if not path.exists() or not path.is_file():
        raise HTTPException(404, "File not found")
    return FileResponse(path)
