import { NextRequest, NextResponse } from 'next/server';

const SEO_HOST = 'seo.plunderandriffle.com';

/** Route only the dedicated SEO host into its isolated App Router section. */
export function proxy(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0]?.toLowerCase();
  if (host !== SEO_HOST) return NextResponse.next();

  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/_next/') || pathname.startsWith('/api/')) return NextResponse.next();

  const target = request.nextUrl.clone();
  if (pathname === '/robots.txt') target.pathname = '/seo/robots.txt';
  else if (pathname === '/sitemap.xml') target.pathname = '/seo/sitemap.xml';
  else if (pathname === '/seo' || pathname.startsWith('/seo/')) return NextResponse.next();
  else target.pathname = `/seo${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(target);
}
