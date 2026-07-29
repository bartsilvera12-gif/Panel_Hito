'use client';
import { useState, useTransition } from 'react';
import { Info } from 'lucide-react';
import { updateRow } from '@/actions/admin';
import type { AdminProfile, AdminRole } from '@/lib/types';

const ROLES: AdminRole[] = ['superadmin', 'admin', 'editor'];

export default function UsersClient({ initial, canInvite }: { initial: AdminProfile[]; canInvite: boolean }) {
  const [rows, setRows] = useState(initial);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(null), 2200); };

  const change = (r: AdminProfile, values: Partial<AdminProfile>) => start(async () => {
    const res = await updateRow('admin_profiles', r.id, values as Record<string, unknown>);
    if (res.ok) setRows((rs) => rs.map((x) => x.id === r.id ? { ...x, ...values } : x));
    flash(res.ok ? 'Actualizado' : `Error: ${res.error}`);
  });

  return (
    <div>
      {msg && <div className="fixed bottom-5 right-5 z-50 rounded-md bg-azul px-4 py-2 text-sm text-white shadow-lg">{msg}</div>}
      {!canInvite && (
        <div className="mb-5 flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-4 text-[13px] text-amber-800">
          <Info size={16} className="mt-0.5 shrink-0" />
          <span>Invitar/crear usuarios requiere <code>SUPABASE_SERVICE_ROLE_KEY</code> (Supabase Admin API). Con el script: <code>npx tsx scripts/create-admin.ts</code>. Acá podés cambiar rol y activar/desactivar los perfiles existentes.</span>
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border border-black/10 bg-white">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-claro text-[12px] uppercase tracking-wide text-gris">
            <tr><th className="px-4 py-3">Nombre</th><th className="px-4 py-3">Rol</th><th className="px-4 py-3">Estado</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-black/5">
                <td className="px-4 py-3 text-azul">{r.full_name ?? '—'}</td>
                <td className="px-4 py-3">
                  <select value={r.role} disabled={pending} onChange={(e) => change(r, { role: e.target.value as AdminRole })} className="rounded-sm border border-black/15 px-2 py-1">
                    {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => change(r, { active: !r.active })} disabled={pending} className={`rounded-sm px-3 py-1 text-[13px] ${r.active ? 'bg-cian/15 text-azul' : 'bg-black/10 text-gris'}`}>
                    {r.active ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
