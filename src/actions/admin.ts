'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthAdmin } from '@/lib/queries';

async function ctx() {
  const auth = await getAuthAdmin();
  if (!auth) throw new Error('No autorizado');
  const supabase = await createClient();
  return { auth, supabase };
}

async function audit(action: string, entity: string, entityId: string | null, changes?: unknown) {
  try {
    const { auth, supabase } = await ctx();
    await supabase.from('audit_logs').insert({
      user_id: auth.user.id, action, entity, entity_id: entityId, changes: (changes ?? null) as any,
    });
  } catch { /* no bloquear la operación por el log */ }
}

const REVALIDATE = ['/', '/trabajos', '/politicadeprivacidad'];
function revalidateAll(extra: string[] = []) {
  [...REVALIDATE, ...extra].forEach((p) => revalidatePath(p));
}

// ---- CRUD genérico -------------------------------------------------
export async function createRow(table: string, values: Record<string, unknown>) {
  const { supabase } = await ctx();
  const { data, error } = await supabase.from(table).insert(values).select('id').single();
  if (error) return { ok: false, error: error.message };
  await audit('crear', table, data?.id ?? null, values);
  revalidateAll(); return { ok: true, id: data?.id };
}

export async function updateRow(table: string, id: string, values: Record<string, unknown>) {
  const { supabase } = await ctx();
  const { error } = await supabase.from(table).update(values).eq('id', id);
  if (error) return { ok: false, error: error.message };
  await audit('editar', table, id, values);
  revalidateAll(); return { ok: true };
}

export async function deleteRow(table: string, id: string) {
  const { supabase } = await ctx();
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  await audit('eliminar', table, id);
  revalidateAll(); return { ok: true };
}

export async function toggleField(table: string, id: string, field: string, value: boolean) {
  const { supabase } = await ctx();
  const { error } = await supabase.from(table).update({ [field]: value }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  await audit(value ? 'publicar' : 'ocultar', table, id, { [field]: value });
  revalidateAll(); return { ok: true };
}

export async function reorderRows(table: string, orderedIds: string[]) {
  const { supabase } = await ctx();
  for (let i = 0; i < orderedIds.length; i++) {
    await supabase.from(table).update({ sort_order: i }).eq('id', orderedIds[i]);
  }
  await audit('reordenar', table, null, { count: orderedIds.length });
  revalidateAll(); return { ok: true };
}

// ---- galería: subida de archivos -----------------------------------
export async function uploadGalleryMedia(formData: FormData) {
  await ctx(); // exige admin autenticado
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, error: 'Para subir archivos falta configurar SUPABASE_SERVICE_ROLE_KEY.' };
  }

  const files = formData.getAll('files').filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return { ok: false, error: 'No se seleccionaron archivos.' };

  const created: unknown[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const isVideo = file.type.startsWith('video');
    const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/-+/g, '-');
    const path = `gallery/${Date.now()}-${i}-${safe}`;

    const { error: upErr } = await admin.storage
      .from('panelhito-media')
      .upload(path, file, { contentType: file.type || undefined, upsert: false });
    if (upErr) return { ok: false, error: upErr.message };

    const { data, error } = await admin
      .from('project_media')
      .insert({ media_type: isVideo ? 'video' : 'image', storage_path: path, published: true, sort_order: 0 })
      .select('*')
      .single();
    if (error) return { ok: false, error: error.message };
    created.push(data);
  }

  await audit('subir', 'project_media', null, { count: created.length });
  revalidateAll(['/admin/galeria']);
  return { ok: true, items: created };
}

// ---- subida de una imagen (para campos "Ruta de imagen") -----------
export async function uploadImage(formData: FormData) {
  await ctx(); // exige admin autenticado
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, error: 'Para subir imágenes falta configurar SUPABASE_SERVICE_ROLE_KEY.' };
  }
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: 'No se seleccionó ninguna imagen.' };

  const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/-+/g, '-');
  const path = `uploads/${Date.now()}-${safe}`;
  const { error } = await admin.storage
    .from('panelhito-media')
    .upload(path, file, { contentType: file.type || undefined, upsert: false });
  if (error) return { ok: false, error: error.message };

  await audit('subir', 'imagen', null, { path });
  revalidateAll();
  return { ok: true, path };
}

// ---- site_settings -------------------------------------------------
export async function saveSettings(id: string, values: Record<string, unknown>) {
  const { supabase } = await ctx();
  const { error } = await supabase.from('site_settings').update(values).eq('id', id);
  if (error) return { ok: false, error: error.message };
  await audit('configuración', 'site_settings', id, values);
  revalidateAll(); return { ok: true };
}

// ---- consultas -----------------------------------------------------
export async function setContactStatus(id: string, status: string) {
  const { supabase } = await ctx();
  const { error } = await supabase.from('contact_requests').update({ status }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  await audit('editar', 'contact_requests', id, { status });
  revalidatePath('/admin/consultas'); return { ok: true };
}

export async function saveContactNotes(id: string, internal_notes: string) {
  const { supabase } = await ctx();
  const { error } = await supabase.from('contact_requests').update({ internal_notes }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/consultas'); return { ok: true };
}

export async function markContactRead(id: string) {
  const { supabase } = await ctx();
  await supabase.from('contact_requests').update({ read_at: new Date().toISOString() }).eq('id', id);
  revalidatePath('/admin/consultas'); return { ok: true };
}
