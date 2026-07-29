/**
 * Importa el contenido/medios existentes del sitio estático a `panelhito`.
 * - Idempotente: puede correrse varias veces sin duplicar.
 * - No re-sube archivos: registra las rutas públicas (/uploads/...) ya servidas.
 *
 * Uso:  npx tsx scripts/import-existing-content.ts
 */
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const DB = process.env.SUPABASE_DB_URL;
if (!DB) throw new Error('Falta SUPABASE_DB_URL en .env.local');

// Carpeta pública donde viven los assets (repo estático → app Next: public/uploads)
const publicRoot = existsSync(join(process.cwd(), 'public', 'uploads'))
  ? join(process.cwd(), 'public')
  : process.cwd();
const uploads = join(publicRoot, 'uploads');
const galeriaDir = join(uploads, 'galeria');

// Gráficas/promos ocultas de la galería pública (no importar)
const HIDDEN = new Set(['foto-011.jpg', 'foto-016.jpg', 'foto-133.jpg', 'foto-134.jpg']);

// 12 proyectos destacados del inicio (mismo orden y textos que la portada)
const HOME_PROJECTS: Array<{ slug: string; title: string; category: string; cover: string; alt: string }> = [
  { slug: 'vivienda-modular', title: 'Vivienda modular', category: 'Vivienda', cover: '/uploads/trabajo-01.jpg', alt: 'Vivienda modular Panel Hito' },
  { slug: 'casa-llave-en-mano', title: 'Casa llave en mano', category: 'Vivienda', cover: '/uploads/trabajo-02.jpg', alt: 'Casa llave en mano Panel Hito' },
  { slug: 'vivienda-con-galeria', title: 'Vivienda con galería', category: 'Vivienda', cover: '/uploads/trabajo-03.jpg', alt: 'Vivienda con galería Panel Hito' },
  { slug: 'quincho-y-galeria', title: 'Quincho y galería', category: 'Quincho', cover: '/uploads/trabajo-04.jpg', alt: 'Quincho y galería Panel Hito' },
  { slug: 'nave-industrial', title: 'Nave industrial', category: 'Industria', cover: '/uploads/trabajo-05.jpg', alt: 'Nave industrial Panel Hito' },
  { slug: 'galpon-deposito', title: 'Galpón / depósito', category: 'Galpón', cover: '/uploads/trabajo-06.jpg', alt: 'Galpón con paneles Panel Hito' },
  { slug: 'local-comercial', title: 'Local comercial', category: 'Comercio', cover: '/uploads/trabajo-07.jpg', alt: 'Local comercial Panel Hito' },
  { slug: 'local-kiosco', title: 'Local / kiosco', category: 'Comercio', cover: '/uploads/trabajo-08.jpg', alt: 'Local tipo kiosco Panel Hito' },
  { slug: 'oficina-modular', title: 'Oficina modular', category: 'Oficina', cover: '/uploads/trabajo-09.jpg', alt: 'Oficina modular Panel Hito' },
  { slug: 'modulos-de-oficina', title: 'Módulos de oficina', category: 'Oficina', cover: '/uploads/trabajo-10.jpg', alt: 'Módulos de oficina Panel Hito' },
  { slug: 'galeria-con-quincho', title: 'Galería con quincho', category: 'Galería', cover: '/uploads/trabajo-11.jpg', alt: 'Galería con quincho Panel Hito' },
  { slug: 'interior-equipado', title: 'Interior equipado', category: 'Interior', cover: '/uploads/trabajo-12.jpg', alt: 'Interior equipado Panel Hito' },
];

async function main() {
  const c = new pg.Client({ connectionString: DB });
  await c.connect();
  await c.query('set search_path = panelhito, public');

  // 1) Proyectos destacados del inicio (idempotente por slug)
  let projects = 0;
  for (let i = 0; i < HOME_PROJECTS.length; i++) {
    const p = HOME_PROJECTS[i];
    const r = await c.query(
      `insert into panelhito.projects (slug, title, category, cover_image_path, cover_image_alt, featured_home, published, sort_order)
       values ($1,$2,$3,$4,$5,true,true,$6)
       on conflict (slug) do nothing`,
      [p.slug, p.title, p.category, p.cover, p.alt, i],
    );
    projects += r.rowCount ?? 0;
  }

  // 2) Galería: fotos y videos de /uploads/galeria → project_media (sin proyecto)
  let media = 0;
  if (existsSync(galeriaDir)) {
    const files = readdirSync(galeriaDir)
      .filter((f) => /\.(jpg|jpeg|png|webp|mp4|webm)$/i.test(f))
      .filter((f) => !HIDDEN.has(f))
      .sort();
    let order = 0;
    for (const f of files) {
      const isVideo = /\.(mp4|webm)$/i.test(f);
      const path = `/uploads/galeria/${f}`;
      const r = await c.query(
        `insert into panelhito.project_media (media_type, storage_path, alt_text, published, sort_order)
         select $1,$2,$3,true,$4
         where not exists (select 1 from panelhito.project_media where storage_path = $2)`,
        [isVideo ? 'video' : 'image', path, 'Obra realizada con paneles Panel Hito', order++],
      );
      media += r.rowCount ?? 0;
    }
  } else {
    console.warn(`(aviso) No se encontró ${galeriaDir}; se omite la galería.`);
  }

  const totalMedia = (await c.query('select count(*)::int n from panelhito.project_media')).rows[0].n;
  const totalProjects = (await c.query('select count(*)::int n from panelhito.projects')).rows[0].n;
  await c.end();

  console.log(`Proyectos nuevos insertados: ${projects} (total: ${totalProjects})`);
  console.log(`Medios nuevos importados:    ${media} (total en galería: ${totalMedia})`);
  console.log('Importación idempotente completada.');
}

main().catch((e) => { console.error('Falló la importación:', e.message); process.exit(1); });
