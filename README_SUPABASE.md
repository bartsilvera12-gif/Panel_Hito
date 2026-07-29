# Panel Hito — Backend Supabase (`panelhito`)

Todo el proyecto vive en el schema **`panelhito`** de una base Supabase **multi-tenant compartida**.
No se crea nada en `public` ni en los schemas de otros proyectos.

## Variables de entorno (`.env.local`, nunca commitear)

```
NEXT_PUBLIC_SUPABASE_URL=https://api.neura.com.py
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<PENDIENTE — necesario para crear usuarios admin y Storage server-side>
SUPABASE_DB_URL=postgresql://postgres:***@187.77.247.54:6432/postgres?sslmode=disable
ADMIN_INITIAL_EMAIL=admin@panelhito.com
ADMIN_INITIAL_PASSWORD=<la contraseña del admin>
ADMIN_INITIAL_USER_ID=55e273bb-3bd4-4ce1-9af2-55641324a11c
IP_HASH_SECRET=<secreto largo aleatorio>
```

> **Pendiente real:** el `SUPABASE_SERVICE_ROLE_KEY` no fue provisto. Es necesario para
> `scripts/create-admin.ts` (crear nuevos admins), la gestión de usuarios en `/admin/usuarios`
> y la subida/borrado de archivos a Storage desde el servidor. El resto funciona con anon + RLS.

## Aplicar migraciones y seed

Ya fueron **aplicadas en vivo** con:

```bash
node scripts/apply-db.mjs --seed
```

Este runner ejecuta, en orden, `supabase/migrations/*.sql` y luego `supabase/seed.sql`.
Todo es idempotente (create if not exists / on conflict / where not exists).

Migraciones:
- `0001_init_panelhito.sql` — schema, `set_updated_at`, 19 tablas, checks, índices, triggers.
- `0002_rls_policies.sql` — funciones de rol (`is_admin`, `is_superadmin`, `is_admin_or_super`), grants, RLS + políticas.
- `0003_expose_schema.sql` — **agrega** `panelhito` a `pgrst.db_schemas` preservando los demás tenants y hace `notify pgrst, 'reload config'`.

## Exponer el schema (ya hecho) y verificar

La migración `0003` corre:

```sql
alter role authenticator set pgrst.db_schemas = '<lista_existente>,panelhito';
notify pgrst, 'reload config';
```

Verificar que quedó expuesto (debe contener `panelhito` y **todos** los demás):

```bash
psql "$SUPABASE_DB_URL" -c "select (regexp_match(array_to_string(rolconfig,E'\n'),'pgrst\.db_schemas=([^\n]*)'))[1] from pg_roles where rolname='authenticator';"
```

O vía REST (debe responder, no 404):

```bash
curl -s -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Accept-Profile: panelhito" \
  "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/products?select=slug&limit=1"
```

> Como `search_path` por defecto del rol no incluye `panelhito`, **todas** las consultas del
> cliente deben especificar el schema: `supabase.schema('panelhito').from('...')`.

## Crear/vincular un administrador

El superadmin inicial (`admin@panelhito.com`, uid `55e273bb…`) ya quedó como `superadmin` en el seed.
Para crear otros (requiere `SUPABASE_SERVICE_ROLE_KEY`):

```bash
ADMIN_INITIAL_EMAIL=nuevo@panelhito.com ADMIN_INITIAL_PASSWORD=... npx tsx scripts/create-admin.ts admin
```

## Importar contenido/medios existentes (ya hecho)

```bash
npx tsx scripts/import-existing-content.ts
```

Idempotente. Registra las rutas públicas de `/uploads/galeria` en `panelhito.project_media`
(132 fotos + 5 videos) y crea los 12 proyectos destacados del inicio. **No re-sube archivos.**

## Storage

Bucket recomendado: **`panelhito-media`** (crear cuando haya service role), con prefijos:
`panelhito/products/`, `panelhito/applications/`, `panelhito/projects/`, `panelhito/gallery/`,
`panelhito/branding/`, `panelhito/legal/`.

- Lectura pública del bucket; escritura/borrado solo para administradores (políticas en `storage.objects`).
- Los assets actuales se sirven desde `public/uploads` (no requieren Storage). Storage es para cargas nuevas del admin.

## Estado verificado

| Objeto | Resultado |
|---|---|
| Tablas en `panelhito` | 19 |
| products / applications / benefits | 5 / 8 / 8 |
| comparison / process / faqs / values | 6 / 4 / 7 / 5 |
| hero_highlights / project_types / sections | 4 / 8 / 13 |
| projects / project_media | 12 / 137 |
| admin_profiles (superadmin) | 1 |
| `panelhito` expuesto en PostgREST | sí (76+ tenants preservados) |
