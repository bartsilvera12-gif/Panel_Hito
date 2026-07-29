import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://panelhito.com.py';
  return [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/trabajos`, changeFrequency: 'weekly', priority: 0.8 },
  ];
}
