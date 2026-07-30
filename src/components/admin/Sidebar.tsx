'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, Package,
  FolderOpen, Images, Tags, LogOut, Menu, X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { AdminRole } from '@/lib/types';

type NavItem = { href: string; label: string; icon: React.ElementType; minRole?: AdminRole };
type Group = { title: string | null; links: NavItem[] };

// Menú agrupado por temas para navegar más fácil.
const GROUPS: Group[] = [
  {
    title: null,
    links: [{ href: '/admin', label: 'Inicio', icon: LayoutDashboard }],
  },
  {
    title: 'Contenido del sitio',
    links: [
      // { href: '/admin/contenido', label: 'Contenido', icon: FileText },
      { href: '/admin/productos', label: 'Productos', icon: Package },
      // { href: '/admin/beneficios', label: 'Beneficios', icon: Sparkles },
      // { href: '/admin/aplicaciones', label: 'Aplicaciones', icon: Grid3x3 },
      // { href: '/admin/comparacion', label: 'Comparación', icon: Scale },
      // { href: '/admin/proceso', label: 'Proceso', icon: ListOrdered },
    ],
  },
  {
    title: 'Portafolio',
    links: [
      { href: '/admin/proyectos', label: 'Proyectos', icon: FolderOpen },
      { href: '/admin/categorias', label: 'Categorías', icon: Tags },
      { href: '/admin/galeria', label: 'Galería', icon: Images },
      // { href: '/admin/preguntas', label: 'Preguntas', icon: HelpCircle },
    ],
  },
  {
    title: 'Administración',
    links: [
      // Ocultados del menú (las rutas siguen existiendo):
      // { href: '/admin/consultas', label: 'Consultas', icon: Inbox },
      // { href: '/admin/legal', label: 'Legal', icon: Scroll },
      // { href: '/admin/configuracion', label: 'Configuración', icon: Settings, minRole: 'admin' },
      // { href: '/admin/usuarios', label: 'Usuarios', icon: Users, minRole: 'superadmin' },
    ],
  },
];

const rank: Record<AdminRole, number> = { editor: 1, admin: 2, superadmin: 3 };

export default function Sidebar({ role, name }: { role: AdminRole; name: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    await createClient().auth.signOut();
    router.replace('/admin/login');
    router.refresh();
  };

  const groups = GROUPS
    .map((g) => ({ ...g, links: g.links.filter((l) => !l.minRole || rank[role] >= rank[l.minRole]) }))
    .filter((g) => g.links.length > 0);

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-5">
        <img src="/uploads/PanelHito_isotipo_blanco.svg" alt="Panel Hito" className="h-9 w-9" />
        <div>
          <div className="font-display text-[15px] font-semibold text-white">Panel Hito</div>
          <div className="text-[11px] text-white/50">Administrador</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {groups.map((g, gi) => (
          <div key={g.title ?? `g${gi}`} className={gi > 0 ? 'mt-4' : ''}>
            {g.title && (
              <div className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/35">{g.title}</div>
            )}
            {g.links.map((l) => {
              const active = pathname === l.href;
              const Icon = l.icon;
              return (
                <Link key={l.href} href={l.href} prefetch onClick={() => setOpen(false)}
                  className={`mb-0.5 flex items-center gap-3 rounded-md px-3 py-2.5 text-[14px] transition ${active ? 'bg-cian text-azul font-semibold' : 'text-white/75 hover:bg-white/10 hover:text-white'}`}>
                  <Icon size={18} /> {l.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 px-4 py-4">
        <div className="mb-2 truncate text-[13px] text-white/70">{name ?? 'Admin'} · <span className="uppercase text-cian">{role}</span></div>
        <button onClick={logout} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-[14px] text-white/80 hover:bg-white/10">
          <LogOut size={18} /> Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Móvil */}
      <div className="flex items-center justify-between bg-azul px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2 text-white"><img src="/uploads/PanelHito_isotipo_blanco.svg" className="h-7 w-7" alt="" /><span className="font-display font-semibold">Panel Hito</span></div>
        <button aria-label="Menú" onClick={() => setOpen((v) => !v)} className="text-white">{open ? <X /> : <Menu />}</button>
      </div>
      {open && <div className="fixed inset-0 z-40 bg-azul lg:hidden">{content}</div>}
      {/* Escritorio */}
      <aside className="hidden w-64 shrink-0 bg-azul lg:block">
        <div className="sticky top-0 h-screen">{content}</div>
      </aside>
    </>
  );
}
