const IMAGE_PARAMS = 'w=600&h=800&fit=crop&auto=format&q=80';

export const DEFAULT_TOPIC_IMAGE = buildUnsplashUrl('photo-1611162617474-5b21e939e227');

/** HEAD で 404 になるなど、シードで使っていた壊れた Unsplash ID */
const UNSPLASH_REPLACEMENTS: Record<string, string> = {
  'photo-1511923499332-2d1a0b9c5b8e': buildUnsplashUrl('photo-1554118811-1e0d58224f24'),
  'photo-1478131143088-5e74181e3bb3': buildUnsplashUrl('photo-1504280390367-361c6d9f38f4'),
  'photo-1514880547357-9ea9e782228f': buildUnsplashUrl('photo-1573865526739-10659fec78a5'),
  'photo-1597466599360-3bf75c87fd69': buildUnsplashUrl('photo-1464366400600-7168b8af9bc3'),
  'photo-1522869635100-9f4ffb5f86f7': buildUnsplashUrl('photo-1485846234645-a62644f84728'),
  'photo-1476514525535-07fb3c4ac5d1': buildUnsplashUrl('photo-1469474968028-56623f02e42e'),
};

export function buildUnsplashUrl(photoId: string): string {
  return `https://images.unsplash.com/${photoId}?${IMAGE_PARAMS}`;
}

function extractUnsplashPhotoId(url: string): string | null {
  const match = url.match(/images\.unsplash\.com\/(photo-[^/?]+)/i);
  return match?.[1] ?? null;
}

export function normalizeTopicImageUrl(url: string | undefined | null): string {
  const trimmed = url?.trim() ?? '';
  if (!trimmed) return DEFAULT_TOPIC_IMAGE;
  if (trimmed.startsWith('data:')) return trimmed;

  let normalized = trimmed;
  if (normalized.startsWith('http://')) {
    normalized = `https://${normalized.slice('http://'.length)}`;
  }

  const photoId = extractUnsplashPhotoId(normalized);
  if (photoId && UNSPLASH_REPLACEMENTS[photoId]) {
    return UNSPLASH_REPLACEMENTS[photoId];
  }

  if (normalized.includes('images.unsplash.com')) {
    if (!normalized.includes('auto=format')) {
      const joiner = normalized.includes('?') ? '&' : '?';
      normalized = `${normalized}${joiner}auto=format&q=80`;
    }
    if (!normalized.includes('w=')) {
      const joiner = normalized.includes('?') ? '&' : '?';
      normalized = `${normalized}${joiner}w=600&h=800&fit=crop`;
    }
  }

  return normalized;
}
