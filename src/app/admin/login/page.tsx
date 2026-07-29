'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-azul text-white/60">Cargando…</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get('error') === 'sin-acceso' ? 'Tu usuario no tiene acceso administrativo.' : null,
  );
  const [reset, setReset] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setReset(null); setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError('Credenciales inválidas.'); setLoading(false); return; }
    const { data: profile } = await supabase
      .from('admin_profiles').select('active').eq('user_id', data.user.id).maybeSingle();
    if (!profile || !profile.active) {
      await supabase.auth.signOut();
      setError('Tu usuario no tiene acceso administrativo activo.');
      setLoading(false); return;
    }
    router.replace(params.get('redirect') ?? '/admin');
    router.refresh();
  };

  const onReset = async () => {
    if (!email) { setError('Ingresá tu correo para recuperar la contraseña.'); return; }
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/admin/login` : undefined,
    });
    if (error) setError('No se pudo enviar el correo de recuperación.');
    else setReset('Te enviamos un correo para restablecer la contraseña.');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-azul px-4">
      <div className="w-full max-w-[400px] rounded-lg bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center gap-3">
          <img src="/uploads/PanelHito_isotipo_cian.svg" alt="Panel Hito" className="h-10 w-10" />
          <span className="font-display text-xl font-semibold text-azul">Panel Hito</span>
        </div>
        <h1 className="font-display text-2xl font-medium text-azul">Panel administrador</h1>
        <p className="mt-1 text-sm text-gris">Ingresá con tu cuenta autorizada.</p>

        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-[13px] font-medium text-gris">Correo</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-sm border border-black/15 px-4 py-3 text-[15px] outline-none focus:border-cian" autoComplete="email" />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-[13px] font-medium text-gris">Contraseña</label>
            <div className="relative">
              <input id="password" type={show ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-sm border border-black/15 px-4 py-3 pr-11 text-[15px] outline-none focus:border-cian" autoComplete="current-password" />
              <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'Ocultar' : 'Mostrar'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gris hover:text-azul">
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <label className="flex items-center gap-2 text-[13px] text-gris">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-cian" />
            Recordar sesión
          </label>

          {error && <p role="alert" className="rounded-sm bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          {reset && <p role="status" className="rounded-sm bg-cian/15 px-4 py-3 text-sm text-azul">{reset}</p>}

          <button type="submit" disabled={loading}
            className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-sm bg-cian px-6 py-3 font-semibold text-azul transition hover:bg-cian-hover disabled:opacity-60">
            {loading && <Loader2 className="animate-spin" size={18} />}{loading ? 'Ingresando…' : 'Ingresar'}
          </button>
          <button type="button" onClick={onReset} className="text-[13px] text-gris underline hover:text-azul">
            ¿Olvidaste tu contraseña?
          </button>
        </form>
      </div>
    </div>
  );
}
