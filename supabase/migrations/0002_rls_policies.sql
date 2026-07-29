-- =====================================================================
-- Panel Hito · 0002 · Funciones de rol + Grants + RLS + Políticas
-- =====================================================================

-- ---------------------------------------------------------------------
-- Funciones auxiliares de rol (security definer + search_path seguro).
-- Se definen aquí (tras crear las tablas en 0001) para que la validación
-- de cuerpos SQL encuentre panelhito.admin_profiles.
-- ---------------------------------------------------------------------
create or replace function panelhito.current_admin_role()
returns text language sql stable security definer set search_path = panelhito, public as $$
  select ap.role from panelhito.admin_profiles ap
  where ap.user_id = auth.uid() and ap.active = true limit 1;
$$;

create or replace function panelhito.is_admin()
returns boolean language sql stable security definer set search_path = panelhito, public as $$
  select coalesce(panelhito.current_admin_role() in ('superadmin','admin','editor'), false);
$$;

create or replace function panelhito.is_content_admin()
returns boolean language sql stable security definer set search_path = panelhito, public as $$
  select coalesce(panelhito.current_admin_role() in ('superadmin','admin','editor'), false);
$$;

create or replace function panelhito.is_admin_or_super()
returns boolean language sql stable security definer set search_path = panelhito, public as $$
  select coalesce(panelhito.current_admin_role() in ('superadmin','admin'), false);
$$;

create or replace function panelhito.is_superadmin()
returns boolean language sql stable security definer set search_path = panelhito, public as $$
  select coalesce(panelhito.current_admin_role() = 'superadmin', false);
$$;

-- Grants base (RLS sigue gobernando el acceso fila a fila)
grant usage on schema panelhito to anon, authenticated, service_role;
grant all on all tables in schema panelhito to service_role;
grant all on all functions in schema panelhito to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema panelhito to authenticated;
grant select on all tables in schema panelhito to anon;
grant insert on panelhito.contact_requests to anon;

alter default privileges in schema panelhito grant all on tables to service_role;
alter default privileges in schema panelhito grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema panelhito grant select on tables to anon;

-- ---------------------------------------------------------------------
-- Habilitar RLS en todas las tablas
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'admin_profiles','site_settings','navigation_items','site_sections','hero_highlights',
    'products','product_specs','benefits','applications','comparison_rows','process_steps',
    'projects','project_media','company_values','faqs','contact_project_types','contact_requests',
    'legal_pages','audit_logs'
  ] loop
    execute format('alter table panelhito.%I enable row level security;', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- Patrón estándar: lectura pública (published/visible) + gestión admin
-- ---------------------------------------------------------------------
do $$
declare
  r record;
  tables_published text[] := array['products','benefits','applications','comparison_rows',
    'process_steps','projects','project_media','faqs','contact_project_types','legal_pages'];
  tables_visible text[] := array['site_sections','hero_highlights','company_values','navigation_items'];
  t text;
begin
  -- Tablas con columna `published`
  foreach t in array tables_published loop
    execute format('drop policy if exists public_read on panelhito.%I;', t);
    execute format('create policy public_read on panelhito.%I for select to anon, authenticated using (published = true);', t);
    execute format('drop policy if exists admin_all on panelhito.%I;', t);
    execute format('create policy admin_all on panelhito.%I for all to authenticated using (panelhito.is_admin()) with check (panelhito.is_admin());', t);
  end loop;
  -- Tablas con columna `visible`
  foreach t in array tables_visible loop
    execute format('drop policy if exists public_read on panelhito.%I;', t);
    execute format('create policy public_read on panelhito.%I for select to anon, authenticated using (visible = true);', t);
    execute format('drop policy if exists admin_all on panelhito.%I;', t);
    execute format('create policy admin_all on panelhito.%I for all to authenticated using (panelhito.is_admin()) with check (panelhito.is_admin());', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- product_specs: público solo si el producto está publicado
-- ---------------------------------------------------------------------
drop policy if exists public_read on panelhito.product_specs;
create policy public_read on panelhito.product_specs for select to anon, authenticated
  using (exists (select 1 from panelhito.products p where p.id = product_id and p.published = true));
drop policy if exists admin_all on panelhito.product_specs;
create policy admin_all on panelhito.product_specs for all to authenticated
  using (panelhito.is_admin()) with check (panelhito.is_admin());

-- ---------------------------------------------------------------------
-- site_settings: lectura pública (config no sensible); gestión admin/super
-- ---------------------------------------------------------------------
drop policy if exists public_read on panelhito.site_settings;
create policy public_read on panelhito.site_settings for select to anon, authenticated using (true);
drop policy if exists admin_manage on panelhito.site_settings;
create policy admin_manage on panelhito.site_settings for all to authenticated
  using (panelhito.is_admin_or_super()) with check (panelhito.is_admin_or_super());

-- ---------------------------------------------------------------------
-- contact_requests: INSERT público; lectura/gestión solo admin+super
-- ---------------------------------------------------------------------
drop policy if exists public_insert on panelhito.contact_requests;
create policy public_insert on panelhito.contact_requests for insert to anon, authenticated
  with check (true);
drop policy if exists admin_select on panelhito.contact_requests;
create policy admin_select on panelhito.contact_requests for select to authenticated
  using (panelhito.is_admin_or_super());
drop policy if exists admin_update on panelhito.contact_requests;
create policy admin_update on panelhito.contact_requests for update to authenticated
  using (panelhito.is_admin_or_super()) with check (panelhito.is_admin_or_super());
drop policy if exists admin_delete on panelhito.contact_requests;
create policy admin_delete on panelhito.contact_requests for delete to authenticated
  using (panelhito.is_admin_or_super());

-- ---------------------------------------------------------------------
-- admin_profiles: cada admin ve su fila; superadmin gestiona todo
-- ---------------------------------------------------------------------
drop policy if exists read_self_or_admin on panelhito.admin_profiles;
create policy read_self_or_admin on panelhito.admin_profiles for select to authenticated
  using (user_id = auth.uid() or panelhito.is_admin());
drop policy if exists superadmin_manage on panelhito.admin_profiles;
create policy superadmin_manage on panelhito.admin_profiles for all to authenticated
  using (panelhito.is_superadmin()) with check (panelhito.is_superadmin());

-- ---------------------------------------------------------------------
-- audit_logs: lectura admin; inserción admin
-- ---------------------------------------------------------------------
drop policy if exists admin_read on panelhito.audit_logs;
create policy admin_read on panelhito.audit_logs for select to authenticated
  using (panelhito.is_admin());
drop policy if exists admin_insert on panelhito.audit_logs;
create policy admin_insert on panelhito.audit_logs for insert to authenticated
  with check (panelhito.is_admin());
