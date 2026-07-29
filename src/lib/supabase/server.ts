import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Cliente Supabase para Server Components / Server Actions (schema panelhito).
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: 'panelhito' },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Llamado desde un Server Component: se ignora (el middleware refresca la sesión).
          }
        },
      },
    },
  );
}
