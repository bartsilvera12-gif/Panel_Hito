import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Cliente con SERVICE ROLE. SOLO en el servidor (rutas/acciones), nunca en el cliente.
// Requiere SUPABASE_SERVICE_ROLE_KEY (pendiente de configurar).
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY no configurada (requerida para operaciones de administración/servidor).');
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: 'panelhito' },
  });
}

export function hasServiceRole() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}
