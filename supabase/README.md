# Supabase Integration

The SQL migration in `migrations/001_rhythmin.sql` is a blueprint for the planned free-tier persistence layer. Apply it only to a Supabase project owned by the user. Keep the project URL and public anon key in local environment configuration; never commit service-role keys.

The current local backend remains the default for development. Supabase integration should be enabled after the local API and UI flows pass acceptance tests.

Recommended private Storage buckets are `source-audio`, `stems`, and `exports`. Use signed URLs and direct browser uploads so audio does not pass through an Edge Function body.
