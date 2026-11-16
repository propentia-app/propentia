-- propentia — INSTALACIÓN COMPLETA de un proyecto de Supabase desde cero
-- Une, en el orden correcto, supabase-setup.sql, las tablas que ese archivo no crea,
-- supabase-cuentas.sql, supabase-aprobacion.sql y supabase-marca.sql.
-- Se pega completo en Supabase → SQL Editor y se corre UNA vez, DESPUÉS de crear tu cuenta
-- en la app. Antes, cambia TU_CORREO@ejemplo.com (aparece 2 veces) por el correo de tu cuenta.
-- Corre en una sola transacción: si algo falla, no queda nada a medias.

-- ===== 1) supabase-setup.sql =====
-- FichaFlow — esquema para compartir biblioteca y diseño predeterminado
-- entre dispositivos (escritorio + iPhone) y entre las personas que
-- comparten esta app. Ya se corrió una vez contra el proyecto de
-- Supabase en uso — este archivo se conserva como referencia, por si
-- alguna vez hay que recrear el proyecto desde cero.

-- Cada página guardada en la biblioteca es su propia fila — así, si dos
-- personas agregan una página cada quien al mismo tiempo desde
-- dispositivos distintos, no hay ningún choque: son dos inserciones
-- independientes, no una sola lista que se sobreescribe completa.
create table if not exists library_pages (
  id text primary key,
  saved_at bigint not null,
  ficha jsonb not null
);

-- El diseño predeterminado sí es un solo objeto compartido (no una
-- lista), así que es una tabla de una sola fila fija (id siempre 1).
create table if not exists default_design (
  id int primary key default 1,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  constraint default_design_single_row check (id = 1)
);

-- Presets con nombre ("Piedra Caliza", "FINAL", etc.) — igual que
-- library_pages, una fila por preset, para poder guardar varias
-- configuraciones y alternar entre ellas sin ajustar todo a mano.
create table if not exists design_presets (
  id text primary key,
  name text not null,
  saved_at bigint not null,
  value jsonb not null
);

alter table library_pages enable row level security;
alter table default_design enable row level security;
alter table design_presets enable row level security;

-- Acceso abierto para la llave "anon" (la misma que vive en js/sync.js)
-- — es la llave pública que va en el código de la app, protegida solo
-- por no ser conocida fuera del grupo que la usa. No hay contraseñas
-- de por medio; es un espacio compartido, no cuentas individuales.
create policy "anon full access to library_pages" on library_pages
  for all using (true) with check (true);

create policy "anon full access to default_design" on default_design
  for all using (true) with check (true);

create policy "anon full access to design_presets" on design_presets
  for all using (true) with check (true);

-- =====================================================================
-- Tablas que supabase-setup.sql no crea (existen en el proyecto original; esquema leído de él)
-- =====================================================================
alter table library_pages add column if not exists name text;

create table if not exists library_page_assets (
  page_id text not null references library_pages(id) on delete cascade,
  id text not null,
  data text not null,
  primary key (page_id, id)
);

create table if not exists saved_documents (
  id text primary key,
  name text not null,
  saved_at bigint not null,
  updated_at bigint not null,
  meta jsonb not null
);

create table if not exists saved_document_fichas (
  saved_document_id text not null references saved_documents(id) on delete cascade,
  id text not null,
  ficha jsonb not null,
  primary key (saved_document_id, id)
);

create table if not exists saved_document_mapas (
  saved_document_id text not null references saved_documents(id) on delete cascade,
  id text not null,
  mapa jsonb not null,
  primary key (saved_document_id, id)
);

create table if not exists saved_document_assets (
  saved_document_id text not null references saved_documents(id) on delete cascade,
  id text not null,
  data text not null,
  primary key (saved_document_id, id)
);

alter table library_page_assets enable row level security;
alter table saved_documents enable row level security;
alter table saved_document_fichas enable row level security;
alter table saved_document_mapas enable row level security;
alter table saved_document_assets enable row level security;

