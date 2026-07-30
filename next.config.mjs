/** @type {import('next').NextConfig} */
const supabaseHost = (() => {
  try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://api.neura.com.py').hostname; }
  catch { return 'api.neura.com.py'; }
})();

const nextConfig = {
  // Oculta el indicador "N" de Next.js en desarrollo.
  devIndicators: false,
  // Permite subir imágenes/videos por Server Actions (por defecto el límite es 1 MB).
  experimental: {
    serverActions: { bodySizeLimit: '50mb' },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: supabaseHost },
    ],
  },
  async redirects() {
    return [];
  },
};

export default nextConfig;
