import Link from 'next/link';
import Reveal from '@/components/public/Reveal';
import { mediaUrl } from '@/lib/utils';
import type { ProjectMedia } from '@/lib/types';

// Vista previa de la galería para el inicio: muestra algunas fotos/videos
// y enlaza a la galería completa (/trabajos).
const PREVIEW = 8;

export default function GalleryPreview({ media }: { media: ProjectMedia[] }) {
  const items = media.slice(0, PREVIEW);
  if (items.length === 0) return null;

  return (
    <>
      <div className="mt-[clamp(32px,4vw,56px)] grid grid-cols-2 gap-[clamp(12px,2vw,20px)] sm:grid-cols-3 lg:grid-cols-4">
        {items.map((m) => (
          <Reveal key={m.id} className="group overflow-hidden rounded-md border border-black/10 bg-[#E7EEF1]">
            <div className="relative" style={{ aspectRatio: '4/3' }}>
              {m.media_type === 'video' ? (
                <>
                  <span className="absolute left-2 top-2 z-[2] rounded bg-azul/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-cian">Video</span>
                  <video src={mediaUrl(m.storage_path)} muted preload="metadata" className="h-full w-full object-cover" />
                </>
              ) : (
                <img
                  src={mediaUrl(m.storage_path)}
                  alt={m.alt_text ?? 'Obra realizada con paneles Panel Hito'}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                />
              )}
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-[clamp(32px,4vw,48px)] text-center">
        <Link href="/trabajos" className="inline-flex min-h-[44px] items-center gap-2.5 rounded-sm bg-azul px-8 py-4 text-[15px] font-semibold text-white transition hover:bg-cian hover:text-azul">
          Ver galería completa →
        </Link>
      </Reveal>
    </>
  );
}
