-- Crear tabla contacts para usuarios tipo 'user'
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Crear tabla user_profiles para usuarios tipo 'admin'
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  role text not null default 'admin',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Habilitar RLS en las nuevas tablas
alter table public.contacts enable row level security;
alter table public.user_profiles enable row level security;

-- Políticas para contacts (lectura pública, escritura solo para admins)
create policy if not exists contacts_read_all on public.contacts for select using (true);
create policy if not exists contacts_write_admin on public.contacts for all using (
  exists (
    select 1 from public.user_profiles 
    where user_profiles.id = auth.uid() 
    and user_profiles.role = 'admin'
  )
);

-- Políticas para user_profiles (solo el propio usuario puede ver su perfil)
create policy if not exists user_profiles_read_own on public.user_profiles for select using (auth.uid() = id);
create policy if not exists user_profiles_update_own on public.user_profiles for update using (auth.uid() = id);

-- Actualizar políticas de sessions para roles
drop policy if exists sessions_write_auth on public.sessions;
create policy if not exists sessions_write_admin on public.sessions for all using (
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

-- Función para obtener el rol del usuario actual
create or replace function get_user_role()
returns text
language sql
security definer
as $$
  select case 
    when exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin') then 'admin'
    when exists (select 1 from public.contacts where email = (select email from auth.users where id = auth.uid())) then 'user'
    else 'guest'
  end;
$$;

-- Función para verificar si el usuario es admin
create or replace function is_admin()
returns boolean
language sql
security definer
as $$
  select exists (
    select 1 from public.user_profiles 
    where id = auth.uid() 
    and role = 'admin'
  );
$$;

-- Función para verificar si el usuario es user (está en contacts)
create or replace function is_user()
returns boolean
language sql
security definer
as $$
  select exists (
    select 1 from public.contacts 
    where email = (select email from auth.users where id = auth.uid())
  );
$$;



