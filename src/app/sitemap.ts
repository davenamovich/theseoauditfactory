import type { MetadataRoute } from 'next';

// All user-facing views live under hash routes on the canonical root URL.
// Search engines and AI assistants index the root; hash fragments are not
// separate URLs. This sitemap is honest about that instead of inventing pages.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const lastModified = new Date();
  return [
    {
      url: `${base}/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
