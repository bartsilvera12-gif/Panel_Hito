'use client';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import {
  Plus, Trash2, ChevronUp, ChevronDown, ChevronRight, Pencil, Save, Eye, EyeOff, Loader2,
  Search, X, CheckCircle2, AlertCircle, Inbox, Image as ImageIcon, Upload,
} from 'lucide-react';
import { createRow, updateRow, deleteRow, toggleField, reorderRows, uploadImage } from '@/actions/admin';
import { mediaUrl } from '@/lib/utils';

const fieldInputCls = 'w-full rounded-md border border-black/15 px-3 py-2 text-[14px] outline-none transition focus:border-cian focus:ring-2 focus:ring-cian/20';

// Campo de imagen: ruta de texto + botón "Subir" (sube el archivo y llena la ruta).
function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onFile = async (file?: File) => {
    if (!file) return;
    setUploading(true); setErr(null);
    try {
      const fd = new FormData(); fd.append('file', file);
      const res = await uploadImage(fd);
      if (res.ok && res.path) onChange(res.path);
      else setErr(res.error ?? 'Error al subir');
    } finally {
      setUploading(false);
      if (ref.current) ref.current.value = '';
    }
  };

  const preview = value ? mediaUrl(value) : '';
  return (
    <div>
      <div className="flex gap-2">
        <input className={fieldInputCls} value={value} onChange={(e) => onChange(e.target.value)} placeholder="ruta de imagen o subí un archivo →" />
        <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
        <button type="button" onClick={() => ref.current?.click()} disabled={uploading}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-black/15 px-3 py-2 text-[13px] font-medium text-azul transition hover:border-cian hover:text-cian disabled:opacity-50">
          {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />} Subir
        </button>
      </div>
      {preview && <img src={preview} alt="" className="mt-2 h-20 w-20 rounded-md border border-black/10 object-cover" />}
      {err && <p className="mt-1 text-[12px] text-red-600">{err}</p>}
    </div>
  );
}

export type FieldType = 'text' | 'textarea' | 'array' | 'select' | 'slug' | 'image';
export interface FieldDef { name: string; label: string; type?: FieldType; options?: string[]; from?: string; }

type Row = Record<string, any> & { id: string };
type Toast = { text: string; kind: 'ok' | 'error' };

const asText = (v: any) => (Array.isArray(v) ? v.join(', ') : String(v ?? ''));

