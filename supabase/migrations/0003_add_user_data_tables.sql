-- Create table for event notes
create table if not exists public.event_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  notes text not null default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

-- Create table for event speakers (admin only)
create table if not exists public.event_speakers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create table for event tasks
create table if not exists public.event_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  text text not null,
  completed boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS on all tables
alter table public.event_notes enable row level security;
alter table public.event_speakers enable row level security;
alter table public.event_tasks enable row level security;

-- Policies for event_notes (users can only see/edit their own notes)
create policy if not exists event_notes_read_own on public.event_notes for select using (auth.uid() = user_id);
create policy if not exists event_notes_write_own on public.event_notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Policies for event_speakers (read for all, write only for admins)
create policy if not exists event_speakers_read_all on public.event_speakers for select using (true);
create policy if not exists event_speakers_write_admin on public.event_speakers for all using (
  exists (
    select 1 from public.user_profiles 
    where user_profiles.id = auth.uid() 
    and user_profiles.role = 'admin'
  )
) with check (
  exists (
    select 1 from public.user_profiles 
    where user_profiles.id = auth.uid() 
    and user_profiles.role = 'admin'
  )
);

-- Policies for event_tasks (users can only see/edit their own tasks)
create policy if not exists event_tasks_read_own on public.event_tasks for select using (auth.uid() = user_id);
create policy if not exists event_tasks_write_own on public.event_tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists event_notes_user_id_idx on public.event_notes(user_id);
create index if not exists event_tasks_user_id_idx on public.event_tasks(user_id);
create index if not exists event_tasks_completed_idx on public.event_tasks(completed);
