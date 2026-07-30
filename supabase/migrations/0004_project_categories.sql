-- =====================================================================
-- Panel Hito · 0004 · Categorías de proyectos (lista para el desplegable)
-- Idempotente: puede re-ejecutarse sin efectos secundarios.
-- =====================================================================

create table if not exists panelhito.project_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  published boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Grants (RLS gobierna el acceso fila a fila)
grant select on panelhito.project_categories to anon;
grant select, insert, update, delete on panelhito.project_categories to authenticated;
grant all on panelhito.project_categories to service_role;

-- RLS: lectura pública de publicadas + gestión de admins
alter table panelhito.project_categories enable row level security;

drop policy if exists public_read on panelhito.project_categories;
create policy public_read on panelhito.project_categories for select to anon, authenticated
  using (published = true);

drop policy if exists admin_all on panelhito.project_categories;
create policy admin_all on panelhito.project_categories for all to authenticated
  using (panelhito.is_admin()) with check (panelhito.is_admin());

-- Semilla: categorías ya usadas en los proyectos existentes
insert into panelhito.project_categories (name, sort_order)
select c.category, (row_number() over (order by c.category)) - 1
from (select distinct category from panelhito.projects where category is not null and category <> '') c
on conflict (name) do nothing;

-- Avisar a PostgREST que recargue el esquema (puede fallar tras pgbouncer; ver nota de ops)
do $$ begin
  notify pgrst, 'reload schema';
exception when others then null;
end $$;
