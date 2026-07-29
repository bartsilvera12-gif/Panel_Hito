-- =====================================================================
-- Panel Hito · 0001 · Schema, funciones, tablas, índices y triggers
-- Base multi-tenant compartida: TODO vive en el schema `panelhito`.
-- No se crea nada en `public` ni en otros schemas de terceros.
-- =====================================================================

create schema if not exists panelhito;

-- pgcrypto para gen_random_uuid()
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Trigger de updated_at
-- ---------------------------------------------------------------------
create or replace function panelhito.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- =====================================================================
-- TABLAS
-- =====================================================================

-- admin_profiles ------------------------------------------------------
create table if not exists panelhito.admin_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'editor' check (role in ('superadmin','admin','editor')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_profiles_user_unique unique (user_id)
);
create index if not exists idx_admin_profiles_user on panelhito.admin_profiles(user_id);
create index if not exists idx_admin_profiles_active on panelhito.admin_profiles(active);

-- site_settings (singleton) ------------------------------------------
create table if not exists panelhito.site_settings (
  id uuid primary key default gen_random_uuid(),
  singleton boolean not null default true unique check (singleton = true),
  business_name text,
  slogan text,
  business_description text,
  whatsapp_number text,
  phone_display text,
  email text,
  address text,
  city text,
  country text,
  instagram_url text,
  facebook_url text,
  logo_dark_path text,
  logo_light_path text,
  favicon_path text,
  seo_title text,
  seo_description text,
  og_image_path text,
  google_analytics_id text,
  google_search_console_code text,
  meta_pixel_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- navigation_items ----------------------------------------------------
create table if not exists panelhito.navigation_items (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  href text not null,
  location text not null default 'header' check (location in ('header','footer','both')),
  open_new_tab boolean not null default false,
  visible boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_nav_location_visible on panelhito.navigation_items(location, visible, sort_order);

-- site_sections -------------------------------------------------------
create table if not exists panelhito.site_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  eyebrow text,
  title text,
  description text,
  secondary_text text,
  primary_button_label text,
  primary_button_url text,
  secondary_button_label text,
  secondary_button_url text,
  background_media_path text,
  visible boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_sections_visible_order on panelhito.site_sections(visible, sort_order);

-- hero_highlights -----------------------------------------------------
create table if not exists panelhito.hero_highlights (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  icon_key text,
  visible boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_hero_highlights_visible_order on panelhito.hero_highlights(visible, sort_order);

-- products ------------------------------------------------------------
create table if not exists panelhito.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text,
  short_description text,
  description text,
  applications text[] not null default '{}',
  thickness_text text,
  core_text text,
  image_path text,
  image_alt text,
  whatsapp_message text,
  featured boolean not null default false,
  published boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_products_published on panelhito.products(published);
create index if not exists idx_products_featured on panelhito.products(featured);
create index if not exists idx_products_order on panelhito.products(sort_order);
create index if not exists idx_products_slug on panelhito.products(slug);
create index if not exists idx_products_created on panelhito.products(created_at);

-- product_specs -------------------------------------------------------
create table if not exists panelhito.product_specs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references panelhito.products(id) on delete cascade,
  label text not null,
  value text,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_product_specs_product on panelhito.product_specs(product_id, sort_order);

-- benefits ------------------------------------------------------------
create table if not exists panelhito.benefits (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  icon_key text,
  published boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_benefits_published_order on panelhito.benefits(published, sort_order);

-- applications --------------------------------------------------------
create table if not exists panelhito.applications (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  image_path text,
  image_alt text,
  published boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_applications_published_order on panelhito.applications(published, sort_order);
create index if not exists idx_applications_slug on panelhito.applications(slug);

-- comparison_rows -----------------------------------------------------
create table if not exists panelhito.comparison_rows (
  id uuid primary key default gen_random_uuid(),
  criterion text not null,
  conventional_value text,
  panel_value text,
  published boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_comparison_published_order on panelhito.comparison_rows(published, sort_order);

-- process_steps -------------------------------------------------------
create table if not exists panelhito.process_steps (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  published boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_process_published_order on panelhito.process_steps(published, sort_order);

-- projects ------------------------------------------------------------
create table if not exists panelhito.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text,
  location text,
  description text,
  product_used text,
  cover_image_path text,
  cover_image_alt text,
  featured_home boolean not null default false,
  published boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  project_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_projects_published on panelhito.projects(published);
create index if not exists idx_projects_featured_home on panelhito.projects(featured_home);
create index if not exists idx_projects_order on panelhito.projects(sort_order);
create index if not exists idx_projects_slug on panelhito.projects(slug);

-- project_media (galería: imágenes y videos) --------------------------
create table if not exists panelhito.project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references panelhito.projects(id) on delete set null,
  media_type text not null check (media_type in ('image','video')),
  storage_path text not null,
  thumbnail_path text,
  alt_text text,
  caption text,
  is_cover boolean not null default false,
  featured boolean not null default false,
  published boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_media_project on panelhito.project_media(project_id, sort_order);
create index if not exists idx_media_published on panelhito.project_media(published);
create index if not exists idx_media_featured on panelhito.project_media(featured);
create index if not exists idx_media_type on panelhito.project_media(media_type);

-- company_values ------------------------------------------------------
create table if not exists panelhito.company_values (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  visible boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_values_visible_order on panelhito.company_values(visible, sort_order);

-- faqs ----------------------------------------------------------------
create table if not exists panelhito.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text,
  published boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_faqs_published_order on panelhito.faqs(published, sort_order);

-- contact_project_types ----------------------------------------------
create table if not exists panelhito.contact_project_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  published boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_project_types_published_order on panelhito.contact_project_types(published, sort_order);

-- contact_requests ----------------------------------------------------
create table if not exists panelhito.contact_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  company text,
  phone text,
  email text,
  project_type text,
  city text,
  approximate_area text,
  message text,
  status text not null default 'nuevo' check (status in ('nuevo','contactado','presupuestado','cerrado','descartado')),
  internal_notes text,
  assigned_to uuid references auth.users(id) on delete set null,
  source_page text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  ip_hash text,
  user_agent text,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_contact_status on panelhito.contact_requests(status);
create index if not exists idx_contact_created on panelhito.contact_requests(created_at);
create index if not exists idx_contact_assigned on panelhito.contact_requests(assigned_to);

-- legal_pages ---------------------------------------------------------
create table if not exists panelhito.legal_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  content text,
  last_updated_label text,
  seo_title text,
  seo_description text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_legal_slug on panelhito.legal_pages(slug);

-- audit_logs ----------------------------------------------------------
create table if not exists panelhito.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity text,
  entity_id text,
  changes jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_created on panelhito.audit_logs(created_at);
create index if not exists idx_audit_entity on panelhito.audit_logs(entity, entity_id);

-- =====================================================================
-- Triggers de updated_at para todas las tablas con esa columna
-- =====================================================================
do $$
declare t text;
begin
  foreach t in array array[
    'admin_profiles','site_settings','navigation_items','site_sections','hero_highlights',
    'products','product_specs','benefits','applications','comparison_rows','process_steps',
    'projects','project_media','company_values','faqs','contact_project_types','contact_requests','legal_pages'
  ] loop
    execute format('drop trigger if exists set_updated_at on panelhito.%I;', t);
    execute format('create trigger set_updated_at before update on panelhito.%I for each row execute function panelhito.set_updated_at();', t);
  end loop;
end $$;
