// Resuelve la URL de un medio. Rutas públicas (/uploads, /brand, http) se usan tal cual;
// paths relativos se resuelven contra el bucket público de Supabase Storage.
export function mediaUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('/')) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  return `${base}/storage/v1/object/public/panelhito-media/${path}`;
}

// Genera el href de WhatsApp con el número configurado y un mensaje opcional.
export function whatsappHref(number: string | null | undefined, message?: string | null): string {
  const digits = (number ?? '').replace(/\D/g, '');
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${digits}${text}`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('es-PY', { dateStyle: 'medium', timeStyle: 'short' });
}
