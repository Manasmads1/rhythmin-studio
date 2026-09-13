# Frontend Agent Notes

- Preserve browser-first playback and the existing `StemEngine` contract.
- Use `shared/backend-api.js` for backend calls; do not scatter fetch logic through pages.
- Keep demo mode explicit and functional when no backend URL is configured.
- Persist local state before remote saves complete.
- Release object URLs and audio buffers on replacement/removal.
- Keep landing-page assets light and lazy-load instrument code.
- Verify keyboard, reduced motion, mobile layout, and audio lifecycle behavior.
