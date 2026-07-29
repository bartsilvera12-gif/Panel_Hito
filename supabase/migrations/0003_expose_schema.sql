-- =====================================================================
-- Panel Hito · 0003 · Exponer el schema `panelhito` en PostgREST
-- Base compartida: se APPENDEA a la lista existente, sin pisar otros
-- schemas (multi-tenant). Idempotente.
-- =====================================================================

do $$
declare
  cur text;
  newval text;
begin
  select (regexp_match(array_to_string(rolconfig, E'\n'), 'pgrst\.db_schemas=([^\n]*)'))[1]
    into cur
  from pg_roles
  where rolname = 'authenticator';

  if cur is null then
    -- Sin configuración previa (poco probable en Supabase): default seguro
    newval := 'public, storage, graphql_public, panelhito';
  elsif (',' || cur || ',') like '%,panelhito,%' then
    newval := cur; -- ya está expuesto, no cambiar
  else
    newval := cur || ',panelhito';
  end if;

  execute format('alter role authenticator set pgrst.db_schemas = %L', newval);
  raise notice 'pgrst.db_schemas => %', newval;
end $$;

-- Recargar la configuración de PostgREST
notify pgrst, 'reload config';

-- Verificación (informativo):
--   select (regexp_match(array_to_string(rolconfig, E'\n'), 'pgrst\.db_schemas=([^\n]*)'))[1]
--   from pg_roles where rolname = 'authenticator';
