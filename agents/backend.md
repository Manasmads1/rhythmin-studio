# Backend Agent Notes

Keep the API contract stable and validate every upload before storing it. Use UUIDs, safe filenames, bounded file sizes, explicit processor names, and structured errors. Never expose service-role keys, filesystem paths, or stack traces. Local SQLite and disk are adapters; Supabase is the planned production persistence layer.
