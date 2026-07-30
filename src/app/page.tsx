import Header from '@/components/public/Header';
import WhatsAppButton from '@/components/public/WhatsAppButton';
import KineticGrid from '@/components/public/KineticGrid';
import Reveal from '@/components/public/Reveal';
import ProjectsGrid from '@/components/public/ProjectsGrid';
import GalleryPreview from '@/components/public/GalleryPreview';
import ContactForm from '@/components/public/ContactForm';
import { mediaUrl, whatsappHref } from '@/lib/utils';
import {
  getSiteSettings, getSections, getNavigation, getHeroHighlights, getProducts,
  getBenefits, getComparison, getProcess, getFeaturedProjects,
  getCompanyValues, getFaqs, getContactProjectTypes, getGalleryMedia,
} from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [
    settings, sections, nav, highlights, products, benefits,
    comparison, process, projects, values, faqs, projectTypes, galleryMedia,
  ] = await Promise.all([
    getSiteSettings(), getSections(), getNavigation('header'), getHeroHighlights(),
    getProducts(), getBenefits(), getComparison(), getProcess(),
    getFeaturedProjects(), getCompanyValues(), getFaqs(), getContactProjectTypes(),
    getGalleryMedia(),
  ]);

  const S = (k: string) => sections[k];
  const wa = settings?.whatsapp_number ?? '';
  const eyebrowCls = 'font-mono text-[11px] uppercase tracking-[0.22em] text-cian';
  const h2Cls = 'font-display text-[clamp(30px,3.9vw,54px)] font-medium leading-[1.08] tracking-[-0.03em]';

  return (
    <>
      <Header nav={nav} logoLight={settings?.logo_light_path ?? null} />

      {/* HERO */}
      <section id="inicio" className="relative flex min-h-[100svh] items-end overflow-hidden bg-azul">
        <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(115deg,#0a3c4f 0 14px,#0d4457 14px 28px)', opacity: 0.9 }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,rgba(0,42,59,0.92) 0%,rgba(0,42,59,0.70) 45%,rgba(0,42,59,0.96) 100%)' }} />
        <KineticGrid />
        <div className="relative mx-auto w-full max-w-[1320px] px-[clamp(20px,4vw,48px)] pt-[140px]">
          {S('hero')?.eyebrow && <Reveal className="mb-6"><span className={eyebrowCls}>{S('hero').eyebrow}</span></Reveal>}
          <Reveal as="h1" className="m-0 max-w-[16ch] font-display text-[clamp(38px,6.6vw,92px)] font-medium leading-[1.02] tracking-[-0.035em] text-white">
            {S('hero')?.title}
          </Reveal>
          {S('hero')?.description && (
            <Reveal as="p" className="mt-7 max-w-[58ch] text-[clamp(16px,1.35vw,19px)] font-light leading-[1.65] text-white/75">
              {S('hero').description}
            </Reveal>
          )}
          <Reveal className="mt-9 flex flex-wrap gap-3.5">
            {S('hero')?.primary_button_label && (
              <a href={S('hero').primary_button_url ?? '#contacto'} className="inline-flex min-h-[44px] items-center rounded-sm bg-cian px-[30px] py-[17px] text-[15px] font-semibold text-azul transition hover:bg-cian-hover">
                {S('hero').primary_button_label}
              </a>
            )}
            {S('hero')?.secondary_button_label && (
              <a href={S('hero').secondary_button_url ?? '#productos'} className="inline-flex min-h-[44px] items-center rounded-sm border border-white/40 px-[30px] py-[17px] text-[15px] font-medium text-white transition hover:border-cian hover:text-cian">
                {S('hero').secondary_button_label}
              </a>
            )}
          </Reveal>
          {highlights.length > 0 && (
            <Reveal className="mt-[clamp(48px,7vw,88px)] grid border-t border-white/15" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))' }}>
              {highlights.map((h) => (
                <div key={h.id} className="border-r border-white/10 px-6 pb-[30px] pt-6 last:border-r-0">
                  <div className="mt-2.5 font-display text-[17px] text-white">{h.title}</div>
                </div>
              ))}
            </Reveal>
          )}
        </div>
      </section>

      {/* PRESENTACIÓN */}
      <section className="bg-claro px-[clamp(20px,4vw,48px)] py-[clamp(72px,10vw,140px)]">
        <div className="mx-auto grid max-w-[1320px] items-center gap-[clamp(40px,6vw,90px)] lg:grid-cols-2">
          <Reveal>
            {S('presentacion')?.eyebrow && <div className={`${eyebrowCls} text-gris`}>{S('presentacion').eyebrow}</div>}
            <h2 className={`${h2Cls} mt-4 text-azul`}>{S('presentacion')?.title}</h2>
            {S('presentacion')?.description && <p className="mt-6 text-[17px] font-light leading-[1.7] text-gris">{S('presentacion').description}</p>}
            {S('presentacion')?.secondary_text && <p className="mt-4 text-[16px] font-light leading-[1.7] text-gris">{S('presentacion').secondary_text}</p>}
          </Reveal>
          <Reveal className="rounded-sm border border-black/10 bg-white p-8">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-gris">Corte del panel · esquema</div>
            <div className="mt-5 overflow-hidden rounded-sm border border-black/10">
              <div className="flex items-center justify-center bg-[#E7EEF1] py-3 text-[13px] text-azul">Chapa exterior</div>
              <div className="border-y-2 border-cian bg-[repeating-linear-gradient(90deg,#E7EEF1_0_8px,#DCE6EA_8px_16px)] py-8 text-center text-[12px] text-gris">Núcleo aislante · tipo y espesor según ficha</div>
              <div className="flex items-center justify-center bg-[#E7EEF1] py-3 text-[13px] text-azul">Chapa interior</div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PRODUCTOS */}
      <section id="productos" className="relative overflow-hidden bg-azul px-[clamp(20px,4vw,48px)] py-[clamp(72px,10vw,140px)] text-white">
        <KineticGrid />
        <div className="relative z-10 mx-auto max-w-[1320px]">
          <Reveal className="flex flex-wrap items-end justify-between gap-6 border-b border-white/15 pb-[34px]">
            <div>
              <div className={eyebrowCls}>{S('productos')?.eyebrow ?? 'Productos'}</div>
              <h2 className={`${h2Cls} mt-4`}>{S('productos')?.title ?? 'Líneas de panel'}</h2>
            </div>
            {S('productos')?.description && <p className="max-w-[42ch] text-[15px] font-light leading-[1.65] text-white/60">{S('productos').description}</p>}
          </Reveal>
          {products.map((p, i) => (
            <Reveal key={p.id} as="article" className="grid items-center gap-[clamp(24px,4vw,64px)] border-b border-white/10 py-[clamp(34px,5vw,60px)] md:grid-cols-2">
              <div className={`overflow-hidden border border-white/10 ${i % 2 === 1 ? 'md:order-2' : ''}`} style={{ aspectRatio: '4/3' }}>
                {p.image_path
                  ? <img src={mediaUrl(p.image_path)} alt={p.image_alt ?? p.name} loading="lazy" className="h-full w-full object-cover" />
                  : <div className="flex h-full items-center justify-center bg-[repeating-linear-gradient(115deg,#06384a_0_12px,#0a4155_12px_24px)] font-mono text-[11px] uppercase text-white/40">{p.name}</div>}
              </div>
              <div className={i % 2 === 1 ? 'md:order-1' : ''}>
                <h3 className="mt-3 font-display text-[clamp(24px,2.6vw,34px)] font-medium tracking-[-0.02em]">{p.name}</h3>
                {p.description && <p className="mt-3.5 max-w-[48ch] text-[16px] font-light leading-[1.7] text-white/65">{p.description}</p>}
                <div className="mt-[26px] grid gap-4 border-t border-white/10 pt-5" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))' }}>
                  {p.applications.length > 0 && <div><div className="font-mono text-[10px] uppercase tracking-[0.16em] text-gris">Aplicaciones</div><div className="mt-1.5 text-[14px] text-white/90">{p.applications.join(' · ')}</div></div>}
                </div>
                <a href={whatsappHref(wa, p.whatsapp_message)} target="_blank" rel="noopener" className="mt-[26px] inline-flex min-h-[44px] items-center gap-2.5 rounded-sm border border-cian/60 px-[22px] py-[13px] text-[14px] font-medium text-cian transition hover:bg-cian hover:text-azul">
                  Consultar producto
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* BENEFICIOS */}
      <section id="beneficios" className="bg-claro px-[clamp(20px,4vw,48px)] py-[clamp(72px,10vw,140px)]">
        <div className="mx-auto max-w-[1320px]">
          <Reveal>
            <div className={`${eyebrowCls} text-gris`}>{S('beneficios')?.eyebrow ?? 'Beneficios'}</div>
            <h2 className={`${h2Cls} mt-4 text-azul`}>{S('beneficios')?.title ?? 'Por qué elegir panel termoacústico'}</h2>
          </Reveal>
          <div className="mt-[clamp(36px,5vw,60px)] grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))' }}>
            {benefits.map((b, i) => (
              <Reveal key={b.id} delay={(i % 3) * 70} className="rounded-sm border border-black/10 bg-white p-7">
                <h3 className="font-display text-[19px] font-medium text-azul">{b.title}</h3>
                {b.description && <p className="mt-2.5 text-[15px] font-light leading-[1.6] text-gris">{b.description}</p>}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARACIÓN */}
      <section className="bg-white px-[clamp(20px,4vw,48px)] py-[clamp(72px,10vw,140px)]">
        <div className="mx-auto max-w-[1100px]">
          <Reveal>
            <div className={`${eyebrowCls} text-gris`}>{S('comparacion')?.eyebrow ?? 'Comparación'}</div>
            <h2 className={`${h2Cls} mt-4 text-azul`}>{S('comparacion')?.title ?? 'Cubierta convencional y solución con panel'}</h2>
          </Reveal>
          <Reveal className="mt-[clamp(36px,5vw,60px)] overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-black/15 text-[13px] uppercase tracking-wide text-gris">
                  <th className="py-3 pr-4 font-medium">Criterio</th>
                  <th className="py-3 pr-4 font-medium">Cubierta convencional</th>
                  <th className="py-3 font-medium text-cian">Panel termoacústico</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((r) => (
                  <tr key={r.id} className="border-b border-black/5 align-top">
                    <td className="py-4 pr-4 font-display text-[16px] text-azul">{r.criterion}</td>
                    <td className="py-4 pr-4 text-[15px] font-light text-gris">{r.conventional_value}</td>
                    <td className="py-4 text-[15px] text-azul">{r.panel_value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </div>
      </section>

      {/* PROCESO */}
      <section className="bg-claro px-[clamp(20px,4vw,48px)] py-[clamp(72px,10vw,140px)]">
        <div className="mx-auto max-w-[1320px]">
          <Reveal>
            <div className={`${eyebrowCls} text-gris`}>{S('proceso')?.eyebrow ?? 'Proceso de atención'}</div>
            <h2 className={`${h2Cls} mt-4 text-azul`}>{S('proceso')?.title ?? 'Cómo trabajamos tu consulta'}</h2>
          </Reveal>
          <div className="mt-[clamp(36px,5vw,60px)] grid gap-px border border-black/10 bg-black/10" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' }}>
            {process.map((p) => (
              <Reveal key={p.id} className="bg-claro p-7">
                <h3 className="font-display text-[19px] font-medium text-azul">{p.title}</h3>
                {p.description && <p className="mt-2.5 text-[15px] font-light leading-[1.6] text-gris">{p.description}</p>}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PROYECTOS */}
      <section id="proyectos" className="relative overflow-hidden bg-azul px-[clamp(20px,4vw,48px)] py-[clamp(72px,10vw,140px)] text-white">
        <KineticGrid />
        <div className="relative z-10 mx-auto max-w-[1320px]">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className={eyebrowCls}>{S('proyectos')?.eyebrow ?? 'Proyectos'}</div>
              <h2 className={`${h2Cls} mt-4 max-w-[18ch]`}>{S('proyectos')?.title ?? 'Nuestros trabajos'}</h2>
            </div>
            {S('proyectos')?.description && <p className="max-w-[40ch] text-[14px] font-light leading-[1.6] text-white/60">{S('proyectos').description}</p>}
          </Reveal>
          <ProjectsGrid projects={projects} />
        </div>
      </section>

      {/* GALERÍA */}
      {galleryMedia.length > 0 && (
        <section id="galeria" className="bg-claro px-[clamp(20px,4vw,48px)] py-[clamp(72px,10vw,140px)]">
          <div className="mx-auto max-w-[1320px]">
            <Reveal className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <div className={`${eyebrowCls} text-gris`}>{S('galeria')?.eyebrow ?? 'Galería'}</div>
                <h2 className={`${h2Cls} mt-4 text-azul`}>{S('galeria')?.title ?? 'Obras en imágenes'}</h2>
              </div>
              {S('galeria')?.description && <p className="max-w-[40ch] text-[14px] font-light leading-[1.6] text-gris">{S('galeria').description}</p>}
            </Reveal>
            <GalleryPreview media={galleryMedia} />
          </div>
        </section>
      )}

      {/* NOSOTROS */}
      <section id="nosotros" className="bg-claro px-[clamp(20px,4vw,48px)] py-[clamp(72px,10vw,140px)]">
        <div className="mx-auto max-w-[1320px]">
          <Reveal>
            <div className={`${eyebrowCls} text-gris`}>{S('nosotros')?.eyebrow ?? 'Nosotros'}</div>
            <h2 className={`${h2Cls} mt-4 text-azul`}>{S('nosotros')?.title ?? 'Sobre Panel Hito'}</h2>
          </Reveal>
          <div className="mt-[clamp(28px,4vw,44px)] grid gap-px border border-black/10 bg-black/10 md:grid-cols-5">
            {values.map((v) => (
              <Reveal key={v.id} className="bg-white p-6">
                <div className="font-display text-[18px] font-semibold text-azul">{v.title}</div>
                {v.description && <p className="mt-2 text-[14px] font-light leading-[1.55] text-gris">{v.description}</p>}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white px-[clamp(20px,4vw,48px)] py-[clamp(72px,10vw,140px)]">
        <div className="mx-auto max-w-[860px]">
          <Reveal>
            <div className={`${eyebrowCls} text-gris`}>{S('faq')?.eyebrow ?? 'Preguntas frecuentes'}</div>
            <h2 className={`${h2Cls} mt-4 text-azul`}>{S('faq')?.title ?? 'Consultas habituales'}</h2>
          </Reveal>
          <div className="mt-[clamp(28px,4vw,44px)]">
            {faqs.map((f) => (
              <Reveal key={f.id} as="details" className="group border-b border-black/10 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-[18px] text-azul">
                  {f.question}
                  <span className="text-cian transition group-open:rotate-45">+</span>
                </summary>
                {f.answer && <p className="mt-3 text-[15px] font-light leading-[1.7] text-gris">{f.answer}</p>}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta-final" className="relative overflow-hidden bg-azul px-[clamp(20px,4vw,48px)] py-[clamp(72px,10vw,140px)] text-white">
        <KineticGrid />
        <Reveal className="relative z-10 mx-auto max-w-[900px] text-center">
          <img src={mediaUrl(settings?.favicon_path ?? '/uploads/PanelHito_isotipo_cian.svg')} alt="" className="mx-auto h-[54px] w-[54px] opacity-90" />
          <h2 className="mt-[26px] font-display text-[clamp(30px,4.4vw,60px)] font-medium leading-[1.06] tracking-[-0.03em]">{S('cta')?.title}</h2>
          {S('cta')?.description && <p className="mx-auto mt-5 max-w-[56ch] text-[17px] font-light leading-[1.7] text-white/70">{S('cta').description}</p>}
          <div className="mt-9 flex flex-wrap justify-center gap-3.5">
            <a href={S('cta')?.primary_button_url ?? '#contacto'} className="inline-flex min-h-[44px] items-center rounded-sm bg-cian px-[30px] py-[17px] text-[15px] font-semibold text-azul transition hover:bg-cian-hover">{S('cta')?.primary_button_label ?? 'Solicitar presupuesto'}</a>
            <a href={whatsappHref(wa)} target="_blank" rel="noopener" className="inline-flex min-h-[44px] items-center rounded-sm border border-white/40 px-[30px] py-[17px] text-[15px] font-medium text-white transition hover:border-cian hover:text-cian">{S('cta')?.secondary_button_label ?? 'Hablar por WhatsApp'}</a>
          </div>
        </Reveal>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className="bg-claro px-[clamp(20px,4vw,48px)] py-[clamp(72px,10vw,140px)]">
        <div className="mx-auto grid max-w-[1320px] gap-[clamp(40px,6vw,80px)] lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <div className={`${eyebrowCls} text-gris`}>{S('contacto')?.eyebrow ?? 'Contacto'}</div>
            <h2 className={`${h2Cls} mt-4 text-azul`}>{S('contacto')?.title ?? 'Pedí tu presupuesto'}</h2>
            {S('contacto')?.description && <p className="mt-5 max-w-[42ch] text-[16px] font-light leading-[1.7] text-gris">{S('contacto').description}</p>}
            <div className="mt-8 grid gap-4 text-[15px]">
              {settings?.phone_display && <div><div className="font-mono text-[11px] uppercase tracking-[0.16em] text-gris">WhatsApp</div><a href={whatsappHref(wa)} target="_blank" rel="noopener" className="text-azul">{settings.phone_display}</a></div>}
              {settings?.email && <div><div className="font-mono text-[11px] uppercase tracking-[0.16em] text-gris">Correo</div><a href={`mailto:${settings.email}`} className="text-azul">{settings.email}</a></div>}
              <div><div className="font-mono text-[11px] uppercase tracking-[0.16em] text-gris">Cobertura</div><div className="text-azul">{settings?.country ?? 'Paraguay'}</div></div>
            </div>
          </Reveal>
          <Reveal className="rounded-md border border-black/10 bg-white p-[clamp(24px,3vw,40px)]">
            <ContactForm projectTypes={projectTypes} />
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative overflow-hidden bg-azul px-[clamp(20px,4vw,48px)] py-[clamp(56px,7vw,90px)] pb-[34px] text-white">
        <KineticGrid />
        <div className="relative z-10 mx-auto max-w-[1320px]">
          <div className="flex items-center gap-3">
            <img src={mediaUrl(settings?.logo_light_path ?? '/brand/PanelHito_blanco.svg')} alt="Panel Hito" className="h-10 w-10" />
            <span className="font-display text-[19px] font-semibold">{settings?.business_name ?? 'Panel Hito'}</span>
          </div>
          {settings?.business_description && <p className="mt-4 max-w-[34ch] text-[14px] font-light text-white/60">{settings.business_description}</p>}
          <div className="mt-[clamp(36px,5vw,60px)] border-t border-white/10 pt-[18px] text-center text-[12px] text-white/45">
            Desarrollado por <a href="https://neura.com.py" target="_blank" rel="noopener" className="font-semibold text-cian hover:text-cian-hover">NEURA</a>
          </div>
        </div>
      </footer>

      <WhatsAppButton number={wa} />
    </>
  );
}
