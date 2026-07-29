'use client';
import { useState, useTransition } from 'react';
import { Save } from 'lucide-react';
import { updateRow, toggleField } from '@/actions/admin';
import type { LegalPage } from '@/lib/types';

export default function LegalEditor({ initial }: { initial: LegalPage }) {
  const [p, setP] = useState(initial);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const cls = 'w-full rounded-sm border border-black/15 px-3 py-2 text-[14px] outline-none focus:border-cian';

  const save = () => start(async () => {
    const res = await updateRow('legal_pages', p.id, {
      title: p.title, content: p.content, last_updated_label: p.last_updated_label,
      seo_title: p.seo_title, seo_description: p.seo_description,
    });
    setMsg(res.ok ? 'Guardado' : `Error: ${res.error}`); setTimeout(() => setMsg(null), 2500);
  });
  const togglePub = () => start(async () => {
    const next = !p.published; const res = await toggleField('legal_pages', p.id, 'published', next);
    if (res.ok) setP({ ...p, published: next });
  });

  return (
    <div className="rounded-lg border border-black/10 bg-white p-5">
      {msg && <div className="fixed bottom-5 right-5 z-50 rounded-md bg-azul px-4 py-2 text-sm text-white shadow-lg">{msg}</div>}
      <div className="grid gap-3">
        <div><label className="mb-1 block text-[12px] font-medium text-gris">Título</label><input className={cls} value={p.title} onChange={(e) => setP({ ...p, title: e.target.value })} /></div>
        <div><label className="mb-1 block text-[12px] font-medium text-gris">Etiqueta de actualización</label><input className={cls} value={p.last_updated_label ?? ''} onChange={(e) => setP({ ...p, last_updated_label: e.target.value })} /></div>
        <div><label className="mb-1 block text-[12px] font-medium text-gris">Contenido</label><textarea rows={16} className={cls} value={p.content ?? ''} onChange={(e) => setP({ ...p, content: e.target.value })} /></div>
        <div><label className="mb-1 block text-[12px] font-medium text-gris">SEO título</label><input className={cls} value={p.seo_title ?? ''} onChange={(e) => setP({ ...p, seo_title: e.target.value })} /></div>
        <div><label className="mb-1 block text-[12px] font-medium text-gris">SEO descripción</label><textarea rows={2} className={cls} value={p.seo_description ?? ''} onChange={(e) => setP({ ...p, seo_description: e.target.value })} /></div>
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={save} disabled={pending} className="inline-flex items-center gap-2 rounded-sm bg-cian px-5 py-2.5 font-semibold text-azul hover:bg-cian-hover disabled:opacity-60"><Save size={16} /> Guardar</button>
        <button onClick={togglePub} disabled={pending} className="rounded-sm border border-black/15 px-4 py-2.5 text-[14px] text-azul hover:border-cian">{p.published ? 'Publicada' : 'Oculta'}</button>
      </div>
    </div>
  );
}
