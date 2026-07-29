# Panel Hito — Sitio + Panel administrador

Aplicación **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind + Supabase** para el sitio
público de Panel Hito y su panel administrador. Todo el contenido se gestiona desde `/admin` y se
guarda en el schema **`panelhito`** de Supabase.

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS 3 · Supabase (Auth, DB, Storage, SSR) · Zod ·
React Hook Form · Lucide React.

## Rutas

Públicas: `/` · `/trabajos` · `/politicadeprivacidad`
Admin: `/admin/login` · `/admin` · `/admin/contenido` · `/admin/productos` · `/admin/beneficios` ·
`/admin/aplicaciones` · `/admin/comparacion` · `/admin/proceso` · `/admin/proyectos` ·
`/admin/galeria` · `/admin/preguntas` · `/admin/consultas` · `/admin/legal` · `/admin/configuracion` ·
`/admin/usuarios`

## Puesta en marcha

```bash
cp .env.example .env.local     # completar valores (ver README_SUPABASE.md)
npm install
npm run db:seed                # aplica migraciones + seed (ya aplicado en vivo)
npm run import:content         # registra medios existentes (idempotente, ya ejecutado)
npm run dev                    # http://localhost:3000
```

Scripts: `npm run build` · `npm run start` · `npm run lint` · `npm run typecheck` ·
`npm run create:admin` (requiere service role).

## Arquitectura

- **`src/app`** — App Router. Público (`page.tsx`, `trabajos`, `politicadeprivacidad`) y admin
  (`admin/login`, `admin/(panel)/*`). Todas las páginas leen de `panelhito` vía Supabase SSR.
- **`src/lib/supabase`** — clientes `client` (browser), `server` (SSR con cookies), `admin`
  (service role, solo servidor), `middleware` (refresco de sesión + protección de `/admin/*`).
- **`src/lib/queries.ts`** — lecturas del sitio público y del área admin.
- **`src/actions`** — Server Actions: `contact` (inserción real del formulario) y `admin` (CRUD +
  auditoría, protegido por RLS según rol).
- **`src/components/public`** — `KineticGrid` (canvas portado), `Reveal` (animación de entrada),
  `Header`, `Footer`, `WhatsAppButton`, `ContactForm`, `Gallery` (lightbox).
- **`src/components/admin`** — `Sidebar`, `SimpleCrud`, `SectionsEditor`, `SettingsForm`,
  `ConsultasClient`, `GalleryAdmin`, `LegalEditor`, `UsersClient`.
- **`middleware.ts`** — protege `/admin/*`, redirige a `/admin/login` sin sesión o sin perfil activo.
- **`supabase/`** — migraciones SQL + seed (ver `README_SUPABASE.md`).
- **`scripts/`** — `apply-db.mjs`, `create-admin.ts`, `import-existing-content.ts`.
- **`legacy/`** — sitio estático original conservado como referencia.

El diseño público mantiene la identidad de marca (azul `#002A3B`, cian `#2CC3EF`, fondo claro
`#F4F7F8`, Space Grotesk + Inter) y las cuadrículas cinéticas de las secciones azules.

## Pendiente

- `SUPABASE_SERVICE_ROLE_KEY` (no provista): necesaria para subir/borrar archivos a Storage desde el
  admin y para crear nuevos usuarios administradores. La gestión de metadatos de galería, contenido,
  consultas y configuración funciona sin ella (anon + RLS).

## Despliegue en Vercel

Este proyecto es una app Next.js (no estática). En Vercel: framework **Next.js**, variables de
entorno de `.env.example`. La rama `feature/supabase-admin` contiene esta versión; hacer merge a
`main` cuando se valide (cambia el tipo de build actual).
