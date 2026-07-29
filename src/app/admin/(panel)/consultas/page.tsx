import { redirect } from 'next/navigation';
import ConsultasClient from '@/components/admin/ConsultasClient';
import { createClient } from '@/lib/supabase/server';
import { getAuthAdmin } from '@/lib/queries';
import type { ContactRequest } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function ConsultasPage() {
  const auth = await getAuthAdmin();
  if (!auth) redirect('/admin/login');
  if (auth.profile.role === 'editor') {
    return <p className="rounded-md border border-black/10 bg-white p-6 text-gris">No tenés permisos para ver las consultas.</p>;
  }
  const supabase = await createClient();
  const { data } = await supabase.from('contact_requests').select('*').order('created_at', { ascending: false });
  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-medium text-azul">Consultas</h1>
      <p className="mb-6 text-sm text-gris">Solicitudes recibidas desde el formulario público.</p>
      <ConsultasClient initial={(data ?? []) as ContactRequest[]} />
    </div>
  );
}
