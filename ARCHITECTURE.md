# RhythmIn — Architecture

> The prototype in this repo is a **frontend-only** high-fidelity mockup with real Web Audio playback, real Tone.js instruments, and clearly-labelled demo/mock layers for anything that requires a backend or ML models. This document describes the **intended production architecture** so the app can be lifted into VS Code + GitHub + Cloudflare (or any container host) and connected to real services.

---

## 1. System diagram

```
                    ┌────────────────────────────────────────────┐
                    │              Frontend (SPA)                │
                    │  React + TypeScript · Tailwind · shadcn/ui │
                    │  Tone.js · WaveSurfer.js · Web Audio API   │
                    └──────────────────────┬─────────────────────┘
                                           │  HTTPS / WSS
                    ┌──────────────────────▼─────────────────────┐
                    │            API Gateway (Node)              │
                    │  Fastify or Hono · auth · rate-limit       │
                    │  /api/upload · /api/jobs · /api/projects   │
                    └──────┬─────────────────────┬───────────────┘
                           │                     │
                ┌──────────▼───────┐    ┌────────▼─────────┐
                │  Job Queue       │    │  Metadata DB     │
                │  Redis / BullMQ  │    │  Postgres        │
                └──────────┬───────┘    └──────────────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
     ┌────────▼───┐ ┌──────▼──────┐ ┌───▼─────────┐
     │ Separation │ │ Arrangement │ │  Encoder    │
     │  (Python)  │ │  (Python)   │ │  (FFmpeg)   │
     │  Demucs /  │ │  librosa +  │ │  WAV/MP3/   │
     │  Spleeter  │ │  music21    │ │  FLAC/OGG   │
     └──────┬─────┘ └──────┬──────┘ └─────┬───────┘
            │              │              │
            └──────────────┼──────────────┘
                           │
                    ┌──────▼─────────┐
                    │  Object Store  │
                    │  Cloudflare R2 │
                    │  or S3         │
                    └────────────────┘
```

---

## 2. Frontend

### Tech stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | React 18 + TypeScript | UI |
| Styling | Tailwind + CSS variables | Theme system, both dark and light |
| Components | shadcn/ui + Radix primitives | Accessible controls |
| Icons | Lucide | Consistent, no emoji |
| Audio playback | Web Audio API (`AudioBufferSourceNode`, `GainNode`, `StereoPannerNode`, `AnalyserNode`) | All stem playback + metering |
| Music engine | Tone.js | Drum machine, synth, transport, sequencer |
| Waveform | Custom canvas peaks (see `shared/audio-engine.js` `extractPeaks`) | Lightweight — WaveSurfer.js can be swapped in |
| State | Zustand or Redux Toolkit | Client state for tracks, effects, transport |
| Routing | React Router | Between Landing / Dashboard / Upload / Mixer / Studio / Rebuild / Settings |

### Component structure

```
src/
├── components/         # Presentational, no business logic
│   ├── mixer/          # StemStrip, LevelMeter, Fader, PanKnob
│   ├── studio/         # Timeline, DrumGrid, PianoRoll, SynthPanel
│   ├── shared/         # Button, Modal, Toast, ThemeToggle
│   └── icons/
├── pages/              # Route components
│   ├── Landing.tsx
│   ├── Dashboard.tsx
│   ├── Upload.tsx
│   ├── Mixer.tsx
│   ├── Studio.tsx
│   ├── Rebuild.tsx
│   └── Settings.tsx
├── layouts/
│   ├── AppShell.tsx    # Sidebar + Transport
│   └── LandingLayout.tsx
├── lib/
│   ├── audio/
│   │   ├── StemEngine.ts       # ← already implemented in shared/audio-engine.js
│   │   ├── ToneRegistry.ts     # Central Tone.js voice registry
│   │   ├── waveform.ts         # Peak extraction, offline rendering
│   │   └── wav.ts              # WAV encode/decode
│   ├── api/                    # Typed API client
│   │   ├── client.ts
│   │   ├── jobs.ts
│   │   ├── projects.ts
│   │   └── uploads.ts
│   └── utils/
├── services/           # Business logic — orchestration layer between UI + api
│   ├── SeparationService.ts   # See "Service abstractions" below
│   ├── ArrangementService.ts
│   ├── ProjectService.ts
│   └── ExportService.ts
├── types/
└── hooks/
    ├── useStemEngine.ts
    ├── useTransport.ts
    ├── useJob.ts               # Poll a job, expose status/progress
    └── useProject.ts
```

