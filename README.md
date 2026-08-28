# RhythmIn

> Separate. Create. Rebuild.

A browser-native audio workstation for stem separation, multi-track composition, and AI-assisted arrangement. Built on the Web Audio API + Tone.js, designed as the foundation for a serious open-source music technology product.

---

## What's in this repo

This is the **frontend prototype**. It runs entirely in the browser with no server dependencies — every playback path uses real Web Audio, every instrument is a real Tone.js voice, every waveform is real audio data.

Anything that would normally require a backend (Demucs separation, MP3/FLAC/OGG encoding, cloud storage, the arrangement engine) is either implemented as a clearly-labelled demo layer or shown as a `needs server` disabled control. See `ARCHITECTURE.md` for the production contract.

## Structure

```
index.html                    Landing page (interactive mini-mixer)
app/
  dashboard.html              Projects
  upload.html                 Upload + separation pipeline
  mixer.html                  Stem mixer — REAL Web Audio
  studio.html                 Multi-track timeline + drum machine + synth — REAL Tone.js
  rebuild.html                AI arrangement setup
  settings.html               Preferences + backend config
shared/
  rhythmin.css                Design system (CSS variables, dark + light)
  rhythmin-ui.js              Shared UI: sidebar, transport, toast, modal, formatters
  audio-engine.js             StemEngine class + WAV encode/decode + peak extraction
assets/
  stems/                      Demo stems (drums, bass, keys, lead, full-mix) — synthesized WAVs
ARCHITECTURE.md               Backend contract, deployment, service abstractions
```

## Run locally

No build step — this is plain HTML/CSS/JS.

```bash
npx serve .
# or
python3 -m http.server 8000
```

Open `http://localhost:8000`.

> Some browsers block audio autoplay until the first user interaction — click **Play** on the hero mini-mixer to unlock the AudioContext.

## Keyboard shortcuts

| Key | Action |
|---|---|
| `Space` | Play / pause |
| `Esc` | Stop |
| `L` | Toggle loop |
| `A S D F G H J K` | Piano white keys (Studio) |
| `W E T Y U O P` | Piano black keys (Studio) |

## What's real vs. demo

See the table in `ARCHITECTURE.md` §9. Short version:

- ✅ Mixer playback, per-stem controls, WAV export, meters, waveforms — all real Web Audio
- ✅ Drum machine + synth — real Tone.js
- 🟡 Separation & Rebuild pipelines — UI is real, processing is simulated
- ❌ MP3 / FLAC / OGG export — disabled, needs FFmpeg backend

## Moving to production

Read `ARCHITECTURE.md`. TL;DR:
1. Port the frontend to Vite + React + TypeScript
2. Stand up a Node API gateway (Fastify/Hono)
3. Add a Python worker with Demucs v4 for real separation
4. Add an FFmpeg encoder worker for the missing formats
5. Deploy: Cloudflare Pages (frontend) + Fly.io/Modal (workers) + R2 (storage) + Neon (Postgres)

## License

MIT.

## Responsible use

RhythmIn processes audio you supply. Do not use it to bypass copyright, DRM, or paywalls. The Rebuild feature generates an original arrangement inspired by your reference — not a copy. Only upload material you have the right to work with.