-- ===== 2) supabase-cuentas.sql =====
-- propentia — cuentas por usuario + biblioteca privada con compartir por correo
--
-- Se corre UNA sola vez en Supabase → SQL Editor, DESPUÉS de crear tu propia cuenta
-- desde la app (pantalla "Crear cuenta"). Ver CUENTAS-Y-COMPARTIR.md.
--
-- Qué hace:
--  1. Todo lo que existe hoy (biblioteca, documentos guardados, presets y diseño
--     predeterminado) pasa a ser de TU cuenta.
--  2. Cada tabla queda protegida: cada persona solo ve y toca lo suyo.
--  3. La biblioteca es privada, y el dueño puede compartir una página con otra
--     cuenta por correo (la otra persona solo la ve y la usa; no la edita ni borra).
--
-- ⚠ Antes de correrlo, cambia el correo de la línea marcada por el de TU cuenta.
-- ⚠ Al terminar, la versión VIEJA de la app (la que no pide sesión) deja de poder
--   leer ni guardar. Publica la versión nueva justo después.

-- 1) Dueño de todo lo existente ------------------------------------------------
do $$
declare
  owner uuid;
begin
  select id into owner from auth.users
  where lower(email) = lower('TU_CORREO@ejemplo.com');   -- ← cambia esto por tu correo

  if owner is null then
    raise exception 'No existe ninguna cuenta con ese correo. Crea tu cuenta primero en la app y revisa que el correo esté bien escrito.';
  end if;

  alter table saved_documents add column if not exists user_id uuid references auth.users(id) on delete cascade;
  update saved_documents set user_id = owner where user_id is null;
  alter table saved_documents alter column user_id set default auth.uid();
  alter table saved_documents alter column user_id set not null;

  alter table design_presets add column if not exists user_id uuid references auth.users(id) on delete cascade;
  update design_presets set user_id = owner where user_id is null;
  alter table design_presets alter column user_id set default auth.uid();
  alter table design_presets alter column user_id set not null;

  alter table default_design add column if not exists user_id uuid references auth.users(id) on delete cascade;
  update default_design set user_id = owner where user_id is null;
  alter table default_design drop constraint if exists default_design_single_row;
  alter table default_design drop constraint if exists default_design_pkey;
  alter table default_design drop column if exists id;
  alter table default_design alter column user_id set default auth.uid();
  alter table default_design alter column user_id set not null;
  alter table default_design add primary key (user_id);

  alter table library_pages add column if not exists user_id uuid references auth.users(id) on delete cascade;
  update library_pages set user_id = owner where user_id is null;
  alter table library_pages alter column user_id set default auth.uid();
  alter table library_pages alter column user_id set not null;
end $$;

create index if not exists saved_documents_user_id_idx on saved_documents (user_id);
create index if not exists design_presets_user_id_idx on design_presets (user_id);
create index if not exists library_pages_user_id_idx on library_pages (user_id);

-- 2) Perfiles (correo de cada cuenta) y páginas compartidas -------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null
);
insert into profiles (id, email) select id, email from auth.users on conflict (id) do update set email = excluded.email;

create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email) values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

create table if not exists library_shares (
  page_id text not null references library_pages(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (page_id, user_id)
);
create index if not exists library_shares_user_id_idx on library_shares (user_id);

-- 3) Quita las reglas viejas de "acceso total para cualquiera" ---------------
do $$
declare
  r record;
begin
  for r in
    select policyname, tablename from pg_policies
    where schemaname = 'public'
      and tablename in ('library_pages', 'library_page_assets', 'saved_documents', 'saved_document_fichas',
                        'saved_document_mapas', 'saved_document_assets', 'design_presets', 'default_design',
                        'profiles', 'library_shares')
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

alter table library_pages enable row level security;
alter table library_page_assets enable row level security;
alter table saved_documents enable row level security;
alter table saved_document_fichas enable row level security;
alter table saved_document_mapas enable row level security;
alter table saved_document_assets enable row level security;
alter table design_presets enable row level security;
alter table default_design enable row level security;
alter table profiles enable row level security;
alter table library_shares enable row level security;

