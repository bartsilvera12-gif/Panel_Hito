import SimpleCrud from '@/components/admin/SimpleCrud';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AplicacionesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from('applications').select('*').order('sort_order');
  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-medium text-azul">Aplicaciones</h1>
      <p className="mb-6 text-sm text-gris">Tipos de obra donde se usa el panel. La imagen usa la ruta pública o de Storage.</p>
      <SimpleCrud table="applications" initialRows={(data ?? []) as any} imageField="image_path" fields={[
        { name: 'slug', label: 'Slug' },
        { name: 'title', label: 'Título' },
        { name: 'description', label: 'Descripción', type: 'textarea' },
        { name: 'image_path', label: 'Ruta de imagen' },
        { name: 'image_alt', label: 'Texto alternativo' },
      ]} />
    </div>
  );
}
