import { NextRequest, NextResponse } from 'next/server';

const SEO_HOST = 'seo.plunderandriffle.com';

/** Keep the existing audit experience on the apex host; render the field-notes section on this subdomain. */
export function proxy(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0]?.toLowerCase();
  if (host !== SEO_HOST) return NextResponse.next();

  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/_next/') || pathname.startsWith('/api/')) return NextResponse.next();
  const target = request.nextUrl.clone();
  if (pathname === '/robots.txt') target.pathname = '/robots.txt';
  else if (pathname === '/sitemap.xml') target.pathname = '/sitemap.xml';
  else if (pathname === '/seo' || pathname.startsWith('/seo/')) return NextResponse.next();
  else target.pathname = `/seo${pathname === '/' ? '' : pathname}`;
  const response = NextResponse.rewrite(target);
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}
