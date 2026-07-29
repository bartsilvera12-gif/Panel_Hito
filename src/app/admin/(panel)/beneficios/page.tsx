import SimpleCrud from '@/components/admin/SimpleCrud';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function BeneficiosPage() {
  const supabase = await createClient();
  const { data } = await supabase.from('benefits').select('*').order('sort_order');
  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-medium text-azul">Beneficios</h1>
      <p className="mb-6 text-sm text-gris">Gestioná los beneficios que se muestran en la portada.</p>
      <SimpleCrud table="benefits" initialRows={(data ?? []) as any} fields={[
        { name: 'title', label: 'Título' },
        { name: 'description', label: 'Descripción', type: 'textarea' },
        { name: 'icon_key', label: 'Ícono (clave)' },
      ]} />
    </div>
  );
}
