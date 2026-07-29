import { redirect } from 'next/navigation';
import UsersClient from '@/components/admin/UsersClient';
import { createClient } from '@/lib/supabase/server';
import { getAuthAdmin } from '@/lib/queries';
import { hasServiceRole } from '@/lib/supabase/admin';
import type { AdminProfile } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function UsuariosPage() {
  const auth = await getAuthAdmin();
  if (!auth) redirect('/admin/login');
  if (auth.profile.role !== 'superadmin') {
    return <p className="rounded-md border border-black/10 bg-white p-6 text-gris">Solo un superadmin puede administrar usuarios.</p>;
  }
  const supabase = await createClient();
  const { data } = await supabase.from('admin_profiles').select('*').order('created_at');
  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-medium text-azul">Usuarios administradores</h1>
      <p className="mb-6 text-sm text-gris">Roles y acceso al panel.</p>
      <UsersClient initial={(data ?? []) as AdminProfile[]} canInvite={hasServiceRole()} />
    </div>
  );
}
