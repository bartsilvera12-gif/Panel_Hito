'use client';
import { useState, useTransition } from 'react';
import { Save, Eye, EyeOff } from 'lucide-react';
import { updateRow, toggleField } from '@/actions/admin';
import type { SiteSection } from '@/lib/types';

const FIELDS: { name: keyof SiteSection; label: string; area?: boolean }[] = [
  { name: 'eyebrow', label: 'Etiqueta (eyebrow)' },
  { name: 'title', label: 'Título' },
  { name: 'description', label: 'Descripción', area: true },
  { name: 'secondary_text', label: 'Texto secundario', area: true },
  { name: 'primary_button_label', label: 'Botón principal · texto' },
  { name: 'primary_button_url', label: 'Botón principal · enlace' },
  { name: 'secondary_button_label', label: 'Botón secundario · texto' },
  { name: 'secondary_button_url', label: 'Botón secundario · enlace' },
];

export default function SectionsEditor({ initial }: { initial: SiteSection[] }) {
  const [sections, setSections] = useState(initial);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(null), 2500); };

  const set = (id: string, name: string, value: string) =>
    setSections((s) => s.map((x) => (x.id === id ? { ...x, [name]: value } : x)));

  const save = (sec: SiteSection) => start(async () => {
    const values: Record<string, unknown> = {};
    FIELDS.forEach((f) => { values[f.name as string] = (sec as any)[f.name] ?? null; });
    const res = await updateRow('site_sections', sec.id, values);
    flash(res.ok ? 'Sección guardada' : `Error: ${res.error}`);
  });

  const toggle = (sec: SiteSection) => start(async () => {
    const next = !sec.visible;
    const res = await toggleField('site_sections', sec.id, 'visible', next);
    if (res.ok) setSections((s) => s.map((x) => (x.id === sec.id ? { ...x, visible: next } : x)));
    flash(res.ok ? (next ? 'Sección visible' : 'Sección oculta') : `Error: ${res.error}`);
  });

  const cls = 'w-full rounded-sm border border-black/15 px-3 py-2 text-[14px] outline-none focus:border-cian';

  return (
    <div className="grid gap-4">
      {msg && <div className="fixed bottom-5 right-5 z-50 rounded-md bg-azul px-4 py-2 text-sm text-white shadow-lg">{msg}</div>}
      {sections.map((sec) => (
        <details key={sec.id} className="rounded-lg border border-black/10 bg-white p-4">
          <summary className="flex cursor-pointer items-center justify-between font-display text-[16px] font-medium text-azul">
            <span className="capitalize">{sec.section_key}</span>
            <span className={`rounded px-2 py-0.5 text-[11px] ${sec.visible ? 'bg-cian/15 text-azul' : 'bg-black/10 text-gris'}`}>{sec.visible ? 'visible' : 'oculta'}</span>
          </summary>
          <div className="mt-4 grid gap-3">
            {FIELDS.map((f) => (
              <div key={f.name as string}>
                <label className="mb-1 block text-[12px] font-medium text-gris">{f.label}</label>
                {f.area
                  ? <textarea rows={2} className={cls} value={(sec as any)[f.name] ?? ''} onChange={(e) => set(sec.id, f.name as string, e.target.value)} />
                  : <input className={cls} value={(sec as any)[f.name] ?? ''} onChange={(e) => set(sec.id, f.name as string, e.target.value)} />}
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => save(sec)} disabled={pending} className="inline-flex items-center gap-1.5 rounded-sm bg-cian px-3 py-2 text-[13px] font-semibold text-azul hover:bg-cian-hover disabled:opacity-60"><Save size={15} /> Guardar</button>
            <button onClick={() => toggle(sec)} disabled={pending} className="inline-flex items-center gap-1.5 rounded-sm border border-black/15 px-3 py-2 text-[13px] text-azul hover:border-cian">
              {sec.visible ? <><Eye size={15} /> Visible</> : <><EyeOff size={15} /> Oculta</>}
            </button>
          </div>
        </details>
      ))}
    </div>
  );
}
