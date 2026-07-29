import SimpleCrud from '@/components/admin/SimpleCrud';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function ProyectosPage() {
  const supabase = await createClient();
  const { data } = await supabase.from('projects').select('*').order('sort_order');
  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-medium text-azul">Proyectos</h1>
      <p className="mb-6 text-sm text-gris">
        Obras destacadas del inicio. Las imágenes y videos de cada proyecto se gestionan en{' '}
        <a href="/admin/galeria" className="text-cian underline">Galería</a>.
      </p>
      <SimpleCrud table="projects" initialRows={(data ?? []) as any} fields={[
        { name: 'slug', label: 'Slug (único)' },
        { name: 'title', label: 'Título' },
        { name: 'category', label: 'Categoría' },
        { name: 'location', label: 'Ubicación' },
        { name: 'description', label: 'Descripción', type: 'textarea' },
        { name: 'product_used', label: 'Producto utilizado' },
        { name: 'cover_image_path', label: 'Imagen de portada (ruta)' },
        { name: 'cover_image_alt', label: 'Texto alternativo' },
      ]} />
    </div>
  );
}
