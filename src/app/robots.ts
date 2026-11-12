import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // Keep the draft subdomain out of search until the owner approves launch and DNS is set.
  return { rules: [{ userAgent: '*', disallow: '/' }] };
}
