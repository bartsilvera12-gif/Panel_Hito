import GalleryAdmin from '@/components/admin/GalleryAdmin';
import { createClient } from '@/lib/supabase/server';
import type { ProjectMedia } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function GaleriaPage() {
  const supabase = await createClient();
  const { data } = await supabase.from('project_media').select('*').order('sort_order');
  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-medium text-azul">Galería</h1>
      <p className="mb-6 text-sm text-gris">Fotos y videos que se muestran en /trabajos y en el inicio (destacados).</p>
      <GalleryAdmin initial={(data ?? []) as ProjectMedia[]} />
    </div>
  );
}
