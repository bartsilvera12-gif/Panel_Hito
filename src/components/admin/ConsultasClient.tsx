'use client';
import { useMemo, useState, useTransition } from 'react';
import { Search, Download, X, Mail, MessageCircle } from 'lucide-react';
import { setContactStatus, saveContactNotes, markContactRead } from '@/actions/admin';
import { formatDate, whatsappHref } from '@/lib/utils';
import type { ContactRequest, ContactStatus } from '@/lib/types';

const STATUSES: ContactStatus[] = ['nuevo', 'contactado', 'presupuestado', 'cerrado', 'descartado'];

export default function ConsultasClient({ initial }: { initial: ContactRequest[] }) {
  const [rows, setRows] = useState(initial);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<string>('todos');
  const [sel, setSel] = useState<ContactRequest | null>(null);
  const [notes, setNotes] = useState('');
  const [, start] = useTransition();

  const filtered = useMemo(() => rows.filter((r) => {
    const okStatus = status === 'todos' || r.status === status;
    const hay = `${r.full_name} ${r.company ?? ''} ${r.email ?? ''} ${r.phone ?? ''} ${r.city ?? ''} ${r.project_type ?? ''}`.toLowerCase();
    return okStatus && hay.includes(q.toLowerCase());
  }), [rows, q, status]);

  const open = (r: ContactRequest) => {
    setSel(r); setNotes(r.internal_notes ?? '');
    if (!r.read_at) start(async () => { await markContactRead(r.id); setRows((rs) => rs.map((x) => x.id === r.id ? { ...x, read_at: new Date().toISOString() } : x)); });
  };

  const changeStatus = (r: ContactRequest, s: string) => start(async () => {
    const res = await setContactStatus(r.id, s);
    if (res.ok) { setRows((rs) => rs.map((x) => x.id === r.id ? { ...x, status: s as ContactStatus } : x)); setSel((cur) => cur && cur.id === r.id ? { ...cur, status: s as ContactStatus } : cur); }
  });

  const persistNotes = (r: ContactRequest) => start(async () => {
    await saveContactNotes(r.id, notes);
    setRows((rs) => rs.map((x) => x.id === r.id ? { ...x, internal_notes: notes } : x));
  });

  const exportCsv = () => {
    const cols = ['created_at', 'full_name', 'company', 'phone', 'email', 'project_type', 'city', 'approximate_area', 'status'];
    const head = cols.join(',');
    const body = filtered.map((r) => cols.map((c) => `"${String((r as any)[c] ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([head + '\n' + body], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'consultas.csv'; a.click(); URL.revokeObjectURL(a.href);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…" className="w-full rounded-sm border border-black/15 py-2 pl-9 pr-3 text-[14px] outline-none focus:border-cian" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-sm border border-black/15 px-3 py-2 text-[14px]">
          <option value="todos">Todos los estados</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-sm border border-black/15 px-3 py-2 text-[13px] text-azul hover:border-cian"><Download size={15} /> CSV</button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-black/10 bg-white">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-claro text-[12px] uppercase tracking-wide text-gris">
            <tr><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Nombre</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Ciudad</th><th className="px-4 py-3">Estado</th></tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} onClick={() => open(r)} className={`cursor-pointer border-t border-black/5 hover:bg-claro ${!r.read_at ? 'font-semibold' : ''}`}>
                <td className="px-4 py-3 text-gris">{formatDate(r.created_at)}</td>
                <td className="px-4 py-3 text-azul">{r.full_name}</td>
                <td className="px-4 py-3 text-gris">{r.project_type ?? '—'}</td>
                <td className="px-4 py-3 text-gris">{r.city ?? '—'}</td>
                <td className="px-4 py-3"><span className="rounded bg-cian/15 px-2 py-1 text-[12px] text-azul">{r.status}</span></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-gris">Sin resultados.</td></tr>}
          </tbody>
        </table>
      </div>

      {sel && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={() => setSel(null)}>
          <div className="h-full w-full max-w-[440px] overflow-y-auto bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <h2 className="font-display text-xl font-medium text-azul">{sel.full_name}</h2>
              <button onClick={() => setSel(null)} aria-label="Cerrar" className="text-gris hover:text-azul"><X /></button>
            </div>
            <div className="mt-4 grid gap-2 text-[14px] text-gris">
              {sel.company && <div><b className="text-azul">Empresa:</b> {sel.company}</div>}
              {sel.phone && <div><b className="text-azul">Teléfono:</b> {sel.phone}</div>}
              {sel.email && <div><b className="text-azul">Correo:</b> {sel.email}</div>}
              {sel.project_type && <div><b className="text-azul">Tipo:</b> {sel.project_type}</div>}
              {sel.city && <div><b className="text-azul">Ciudad:</b> {sel.city}</div>}
              {sel.approximate_area && <div><b className="text-azul">Superficie:</b> {sel.approximate_area}</div>}
              <div><b className="text-azul">Fecha:</b> {formatDate(sel.created_at)}</div>
            </div>
            {sel.message && <p className="mt-3 rounded-sm bg-claro p-3 text-[14px] text-azul">{sel.message}</p>}

            <div className="mt-4 flex gap-2">
              {sel.phone && <a href={whatsappHref(sel.phone)} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 rounded-sm bg-cian px-3 py-2 text-[13px] font-semibold text-azul"><MessageCircle size={15} /> WhatsApp</a>}
              {sel.email && <a href={`mailto:${sel.email}`} className="inline-flex items-center gap-1.5 rounded-sm border border-black/15 px-3 py-2 text-[13px] text-azul"><Mail size={15} /> Correo</a>}
            </div>

            <label className="mt-5 block text-[12px] font-medium text-gris">Estado</label>
            <select value={sel.status} onChange={(e) => changeStatus(sel, e.target.value)} className="mt-1 w-full rounded-sm border border-black/15 px-3 py-2 text-[14px]">
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            <label className="mt-4 block text-[12px] font-medium text-gris">Notas internas</label>
            <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 w-full rounded-sm border border-black/15 px-3 py-2 text-[14px] outline-none focus:border-cian" />
            <button onClick={() => persistNotes(sel)} className="mt-2 rounded-sm bg-azul px-4 py-2 text-[13px] font-semibold text-white hover:bg-cian hover:text-azul">Guardar notas</button>
          </div>
        </div>
      )}
    </div>
  );
}
