import Link from 'next/link';
import { Inbox, Package, FolderOpen, Images, HelpCircle, CalendarRange } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import type { ContactRequest } from '@/lib/types';

export const dynamic = 'force-dynamic';

async function count(table: string, filter?: (q: any) => any): Promise<number> {
  const supabase = await createClient();
  let q = supabase.from(table).select('*', { count: 'exact', head: true });
  if (filter) q = filter(q);
  const { count } = await q;
  return count ?? 0;
}

export default async function Dashboard() {
  const supabase = await createClient();
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

  const [nuevas, mes, productos, proyectos, galeria, preguntas] = await Promise.all([
    count('contact_requests', (q) => q.eq('status', 'nuevo')),
    count('contact_requests', (q) => q.gte('created_at', monthStart.toISOString())),
    count('products', (q) => q.eq('published', true)),
    count('projects', (q) => q.eq('published', true)),
    count('project_media', (q) => q.eq('published', true)),
    count('faqs', (q) => q.eq('published', true)),
  ]);

  const { data: ultimas } = await supabase
    .from('contact_requests').select('*').order('created_at', { ascending: false }).limit(5);

  const cards = [
    { label: 'Consultas nuevas', value: nuevas, icon: Inbox, href: '/admin/consultas' },
    { label: 'Consultas del mes', value: mes, icon: CalendarRange, href: '/admin/consultas' },
    { label: 'Productos publicados', value: productos, icon: Package, href: '/admin/productos' },
    { label: 'Proyectos publicados', value: proyectos, icon: FolderOpen, href: '/admin/proyectos' },
    { label: 'Archivos de galería', value: galeria, icon: Images, href: '/admin/galeria' },
    { label: 'Preguntas publicadas', value: preguntas, icon: HelpCircle, href: '/admin/preguntas' },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-azul">Dashboard</h1>
      <p className="mt-1 text-sm text-gris">Resumen del sitio.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      <h2 className="mt-8 font-display text-lg font-medium text-azul">Últimas consultas</h2>
      <div className="mt-3 overflow-hidden rounded-lg border border-black/10 bg-white">
        {(ultimas as ContactRequest[] | null)?.length ? (
          <table className="w-full text-left text-[14px]">
            <thead className="bg-claro text-[12px] uppercase tracking-wide text-gris">
              <tr><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Nombre</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Estado</th></tr>
            </thead>
            <tbody>
              {(ultimas as ContactRequest[]).map((c) => (
                <tr key={c.id} className="border-t border-black/5">
                  <td className="px-4 py-3 text-gris">{formatDate(c.created_at)}</td>
                  <td className="px-4 py-3 text-azul">{c.full_name}</td>
                  <td className="px-4 py-3 text-gris">{c.project_type ?? '—'}</td>
                  <td className="px-4 py-3"><span className="rounded bg-cian/15 px-2 py-1 text-[12px] text-azul">{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-6 text-center text-sm text-gris">Todavía no hay consultas.</p>
        )}
      </div>
    </div>
  );
}