-- 4) Reglas nuevas: solo con sesión iniciada y solo lo propio ----------------
create policy "own saved_documents" on saved_documents
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "own saved_document_fichas" on saved_document_fichas
  for all to authenticated
  using (exists (select 1 from saved_documents d where d.id = saved_document_id and d.user_id = (select auth.uid())))
  with check (exists (select 1 from saved_documents d where d.id = saved_document_id and d.user_id = (select auth.uid())));

create policy "own saved_document_mapas" on saved_document_mapas
  for all to authenticated
  using (exists (select 1 from saved_documents d where d.id = saved_document_id and d.user_id = (select auth.uid())))
  with check (exists (select 1 from saved_documents d where d.id = saved_document_id and d.user_id = (select auth.uid())));

create policy "own saved_document_assets" on saved_document_assets
  for all to authenticated
  using (exists (select 1 from saved_documents d where d.id = saved_document_id and d.user_id = (select auth.uid())))
  with check (exists (select 1 from saved_documents d where d.id = saved_document_id and d.user_id = (select auth.uid())));

create policy "own design_presets" on design_presets
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "own default_design" on default_design
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Biblioteca: el dueño hace todo; quien recibe una página compartida solo la ve.
create policy "library select own or shared" on library_pages
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or exists (select 1 from library_shares s where s.page_id = library_pages.id and s.user_id = (select auth.uid()))
  );
create policy "library insert own" on library_pages
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "library update own" on library_pages
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "library delete own" on library_pages
  for delete to authenticated using (user_id = (select auth.uid()));

create policy "library assets select" on library_page_assets
  for select to authenticated
  using (exists (
    select 1 from library_pages p
    where p.id = page_id
      and (p.user_id = (select auth.uid())
           or exists (select 1 from library_shares s where s.page_id = p.id and s.user_id = (select auth.uid())))
  ));
create policy "library assets insert own" on library_page_assets
  for insert to authenticated
  with check (exists (select 1 from library_pages p where p.id = page_id and p.user_id = (select auth.uid())));
create policy "library assets update own" on library_page_assets
  for update to authenticated
  using (exists (select 1 from library_pages p where p.id = page_id and p.user_id = (select auth.uid())))
  with check (exists (select 1 from library_pages p where p.id = page_id and p.user_id = (select auth.uid())));
create policy "library assets delete own" on library_page_assets
  for delete to authenticated
  using (exists (select 1 from library_pages p where p.id = page_id and p.user_id = (select auth.uid())));

-- Perfiles: ves el tuyo y el de quien te compartió algo.
create policy "profiles select own or sharer" on profiles
  for select to authenticated
  using (
    id = (select auth.uid())
    or exists (
      select 1 from library_pages p join library_shares s on s.page_id = p.id
      where p.user_id = profiles.id and s.user_id = (select auth.uid())
    )
  );

-- Lo que te compartieron (solo lectura; compartir y quitar pasan por las funciones de abajo).
create policy "shares select recipient" on library_shares
  for select to authenticated using (user_id = (select auth.uid()));

-- 5) Funciones para compartir (solo las puede llamar quien tiene sesión) -----
create or replace function share_library_page(p_page text, p_email text) returns text
language plpgsql security definer set search_path = public as $$
declare target uuid;
begin
  if not exists (select 1 from library_pages where id = p_page and user_id = auth.uid()) then
    raise exception 'No eres el dueño de esta página.';
  end if;
  select id into target from auth.users where lower(email) = lower(trim(p_email));
  if target is null then return 'not_found'; end if;
  if target = auth.uid() then return 'self'; end if;
  insert into library_shares (page_id, user_id) values (p_page, target) on conflict do nothing;
  return 'ok';
end $$;

