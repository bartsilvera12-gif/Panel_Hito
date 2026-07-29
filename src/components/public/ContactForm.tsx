'use client';
import { useActionState, useEffect, useRef } from 'react';
import { submitContact, type ContactState } from '@/actions/contact';
import type { ContactProjectType } from '@/lib/types';

const initial: ContactState = { ok: false };

export default function ContactForm({ projectTypes }: { projectTypes: ContactProjectType[] }) {
  const [state, action, pending] = useActionState(submitContact, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok && formRef.current) formRef.current.reset();
  }, [state.ok]);

  const inputCls =
    'w-full rounded-sm border border-black/15 bg-white px-4 py-3 text-[15px] text-azul outline-none focus:border-cian';

  return (
    <form ref={formRef} action={action} className="grid gap-4" noValidate>
      {/* UTMs / origen (rellenados por script si aplica) */}
      <input type="hidden" name="source_page" value="/" />
      {/* Honeypot: oculto para humanos */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>No completar<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="full_name" className="mb-1 block text-[13px] font-medium text-gris">Nombre y apellido *</label>
          <input id="full_name" name="full_name" required className={inputCls} autoComplete="name" />
        </div>
        <div>
          <label htmlFor="company" className="mb-1 block text-[13px] font-medium text-gris">Empresa</label>
          <input id="company" name="company" className={inputCls} autoComplete="organization" />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1 block text-[13px] font-medium text-gris">Teléfono</label>
          <input id="phone" name="phone" className={inputCls} inputMode="tel" autoComplete="tel" />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-[13px] font-medium text-gris">Correo</label>
          <input id="email" name="email" type="email" className={inputCls} autoComplete="email" />
        </div>
        <div>
          <label htmlFor="project_type" className="mb-1 block text-[13px] font-medium text-gris">Tipo de proyecto</label>
          <select id="project_type" name="project_type" className={inputCls} defaultValue="">
            <option value="" disabled>Seleccioná una opción</option>
            {projectTypes.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="city" className="mb-1 block text-[13px] font-medium text-gris">Ciudad</label>
          <input id="city" name="city" className={inputCls} autoComplete="address-level2" />
        </div>
        <div>
          <label htmlFor="approximate_area" className="mb-1 block text-[13px] font-medium text-gris">Superficie aproximada</label>
          <input id="approximate_area" name="approximate_area" className={inputCls} placeholder="m² aprox." />
        </div>
      </div>
      <div>
        <label htmlFor="message" className="mb-1 block text-[13px] font-medium text-gris">Mensaje</label>
        <textarea id="message" name="message" rows={4} className={inputCls} />
      </div>

      {state.error && (
        <p role="alert" className="rounded-sm bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}
      {state.ok && (
        <p role="status" className="rounded-sm bg-cian/15 px-4 py-3 text-sm text-azul">
          ¡Consulta enviada! Te contactaremos a la brevedad.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-[44px] items-center justify-center rounded-sm bg-cian px-8 py-4 text-[15px] font-semibold text-azul transition hover:bg-cian-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Enviando…' : 'Enviar consulta'}
      </button>
    </form>
  );
}
