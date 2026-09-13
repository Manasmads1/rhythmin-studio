# RhythmIN Implementation Roadmap

## Current state

The repository is a static, browser-first audio workstation. The browser already owns Web Audio playback, waveform rendering, mixer controls, Tone.js instruments, theme switching, and WAV export. Server-dependent capabilities are isolated behind demo behavior.

## Milestones

| Milestone | Outcome | Status |
|---|---|---|
| Product foundation | Distinctive music-lab UI, accessible states, lightweight browser workflows | In progress |
| Backend contract | Typed API adapter, upload/job/project contracts, demo processor | In progress |
| Persistence | Supabase schema, storage policies, project/job persistence | Planned |
| Real processing | Optional Demucs/FFmpeg worker behind processor interface | Planned |
| Public launch | Cloudflare Pages frontend, Supabase configuration, acceptance tests | Planned |

## Acceptance criteria

- File selection, replacement, drag/drop, validation, and preview work without page reload.
- Mixer adjustments survive tab changes and project refreshes when persistence is enabled.
- Backend failures fall back visibly to demo mode; no fake successful ML result is shown.
- Large files are rejected before processing and browser memory is bounded.
- Jobs expose queued, processing, completed, failed, and cancelled states.
- Documentation explains what is real, simulated, local, or externally dependent.

## Risks

Free infrastructure cannot provide unlimited GPU Demucs processing. The product therefore treats real ML separation as an optional processor adapter and keeps all core editing and playback useful without it.

## Next actions

1. Complete local backend adapter and tests.
2. Add Supabase schema and secure storage policies.
3. Connect upload/job lifecycle to the frontend.
4. Test browser-first editing and persistence.
5. Add a remote processing worker only when a compatible runtime is available.
