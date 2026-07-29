'use client';
import { useState, useTransition } from 'react';
import { Save } from 'lucide-react';
import { saveSettings } from '@/actions/admin';
import type { SiteSettings } from '@/lib/types';

const GROUPS: { title: string; fields: { name: keyof SiteSettings; label: string; area?: boolean }[] }[] = [
  { title: 'Negocio', fields: [
    { name: 'business_name', label: 'Nombre del negocio' },
    { name: 'slogan', label: 'Slogan' },
    { name: 'business_description', label: 'Descripción', area: true },
  ]},
  { title: 'Contacto', fields: [
    { name: 'whatsapp_number', label: 'WhatsApp (solo dígitos, ej. 595981000000)' },
    { name: 'phone_display', label: 'Teléfono visible' },
    { name: 'email', label: 'Correo' },
    { name: 'address', label: 'Dirección' },
    { name: 'city', label: 'Ciudad' },
    { name: 'country', label: 'País' },
  ]},
  { title: 'Redes', fields: [
    { name: 'instagram_url', label: 'Instagram (URL)' },
    { name: 'facebook_url', label: 'Facebook (URL)' },
  ]},
  { title: 'Branding', fields: [
    { name: 'logo_light_path', label: 'Logo claro (ruta)' },
    { name: 'logo_dark_path', label: 'Logo oscuro (ruta)' },
    { name: 'favicon_path', label: 'Favicon (ruta)' },
  ]},
  { title: 'SEO', fields: [
    { name: 'seo_title', label: 'Título SEO' },
    { name: 'seo_description', label: 'Descripción SEO', area: true },
    { name: 'og_image_path', label: 'Imagen Open Graph (ruta)' },
  ]},
  { title: 'Analítica', fields: [
    { name: 'google_analytics_id', label: 'Google Analytics ID' },
    { name: 'google_search_console_code', label: 'Search Console (código)' },
    { name: 'meta_pixel_id', label: 'Meta Pixel ID' },
  ]},
];

export default function SettingsForm({ initial }: { initial: SiteSettings }) {
  const [s, setS] = useState(initial);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const cls = 'w-full rounded-sm border border-black/15 px-3 py-2 text-[14px] outline-none focus:border-cian';

  const save = () => start(async () => {
    const values = { ...s } as any; delete values.id;
    const res = await saveSettings(s.id, values);
    setMsg(res.ok ? 'Configuración guardada' : `Error: ${res.error}`);
    setTimeout(() => setMsg(null), 2500);
  });

  return (
    <div>
      {msg && <div className="fixed bottom-5 right-5 z-50 rounded-md bg-azul px-4 py-2 text-sm text-white shadow-lg">{msg}</div>}
      <div className="grid gap-5">
        {GROUPS.map((g) => (
          <div key={g.title} className="rounded-lg border border-black/10 bg-white p-5">
            <h2 className="mb-4 font-display text-[16px] font-semibold text-azul">{g.title}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {g.fields.map((f) => (
                <div key={f.name as string} className={f.area ? 'sm:col-span-2' : ''}>
                  <label className="mb-1 block text-[12px] font-medium text-gris">{f.label}</label>
                  {f.area
                    ? <textarea rows={2} className={cls} value={(s as any)[f.name] ?? ''} onChange={(e) => setS({ ...s, [f.name]: e.target.value })} />
                    : <input className={cls} value={(s as any)[f.name] ?? ''} onChange={(e) => setS({ ...s, [f.name]: e.target.value })} />}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button onClick={save} disabled={pending} className="mt-5 inline-flex items-center gap-2 rounded-sm bg-cian px-6 py-3 font-semibold text-azul hover:bg-cian-hover disabled:opacity-60">
        <Save size={17} /> {pending ? 'Guardando…' : 'Guardar configuración'}
      </button>
    </div>
  );
}
