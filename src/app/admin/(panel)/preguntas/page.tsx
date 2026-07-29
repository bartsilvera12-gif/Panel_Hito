import SimpleCrud from '@/components/admin/SimpleCrud';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function PreguntasPage() {
  const supabase = await createClient();
  const { data } = await supabase.from('faqs').select('*').order('sort_order');
  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-medium text-azul">Preguntas frecuentes</h1>
      <p className="mb-6 text-sm text-gris">Consultas habituales que se muestran en la portada.</p>
      <SimpleCrud table="faqs" initialRows={(data ?? []) as any} fields={[
        { name: 'question', label: 'Pregunta' },
        { name: 'answer', label: 'Respuesta', type: 'textarea' },
      ]} />
    </div>
  );
}
