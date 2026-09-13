create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  type text not null default 'separation',
  source_file_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audio_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  storage_key text not null,
  name text not null,
  mime text not null,
  bytes bigint not null,
  duration numeric,
  sample_rate integer,
  channels integer,
  sha256 text,
  created_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  type text not null,
  processor text not null,
  status text not null default 'queued',
  progress integer not null default 0 check (progress between 0 and 100),
  stage text not null default 'queued',
  input jsonb not null default '{}'::jsonb,
  outputs jsonb,
  error jsonb,
  cancel_requested boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tracks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  role text not null,
  name text not null,
  position integer not null default 0,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;
alter table public.audio_files enable row level security;
alter table public.jobs enable row level security;
alter table public.tracks enable row level security;

create policy "users manage own projects" on public.projects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users manage files in own projects" on public.audio_files for all using (exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())) with check (exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()));
create policy "users manage jobs in own projects" on public.jobs for all using (exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())) with check (exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()));
create policy "users manage tracks in own projects" on public.tracks for all using (exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())) with check (exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()));
