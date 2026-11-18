-- Shimbro · Crews + Perfil/Apodo
-- Correr una vez en el SQL Editor de Supabase (después del schema.sql base).
--
-- Modelo:
--  perfil         : apodo + "resumen" (por ejercicio: mejor peso, si está en rutina).
--                   El resumen es lo único que ven los compañeros de crew (privacidad).
--  crews          : una crew con código de acceso único (6 chars A-Z0-9, sin caducar).
--  crew_miembros  : quién pertenece a qué crew.
-- La visibilidad entre miembros se resuelve con funciones SECURITY DEFINER para evitar
-- la recursión de RLS al consultar la propia tabla de membresías.

-- ---------- PERFIL ----------
create table if not exists public.perfil (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  apodo      text,
  resumen    jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.perfil enable row level security;
grant select, insert, update on public.perfil to authenticated;

-- ---------- CREWS ----------
create table if not exists public.crews (
  id         uuid primary key default gen_random_uuid(),
  codigo     text unique not null,
  nombre     text,
  creado_por uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.crews enable row level security;
grant select on public.crews to authenticated;

create table if not exists public.crew_miembros (
  crew_id   uuid references public.crews (id) on delete cascade,
  user_id   uuid references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (crew_id, user_id)
);
alter table public.crew_miembros enable row level security;
grant select, insert, delete on public.crew_miembros to authenticated;

-- ---------- Funciones de visibilidad (SECURITY DEFINER evita recursión de RLS) ----------
create or replace function public.es_miembro(c uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists(
    select 1 from public.crew_miembros
    where crew_id = c and user_id = auth.uid()
  );
$$;

create or replace function public.comparte_crew(objetivo uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists(
    select 1
    from public.crew_miembros m1
    join public.crew_miembros m2 on m1.crew_id = m2.crew_id
    where m1.user_id = auth.uid() and m2.user_id = objetivo
  );
$$;

-- ---------- Políticas RLS ----------
-- perfil: cada uno su fila; lectura también para compañeros de crew (para el tablero).
drop policy if exists "perfil leer" on public.perfil;
create policy "perfil leer" on public.perfil
  for select using (auth.uid() = user_id or public.comparte_crew(user_id));

drop policy if exists "perfil insertar" on public.perfil;
create policy "perfil insertar" on public.perfil
  for insert with check (auth.uid() = user_id);

drop policy if exists "perfil actualizar" on public.perfil;
create policy "perfil actualizar" on public.perfil
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- crews: solo las ven sus miembros.
drop policy if exists "crews leer" on public.crews;
create policy "crews leer" on public.crews
  for select using (public.es_miembro(id));

-- crew_miembros: ves los miembros de tus crews; podés salirte vos mismo.
drop policy if exists "miembros leer" on public.crew_miembros;
create policy "miembros leer" on public.crew_miembros
  for select using (public.es_miembro(crew_id));

drop policy if exists "miembros salir" on public.crew_miembros;
create policy "miembros salir" on public.crew_miembros
  for delete using (user_id = auth.uid());

-- ---------- Crear / unirse (SECURITY DEFINER: generan/leen código sin exponer la tabla) ----------
create or replace function public.gen_codigo()
returns text language plpgsql as $$
declare chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; c text := ''; i int;
begin
  for i in 1..6 loop
    c := c || substr(chars, 1 + floor(random() * 36)::int, 1);
  end loop;
  return c;
end; $$;

create or replace function public.crear_crew(p_nombre text)
returns public.crews language plpgsql security definer set search_path = public as $$
declare nuevo public.crews; cod text; intentos int := 0;
begin
  loop
    cod := public.gen_codigo();
    begin
      insert into public.crews (codigo, nombre, creado_por)
        values (cod, nullif(trim(p_nombre), ''), auth.uid())
        returning * into nuevo;
      exit;
    exception when unique_violation then
      intentos := intentos + 1;
      if intentos > 10 then raise exception 'No se pudo generar un código'; end if;
    end;
  end loop;
  insert into public.crew_miembros (crew_id, user_id) values (nuevo.id, auth.uid())
    on conflict do nothing;
  return nuevo;
end; $$;

create or replace function public.unirse_a_crew(p_codigo text)
returns public.crews language plpgsql security definer set search_path = public as $$
declare c public.crews;
begin
  select * into c from public.crews where codigo = upper(trim(p_codigo));
  if c.id is null then raise exception 'Código inválido'; end if;
  insert into public.crew_miembros (crew_id, user_id) values (c.id, auth.uid())
    on conflict do nothing;
  return c;
end; $$;

grant execute on function public.crear_crew(text)   to authenticated;
grant execute on function public.unirse_a_crew(text) to authenticated;
grant execute on function public.es_miembro(uuid)    to authenticated;
grant execute on function public.comparte_crew(uuid) to authenticated;