### Service abstractions (Demo ↔ Production)

Every heavy operation is hidden behind an interface, with two implementations:

```ts
// lib/services/SeparationService.ts
export interface SeparationService {
  submit(file: File, opts: SeparationOptions): Promise<Job>;
  getStems(projectId: string): Promise<Stem[]>;
}

export class DemoSeparationService implements SeparationService { /* uses the 4 pre-rendered stems */ }
export class ProductionSeparationService implements SeparationService { /* POSTs to /api/separate */ }
```

Injected via context provider so a single environment flag flips the whole app:
```
VITE_SEPARATION_MODE=demo | production
```

---

## 3. Backend API

### Runtime choice
- **Gateway**: Node.js (Fastify or Hono) — fast, TypeScript-native, low overhead. Deploys on any container host or Cloudflare Workers for the gateway alone.
- **Workers**: **Python** for anything ML/DSP-heavy (FastAPI + Celery/RQ + PyTorch). Python is where Demucs, Spleeter, librosa live — don't reinvent audio DSP in JS.

Hybrid is intentional. Do not force everything into one runtime.

### Endpoints

| Method | Path | Body / Params | Returns |
|---|---|---|---|
| `POST` | `/api/upload` | `multipart/form-data` audio file | `{ fileId, url, meta }` |
| `POST` | `/api/separate` | `{ fileId, model, stems[], format }` | `{ jobId }` |
| `POST` | `/api/arrangement` | `{ fileId, instruments[], style, length }` | `{ jobId }` |
| `GET`  | `/api/jobs/:id` | — | `Job` (see below) |
| `POST` | `/api/jobs/:id/cancel` | — | `{ ok: true }` |
| `GET`  | `/api/stems/:projectId` | — | `Stem[]` |
| `POST` | `/api/export` | `{ projectId, stems[], format, quality }` | `{ jobId }` |
| `GET`  | `/api/projects` | — | `Project[]` |
| `GET`  | `/api/projects/:id` | — | `Project` |
| `DELETE` | `/api/projects/:id` | — | `{ ok: true }` |

### Job shape

```ts
type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

interface Job {
  id: string;
  type: 'separate' | 'arrangement' | 'export';
  status: JobStatus;
  progress: number;         // 0-100
  stage?: string;           // human-readable current stage
  createdAt: number;
  updatedAt: number;
  input: Record<string, any>;
  outputs?: Record<string, string>;  // e.g. { drums: 'https://…drums.wav' }
  error?: { code: string; message: string; details?: any };
}
```

### Real-time updates
- Prefer **Server-Sent Events** at `GET /api/jobs/:id/stream` for progress. Simpler than WebSockets, works through Cloudflare fine, avoids reconnection dance.
- Fall back to polling (`GET /api/jobs/:id`) every 1-2 s if EventSource fails.

---

## 4. ML / DSP workers

### Separation worker (Python)
- **Demucs v4** (`htdemucs`, `htdemucs_ft`) as the default — best quality, permissive license
- **Spleeter** as a fast fallback
- **MDX-Net** for vocals-only mode

Runs in a Docker container with PyTorch + CUDA (optional). Reads job from Redis queue, writes output stems to object storage, updates job status.

```
worker/
├── Dockerfile
├── requirements.txt          # torch, demucs, spleeter, librosa, celery
├── app/
│   ├── separator.py          # Demucs wrapper
│   ├── analyzer.py           # tempo/key/structure (librosa + madmom)
│   ├── arranger.py           # instrumental reconstruction
│   ├── encoder.py            # FFmpeg wrapper (WAV/MP3/FLAC/OGG)
│   └── tasks.py              # Celery task definitions
```

