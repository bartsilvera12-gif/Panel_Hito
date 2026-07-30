import Link from 'next/link';
import SectionsEditor from '@/components/admin/SectionsEditor';
import { createClient } from '@/lib/supabase/server';
import type { SiteSection } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function ContenidoPage() {
  const supabase = await createClient();
  const { data } = await supabase.from('site_sections').select('*').order('sort_order');
  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-medium text-azul">Contenido de secciones</h1>
      <p className="mb-6 text-sm text-gris">
        Editá textos, botones y visibilidad de cada sección. La información de la empresa y el footer se editan en{' '}
        <Link href="/admin/configuracion" className="text-cian underline">Configuración</Link>.
      </p>
      <SectionsEditor initial={(data ?? []) as SiteSection[]} />
    </div>
  );
}
