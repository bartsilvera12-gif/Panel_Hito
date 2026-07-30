import SimpleCrud from '@/components/admin/SimpleCrud';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function CategoriasPage() {
  const supabase = await createClient();
  const { data } = await supabase.from('project_categories').select('*').order('sort_order');
  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-medium text-azul">Categorías</h1>
      <p className="mb-6 text-sm text-gris">Categorías de proyectos. Se usan como opciones del desplegable al editar un proyecto.</p>
      <SimpleCrud table="project_categories" initialRows={(data ?? []) as any} fields={[
        { name: 'name', label: 'Nombre' },
      ]} />
    </div>
  );
}