// Convierte un texto en slug: minúsculas, sin acentos, guiones.
const slugify = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export default function SimpleCrud({
  table, fields, initialRows, publishField = 'published', imageField, groupBy,
}: {
  table: string;
  fields: FieldDef[];
  initialRows: Row[];
  publishField?: 'published' | 'visible';
  imageField?: string;
  groupBy?: string;
}) {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [pending, start] = useTransition();
  const [toast, setToast] = useState<Toast | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const groupVal = (row: Row) => (groupBy ? asText(row[groupBy]).trim() || 'Sin categoría' : '');
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    if (!groupBy || initialRows.length === 0) return new Set();
    return new Set([asText(initialRows[0][groupBy]).trim() || 'Sin categoría']); // primera categoría abierta
  });
  const toggleGroup = (g: string) =>
    setOpenGroups((s) => { const n = new Set(s); if (n.has(g)) n.delete(g); else n.add(g); return n; });

  // Snapshot de los valores guardados para detectar cambios sin guardar.
  const baseline = useRef<Record<string, string>>({});
  const snapKey = (id: string, name: string) => `${id}::${name}`;
  const snapshot = (row: Row) => {
    fields.forEach((f) => { baseline.current[snapKey(row.id, f.name)] = asText(row[f.name]); });
  };
  useEffect(() => { initialRows.forEach(snapshot); }, []);

  const isDirty = (row: Row) =>
    fields.some((f) => asText(row[f.name]) !== (baseline.current[snapKey(row.id, f.name)] ?? ''));

  const flash = (text: string, kind: Toast['kind'] = 'ok') => {
    setToast({ text, kind });
    setTimeout(() => setToast(null), 2600);
  };

  const setField = (id: string, name: string, value: string) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [name]: value } : r)));

  const parse = (f: FieldDef, v: any) =>
    f.type === 'array' ? String(v ?? '').split(',').map((s) => s.trim()).filter(Boolean) : (v ?? '');

  const save = (row: Row) => start(async () => {
    const values: Record<string, unknown> = {};
    fields.forEach((f) => { values[f.name] = parse(f, row[f.name]); });
    const res = await updateRow(table, row.id, values);
    if (res.ok) { snapshot(row); setEditingId(null); }
    flash(res.ok ? 'Cambios guardados' : `Error: ${res.error}`, res.ok ? 'ok' : 'error');
  });

  // Descartar cambios: restaurar los valores guardados y cerrar el editor.
  const cancelEdit = (id: string) => {
    setRows((rs) => rs.map((r) => (r.id === id
      ? { ...r, ...Object.fromEntries(fields.map((f) => [f.name, baseline.current[snapKey(id, f.name)] ?? ''])) }
      : r)));
    setEditingId(null);
  };

  const remove = (id: string) => {
    if (!confirm('¿Eliminar este elemento? Esta acción no se puede deshacer.')) return;
    start(async () => {
      const res = await deleteRow(table, id);
      if (res.ok) setRows((rs) => rs.filter((r) => r.id !== id));
      flash(res.ok ? 'Elemento eliminado' : `Error: ${res.error}`, res.ok ? 'ok' : 'error');
    });
  };

  const togglePub = (row: Row) => start(async () => {
    const next = !row[publishField];
    const res = await toggleField(table, row.id, publishField, next);
    if (res.ok) setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, [publishField]: next } : r)));
    flash(res.ok ? (next ? 'Ahora visible en el sitio' : 'Oculto del sitio') : `Error: ${res.error}`, res.ok ? 'ok' : 'error');
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
      const newRow: Row = { id: res.id as string, [publishField]: true, ...Object.fromEntries(fields.map((f) => [f.name, parse(f, draft[f.name])])) };
      snapshot(newRow);
      setRows((rs) => [...rs, newRow]);
      setDraft({});
      setShowAdd(false);
    }
    flash(res.ok ? 'Elemento creado' : `Error: ${res.error}`, res.ok ? 'ok' : 'error');
  });

  const inputCls = 'w-full rounded-md border border-black/15 px-3 py-2 text-[14px] outline-none transition focus:border-cian focus:ring-2 focus:ring-cian/20';

  // Renderiza el control según el tipo de campo (texto, textarea, select, slug…).
  // `sourceValue` es el valor del campo origen (f.from) para generar el slug.
  const renderField = (f: FieldDef, value: string, onChange: (v: string) => void, sourceValue = '') => {
    if (f.type === 'select') {
      return (
        <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">— Elegí una opción —</option>
          {(f.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    }
    if (f.type === 'textarea') {
      return <textarea className={inputCls} rows={3} value={value} onChange={(e) => onChange(e.target.value)} />;
    }
    if (f.type === 'image') {
      return <ImageField value={value} onChange={onChange} />;
    }
    if (f.type === 'slug') {
      return (
        <div className="flex gap-2">
          <input className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} placeholder="ej: panel-para-cubiertas" />
          <button type="button" onClick={() => onChange(slugify(sourceValue))} disabled={!slugify(sourceValue)}
            title={f.from ? `Generar desde ${f.from}` : 'Generar'}
            className="shrink-0 rounded-md border border-black/15 px-3 py-2 text-[13px] font-medium text-azul transition hover:border-cian hover:text-cian disabled:opacity-40">
            Generar
          </button>
        </div>
      );
    }
    return <input className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} />;
  };

  // Búsqueda simple sobre el contenido de los campos.
  const visibleRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => fields.some((f) => asText(r[f.name]).toLowerCase().includes(q)));
  }, [rows, query, fields]);

  const showSearch = rows.length > 4;

  // Render de una fila compacta + su editor expandible.
  const renderRow = (row: Row) => {
    const idx = rows.indexOf(row);
    const editing = editingId === row.id;
    const dirty = isDirty(row);
    const title = asText(row[fields[0].name]).trim() || 'Sin título';
    const subtitle = fields[1] ? asText(row[fields[1].name]).trim() : '';
    const pub = row[publishField];
    const thumb = imageField ? mediaUrl(row[imageField]) : null;
    const showReorder = !query && !groupBy;
    return (
      <div key={row.id}>
        {/* Fila compacta */}
        <div className={`flex items-center gap-2 px-3 py-2.5 sm:px-4 ${editing ? 'bg-claro' : 'hover:bg-claro/50'}`}>
          <button onClick={() => (editing ? cancelEdit(row.id) : setEditingId(row.id))} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
            <ChevronRight size={16} className={`shrink-0 text-gris transition-transform ${editing ? 'rotate-90' : ''}`} />
            {imageField && (
              thumb
                ? <img src={thumb} alt="" loading="lazy" className="h-10 w-10 shrink-0 rounded-md border border-black/10 object-cover" />
                : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-dashed border-black/15 bg-claro text-gris/60"><ImageIcon size={16} /></span>
            )}
            <span className="min-w-0">
              <span className="block truncate text-[14px] font-medium text-azul">{title}</span>
              {subtitle && <span className="block truncate text-[12px] text-gris">{subtitle}</span>}
            </span>
          </button>

          <button onClick={() => togglePub(row)} disabled={pending} title={pub ? 'Visible en el sitio — clic para ocultar' : 'Oculto — clic para publicar'}
            className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${pub ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'border-black/10 bg-black/5 text-gris hover:bg-black/10'}`}>
            {pub ? <><Eye size={12} /> Visible</> : <><EyeOff size={12} /> Oculto</>}
          </button>

          {showReorder && (
            <span className="hidden shrink-0 items-center sm:flex">
              <button onClick={() => move(idx, -1)} disabled={pending || idx === 0} title="Subir" className="rounded-md p-1.5 text-gris hover:bg-black/5 hover:text-azul disabled:opacity-30"><ChevronUp size={16} /></button>
              <button onClick={() => move(idx, 1)} disabled={pending || idx === rows.length - 1} title="Bajar" className="rounded-md p-1.5 text-gris hover:bg-black/5 hover:text-azul disabled:opacity-30"><ChevronDown size={16} /></button>
            </span>
          )}

          <button onClick={() => (editing ? cancelEdit(row.id) : setEditingId(row.id))} title="Editar" className="shrink-0 rounded-md p-1.5 text-gris hover:bg-black/5 hover:text-azul"><Pencil size={16} /></button>
          <button onClick={() => remove(row.id)} disabled={pending} title="Eliminar" className="shrink-0 rounded-md p-1.5 text-gris hover:bg-red-50 hover:text-red-600 disabled:opacity-40"><Trash2 size={16} /></button>
        </div>

        {/* Editor expandible (solo el elemento seleccionado) */}
        {editing && (
          <div className="border-t border-black/5 bg-claro px-3 py-4 sm:px-4">
            <div className="grid gap-3">
              {fields.map((f) => (
                <div key={f.name}>
                  <label className="mb-1 block text-[12px] font-medium text-gris">{f.label}{f.type === 'array' ? ' (separá con comas)' : ''}</label>
                  {renderField(f, asText(row[f.name]), (v) => setField(row.id, f.name, v), f.from ? asText(row[f.from]) : '')}
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <button onClick={() => save(row)} disabled={pending || !dirty} className="inline-flex items-center gap-1.5 rounded-md bg-cian px-4 py-2 text-[13px] font-semibold text-azul hover:bg-cian-hover disabled:opacity-50">
                {pending ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />} {dirty ? 'Guardar cambios' : 'Guardado'}
              </button>
              <button onClick={() => cancelEdit(row.id)} disabled={pending} className="rounded-md border border-black/15 px-4 py-2 text-[13px] text-azul hover:border-cian">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Agrupa las filas visibles por la categoría indicada (preservando el orden).
  const groupedRows = () => {
    const order: string[] = [];
    const map = new Map<string, Row[]>();
    visibleRows.forEach((row) => {
      const g = groupVal(row);
      if (!map.has(g)) { map.set(g, []); order.push(g); }
      map.get(g)!.push(row);
    });
    return order.map((g) => ({ g, rows: map.get(g)! }));
  };

  return (
    <div>
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm text-white shadow-lg ${toast.kind === 'ok' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {toast.kind === 'ok' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.text}
        </div>
      )}

      {/* Barra superior: contador, aviso de cambios, buscador y botón Agregar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="text-[13px] text-gris">
          {rows.length} {rows.length === 1 ? 'elemento' : 'elementos'}
        </span>
        {showSearch && (
          <div className="relative ml-auto w-full max-w-[280px]">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gris" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar…"
              className="w-full rounded-md border border-black/15 py-2 pl-9 pr-8 text-[14px] outline-none focus:border-cian focus:ring-2 focus:ring-cian/20"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gris hover:text-azul" aria-label="Limpiar">
                <X size={15} />
              </button>
            )}
          </div>
        )}
        <button
          onClick={() => setShowAdd((v) => !v)}
          className={`inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-[13px] font-semibold transition ${showSearch ? '' : 'ml-auto'} ${showAdd ? 'border border-black/15 text-azul hover:border-cian' : 'bg-azul text-white hover:bg-cian hover:text-azul'}`}
        >
          {showAdd ? <><X size={15} /> Cerrar</> : <><Plus size={15} /> Agregar</>}
        </button>
      </div>

      {/* Formulario de alta (colapsable, arriba del listado) */}
      {showAdd && (
        <div className="mb-5 rounded-lg border border-dashed border-cian/50 bg-cian/5 p-4">
          <div className="mb-3 flex items-center gap-2 text-[14px] font-semibold text-azul"><Plus size={16} /> Nuevo elemento</div>
          <div className="grid gap-3">
            {fields.map((f) => (
              <div key={f.name}>
                <label className="mb-1 block text-[12px] font-medium text-gris">{f.label}{f.type === 'array' ? ' (separá con comas)' : ''}</label>
                {renderField(f, draft[f.name] ?? '', (v) => setDraft((d) => ({ ...d, [f.name]: v })), f.from ? (draft[f.from] ?? '') : '')}
              </div>
            ))}
          </div>
          <button onClick={add} disabled={pending} className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-azul px-4 py-2 text-[13px] font-semibold text-white hover:bg-cian hover:text-azul disabled:opacity-60">
            {pending ? <Loader2 className="animate-spin" size={15} /> : <Plus size={15} />} Crear
          </button>
        </div>
      )}

      {/* Listado */}
      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-black/15 bg-white p-10 text-center">
          <Inbox size={28} className="mx-auto text-gris/60" />
          <p className="mt-3 text-sm text-gris">Todavía no hay elementos.</p>
          <button onClick={() => setShowAdd(true)} className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-azul px-4 py-2 text-[13px] font-semibold text-white hover:bg-cian hover:text-azul">
            <Plus size={15} /> Agregar el primero
          </button>
        </div>
      ) : visibleRows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-black/15 bg-white p-8 text-center text-sm text-gris">
          Sin resultados para “{query}”.
        </p>
      ) : groupBy ? (
        <div className="space-y-3">
          {groupedRows().map(({ g, rows: gr }) => {
            const isOpen = query ? true : openGroups.has(g);
            return (
              <div key={g} className="overflow-hidden rounded-lg border border-black/10 bg-white">
                <button onClick={() => toggleGroup(g)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-claro">
                  <span className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold text-azul">{g}</span>
                    <span className="rounded-full bg-black/5 px-2 py-0.5 text-[11px] text-gris">{gr.length}</span>
                  </span>
                  <ChevronDown size={18} className={`shrink-0 text-gris transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && <div className="divide-y divide-black/5 border-t border-black/10">{gr.map(renderRow)}</div>}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="divide-y divide-black/5 overflow-hidden rounded-lg border border-black/10 bg-white">
          {visibleRows.map(renderRow)}
        </div>
      )}
    </div>
  );
}
