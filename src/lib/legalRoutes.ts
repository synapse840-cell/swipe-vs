export type LegalPath = '/terms' | '/privacy';

export function getLegalPath(): LegalPath | null {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname;
  if (path === '/terms' || path === '/privacy') return path;
  return null;
}

export function navigateTo(path: '/' | LegalPath) {
  if (typeof window === 'undefined') return;
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
