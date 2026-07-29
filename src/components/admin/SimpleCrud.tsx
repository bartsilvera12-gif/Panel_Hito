'use client';
import { useState, useTransition } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Save, Eye, EyeOff, Loader2 } from 'lucide-react';
import { createRow, updateRow, deleteRow, toggleField, reorderRows } from '@/actions/admin';

export type FieldType = 'text' | 'textarea' | 'array';
export interface FieldDef { name: string; label: string; type?: FieldType; }

type Row = Record<string, any> & { id: string };

export default function SimpleCrud({
  table, fields, initialRows, publishField = 'published',
}: {
  table: string;
  fields: FieldDef[];
  initialRows: Row[];
  publishField?: 'published' | 'visible';
}) {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(null), 2500); };

  const setField = (id: string, name: string, value: string) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [name]: value } : r)));

  const parse = (f: FieldDef, v: any) =>
    f.type === 'array' ? String(v ?? '').split(',').map((s) => s.trim()).filter(Boolean) : (v ?? '');

  const save = (row: Row) => start(async () => {
    const values: Record<string, unknown> = {};
    fields.forEach((f) => { values[f.name] = parse(f, row[f.name]); });
    const res = await updateRow(table, row.id, values);
    flash(res.ok ? 'Guardado' : `Error: ${res.error}`);
  });

  const remove = (id: string) => {
    if (!confirm('¿Eliminar este elemento? Esta acción no se puede deshacer.')) return;
    start(async () => {
      const res = await deleteRow(table, id);
      if (res.ok) setRows((rs) => rs.filter((r) => r.id !== id));
      flash(res.ok ? 'Eliminado' : `Error: ${res.error}`);
    });
  };

  const togglePub = (row: Row) => start(async () => {
    const next = !row[publishField];
    const res = await toggleField(table, row.id, publishField, next);
    if (res.ok) setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, [publishField]: next } : r)));
    flash(res.ok ? (next ? 'Publicado' : 'Oculto') : `Error: ${res.error}`);
  });

  const move = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[idx], next[j]] = [next[j], next[idx]];
    setRows(next);
    start(async () => { await reorderRows(table, next.map((r) => r.id)); flash('Orden actualizado'); });
  };

  const add = () => start(async () => {
    const values: Record<string, unknown> = { sort_order: rows.length };
    fields.forEach((f) => { values[f.name] = parse(f, draft[f.name]); });
    const res = await createRow(table, values);
    if (res.ok && res.id) {
      setRows((rs) => [...rs, { id: res.id as string, [publishField]: true, ...Object.fromEntries(fields.map((f) => [f.name, parse(f, draft[f.name])])) }]);
      setDraft({});
    }
    flash(res.ok ? 'Creado' : `Error: ${res.error}`);
  });

  const inputCls = 'w-full rounded-sm border border-black/15 px-3 py-2 text-[14px] outline-none focus:border-cian';

  return (
    <div>
      {msg && <div className="fixed bottom-5 right-5 z-50 rounded-md bg-azul px-4 py-2 text-sm text-white shadow-lg">{msg}</div>}

      <div className="grid gap-4">
        {rows.map((row, idx) => (
          <div key={row.id} className="rounded-lg border border-black/10 bg-white p-4">
            <div className="grid gap-3">
              {fields.map((f) => (
                <div key={f.name}>
                  <label className="mb-1 block text-[12px] font-medium text-gris">{f.label}{f.type === 'array' ? ' (separá con comas)' : ''}</label>
                  {f.type === 'textarea'
                    ? <textarea className={inputCls} rows={2} value={row[f.name] ?? ''} onChange={(e) => setField(row.id, f.name, e.target.value)} />
                    : <input className={inputCls} value={Array.isArray(row[f.name]) ? row[f.name].join(', ') : (row[f.name] ?? '')} onChange={(e) => setField(row.id, f.name, e.target.value)} />}
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button onClick={() => save(row)} disabled={pending} className="inline-flex items-center gap-1.5 rounded-sm bg-cian px-3 py-2 text-[13px] font-semibold text-azul hover:bg-cian-hover disabled:opacity-60"><Save size={15} /> Guardar</button>
              <button onClick={() => togglePub(row)} disabled={pending} className="inline-flex items-center gap-1.5 rounded-sm border border-black/15 px-3 py-2 text-[13px] text-azul hover:border-cian">
                {row[publishField] ? <><Eye size={15} /> Visible</> : <><EyeOff size={15} /> Oculto</>}
              </button>
              <button onClick={() => move(idx, -1)} disabled={pending || idx === 0} className="rounded-sm border border-black/15 p-2 text-gris hover:border-cian disabled:opacity-40"><ChevronUp size={15} /></button>
              <button onClick={() => move(idx, 1)} disabled={pending || idx === rows.length - 1} className="rounded-sm border border-black/15 p-2 text-gris hover:border-cian disabled:opacity-40"><ChevronDown size={15} /></button>
              <button onClick={() => remove(row.id)} disabled={pending} className="ml-auto inline-flex items-center gap-1.5 rounded-sm border border-red-200 px-3 py-2 text-[13px] text-red-600 hover:bg-red-50"><Trash2 size={15} /> Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-dashed border-black/20 bg-white p-4">
        <div className="mb-3 flex items-center gap-2 text-[14px] font-semibold text-azul"><Plus size={16} /> Agregar</div>
        <div className="grid gap-3">
          {fields.map((f) => (
            <div key={f.name}>
              <label className="mb-1 block text-[12px] font-medium text-gris">{f.label}</label>
              {f.type === 'textarea'
                ? <textarea className={inputCls} rows={2} value={draft[f.name] ?? ''} onChange={(e) => setDraft((d) => ({ ...d, [f.name]: e.target.value }))} />
                : <input className={inputCls} value={draft[f.name] ?? ''} onChange={(e) => setDraft((d) => ({ ...d, [f.name]: e.target.value }))} />}
            </div>
          ))}
        </div>
        <button onClick={add} disabled={pending} className="mt-3 inline-flex items-center gap-1.5 rounded-sm bg-azul px-4 py-2 text-[13px] font-semibold text-white hover:bg-cian hover:text-azul disabled:opacity-60">
          {pending ? <Loader2 className="animate-spin" size={15} /> : <Plus size={15} />} Crear
        </button>
      </div>
    </div>
  );
}
