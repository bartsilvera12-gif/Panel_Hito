import Link from 'next/link';
import SimpleCrud from '@/components/admin/SimpleCrud';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function ProyectosPage() {
  const supabase = await createClient();
  const [{ data }, { data: cats }] = await Promise.all([
    supabase.from('projects').select('*').order('sort_order'),
    supabase.from('project_categories').select('name').eq('published', true).order('sort_order'),
  ]);
  const categoryOptions = (cats ?? []).map((c: { name: string }) => c.name);
  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-medium text-azul">Proyectos</h1>
      <p className="mb-6 text-sm text-gris">
        Obras destacadas del inicio. Las categorías se administran en{' '}
        <Link href="/admin/categorias" className="text-cian underline">Categorías</Link>. Las imágenes y videos, en{' '}
        <Link href="/admin/galeria" className="text-cian underline">Galería</Link>.
      </p>
      <SimpleCrud table="projects" initialRows={(data ?? []) as any} imageField="cover_image_path" groupBy="category" fields={[
        { name: 'title', label: 'Título' },
        { name: 'slug', label: 'Slug (único)', type: 'slug', from: 'title' },
        { name: 'category', label: 'Categoría', type: 'select', options: categoryOptions },
        { name: 'description', label: 'Descripción', type: 'textarea' },
        { name: 'cover_image_path', label: 'Imagen de portada', type: 'image' },
      ]} />
    </div>
  );
}
