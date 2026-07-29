import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { getSiteSettings } from '@/lib/queries';
import { mediaUrl } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-space-grotesk' });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings().catch(() => null);
  const title = s?.seo_title ?? 'Panel Hito — Paneles termoacústicos';
  const description = s?.seo_description ?? 'Paneles termoacústicos para cubiertas, fachadas y cámaras frigoríficas en Paraguay.';
  const icon = mediaUrl(s?.favicon_path ?? '/uploads/PanelHito_isotipo_cian.svg');
  return {
    title, description,
    icons: { icon: [{ url: icon }] },
    openGraph: { title, description, type: 'website', images: s?.og_image_path ? [mediaUrl(s.og_image_path)] : undefined },
    ...(s?.google_search_console_code ? { verification: { google: s.google_search_console_code } } : {}),
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
