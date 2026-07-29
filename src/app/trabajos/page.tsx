import type { Metadata } from 'next';
import Link from 'next/link';
import Gallery from '@/components/public/Gallery';
import { getGalleryMedia, getSiteSettings } from '@/lib/queries';
import { mediaUrl } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Nuestros trabajos · Panel Hito',
  description: 'Galería de obras realizadas con paneles termoacústicos Panel Hito: viviendas, comercios, oficinas, galpones, cámaras e industria.',
};

export default async function TrabajosPage() {
  const [media, settings] = await Promise.all([getGalleryMedia(), getSiteSettings()]);
  const logo = mediaUrl(settings?.logo_light_path ?? '/brand/PanelHito_blanco.svg');

  return (
    <>
      <header className="sticky top-0 z-20 bg-azul/95 text-white backdrop-blur">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between px-[clamp(20px,4vw,48px)] py-4">
          <Link href="/" className="flex items-center gap-3"><img src={logo} alt="Panel Hito" className="h-9 w-9" /><span className="font-display text-lg font-semibold">Panel Hito</span></Link>
          <Link href="/#proyectos" className="rounded-sm border border-white/25 px-4 py-2.5 text-[13px] text-white/85 hover:border-cian hover:text-cian">Volver al sitio</Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1320px] px-[clamp(20px,4vw,48px)] pb-6 pt-[clamp(36px,5vw,64px)]">
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-cian">Proyectos</div>
        <h1 className="mt-3.5 font-display text-[clamp(30px,5vw,52px)] font-medium tracking-[-0.03em] text-azul">Nuestros trabajos</h1>
        <p className="mt-3.5 max-w-[60ch] text-[16px] font-light leading-[1.6] text-gris">
          Obras realizadas con paneles termoacústicos Panel Hito: viviendas, comercios, oficinas, galpones, cámaras frigoríficas e industria.
        </p>
      </div>

      <main className="mx-auto max-w-[1320px] px-[clamp(20px,4vw,48px)] pb-[clamp(56px,8vw,90px)]">
        {media.length === 0
          ? <p className="rounded-md border border-black/10 bg-white p-8 text-center text-gris">Aún no hay imágenes publicadas en la galería.</p>
          : <Gallery media={media} />}
      </main>

      <footer className="bg-azul px-[clamp(20px,4vw,48px)] py-10 text-center text-[13px] text-white/55">
        Desarrollado por <a href="https://neura.com.py" target="_blank" rel="noopener" className="font-semibold text-cian">NEURA</a>
      </footer>
    </>
  );
}
