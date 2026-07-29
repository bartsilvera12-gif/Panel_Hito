import LegalEditor from '@/components/admin/LegalEditor';
import { createClient } from '@/lib/supabase/server';
import type { LegalPage } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function LegalPageAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.from('legal_pages').select('*').eq('slug', 'politica-de-privacidad').maybeSingle();
  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-medium text-azul">Política de Privacidad</h1>
      <p className="mb-6 text-sm text-gris">Se muestra en /politicadeprivacidad.</p>
      {data ? <LegalEditor initial={data as LegalPage} /> : <p className="text-gris">No se encontró la página legal.</p>}
    </div>
  );
}
