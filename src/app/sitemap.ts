import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  // No URLs listed while the subdomain content is an unapproved editorial draft.
  return [];
}
