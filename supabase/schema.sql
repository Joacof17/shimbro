-- Esquema de Shimbro en Supabase.
-- Modelo documento: una fila por usuario con todo su EstadoApp como JSONB
-- (rutinas, historial, sesiones). Mapea 1:1 con el estado local, así la
-- sincronización es trivial: leer el blob al iniciar sesión, escribirlo al cambiar.
--
-- Correr este archivo una vez en el SQL Editor del dashboard de Supabase.

create table if not exists public.estado_usuario (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  estado     jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Row Level Security: cada usuario solo accede a SU fila.
alter table public.estado_usuario enable row level security;

drop policy if exists "leer propio estado" on public.estado_usuario;
create policy "leer propio estado" on public.estado_usuario
  for select using (auth.uid() = user_id);

drop policy if exists "insertar propio estado" on public.estado_usuario;
create policy "insertar propio estado" on public.estado_usuario
  for insert with check (auth.uid() = user_id);

drop policy if exists "actualizar propio estado" on public.estado_usuario;
create policy "actualizar propio estado" on public.estado_usuario
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Mantener updated_at al día.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_estado_updated_at on public.estado_usuario;
create trigger trg_estado_updated_at
  before update on public.estado_usuario
  for each row execute function public.touch_updated_at();
