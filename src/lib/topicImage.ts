export const DEFAULT_TOPIC_IMAGE =
  'https://images.unsplash.com/photo-1611162617474-5b21e939e227?w=600&h=800&fit=crop&auto=format&q=80';

const BROKEN_UNSPLASH_IDS = new Set([
  'photo-1511923499332-2d1a0b9c5b8e',
]);

const UNSPLASH_REPLACEMENTS: Record<string, string> = {
  'photo-1511923499332-2d1a0b9c5b8e':
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=800&fit=crop&auto=format&q=80',
};

export function normalizeTopicImageUrl(url: string | undefined | null): string {
  const trimmed = url?.trim() ?? '';
  if (!trimmed) return DEFAULT_TOPIC_IMAGE;
  if (trimmed.startsWith('data:')) return trimmed;

  let normalized = trimmed;
  if (normalized.startsWith('http://')) {
    normalized = `https://${normalized.slice('http://'.length)}`;
  }

  for (const brokenId of BROKEN_UNSPLASH_IDS) {
    if (normalized.includes(brokenId)) {
      return UNSPLASH_REPLACEMENTS[brokenId] ?? DEFAULT_TOPIC_IMAGE;
    }
  }

  if (normalized.includes('images.unsplash.com') && !normalized.includes('auto=format')) {
    const joiner = normalized.includes('?') ? '&' : '?';
    normalized = `${normalized}${joiner}auto=format&q=80`;
  }

  return normalized;
}
