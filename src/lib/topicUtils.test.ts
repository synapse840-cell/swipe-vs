import { describe, expect, it } from 'vitest';
import { applyTopicAdjustments } from './topicUtils';
import type { Topic } from '../types';

const baseTopic: Topic = {
  id: '1',
  title: 'Test',
  category: 'その他',
  optionA: { text: 'A', imageUrl: '' },
  optionB: { text: 'B', imageUrl: '' },
  votesA: 10,
  votesB: 20,
  viewCount: 100,
  createdBy: 'user',
  comments: [],
};

describe('applyTopicAdjustments', () => {
  it('applies vote and view deltas', () => {
    const [topic] = applyTopicAdjustments(
      [baseTopic],
      { '1': { votesA: 2, votesB: 1 } },
      { '1': 5 },
    );

    expect(topic.votesA).toBe(12);
    expect(topic.votesB).toBe(21);
    expect(topic.viewCount).toBe(105);
  });
});
