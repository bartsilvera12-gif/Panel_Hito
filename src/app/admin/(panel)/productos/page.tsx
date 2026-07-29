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
      <SimpleCrud table="products" initialRows={(data ?? []) as any} fields={[
        { name: 'slug', label: 'Slug (único)' },
        { name: 'name', label: 'Nombre' },
        { name: 'category', label: 'Categoría' },
        { name: 'short_description', label: 'Descripción corta' },
        { name: 'description', label: 'Descripción', type: 'textarea' },
        { name: 'applications', label: 'Aplicaciones', type: 'array' },
        { name: 'thickness_text', label: 'Espesores' },
        { name: 'core_text', label: 'Núcleo' },
        { name: 'image_path', label: 'Ruta de imagen' },
        { name: 'image_alt', label: 'Texto alternativo' },
        { name: 'whatsapp_message', label: 'Mensaje de WhatsApp', type: 'textarea' },
      ]} />
    </div>
  );
}
