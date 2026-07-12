import { describe, expect, it } from 'vitest';
import { DEFAULT_TOPIC_IMAGE, buildUnsplashUrl, normalizeTopicImageUrl } from './topicImage';

describe('buildUnsplashUrl', () => {
  it('includes standard params', () => {
    const url = buildUnsplashUrl('photo-123');
    expect(url).toContain('auto=format');
    expect(url).toContain('w=600');
  });
});

describe('normalizeTopicImageUrl', () => {
  it('returns default for empty url', () => {
    expect(normalizeTopicImageUrl('')).toBe(DEFAULT_TOPIC_IMAGE);
  });

  it('replaces known broken unsplash ids', () => {
    const broken = [
      'photo-1511923499332-2d1a0b9c5b8e',
      'photo-1522869635100-9f4ffb5f86f7',
      'photo-1476514525535-07fb3c4ac5d1',
    ];

    for (const id of broken) {
      const url = normalizeTopicImageUrl(`https://images.unsplash.com/${id}?w=600&h=800&fit=crop`);
      expect(url).not.toContain(id);
      expect(url).toContain('auto=format');
    }
  });

  it('adds auto format params for unsplash', () => {
    const url = normalizeTopicImageUrl('https://images.unsplash.com/photo-123?w=600');
    expect(url).toContain('auto=format');
    expect(url).toContain('q=80');
  });
});
