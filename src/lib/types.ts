// Tipos del dominio panelhito (coinciden con las columnas de la BD)

export type AdminRole = 'superadmin' | 'admin' | 'editor';

export interface AdminProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  role: AdminRole;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  id: string;
  business_name: string | null;
  slogan: string | null;
  business_description: string | null;
  whatsapp_number: string | null;
  phone_display: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  logo_dark_path: string | null;
  logo_light_path: string | null;
  favicon_path: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image_path: string | null;
  google_analytics_id: string | null;
  google_search_console_code: string | null;
  meta_pixel_id: string | null;
}

export interface SiteSection {
  id: string;
  section_key: string;
  eyebrow: string | null;
  title: string | null;
  description: string | null;
  secondary_text: string | null;
  primary_button_label: string | null;
  primary_button_url: string | null;
  secondary_button_label: string | null;
  secondary_button_url: string | null;
  background_media_path: string | null;
  visible: boolean;
  sort_order: number;
  metadata: Record<string, unknown>;
}

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  location: 'header' | 'footer' | 'both';
  open_new_tab: boolean;
  visible: boolean;
  sort_order: number;
}

export interface HeroHighlight {
  id: string;
  title: string;
  icon_key: string | null;
  visible: boolean;
  sort_order: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  short_description: string | null;
  description: string | null;
  applications: string[];
  thickness_text: string | null;
  core_text: string | null;
  image_path: string | null;
  image_alt: string | null;
  whatsapp_message: string | null;
  featured: boolean;
  published: boolean;
  sort_order: number;
}

export interface ProductSpec {
  id: string;
  product_id: string;
  label: string;
  value: string | null;
  sort_order: number;
}

export interface Benefit {
  id: string;
  title: string;
  description: string | null;
  icon_key: string | null;
  published: boolean;
  sort_order: number;
}

export interface Application {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  image_path: string | null;
  image_alt: string | null;
  published: boolean;
  sort_order: number;
}

export interface ComparisonRow {
  id: string;
  criterion: string;
  conventional_value: string | null;
  panel_value: string | null;
  published: boolean;
  sort_order: number;
}

export interface ProcessStep {
  id: string;
  title: string;
  description: string | null;
  published: boolean;
  sort_order: number;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  location: string | null;
  description: string | null;
  product_used: string | null;
  cover_image_path: string | null;
  cover_image_alt: string | null;
  featured_home: boolean;
  published: boolean;
  sort_order: number;
  project_date: string | null;
}

export interface ProjectMedia {
  id: string;
  project_id: string | null;
  media_type: 'image' | 'video';
  storage_path: string;
  thumbnail_path: string | null;
  alt_text: string | null;
  caption: string | null;
  is_cover: boolean;
  featured: boolean;
  published: boolean;
  sort_order: number;
  metadata: Record<string, unknown>;
}

export interface CompanyValue {
  id: string;
  title: string;
  description: string | null;
  visible: boolean;
  sort_order: number;
}

export interface Faq {
  id: string;
  question: string;
  answer: string | null;
  published: boolean;
  sort_order: number;
}

export interface ContactProjectType {
  id: string;
  name: string;
  published: boolean;
  sort_order: number;
}

export type ContactStatus = 'nuevo' | 'contactado' | 'presupuestado' | 'cerrado' | 'descartado';

export interface ContactRequest {
  id: string;
  full_name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  project_type: string | null;
  city: string | null;
  approximate_area: string | null;
  message: string | null;
  status: ContactStatus;
  internal_notes: string | null;
  assigned_to: string | null;
  source_page: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LegalPage {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  last_updated_label: string | null;
  seo_title: string | null;
  seo_description: string | null;
  published: boolean;
}
