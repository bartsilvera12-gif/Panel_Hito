'use server';
import { createHmac } from 'node:crypto';
import { headers } from 'next/headers';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({
  full_name: z.string().min(2, 'Ingresá tu nombre').max(120),
  company: z.string().max(160).optional().or(z.literal('')),
  phone: z.string().max(40).optional().or(z.literal('')),
  email: z.string().email('Correo inválido').max(160).optional().or(z.literal('')),
  project_type: z.string().max(80).optional().or(z.literal('')),
  city: z.string().max(120).optional().or(z.literal('')),
  approximate_area: z.string().max(80).optional().or(z.literal('')),
  message: z.string().max(2000).optional().or(z.literal('')),
  // Honeypot: debe venir vacío
  website: z.string().max(0).optional().or(z.literal('')),
  utm_source: z.string().max(120).optional().or(z.literal('')),
  utm_medium: z.string().max(120).optional().or(z.literal('')),
  utm_campaign: z.string().max(120).optional().or(z.literal('')),
  source_page: z.string().max(200).optional().or(z.literal('')),
});

export type ContactState = { ok: boolean; error?: string };

// Rate limit best-effort en memoria (por instancia).
const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 4;

export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };
  }
  const d = parsed.data;
  // Honeypot
  if (d.website && d.website.length > 0) return { ok: true }; // bot: fingir éxito sin insertar

  const h = await headers();
  const ipRaw = (h.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
  const secret = process.env.IP_HASH_SECRET ?? 'dev-secret';
  const ipHash = createHmac('sha256', secret).update(ipRaw).digest('hex');

  // Rate limit
  const now = Date.now();
  const arr = (hits.get(ipHash) ?? []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX_PER_WINDOW) {
    return { ok: false, error: 'Demasiados envíos. Probá de nuevo en unos minutos.' };
  }
  arr.push(now); hits.set(ipHash, arr);

  const supabase = await createClient();
  const { error } = await supabase.from('contact_requests').insert({
    full_name: d.full_name,
    company: d.company || null,
    phone: d.phone || null,
    email: d.email || null,
    project_type: d.project_type || null,
    city: d.city || null,
    approximate_area: d.approximate_area || null,
    message: d.message || null,
    source_page: d.source_page || null,
    utm_source: d.utm_source || null,
    utm_medium: d.utm_medium || null,
    utm_campaign: d.utm_campaign || null,
    ip_hash: ipHash,
    user_agent: h.get('user-agent')?.slice(0, 400) ?? null,
  });

  if (error) return { ok: false, error: 'No se pudo enviar la consulta. Intentá nuevamente.' };
  return { ok: true };
}
