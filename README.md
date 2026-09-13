# RhythmIN

> Separate. Create. Rebuild.

RhythmIN is a browser-first music workspace for uploading audio, exploring stems, mixing tracks, playing instruments, and building arrangements. The UI is intentionally lightweight: Web Audio and Tone.js handle interaction in the browser, while the optional backend handles uploads, projects, jobs, and generated artifacts.

## Current capabilities

| Capability | Status |
|---|---|
| Dark/light themes and responsive studio UI | Working |
| Browser playback, waveform previews, mixer controls, meters | Working |
| Drum machine and synth interactions | Working in browser |
| WAV export | Working in browser |
| Local FastAPI upload/job backend | Working starter scaffold |
| Supabase persistence | Planned integration |
| Real Demucs separation | Adapter documented; requires compatible worker runtime |
| MP3/FLAC/OGG export | FFmpeg worker adapter planned |

## Repository structure

```text
index.html                 Landing page
app/                       Dashboard, upload, mixer, studio, rebuild, settings
shared/                    CSS, UI helpers, audio engine, backend adapter
backend/                   FastAPI starter service and backend documentation
agents/                    Frontend, backend, QA, and platform notes
assets/                    Small visual assets
PLAN.md                    Product roadmap
DESIGN.md                  Visual and UX system
ARCHITECTURE.md            System architecture and boundaries
```

## Run the frontend

```bash
python3 -m http.server 8000
```

Open `http://127.0.0.1:8000`.

## Run the starter backend

```bash
cd backend
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8787
```

Check `http://127.0.0.1:8787/api/health`. In RhythmIN, open Settings and set the Separation API to `http://127.0.0.1:8787`. The upload flow will then use the backend adapter. Clear the value to restore demo mode.

The starter processor copies the uploaded source into explicit demo stem outputs so the entire upload → job → mixer lifecycle can be tested without claiming real ML separation. A real Demucs/FFmpeg processor can be added behind the documented adapter later.

## Free deployment direction

The planned free stack is Cloudflare Pages for the static frontend and Supabase for database, storage, and lightweight orchestration. Neither Pages Functions nor Supabase Edge Functions should run Demucs/PyTorch. Real separation requires a separate compatible Python worker; until one is configured, the product remains honest and usable in browser/demo mode.

## Responsible use

Only upload audio you own or have permission to process. RhythmIN is not intended to bypass DRM, paywalls, or copyright controls. See `PLAN.md`, `DESIGN.md`, `ARCHITECTURE.md`, and `backend/` for the full product and engineering record.
