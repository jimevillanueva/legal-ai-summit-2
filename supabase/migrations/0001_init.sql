-- Enable extensions if needed
create extension if not exists pgcrypto;

-- Sessions (denormalized speakers as jsonb for simplicidad)
create table if not exists public.sessions (
  id text primary key,
  title text not null,
  speakers jsonb not null default '[]'::jsonb,
  room text,
  day date not null,
  time text not null,
  notes text,
  status text not null default 'Confirmada',
  has_conflict boolean not null default false,
  zoom_link text,
  border_color text,
  created_at timestamptz default now()
);

-- Index for schedule queries
create index if not exists sessions_day_time_idx on public.sessions(day, time);

-- RLS
alter table public.sessions enable row level security;

-- Public read
create policy if not exists sessions_read_all on public.sessions for select using (true);

-- Authenticated write
create policy if not exists sessions_write_auth on public.sessions for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
