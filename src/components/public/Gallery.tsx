'use client';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ProjectMedia } from '@/lib/types';
import { mediaUrl } from '@/lib/utils';

type Filter = 'todos' | 'image' | 'video';

export default function Gallery({ media }: { media: ProjectMedia[] }) {
  const [filter, setFilter] = useState<Filter>('todos');
  const [limit, setLimit] = useState(40);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = useMemo(
    () => media.filter((m) => filter === 'todos' || m.media_type === filter),
    [media, filter],
  );
  const visible = filtered.slice(0, limit);
  const images = useMemo(() => filtered.filter((m) => m.media_type === 'image'), [filtered]);

  const openLightbox = (m: ProjectMedia) => {
    const idx = images.findIndex((im) => im.id === m.id);
    if (idx >= 0) setLightbox(idx);
  };
  const close = useCallback(() => setLightbox(null), []);
  const step = useCallback((d: number) => {
    setLightbox((cur) => (cur === null ? cur : (cur + d + images.length) % images.length));
  }, [images.length]);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, close, step]);

  const btn = (f: Filter, label: string) => (
    <button
      type="button"
      onClick={() => { setFilter(f); setLimit(40); }}
      className={`rounded-sm px-4 py-2 text-[13px] font-medium transition ${filter === f ? 'bg-cian text-azul' : 'border border-black/15 text-gris hover:border-cian'}`}
    >
      {label}
    </button>
  );

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2">
        {btn('todos', 'Todos')}{btn('image', 'Fotos')}{btn('video', 'Videos')}
      </div>

      <div className="[column-gap:14px] columns-1 sm:columns-2 lg:columns-3 xl:columns-4">
        {visible.map((m) => (
          <figure key={m.id} className="mb-3.5 break-inside-avoid overflow-hidden rounded-md border border-black/10 bg-[#E7EEF1]">
            {m.media_type === 'video' ? (
              <div className="relative bg-black">
                <span className="absolute left-2.5 top-2.5 z-[2] rounded bg-azul/80 px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-cian">Video</span>
                <video controls preload="metadata" src={mediaUrl(m.storage_path)} className="w-full" />
              </div>
            ) : (
              <img
                src={mediaUrl(m.storage_path)}
                alt={m.alt_text ?? 'Obra realizada con paneles Panel Hito'}
                loading="lazy"
                onClick={() => openLightbox(m)}
                className="w-full cursor-zoom-in transition hover:scale-[1.03]"
              />
            )}
            {m.caption && <figcaption className="px-3 py-2 text-[13px] text-gris">{m.caption}</figcaption>}
          </figure>
        ))}
      </div>

      {visible.length < filtered.length && (
        <div className="mt-8 text-center">
          <button type="button" onClick={() => setLimit((l) => l + 40)} className="rounded-sm bg-azul px-8 py-4 text-[15px] font-semibold text-white transition hover:bg-cian hover:text-azul">
            Cargar más
          </button>
        </div>
      )}

      {lightbox !== null && images[lightbox] && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(0,20,28,0.94)]" onClick={close}>
          <button type="button" aria-label="Cerrar" onClick={close} className="absolute right-5 top-5 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white/10 text-white hover:bg-cian hover:text-azul"><X /></button>
          <button type="button" aria-label="Anterior" onClick={(e) => { e.stopPropagation(); step(-1); }} className="absolute left-4 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white/10 text-white hover:bg-cian hover:text-azul"><ChevronLeft /></button>
          <img src={mediaUrl(images[lightbox].storage_path)} alt={images[lightbox].alt_text ?? ''} className="max-h-[86vh] max-w-[92vw] rounded-md" onClick={(e) => e.stopPropagation()} />
          <button type="button" aria-label="Siguiente" onClick={(e) => { e.stopPropagation(); step(1); }} className="absolute right-4 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white/10 text-white hover:bg-cian hover:text-azul"><ChevronRight /></button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 font-mono text-[13px] text-white/75">{lightbox + 1} / {images.length}</div>
        </div>
      )}
    </>
  );
}
