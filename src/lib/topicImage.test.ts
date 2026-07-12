import { describe, expect, it } from 'vitest';
import { DEFAULT_TOPIC_IMAGE, normalizeTopicImageUrl } from './topicImage';

describe('normalizeTopicImageUrl', () => {
  it('returns default for empty url', () => {
    expect(normalizeTopicImageUrl('')).toBe(DEFAULT_TOPIC_IMAGE);
  });

  it('replaces known broken unsplash ids', () => {
    const url = normalizeTopicImageUrl(
      'https://images.unsplash.com/photo-1511923499332-2d1a0b9c5b8e?w=600&h=800&fit=crop',
    );
    expect(url).toContain('photo-1554118811-1e0d58224f24');
  });

  it('adds auto format params for unsplash', () => {
    const url = normalizeTopicImageUrl('https://images.unsplash.com/photo-123?w=600');
    expect(url).toContain('auto=format');
    expect(url).toContain('q=80');
  });
});
