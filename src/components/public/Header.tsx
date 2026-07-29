'use client';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import type { NavigationItem } from '@/lib/types';
import { mediaUrl } from '@/lib/utils';

export default function Header({
  nav, logoLight,
}: { nav: NavigationItem[]; logoLight: string | null }) {
  const [open, setOpen] = useState(false);
  const logo = mediaUrl(logoLight ?? '/brand/PanelHito_blanco.svg');

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-[1320px] items-center gap-6 px-[clamp(20px,4vw,48px)] py-5">
        <a href="#inicio" className="flex items-center gap-3">
          <img src={logo} alt="Panel Hito" className="h-9 w-9" />
          <span className="font-display text-lg font-semibold text-white">Panel Hito</span>
        </a>
        <nav className="ml-auto hidden items-center gap-7 md:flex">
          {nav.map((n) => (
            <a
              key={n.id}
              href={n.href}
              target={n.open_new_tab ? '_blank' : undefined}
              className="text-sm text-white/85 transition hover:text-cian"
            >
              {n.label}
            </a>
          ))}
        </nav>
        <a
          href="#contacto"
          className="ml-auto hidden rounded-sm bg-cian px-5 py-3 text-[13px] font-semibold text-azul transition hover:bg-cian-hover md:ml-0 md:inline-flex"
        >
          Solicitar presupuesto
        </a>
        <button
          type="button"
          aria-label="Abrir menú"
          onClick={() => setOpen((v) => !v)}
          className="ml-auto text-white md:hidden"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {open && (
        <div className="mx-4 rounded-md bg-azul/95 p-4 backdrop-blur md:hidden">
          <div className="flex flex-col">
            {nav.map((n) => (
              <a key={n.id} href={n.href} onClick={() => setOpen(false)} className="py-2 text-white/90">
                {n.label}
              </a>
            ))}
            <a
              href="#contacto"
              onClick={() => setOpen(false)}
              className="mt-3 rounded-sm bg-cian px-4 py-3 text-center font-semibold text-azul"
            >
              Solicitar presupuesto
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
