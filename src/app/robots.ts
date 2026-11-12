import type { MetadataRoute } from 'next';

// robots.txt as a metadata route so the Sitemap URL is always absolute.
// AI crawlers are explicitly welcomed: this site is written to be quotable.
export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
  return {
    rules: [
      // Traditional search engines
      { userAgent: ['Googlebot', 'Bingbot', 'DuckDuckBot', 'Applebot'], allow: '/' },
      // AI assistants and answer engines
      {
        userAgent: [
          'GPTBot',
          'OAI-SearchBot',
          'ChatGPT-User',
          'ClaudeBot',
          'Claude-User',
          'Claude-SearchBot',
          'PerplexityBot',
          'Perplexity-User',
          'Google-Extended',
          'Applebot-Extended',
          'CCBot',
        ],
        allow: '/',
      },
      // Social previews
      { userAgent: ['Twitterbot', 'facebookexternalhit'], allow: '/' },
      // Everyone else
      { userAgent: '*', allow: '/', disallow: '/api/' },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
