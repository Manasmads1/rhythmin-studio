# RhythmIN Data Schema

The local adapter uses SQLite tables that mirror the future Supabase schema.

- `projects(id, session_id, name, type, source_file_id, metadata_json, revision, created_at, updated_at)`
- `audio_files(id, project_id, storage_key, name, mime, bytes, duration, sample_rate, channels, sha256, created_at)`
- `tracks(id, project_id, role, name, position, settings_json, created_at, updated_at)`
- `jobs(id, project_id, type, processor, status, progress, stage, input_json, outputs_json, error_json, cancel_requested, created_at, updated_at)`
- `stems(id, project_id, job_id, role, audio_file_id, confidence, created_at)`
- `exports(id, project_id, job_id, format, status, output_key, created_at, updated_at)`

Supabase migration policies will scope every row to the authenticated user. Anonymous sessions are a development-only compatibility mode.
