# Backend Backlog

## Now

- [ ] FastAPI health endpoint and CORS for the published frontend.
- [ ] Upload validation and local storage provider.
- [ ] SQLite metadata for files, projects, stems, and jobs.
- [ ] Job lifecycle with polling and cancellation.
- [ ] Explicit demo processor and processor status.
- [ ] Frontend API adapter with demo fallback.

## Next

- [ ] Supabase schema and row-level security policies.
- [ ] Direct signed uploads to private storage buckets.
- [ ] Project and track persistence with debounced saves.
- [ ] SSE or realtime job updates.
- [ ] Browser WAV export integration with export records.

## Later

- [ ] Remote Demucs worker contract.
- [ ] FFmpeg MP3, FLAC, and OGG export worker.
- [ ] Authentication and account recovery.
- [ ] Project revisions and conflict handling.
- [ ] Cleanup and retention automation.

## Blocked / external

- Real Demucs requires a compatible Python runtime and enough CPU/GPU capacity.
- Public Supabase integration requires a project URL and public client key configured securely.
- Custom domain requires a domain owned by the user.

## Definition of done

Every task must include error handling, a loading state, automated coverage where practical, documentation, and a browser verification path.
