import SimpleCrud from '@/components/admin/SimpleCrud';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function ProductosPage() {
  const supabase = await createClient();
  const { data } = await supabase.from('products').select('*').order('sort_order');
  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-medium text-azul">Productos</h1>
      <p className="mb-6 text-sm text-gris">Líneas de panel. El slug debe ser único. La imagen usa ruta pública o de Storage.</p>
      <SimpleCrud table="products" initialRows={(data ?? []) as any} imageField="image_path" fields={[
        { name: 'name', label: 'Nombre' },
        { name: 'slug', label: 'Slug (único)', type: 'slug', from: 'name' },
        { name: 'description', label: 'Descripción', type: 'textarea' },
        { name: 'applications', label: 'Aplicaciones', type: 'array' },
        { name: 'image_path', label: 'Imagen', type: 'image' },
        { name: 'whatsapp_message', label: 'Mensaje de WhatsApp', type: 'textarea' },
      ]} />
    </div>
  );
}