create or replace function list_library_shares(p_page text) returns table (user_id uuid, email text)
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from library_pages where id = p_page and user_id = auth.uid()) then
    raise exception 'No eres el dueño de esta página.';
  end if;
  return query select s.user_id, u.email::text from library_shares s join auth.users u on u.id = s.user_id
               where s.page_id = p_page order by s.created_at;
end $$;

create or replace function unshare_library_page(p_page text, p_user uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from library_pages where id = p_page and user_id = auth.uid()) then
    raise exception 'No eres el dueño de esta página.';
  end if;
  delete from library_shares where page_id = p_page and user_id = p_user;
end $$;

revoke all on function share_library_page(text, text) from public, anon;
revoke all on function list_library_shares(text) from public, anon;
revoke all on function unshare_library_page(text, uuid) from public, anon;
grant execute on function share_library_page(text, text) to authenticated;
grant execute on function list_library_shares(text) to authenticated;
grant execute on function unshare_library_page(text, uuid) to authenticated;

-- ===== 3) supabase-aprobacion.sql =====
-- propentia — aprobación manual de cuentas + panel de administración
--
-- Se corre UNA sola vez en Supabase → SQL Editor, DESPUÉS de haber corrido supabase-cuentas.sql.
-- Ver CUENTAS-Y-COMPARTIR.md (sección "Aprobar cuentas").
--
-- Qué hace:
--  1. Cada cuenta nueva queda "pendiente": puede entrar y recorrer la app, pero no crear ni
--     guardar nada hasta que tú la apruebes.
--  2. Las cuentas que YA existen quedan aprobadas, y la tuya queda como administrador.
--  3. Crea las funciones del panel de Administración (solo las puede usar un administrador).
--
-- ⚠ Antes de correrlo, cambia el correo de la línea marcada por el de TU cuenta (la misma de antes).

-- 1) Estado y datos de cada cuenta -------------------------------------------
alter table profiles add column if not exists status text not null default 'pending';
alter table profiles add column if not exists is_admin boolean not null default false;
alter table profiles add column if not exists nombre text;
alter table profiles add column if not exists empresa text;
alter table profiles add column if not exists telefono text;
alter table profiles add column if not exists created_at timestamptz not null default now();
alter table profiles add column if not exists approved_at timestamptz;

alter table profiles drop constraint if exists profiles_status_check;
alter table profiles add constraint profiles_status_check
  check (status in ('pending', 'approved', 'rejected', 'suspended'));

do $$
declare
  owner uuid;
begin
  select id into owner from auth.users
  where lower(email) = lower('TU_CORREO@ejemplo.com');   -- ← cambia esto por tu correo

  if owner is null then
    raise exception 'No existe ninguna cuenta con ese correo. Revisa que esté bien escrito.';
  end if;

  -- Las cuentas que ya existían quedan aprobadas (nadie queda fuera por este cambio).
  update profiles set status = 'approved', approved_at = coalesce(approved_at, now()) where status = 'pending';
  -- Tú, administrador.
  update profiles set is_admin = true, status = 'approved', approved_at = coalesce(approved_at, now()) where id = owner;
end $$;

-- 2) Las cuentas nuevas nacen pendientes y guardan los datos del registro -----
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, status, nombre, empresa, telefono)
  values (
    new.id, new.email, 'pending',
    nullif(trim(new.raw_user_meta_data ->> 'nombre'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'empresa'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'telefono'), '')
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end $$;

-- 3) Ayudantes: ¿esta cuenta está aprobada? ¿es administradora? ---------------
create or replace function is_approved() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and status = 'approved');
$$;

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and is_admin and status = 'approved');
$$;

revoke all on function is_approved() from public, anon;
revoke all on function is_admin() from public, anon;
grant execute on function is_approved() to authenticated;
grant execute on function is_admin() to authenticated;

-- 4) Las reglas de cada tabla ahora exigen cuenta aprobada -------------------
do $$
declare
  r record;
