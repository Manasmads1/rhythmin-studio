# Processor Contract

## Demo processor

The demo processor is deterministic and explicit. It records `processor: demo`, advances through the same job stages as a real worker, and can produce browser-compatible demo outputs when sample assets are available. It must never be labelled as Demucs or real separation.

## Remote processor

The remote processor will accept a source storage key, selected stem roles, model, and output format. It will return output storage keys and metadata. Worker callbacks must include a signed job token and must validate job ownership before updating status.

## Demucs requirements

A real worker needs Python, PyTorch, Demucs, enough temporary disk for decoded audio, and a process supervisor. CPU-only execution may be slow. GPU execution is optional and cannot be assumed on free serverless hosting.

## FFmpeg requirements

The encoder validates input/output paths, uses fixed argument lists, applies timeouts, and reports stderr without exposing host paths. WAV may remain browser-native; MP3, FLAC, and OGG belong in the encoder worker.