### Arrangement engine (Rebuild)
Approach:
1. Run separation to isolate rhythm, harmony, and melody stems.
2. Extract tempo (BPM), downbeats, key (chromagram → Krumhansl-Schmuckler), and section structure (spectral novelty + self-similarity matrix).
3. Estimate chord progression per section (chord recognition on harmony stem).
4. For each selected instrument, generate a MIDI part according to its role (rhythmic/harmonic/melodic).
5. Render MIDI through SoundFont / sample libraries (fluidsynth, sfizz).
6. Mix + master.

The intent is **structured reconstruction, not generative pastiche**. This is important both artistically and legally.

### Encoder service
Thin FastAPI wrapper around FFmpeg:
- WAV: passthrough
- MP3: `libmp3lame -b:a 320k`
- FLAC: `flac -8`
- OGG: `libvorbis -q 6`

---

## 5. Data model

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ
);

CREATE TABLE projects (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name TEXT,
  type TEXT CHECK (type IN ('separation','studio','rebuild')),
  source_file_id UUID,
  metadata JSONB,   -- tempo, key, duration, etc
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE audio_files (
  id UUID PRIMARY KEY,
  storage_key TEXT,       -- e.g. r2://bucket/user/id/file.wav
  mime TEXT,
  bytes BIGINT,
  duration_ms INT,
  sample_rate INT,
  channels INT,
  sha256 TEXT
);

CREATE TABLE stems (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  role TEXT,              -- vocals, drums, bass, other, keys, guitar, lead
  audio_file_id UUID REFERENCES audio_files(id),
  confidence FLOAT
);

CREATE TABLE jobs (
  id UUID PRIMARY KEY,
  user_id UUID,
  project_id UUID,
  type TEXT,
  status TEXT,
  progress INT,
  stage TEXT,
  input JSONB,
  outputs JSONB,
  error JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE INDEX ON jobs (user_id, created_at DESC);
CREATE INDEX ON jobs (status) WHERE status IN ('queued','processing');
```

Authentication can be added later — the initial prototype can operate on anonymous session IDs stored in localStorage.

---

## 6. Storage

Abstract behind a single interface:

```ts
interface StorageProvider {
  put(key: string, data: Blob, opts?: { contentType?: string }): Promise<string>;
  getUrl(key: string, opts?: { expiresIn?: number }): Promise<string>;
  delete(key: string): Promise<void>;
  list(prefix: string): Promise<string[]>;
}
```

Implementations:
- `LocalFilesystemProvider` (development)
- `R2Provider` (Cloudflare R2, S3-compatible)
- `S3Provider` (AWS or MinIO)
- `GCSProvider` (Google Cloud Storage)

Key layout: `{userId}/{projectId}/{artifact}` — e.g. `u_123/p_abc/stems/drums.wav`.

---

## 7. Deployment

### Recommended (free-tier friendly)

| Component | Host | Notes |
|---|---|---|
| Frontend (SPA) | **Cloudflare Pages** | Free tier is generous |
| API Gateway | **Cloudflare Workers** or **Fly.io** | Workers if lightweight; Fly for stateful |
| Job queue | **Upstash Redis** (free) or **Fly.io Redis** | |
| Database | **Neon Postgres** (free) or **Supabase** | |
| Object storage | **Cloudflare R2** | 10 GB free / mo, no egress fees |
| ML worker | **Fly.io GPU** or **Modal** or **Runpod** | GPU as needed |
| CDN | Cloudflare | Front of Pages + R2 |

### Environment variables

Create `.env` from `.env.example`:

```
# Frontend
VITE_API_BASE_URL=https://api.rhythmin.app
VITE_SEPARATION_MODE=demo      # or "production"
VITE_STORAGE_PUBLIC_URL=https://cdn.rhythmin.app

# Gateway
DATABASE_URL=postgres://...
REDIS_URL=redis://...
JWT_SECRET=...
STORAGE_BACKEND=r2             # r2 | s3 | local
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=rhythmin-prod

# Workers
DEMUCS_MODEL=htdemucs
FFMPEG_BIN=/usr/bin/ffmpeg
MAX_INPUT_MB=100
MAX_DURATION_SEC=600
```

**Never hard-code secrets.** Every config value comes from env.

---

## 8. Security

- **File validation**: server-side MIME + magic-bytes check (`ffprobe`), reject anything not an audio format. Sanitize filenames.
- **Size limit**: 100 MB per file (configurable via `MAX_INPUT_MB`).
- **Duration limit**: 10 minutes per job (configurable via `MAX_DURATION_SEC`).
- **Rate limiting**: per-IP + per-user, on `/api/upload` and job-creation endpoints.
- **Signed URLs**: object-storage downloads served via time-limited signed URLs, never public buckets.
- **No arbitrary execution**: uploaded files are never executed or `eval`-ed; only decoded through FFmpeg.
- **CORS**: allowlist only your frontend origins.
- **CSP**: strict on the frontend; only `unpkg.com` for CDN'd libs, or self-host them.

---

## 9. What's real vs. demo in this repo

| Feature | Status | Notes |
|---|---|---|
| Landing page mini-mixer | ✅ **Real** | Web Audio playback, real waveforms, real solo/mute/volume |
| Stem mixer (`app/mixer.html`) | ✅ **Real** | Full playback, per-stem controls, WAV export via OfflineAudioContext |
| Studio drum machine (`app/studio.html`) | ✅ **Real** | Tone.js `MembraneSynth`/`NoiseSynth`/`MetalSynth`, 16-step sequencer |
| Studio synth | ✅ **Real** | Tone.js `MonoSynth`, ADSR + resonant lowpass, QWERTY + mouse playable |
| Studio timeline | 🟡 **Design-real** | Clips render, drag works, but clip playback is the drum machine only |
| Upload validation | ✅ **Real** | MIME check, size check, `decodeAudioData` verify |
| Separation pipeline UI | 🟡 **Simulated** | Animated staged pipeline. Real separation requires Demucs backend. |
| AI Rebuild | 🟡 **UI complete, mock output** | Analysis values pre-computed for demo. Real rebuild needs arrangement engine. |
| Export WAV | ✅ **Real** | Rendered via `OfflineAudioContext` and 16-bit PCM encoder |
| Export MP3 / FLAC / OGG | ❌ **Disabled** | Requires FFmpeg backend (see `encoder` worker) |
| Theme (dark/light) | ✅ **Real** | CSS variables, `localStorage`-persisted |

---

## 10. Recommended next engineering steps

1. **Scaffold Vite + React + TS project**; port `shared/rhythmin.css` to Tailwind config + CSS variables, port `shared/audio-engine.js` to `lib/audio/StemEngine.ts`.
2. **Stand up the API gateway** with Fastify or Hono, implement `/api/upload` and `/api/jobs` first.
3. **Build the separation worker** in a Docker container with Demucs v4; wire it to a Redis queue via BullMQ or Celery.
4. **Wire the encoder worker** with FFmpeg so MP3/FLAC/OGG exports actually work.
5. **Add auth** — start with magic-link email or Clerk/Supabase Auth.
6. **Storage** — swap `LocalFilesystemProvider` for R2 in production.
7. **Arrangement engine** — this is the deepest piece. Start with a heuristic version (extract features → template-based MIDI generation) before attempting anything ML-generative.
8. **Observability** — Sentry for errors, PostHog or a self-hosted analytics for usage.
9. **Testing** — Vitest for services/utils, Playwright for a smoke suite that covers Upload → Separate → Mixer → Export.

---

## 11. What NOT to do

- ❌ Do not run Demucs in the browser — it will die on anything longer than a few seconds even with WASM. Backend workers only.
- ❌ Do not put the ML model in the Cloudflare Worker. Cloudflare Workers do not have arbitrary Python/PyTorch — use them for the gateway only, run models on a container host.
- ❌ Do not pretend a fake result is real. Every simulated pipeline in this prototype is labelled as such. Keep it that way in production.
- ❌ Do not bypass copyright. This tool is for material the user has the right to use. See the responsible-use notice in `app/rebuild.html`.

---

## License
MIT. Ship it, fork it, self-host it.