begin
  for r in
    select policyname, tablename from pg_policies
    where schemaname = 'public'
      and tablename in ('library_pages', 'library_page_assets', 'saved_documents', 'saved_document_fichas',
                        'saved_document_mapas', 'saved_document_assets', 'design_presets', 'default_design',
                        'profiles', 'library_shares')
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

create policy "own saved_documents" on saved_documents
  for all to authenticated
  using (user_id = (select auth.uid()) and (select is_approved()))
  with check (user_id = (select auth.uid()) and (select is_approved()));

create policy "own saved_document_fichas" on saved_document_fichas
  for all to authenticated
  using ((select is_approved()) and exists (select 1 from saved_documents d where d.id = saved_document_id and d.user_id = (select auth.uid())))
  with check ((select is_approved()) and exists (select 1 from saved_documents d where d.id = saved_document_id and d.user_id = (select auth.uid())));

create policy "own saved_document_mapas" on saved_document_mapas
  for all to authenticated
  using ((select is_approved()) and exists (select 1 from saved_documents d where d.id = saved_document_id and d.user_id = (select auth.uid())))
  with check ((select is_approved()) and exists (select 1 from saved_documents d where d.id = saved_document_id and d.user_id = (select auth.uid())));

create policy "own saved_document_assets" on saved_document_assets
  for all to authenticated
  using ((select is_approved()) and exists (select 1 from saved_documents d where d.id = saved_document_id and d.user_id = (select auth.uid())))
  with check ((select is_approved()) and exists (select 1 from saved_documents d where d.id = saved_document_id and d.user_id = (select auth.uid())));

create policy "own design_presets" on design_presets
  for all to authenticated
  using (user_id = (select auth.uid()) and (select is_approved()))
  with check (user_id = (select auth.uid()) and (select is_approved()));

create policy "own default_design" on default_design
  for all to authenticated
  using (user_id = (select auth.uid()) and (select is_approved()))
  with check (user_id = (select auth.uid()) and (select is_approved()));

create policy "library select own or shared" on library_pages
  for select to authenticated
  using (
    (select is_approved())
    and (
      user_id = (select auth.uid())
      or exists (select 1 from library_shares s where s.page_id = library_pages.id and s.user_id = (select auth.uid()))
    )
  );
create policy "library insert own" on library_pages
  for insert to authenticated with check (user_id = (select auth.uid()) and (select is_approved()));
create policy "library update own" on library_pages
  for update to authenticated
  using (user_id = (select auth.uid()) and (select is_approved()))
  with check (user_id = (select auth.uid()) and (select is_approved()));
create policy "library delete own" on library_pages
  for delete to authenticated using (user_id = (select auth.uid()) and (select is_approved()));

create policy "library assets select" on library_page_assets
  for select to authenticated
  using ((select is_approved()) and exists (
    select 1 from library_pages p
    where p.id = page_id
      and (p.user_id = (select auth.uid())
           or exists (select 1 from library_shares s where s.page_id = p.id and s.user_id = (select auth.uid())))
  ));
create policy "library assets insert own" on library_page_assets
  for insert to authenticated
  with check ((select is_approved()) and exists (select 1 from library_pages p where p.id = page_id and p.user_id = (select auth.uid())));
create policy "library assets update own" on library_page_assets
  for update to authenticated
  using ((select is_approved()) and exists (select 1 from library_pages p where p.id = page_id and p.user_id = (select auth.uid())))
  with check ((select is_approved()) and exists (select 1 from library_pages p where p.id = page_id and p.user_id = (select auth.uid())));
create policy "library assets delete own" on library_page_assets
  for delete to authenticated
  using ((select is_approved()) and exists (select 1 from library_pages p where p.id = page_id and p.user_id = (select auth.uid())));

-- Perfiles: ves el tuyo (así sabes si ya te aprobaron) y el de quien te compartió algo.
-- Nadie puede modificar su propio perfil: el estado solo cambia con las funciones de abajo.
create policy "profiles select own or sharer" on profiles
  for select to authenticated
  using (
    id = (select auth.uid())
    or exists (
      select 1 from library_pages p join library_shares s on s.page_id = p.id
      where p.user_id = profiles.id and s.user_id = (select auth.uid())
    )
  );

