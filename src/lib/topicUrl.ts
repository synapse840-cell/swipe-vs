export function getTopicIdFromUrl(url?: string): string | null {
  const target = url ?? (typeof window !== 'undefined' ? window.location.href : null);
  if (!target) return null;

  try {
    const parsed = new URL(target);
    return parsed.searchParams.get('topic');
  } catch {
    return null;
  }
}

export function buildTopicShareUrl(topicId: string, baseUrl?: string): string {
  const target = baseUrl ?? (typeof window !== 'undefined' ? window.location.href : 'http://localhost/');
  const url = new URL(target);
  url.search = '';
  url.hash = '';
  url.searchParams.set('topic', topicId);
  return url.toString();
}

export function clearTopicUrl(): void {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  if (!url.searchParams.has('topic')) return;

  url.searchParams.delete('topic');
  window.history.replaceState({}, '', url.toString());
}

export function syncTopicUrl(topicId: string): void {
  if (typeof window === 'undefined') return;

  const nextUrl = buildTopicShareUrl(topicId);
  if (window.location.href === nextUrl) return;

  window.history.replaceState({}, '', nextUrl);
}
