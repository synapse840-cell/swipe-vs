import { describe, expect, it } from 'vitest';
import { buildTopicShareUrl, getTopicIdFromUrl } from './topicUrl';

describe('topicUrl', () => {
  it('builds share url with topic query', () => {
    const url = buildTopicShareUrl('topic-1', 'https://swipe-vs.example/');
    expect(url).toBe('https://swipe-vs.example/?topic=topic-1');
  });

  it('reads topic id from url', () => {
    expect(getTopicIdFromUrl('https://swipe-vs.example/?topic=abc')).toBe('abc');
    expect(getTopicIdFromUrl('https://swipe-vs.example/')).toBeNull();
  });
});
