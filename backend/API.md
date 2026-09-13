# RhythmIN Backend API

Base URL is configured by `RHYTHMIN_BACKEND_URL`.

## Health

`GET /api/health`

Returns service status, processor mode, storage mode, and version.

## Upload

`POST /api/upload` with multipart field `file`.

Returns:

```json
{"fileId":"uuid","projectId":"uuid","name":"track.wav","bytes":1234,"mime":"audio/wav","duration":12.3}
```

## Separation

`POST /api/separate`

```json
{"fileId":"uuid","projectId":"uuid","stems":["vocals","drums","bass","other"],"model":"demo","format":"wav"}
```

Returns `{ "jobId": "uuid" }`.

## Jobs

`GET /api/jobs/{jobId}` returns status, progress, stage, processor, outputs, and error.

`GET /api/jobs/{jobId}/stream` returns `text/event-stream` progress events.

`POST /api/jobs/{jobId}/cancel` requests cancellation.

## Stems

`GET /api/stems/{projectId}` returns generated stem metadata and local/download URLs.

## Projects

`GET /api/projects/{projectId}` returns project metadata and tracks.

`PUT /api/projects/{projectId}` saves a revision-safe project snapshot.

## Errors

Errors use `{ "error": { "code": "...", "message": "..." } }` and never expose filesystem paths or secrets.
