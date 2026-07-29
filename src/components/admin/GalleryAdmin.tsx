'use client';
import { useState, useTransition } from 'react';
import { Eye, EyeOff, Star, Trash2, ChevronUp, ChevronDown, Save, Info } from 'lucide-react';
import { toggleField, deleteRow, updateRow, reorderRows } from '@/actions/admin';
import { mediaUrl } from '@/lib/utils';
import type { ProjectMedia } from '@/lib/types';

export default function GalleryAdmin({ initial, canUpload }: { initial: ProjectMedia[]; canUpload: boolean }) {
  const [items, setItems] = useState(initial);
  const [limit, setLimit] = useState(60);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(null), 2200); };

  const patch = (id: string, v: Partial<ProjectMedia>) => setItems((it) => it.map((m) => m.id === id ? { ...m, ...v } : m));

  const toggle = (m: ProjectMedia, field: 'published' | 'featured') => start(async () => {
    const next = !m[field];
    const res = await toggleField('project_media', m.id, field, next);
    if (res.ok) patch(m.id, { [field]: next } as any);
    flash(res.ok ? 'Actualizado' : `Error: ${res.error}`);
  });

  const remove = (m: ProjectMedia) => {
    if (!confirm('¿Quitar este elemento de la galería?')) return;
    start(async () => {
      const res = await deleteRow('project_media', m.id);
      if (res.ok) setItems((it) => it.filter((x) => x.id !== m.id));
      flash(res.ok ? 'Eliminado' : `Error: ${res.error}`);
    });
  };

  const saveMeta = (m: ProjectMedia) => start(async () => {
    const res = await updateRow('project_media', m.id, { alt_text: m.alt_text, caption: m.caption });
    flash(res.ok ? 'Guardado' : `Error: ${res.error}`);
  });

  const move = (idx: number, dir: -1 | 1) => {
    const j = idx + dir; if (j < 0 || j >= items.length) return;
    const next = [...items]; [next[idx], next[j]] = [next[j], next[idx]];
    setItems(next); start(async () => { await reorderRows('project_media', next.map((x) => x.id)); });
  };

  return (
    <div>
      {msg && <div className="fixed bottom-5 right-5 z-50 rounded-md bg-azul px-4 py-2 text-sm text-white shadow-lg">{msg}</div>}

      {!canUpload && (
        <div className="mb-5 flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-4 text-[13px] text-amber-800">
          <Info size={16} className="mt-0.5 shrink-0" />
          <span>La <b>carga de nuevos archivos</b> (drag &amp; drop a Supabase Storage) requiere configurar <code>SUPABASE_SERVICE_ROLE_KEY</code>. Mientras tanto podés gestionar (publicar, ocultar, ordenar, editar y eliminar) los {items.length} medios ya importados.</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.slice(0, limit).map((m, idx) => (
          <div key={m.id} className="overflow-hidden rounded-lg border border-black/10 bg-white">
            <div className="relative aspect-[4/3] bg-black/5">
              {m.media_type === 'video'
                ? <video src={mediaUrl(m.storage_path)} className="h-full w-full object-cover" muted />
                : <img src={mediaUrl(m.storage_path)} alt={m.alt_text ?? ''} loading="lazy" className="h-full w-full object-cover" />}
              {!m.published && <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-[10px] text-white">oculto</span>}
              {m.featured && <span className="absolute right-2 top-2 rounded bg-cian px-2 py-0.5 text-[10px] font-semibold text-azul">inicio</span>}
            </div>
            <div className="p-2">
              <input value={m.alt_text ?? ''} onChange={(e) => patch(m.id, { alt_text: e.target.value })} placeholder="Alt text" className="mb-1 w-full rounded-sm border border-black/10 px-2 py-1 text-[12px] outline-none focus:border-cian" />
              <input value={m.caption ?? ''} onChange={(e) => patch(m.id, { caption: e.target.value })} placeholder="Caption" className="w-full rounded-sm border border-black/10 px-2 py-1 text-[12px] outline-none focus:border-cian" />
              <div className="mt-2 flex flex-wrap items-center gap-1">
                <button title="Guardar" onClick={() => saveMeta(m)} disabled={pending} className="rounded-sm bg-cian p-1.5 text-azul hover:bg-cian-hover"><Save size={14} /></button>
                <button title={m.published ? 'Ocultar' : 'Publicar'} onClick={() => toggle(m, 'published')} disabled={pending} className="rounded-sm border border-black/15 p-1.5 text-azul">{m.published ? <Eye size={14} /> : <EyeOff size={14} />}</button>
                <button title="Destacar en inicio" onClick={() => toggle(m, 'featured')} disabled={pending} className={`rounded-sm border p-1.5 ${m.featured ? 'border-cian text-cian' : 'border-black/15 text-gris'}`}><Star size={14} /></button>
                <button title="Subir" onClick={() => move(idx, -1)} disabled={pending || idx === 0} className="rounded-sm border border-black/15 p-1.5 text-gris disabled:opacity-40"><ChevronUp size={14} /></button>
                <button title="Bajar" onClick={() => move(idx, 1)} disabled={pending || idx === items.length - 1} className="rounded-sm border border-black/15 p-1.5 text-gris disabled:opacity-40"><ChevronDown size={14} /></button>
                <button title="Eliminar" onClick={() => remove(m)} disabled={pending} className="ml-auto rounded-sm border border-red-200 p-1.5 text-red-600 hover:bg-red-50"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {limit < items.length && (
        <div className="mt-6 text-center">
          <button onClick={() => setLimit((l) => l + 60)} className="rounded-sm bg-azul px-6 py-3 text-[14px] font-semibold text-white hover:bg-cian hover:text-azul">Cargar más ({items.length - limit})</button>
        </div>
      )}
    </div>
  );
}
