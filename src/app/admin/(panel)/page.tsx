import Link from 'next/link';
import { Package, FolderOpen, Images, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

async function count(table: string, filter?: (q: any) => any): Promise<number> {
  const supabase = await createClient();
  let q = supabase.from(table).select('*', { count: 'exact', head: true });
  if (filter) q = filter(q);
  const { count } = await q;
  return count ?? 0;
}

export default async function Dashboard() {
  const [productos, proyectos, galeria] = await Promise.all([
    count('products', (q) => q.eq('published', true)),
    count('projects', (q) => q.eq('published', true)),
    count('project_media', (q) => q.eq('published', true)),
  ]);

  const cards = [
    { label: 'Productos publicados', value: productos, icon: Package, href: '/admin/productos' },
    { label: 'Proyectos publicados', value: proyectos, icon: FolderOpen, href: '/admin/proyectos' },
    { label: 'Archivos de galería', value: galeria, icon: Images, href: '/admin/galeria' },
  ];

  const quick = [
    { label: 'Nuevo producto', href: '/admin/productos', icon: Package },
    { label: 'Nuevo proyecto', href: '/admin/proyectos', icon: FolderOpen },
    { label: 'Subir a galería', href: '/admin/galeria', icon: Images },
    { label: 'Editar contenido', href: '/admin/contenido', icon: FileText },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-azul">Inicio</h1>
      <p className="mt-1 text-sm text-gris">Un resumen del sitio y accesos rápidos.</p>

      {/* Accesos rápidos */}
      <div className="mt-6 flex flex-wrap gap-2.5">
        {quick.map((q) => {
          const Icon = q.icon;
          return (
            <Link key={q.href} href={q.href} className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-[13px] font-medium text-azul transition hover:border-cian hover:bg-cian/5">
              <Icon size={16} className="text-cian" /> {q.label}
            </Link>
          );
        })}
      </div>

      <h2 className="mt-8 font-display text-lg font-medium text-azul">Resumen</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.label} href={c.href} className="rounded-lg border border-black/10 bg-white p-5 transition hover:border-cian">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-gris">{c.label}</span>
                <Icon size={18} className="text-cian" />
              </div>
              <div className="mt-2 font-display text-3xl font-semibold text-azul">{c.value}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
