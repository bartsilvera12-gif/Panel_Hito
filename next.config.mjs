/** @type {import('next').NextConfig} */
const supabaseHost = (() => {
  try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://api.neura.com.py').hostname; }
  catch { return 'api.neura.com.py'; }
})();

const nextConfig = {
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
