/**
 * Crea (o vincula) un administrador de Panel Hito.
 * - Crea el usuario en auth vía Supabase Admin API (requiere SERVICE ROLE KEY).
 * - Inserta/actualiza su fila en panelhito.admin_profiles con el rol indicado.
 *
 * Uso:
 *   ADMIN_INITIAL_EMAIL=... ADMIN_INITIAL_PASSWORD=... npx tsx scripts/create-admin.ts [rol]
 *   (rol: superadmin | admin | editor  — por defecto superadmin)
 *
 * Requiere en .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_INITIAL_EMAIL;
const password = process.env.ADMIN_INITIAL_PASSWORD;
const role = (process.argv[2] || 'superadmin') as 'superadmin' | 'admin' | 'editor';

async function main() {
  if (!url || !serviceKey) {
    throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  }
  if (!email || !password) {
    throw new Error('Definí ADMIN_INITIAL_EMAIL y ADMIN_INITIAL_PASSWORD');
  }
  if (!['superadmin', 'admin', 'editor'].includes(role)) {
    throw new Error(`Rol inválido: ${role}`);
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: 'panelhito' },
  });

  // 1) Buscar usuario existente o crearlo
  let userId: string | undefined;
  const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const existing = list?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (existing) {
    userId = existing.id;
    console.log(`Usuario auth existente: ${email} (${userId})`);
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) throw error;
    userId = data.user?.id;
    console.log(`Usuario auth creado: ${email} (${userId})`);
  }
  if (!userId) throw new Error('No se pudo determinar el user_id');

  // 2) Upsert del perfil administrativo
  const { error: perr } = await admin
    .from('admin_profiles')
    .upsert({ user_id: userId, full_name: 'Administrador Panel Hito', role, active: true }, { onConflict: 'user_id' });
  if (perr) throw perr;

  console.log(`✔ Admin listo: ${email} — rol ${role}`);
}

main().catch((e) => { console.error('Falló create-admin:', e.message); process.exit(1); });
