'use client';
import { useRef, useState, useTransition } from 'react';
import { Trash2, Upload, Loader2, Plus } from 'lucide-react';
import { deleteRow, uploadGalleryMedia } from '@/actions/admin';
import { mediaUrl } from '@/lib/utils';
import type { ProjectMedia } from '@/lib/types';

export default function GalleryAdmin({ initial }: { initial: ProjectMedia[] }) {
  const [items, setItems] = useState(initial);
  const [limit, setLimit] = useState(60);
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(null), 2600); };

  const remove = (m: ProjectMedia) => {
    if (!confirm('¿Eliminar este archivo? Esta acción no se puede deshacer.')) return;
    start(async () => {
      const res = await deleteRow('project_media', m.id);
      if (res.ok) setItems((it) => it.filter((x) => x.id !== m.id));
      flash(res.ok ? 'Archivo eliminado' : `Error: ${res.error}`);
    });
  };

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append('files', f));
      const res = await uploadGalleryMedia(fd);
      if (res.ok && res.items) {
        setItems((it) => [...(res.items as ProjectMedia[]), ...it]);
        flash(`${res.items.length} archivo(s) subido(s)`);
      } else {
        flash(`Error: ${res.error}`);
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div>
      {msg && <div className="fixed bottom-5 right-5 z-50 rounded-md bg-azul px-4 py-2 text-sm text-white shadow-lg">{msg}</div>}

      {/* Subir nuevos archivos */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        multiple
        hidden
        onChange={(e) => onFiles(e.target.files)}
      />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="mb-6 flex w-full items-center justify-center gap-2.5 rounded-lg border-2 border-dashed border-cian/50 bg-cian/5 px-4 py-6 text-[14px] font-semibold text-azul transition hover:border-cian hover:bg-cian/10 disabled:opacity-60"
      >
        {uploading ? <><Loader2 size={18} className="animate-spin" /> Subiendo…</> : <><Upload size={18} /> Subir imágenes o videos</>}
      </button>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-black/15 bg-white p-10 text-center">
          <p className="text-sm text-gris">Todavía no hay archivos en la galería.</p>
          <button onClick={() => fileRef.current?.click()} className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-azul px-4 py-2 text-[13px] font-semibold text-white hover:bg-cian hover:text-azul">
            <Plus size={15} /> Subir el primero
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.slice(0, limit).map((m) => (
            <div key={m.id} className="group relative overflow-hidden rounded-lg border border-black/10 bg-black/5">
              <div className="aspect-[4/3]">
                {m.media_type === 'video'
                  ? <video src={mediaUrl(m.storage_path)} className="h-full w-full object-cover" muted />
                  : <img src={mediaUrl(m.storage_path)} alt="" loading="lazy" className="h-full w-full object-cover" />}
              </div>
              <button
                title="Eliminar"
                onClick={() => remove(m)}
                disabled={pending}
                className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-md bg-white/90 text-red-600 shadow-sm transition hover:bg-red-600 hover:text-white disabled:opacity-40"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {limit < items.length && (
        <div className="mt-6 text-center">
          <button onClick={() => setLimit((l) => l + 60)} className="rounded-sm bg-azul px-6 py-3 text-[14px] font-semibold text-white hover:bg-cian hover:text-azul">Cargar más ({items.length - limit})</button>
        </div>
      )}
    </div>
  );
}
