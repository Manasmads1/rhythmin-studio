# RhythmIN Architecture

## Product boundary

RhythmIN is a browser-first audio workspace. The frontend owns playback, waveform rendering, mixer controls, instruments, local-first editing state, and browser-native WAV export. Backend services own durable metadata, object storage, job orchestration, and optional heavy processing.

## Target topology

```text
Cloudflare Pages / GitHub Pages
  └─ static frontend
       ├─ Web Audio + Tone.js
       ├─ waveform/editor state
       ├─ shared/backend-api.js
       └─ Supabase client when configured

Supabase free project
  ├─ Postgres metadata
  ├─ private storage buckets
  ├─ authentication
  └─ Edge Functions for lightweight orchestration

Optional Python worker
  ├─ Demucs separation
  └─ FFmpeg encoding
```

## Implemented starter topology

The repository now includes `backend/app/main.py`, a FastAPI starter that uses SQLite and local storage. It validates audio uploads, creates projects and jobs, exposes job polling and SSE, runs an explicit demo processor, and serves generated artifacts. The browser adapter activates this backend when a URL is configured in Settings and retains demo mode otherwise.

## Data model

Projects contain source files, tracks, jobs, stems, and exports. Track settings are intended to remain compact JSON so browser playback can apply volume, pan, mute, solo, trim, speed, pitch, effects, and ordering without sending every control change through the network.

## Processing contract

Processors implement the same lifecycle: queued, processing, completed, failed, or cancelled. The demo processor is clearly marked and deterministic. A remote processor may later receive a storage key, model, requested stem roles, and format, then write artifacts and update the job through an authenticated callback.

## Storage

The local adapter stores files under `backend/data`. The planned free hosted adapter uses private Supabase buckets with direct signed uploads and downloads. Large audio should not be sent through serverless function bodies.

## Security

Uploads are size- and type-validated, filenames are sanitized, storage keys are generated server-side, and errors do not expose filesystem paths. Supabase row-level security will scope records to the authenticated user. Service-role keys never belong in the frontend or repository.

## Platform decisions

GitHub Pages remains a fallback deployment. Cloudflare Pages is the preferred future static host. Supabase is the preferred free persistence and storage layer. Vercel remains a valid alternative for a future React migration but does not remove the need for external storage or a heavy processing worker.

## Known constraint

No free serverless platform can honestly guarantee unlimited Demucs/PyTorch processing for arbitrary users. Real separation is therefore an optional worker adapter, while the rest of the product remains fully useful in browser and demo modes.