create policy "shares select recipient" on library_shares
  for select to authenticated using (user_id = (select auth.uid()) and (select is_approved()));

-- 5) Compartir páginas: solo cuentas aprobadas --------------------------------
create or replace function share_library_page(p_page text, p_email text) returns text
language plpgsql security definer set search_path = public as $$
declare target uuid;
begin
  if not is_approved() then raise exception 'Tu cuenta todavía no está aprobada.'; end if;
  if not exists (select 1 from library_pages where id = p_page and user_id = auth.uid()) then
    raise exception 'No eres el dueño de esta página.';
  end if;
  select u.id into target from auth.users u
    join profiles pr on pr.id = u.id and pr.status = 'approved'
    where lower(u.email) = lower(trim(p_email));
  if target is null then return 'not_found'; end if;
  if target = auth.uid() then return 'self'; end if;
  insert into library_shares (page_id, user_id) values (p_page, target) on conflict do nothing;
  return 'ok';
end $$;

-- 6) Panel de administración (solo administradores) ---------------------------
create or replace function admin_list_users() returns table (
  user_id uuid, email text, nombre text, empresa text, telefono text, status text, is_admin boolean,
  created_at timestamptz, approved_at timestamptz, last_sign_in_at timestamptz, proyectos bigint, documentos bigint
)
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'Solo para administradores.'; end if;
  return query
    select p.id, p.email, p.nombre, p.empresa, p.telefono, p.status, p.is_admin,
           p.created_at, p.approved_at, u.last_sign_in_at,
           (select count(*) from library_pages l where l.user_id = p.id),
           (select count(*) from saved_documents d where d.user_id = p.id)
    from profiles p left join auth.users u on u.id = p.id
    order by (p.status = 'pending') desc, p.created_at desc;
end $$;

create or replace function admin_set_status(p_user uuid, p_status text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'Solo para administradores.'; end if;
  if p_status not in ('pending', 'approved', 'rejected', 'suspended') then raise exception 'Estado no válido.'; end if;
  if p_user = auth.uid() then raise exception 'No puedes cambiar el estado de tu propia cuenta.'; end if;
  update profiles
     set status = p_status,
         approved_at = case when p_status = 'approved' then coalesce(approved_at, now()) else approved_at end
   where id = p_user;
end $$;

revoke all on function admin_list_users() from public, anon;
revoke all on function admin_set_status(uuid, text) from public, anon;
revoke all on function share_library_page(text, text) from public, anon;
grant execute on function admin_list_users() to authenticated;
grant execute on function admin_set_status(uuid, text) to authenticated;
grant execute on function share_library_page(text, text) to authenticated;

-- ===== 4) supabase-marca.sql =====
-- Propentia — marca de cada cuenta (logo y nombre del asesor)
--
-- Se corre UNA sola vez en Supabase → SQL Editor, DESPUÉS de supabase-aprobacion.sql.
-- Ver CUENTAS-Y-COMPARTIR.md.
--
-- Qué hace: crea la tabla donde cada cuenta guarda su logo y el nombre que sale en
-- "Elaborado por" de sus fichas. Cada persona solo ve y cambia la suya, y solo si su
-- cuenta está aprobada.
--
-- Este script no necesita que cambies nada: se pega completo y se corre.

create table if not exists brand_profiles (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  asesor text,
  logo text,
  skipped boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table brand_profiles enable row level security;

do $$
declare
  r record;
begin
  for r in select policyname from pg_policies where schemaname = 'public' and tablename = 'brand_profiles'
  loop
    execute format('drop policy %I on public.brand_profiles', r.policyname);
  end loop;
end $$;

create policy "own brand_profiles" on brand_profiles
  for all to authenticated
  using (user_id = (select auth.uid()) and (select is_approved()))
  with check (user_id = (select auth.uid()) and (select is_approved()));
