'use client';
import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { mediaUrl } from '@/lib/utils';
import type { Project } from '@/lib/types';

const shadow = '0 1px 16px rgba(0,42,59,0.9),0 1px 4px rgba(0,0,0,0.5)';

export default function ProjectsGrid({ projects }: { projects: Project[] }) {
  // Categorías presentes (en el orden en que aparecen) con sus proyectos.
  const groups = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, Project[]>();
    projects.forEach((p) => {
      const cat = p.category || 'Otros';
      if (!map.has(cat)) { map.set(cat, []); order.push(cat); }
      map.get(cat)!.push(p);
    });
    return order.map((cat) => ({ cat, items: map.get(cat)! }));
  }, [projects]);

  // Primera categoría abierta por defecto (normalmente Viviendas).
  const [open, setOpen] = useState<string | null>(groups[0]?.cat ?? null);

  return (
    <div className="mt-[clamp(28px,4vw,44px)] border-t border-white/15">
      {groups.map(({ cat, items }) => {
        const isOpen = open === cat;
        return (
          <div key={cat} className="border-b border-white/15">
            <button
              onClick={() => setOpen(isOpen ? null : cat)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 py-5 text-left transition hover:text-cian"
            >
              <span className="flex items-baseline gap-3">
                <span className="font-display text-[clamp(20px,2.4vw,28px)] font-medium text-white">{cat}</span>
                <span className="font-mono text-[12px] text-white/40">{items.length}</span>
              </span>
              <ChevronDown size={22} className={`shrink-0 text-cian transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
              <div className="grid gap-px border border-white/15 bg-white/15 pb-1" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))' }}>
                {items.map((p) => (
                  <article key={p.id} className="relative flex flex-col justify-end overflow-hidden bg-azul p-[26px]" style={{ aspectRatio: '4/3' }}>
                    {p.cover_image_path && <img src={mediaUrl(p.cover_image_path)} alt={p.cover_image_alt ?? p.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />}
                    <div className="absolute inset-x-0 bottom-0 z-[1] h-1/2 bg-gradient-to-t from-azul/85 to-transparent" />
                    <div className="relative z-[2]" style={{ textShadow: shadow }}>
                      <div className="mt-1 font-display text-[21px] text-white">{p.title}</div>
                    </div>
                  </article>
                ))}
              </div>
            )}
            {isOpen && <div className="pb-8" />}
          </div>
        );
      })}
    </div>
  );
}
