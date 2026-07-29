import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLegalPage, getSiteSettings } from '@/lib/queries';
import { mediaUrl } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPage('politica-de-privacidad');
  return {
    title: page?.seo_title ?? 'Política de Privacidad · Panel Hito',
    description: page?.seo_description ?? undefined,
    robots: { index: false, follow: true },
  };
}

export default async function PoliticaPage() {
  const [page, settings] = await Promise.all([getLegalPage('politica-de-privacidad'), getSiteSettings()]);
  if (!page) notFound();
  const logo = mediaUrl(settings?.logo_light_path ?? '/brand/PanelHito_blanco.svg');

  return (
    <>
      <header className="bg-azul text-white">
        <div className="mx-auto flex max-w-[900px] items-center justify-between px-[clamp(20px,4vw,48px)] py-[22px]">
          <Link href="/" className="flex items-center gap-3"><img src={logo} alt="Panel Hito" className="h-9 w-9" /><span className="font-display text-lg font-semibold">Panel Hito</span></Link>
          <Link href="/" className="rounded-sm border border-white/25 px-4 py-2.5 text-[13px] text-white/85 hover:border-cian hover:text-cian">Volver al sitio</Link>
        </div>
      </header>

      <div className="bg-azul px-[clamp(20px,4vw,48px)] pb-[clamp(48px,7vw,88px)] pt-[clamp(24px,4vw,48px)] text-white">
        <div className="mx-auto max-w-[900px]">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-cian">Legal</div>
          <h1 className="mt-3.5 font-display text-[clamp(32px,5.2vw,56px)] font-medium tracking-[-0.03em]">{page.title}</h1>
          {page.last_updated_label && <div className="mt-4 text-[14px] text-white/60">{page.last_updated_label}</div>}
        </div>
      </div>

      <main className="mx-auto max-w-[900px] whitespace-pre-line px-[clamp(20px,4vw,48px)] py-[clamp(40px,6vw,72px)] text-[16px] font-light leading-[1.7] text-[#33454E]">
        {page.content}
      </main>

      <footer className="bg-azul px-[clamp(20px,4vw,48px)] py-10 text-center text-[13px] text-white/55">
        Desarrollado por <a href="https://neura.com.py" target="_blank" rel="noopener" className="font-semibold text-cian">NEURA</a>
      </footer>
    </>
  );
}
