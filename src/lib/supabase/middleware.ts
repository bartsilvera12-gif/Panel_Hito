import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Refresca la sesión y protege /admin/* (excepto /admin/login).
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: 'panelhito' },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAdminArea = path.startsWith('/admin');
  const isLogin = path === '/admin/login';

  if (isAdminArea && !isLogin) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('redirect', path);
      return NextResponse.redirect(url);
    }
    // Debe tener perfil administrativo activo
    const { data: profile } = await supabase
      .from('admin_profiles')
      .select('role, active')
      .eq('user_id', user.id)
      .maybeSingle();
    if (!profile || !profile.active) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('error', 'sin-acceso');
      return NextResponse.redirect(url);
    }
  }

  if (isLogin && user) {
    const { data: profile } = await supabase
      .from('admin_profiles')
      .select('active')
      .eq('user_id', user.id)
      .maybeSingle();
    if (profile?.active) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }
  }

  return response;
}
