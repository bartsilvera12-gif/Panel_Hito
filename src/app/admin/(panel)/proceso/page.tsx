import SimpleCrud from '@/components/admin/SimpleCrud';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function ProcesoPage() {
  const supabase = await createClient();
  const { data } = await supabase.from('process_steps').select('*').order('sort_order');
  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-medium text-azul">Proceso de atención</h1>
      <p className="mb-6 text-sm text-gris">Pasos de cómo trabajan las consultas.</p>
      <SimpleCrud table="process_steps" initialRows={(data ?? []) as any} fields={[
        { name: 'title', label: 'Título' },
        { name: 'description', label: 'Descripción', type: 'textarea' },
      ]} />
    </div>
  );
}
