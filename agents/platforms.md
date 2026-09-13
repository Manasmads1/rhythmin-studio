# Platform Decision Record

## GitHub Pages

Current fallback for the static site. Reliable and already published. It cannot execute backend code.

## Cloudflare Pages

Preferred future frontend host for a free HTTPS subdomain and global static delivery. Pages Functions/Workers can handle lightweight orchestration but not Demucs/PyTorch.

## Supabase

Preferred free backend foundation for Postgres, Storage, Auth, and Edge Functions. Use direct storage uploads and keep privileged keys server-side.

## Vercel

Valid for a future React frontend or lightweight API, but it does not remove the need for external object storage and a separate heavy audio worker.

## External Python worker

Required for real Demucs and FFmpeg processing. A compatible free option is not guaranteed, so the product must remain useful with the explicit browser/demo processor.

## Secrets

Never commit service-role keys, database passwords, or worker tokens. Public frontend keys are limited to client-safe configuration; privileged operations remain server-side.
