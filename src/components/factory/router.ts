'use client';

// Tiny hash router: works in the single-route sandbox while keeping shareable links.
// Uses useSyncExternalStore so SSR (home) and hydrated state (real hash) stay consistent
// without setState-in-effect.
import { useCallback, useSyncExternalStore } from 'react';

export type Route =
  | { view: 'home' }
  | { view: 'audit'; id: string }
  | { view: 'report'; id: string }
  | { view: 'studio'; id?: string }
  | { view: 'learn' }
  | { view: 'article'; slug: string }
  | { view: 'glossary' }
  | { view: 'resources' }
  | { view: 'about' }
  | { view: 'admin' };

export function parseHash(hash: string): Route {
  const clean = hash.replace(/^#\/?/, '');
  const parts = clean.split('/').filter(Boolean);
  if (parts.length === 0) return { view: 'home' };
  switch (parts[0]) {
    case 'audit':
      return parts[1] ? { view: 'audit', id: parts[1] } : { view: 'home' };
    case 'report':
      return parts[1] ? { view: 'report', id: parts[1] } : { view: 'home' };
    case 'studio':
      return { view: 'studio', id: parts[1] };
    case 'learn':
      return parts[1] ? { view: 'article', slug: parts[1] } : { view: 'learn' };
    case 'glossary':
      return { view: 'glossary' };
    case 'resources':
      return { view: 'resources' };
    case 'about':
      return { view: 'about' };
    case 'admin':
      return { view: 'admin' };
    default:
      return { view: 'home' };
  }
}

function subscribe(onChange: () => void): () => void {
  const handler = () => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    onChange();
  };
  window.addEventListener('hashchange', handler);
  return () => window.removeEventListener('hashchange', handler);
}

function getSnapshot(): string {
  return window.location.hash;
}

function getServerSnapshot(): string {
  return '';
}

export function useHashRoute(): [Route, (to: string) => void] {
  const hash = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const route = parseHash(hash);

  const navigate = useCallback((to: string) => {
    const target = to.startsWith('#') ? to : `#${to.startsWith('/') ? to : `/${to}`}`;
    if (window.location.hash === target) {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    } else {
      window.location.hash = target;
    }
  }, []);

  return [route, navigate];
}
