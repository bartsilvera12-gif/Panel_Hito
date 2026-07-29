import { redirect } from 'next/navigation';
import SettingsForm from '@/components/admin/SettingsForm';
import { createClient } from '@/lib/supabase/server';
import { getAuthAdmin } from '@/lib/queries';
import type { SiteSettings } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function ConfiguracionPage() {
  const auth = await getAuthAdmin();
  if (!auth) redirect('/admin/login');
  if (auth.profile.role === 'editor') {
    return <p className="rounded-md border border-black/10 bg-white p-6 text-gris">No tenés permisos para editar la configuración.</p>;
  }
  const supabase = await createClient();
  const { data } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();
  if (!data) return <p className="text-gris">No se encontró la configuración.</p>;
  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-medium text-azul">Configuración general</h1>
      <p className="mb-6 text-sm text-gris">Datos del negocio, contacto, redes, branding y SEO.</p>
      <SettingsForm initial={data as SiteSettings} />
    </div>
  );
}
