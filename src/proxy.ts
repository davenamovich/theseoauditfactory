import { NextRequest, NextResponse } from 'next/server';

const SEO_HOST = 'seo.plunderandriffle.com';

/** Keep the existing audit experience on the apex host; route field notes only on the SEO subdomain. */
export function proxy(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0]?.toLowerCase();
  const { pathname } = request.nextUrl;

  // Internal App Router implementation paths must not become public duplicate URLs on other hosts.
  if (host !== SEO_HOST) {
    if (pathname === '/seo' || pathname.startsWith('/seo/')) return new NextResponse(null, { status: 404 });
    return NextResponse.next();
  }

  if (pathname.startsWith('/_next/') || pathname.startsWith('/api/')) return NextResponse.next();

  // This subdomain is draft/noindex until editorial approval and DNS launch are complete.
  if (pathname === '/robots.txt') {
    return new NextResponse('User-agent: *\nDisallow: /\n', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex, nofollow' },
    });
  }
  if (pathname === '/sitemap.xml') {
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      headers: { 'Content-Type': 'application/xml; charset=utf-8', 'X-Robots-Tag': 'noindex, nofollow' },
    });
  }

  const target = request.nextUrl.clone();
  if (pathname === '/seo' || pathname.startsWith('/seo/')) return NextResponse.next();
  target.pathname = `/seo${pathname === '/' ? '' : pathname}`;
  const response = NextResponse.rewrite(target);
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}
