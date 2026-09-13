from __future__ import annotations

import json
import os
import sqlite3
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


class Store:
    def __init__(self, root: str):
        self.root = Path(root)
        self.uploads = self.root / "uploads"
        self.outputs = self.root / "outputs"
        self.root.mkdir(parents=True, exist_ok=True)
        self.uploads.mkdir(exist_ok=True)
        self.outputs.mkdir(exist_ok=True)
        self.db_path = self.root / "rhythmin.sqlite3"
        self.lock = threading.RLock()
        self._init_db()

    def connect(self):
        db = sqlite3.connect(self.db_path, check_same_thread=False)
        db.row_factory = sqlite3.Row
        return db

    def _init_db(self):
        with self.connect() as db:
            db.executescript("""
            CREATE TABLE IF NOT EXISTS projects (
              id TEXT PRIMARY KEY, session_id TEXT NOT NULL, name TEXT NOT NULL,
              type TEXT NOT NULL, source_file_id TEXT, metadata_json TEXT NOT NULL,
              revision INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS audio_files (
              id TEXT PRIMARY KEY, project_id TEXT NOT NULL, storage_key TEXT NOT NULL,
              name TEXT NOT NULL, mime TEXT NOT NULL, bytes INTEGER NOT NULL,
              duration REAL, sample_rate INTEGER, channels INTEGER, sha256 TEXT, created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS jobs (
              id TEXT PRIMARY KEY, project_id TEXT NOT NULL, type TEXT NOT NULL,
              processor TEXT NOT NULL, status TEXT NOT NULL, progress INTEGER NOT NULL,
              stage TEXT NOT NULL, input_json TEXT NOT NULL, outputs_json TEXT,
              error_json TEXT, cancel_requested INTEGER NOT NULL DEFAULT 0,
              created_at TEXT NOT NULL, updated_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS stems (
              id TEXT PRIMARY KEY, project_id TEXT NOT NULL, job_id TEXT NOT NULL,
              role TEXT NOT NULL, audio_file_id TEXT NOT NULL, confidence REAL, created_at TEXT NOT NULL
            );
            """)

    def create_project(self, session_id: str, name: str, metadata: dict | None = None) -> str:
        project_id = str(uuid.uuid4())
        stamp = now()
        with self.connect() as db:
            db.execute("INSERT INTO projects VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)",
                       (project_id, session_id, name, "separation", None, json.dumps(metadata or {}), stamp, stamp))
        return project_id

    def add_file(self, project_id: str, file_id: str, name: str, mime: str, size: int, sha256: str, key: str) -> None:
        with self.connect() as db:
            db.execute("INSERT INTO audio_files VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                       (file_id, project_id, key, name, mime, size, None, None, None, sha256, now()))
            db.execute("UPDATE projects SET source_file_id=?, updated_at=? WHERE id=?", (file_id, now(), project_id))

    def file(self, file_id: str):
        with self.connect() as db:
            return db.execute("SELECT * FROM audio_files WHERE id=?", (file_id,)).fetchone()

    def project(self, project_id: str):
        with self.connect() as db:
            return db.execute("SELECT * FROM projects WHERE id=?", (project_id,)).fetchone()

    def create_job(self, project_id: str, processor: str, payload: dict) -> str:
        job_id = str(uuid.uuid4())
        stamp = now()
        with self.connect() as db:
            db.execute("INSERT INTO jobs VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)",
                       (job_id, project_id, payload.get("type", "separate"), processor, "queued", 0,
                        "queued", json.dumps(payload), None, None, stamp, stamp))
        return job_id

    def job(self, job_id: str):
        with self.connect() as db:
            return db.execute("SELECT * FROM jobs WHERE id=?", (job_id,)).fetchone()

    def update_job(self, job_id: str, **fields):
        fields["updated_at"] = now()
        allowed = {"status", "progress", "stage", "outputs_json", "error_json", "cancel_requested", "updated_at"}
        fields = {key: value for key, value in fields.items() if key in allowed}
        if not fields:
            return
        clause = ", ".join(f"{key}=?" for key in fields)
        with self.connect() as db:
            db.execute(f"UPDATE jobs SET {clause} WHERE id=?", (*fields.values(), job_id))

    def add_stem(self, project_id: str, job_id: str, role: str, file_id: str, confidence: float = 0.0):
        with self.connect() as db:
            db.execute("INSERT INTO stems VALUES (?, ?, ?, ?, ?, ?, ?)",
                       (str(uuid.uuid4()), project_id, job_id, role, file_id, confidence, now()))

    def stems(self, project_id: str):
        with self.connect() as db:
            return db.execute("""SELECT stems.*, audio_files.name, audio_files.mime, audio_files.storage_key
              FROM stems JOIN audio_files ON audio_files.id=stems.audio_file_id
              WHERE stems.project_id=? ORDER BY stems.role""", (project_id,)).fetchall()

    def cancel(self, job_id: str):
        self.update_job(job_id, cancel_requested=1)

    def path_for(self, key: str) -> Path:
        path = (self.root / key).resolve()
        if self.root.resolve() not in path.parents:
            raise ValueError("invalid storage key")
        return path

    def public_file(self, key: str) -> Path:
        return self.path_for(key)
