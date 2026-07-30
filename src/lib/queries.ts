import { createClient } from '@/lib/supabase/server';
import type {
  SiteSettings, SiteSection, NavigationItem, HeroHighlight, Product, Benefit,
  Application, ComparisonRow, ProcessStep, Project, ProjectMedia, CompanyValue,
  Faq, ContactProjectType, LegalPage,
} from '@/lib/types';

// Mapa de secciones por section_key para acceso cómodo desde la portada.
export async function getSections(): Promise<Record<string, SiteSection>> {
  const supabase = await createClient();
  const { data } = await supabase.from('site_sections').select('*').eq('visible', true);
  const map: Record<string, SiteSection> = {};
  (data ?? []).forEach((s) => { map[(s as SiteSection).section_key] = s as SiteSection; });
  return map;
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();
  return (data as SiteSettings) ?? null;
}

export async function getNavigation(location: 'header' | 'footer'): Promise<NavigationItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('navigation_items').select('*')
    .eq('visible', true).in('location', [location, 'both']).order('sort_order');
  return (data as NavigationItem[]) ?? [];
}

export async function getHeroHighlights(): Promise<HeroHighlight[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('hero_highlights').select('*').eq('visible', true).order('sort_order');
  return (data as HeroHighlight[]) ?? [];
}

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('products').select('*').eq('published', true).order('sort_order');
  return (data as Product[]) ?? [];
}

export async function getBenefits(): Promise<Benefit[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('benefits').select('*').eq('published', true).order('sort_order');
  return (data as Benefit[]) ?? [];
}

export async function getApplications(): Promise<Application[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('applications').select('*').eq('published', true).order('sort_order');
  return (data as Application[]) ?? [];
}

export async function getComparison(): Promise<ComparisonRow[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('comparison_rows').select('*').eq('published', true).order('sort_order');
  return (data as ComparisonRow[]) ?? [];
}

export async function getProcess(): Promise<ProcessStep[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('process_steps').select('*').eq('published', true).order('sort_order');
  return (data as ProcessStep[]) ?? [];
}

// Proyectos que se muestran en el inicio: TODOS los publicados
// (así lo que se carga desde el panel aparece sin tener que marcar "destacado").
export async function getFeaturedProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('projects').select('*')
    .eq('published', true).order('sort_order');
  return (data as Project[]) ?? [];
}

export async function getCompanyValues(): Promise<CompanyValue[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('company_values').select('*').eq('visible', true).order('sort_order');
  return (data as CompanyValue[]) ?? [];
}

export async function getFaqs(): Promise<Faq[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('faqs').select('*').eq('published', true).order('sort_order');
  return (data as Faq[]) ?? [];
}

export async function getContactProjectTypes(): Promise<ContactProjectType[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('contact_project_types').select('*').eq('published', true).order('sort_order');
  return (data as ContactProjectType[]) ?? [];
}

export async function getGalleryMedia(): Promise<ProjectMedia[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('project_media').select('*').eq('published', true).order('sort_order');
  return (data as ProjectMedia[]) ?? [];
}

export async function getLegalPage(slug: string): Promise<LegalPage | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('legal_pages').select('*').eq('slug', slug).eq('published', true).maybeSingle();
  return (data as LegalPage) ?? null;
}

// Sesión + perfil admin (para el área /admin)
export async function getAuthAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('admin_profiles').select('*').eq('user_id', user.id).maybeSingle();
  if (!profile || !profile.active) return null;
  return { user, profile };
}
