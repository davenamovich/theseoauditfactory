import type { MetadataRoute } from 'next';

// robots.txt as a metadata route so the sitemap URL is always absolute.
// AI crawlers are explicitly welcome: this site is written to be quotable.
export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
  return {
    rules: [
      { userAgent: ['Googlebot', 'Bingbot', 'DuckDuckBot', 'Applebot'], allow: '/' },
      { userAgent: ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'CCBot'], allow: '/' },
      { userAgent: ['Twitterbot', 'facebookexternalhit'], allow: '/' },
      { userAgent: '*', allow: '/', disallow: '/api/' },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
