import SimpleCrud from '@/components/admin/SimpleCrud';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function ComparacionPage() {
  const supabase = await createClient();
  const { data } = await supabase.from('comparison_rows').select('*').order('sort_order');
  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-medium text-azul">Comparación</h1>
      <p className="mb-6 text-sm text-gris">Criterios de la tabla comparativa.</p>
      <SimpleCrud table="comparison_rows" initialRows={(data ?? []) as any} fields={[
        { name: 'criterion', label: 'Criterio' },
        { name: 'conventional_value', label: 'Cubierta convencional' },
        { name: 'panel_value', label: 'Panel termoacústico' },
      ]} />
    </div>
  );
}
