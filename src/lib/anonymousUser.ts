const ANON_ID_KEY = 'swipe-vs-anonymous-id';

export function getOrCreateAnonymousUserId(): string {
  if (typeof window === 'undefined') {
    return 'anon_preview';
  }

  try {
    const existing = localStorage.getItem(ANON_ID_KEY);
    if (existing) return existing;

    const id = `anon_${crypto.randomUUID()}`;
    localStorage.setItem(ANON_ID_KEY, id);
    return id;
  } catch {
    return `anon_${Date.now()}`;
  }
}
