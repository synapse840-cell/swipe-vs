import { describe, expect, it } from 'vitest';
import { ALL_CATEGORIES_FILTER, buildFeedTopics, orderTopicsByUnread, groupTopicsByCategory } from './feedOrder';
import type { Topic } from '../types';

const sampleTopics: Topic[] = [
  {
    id: 'a',
    title: 'A',
    category: '仕事',
    optionA: { text: '1', imageUrl: '' },
    optionB: { text: '2', imageUrl: '' },
    votesA: 0,
    votesB: 0,
    viewCount: 0,
    createdBy: 'x',
    comments: [],
  },
  {
    id: 'b',
    title: 'B',
    category: 'グルメ',
    optionA: { text: '1', imageUrl: '' },
    optionB: { text: '2', imageUrl: '' },
    votesA: 0,
    votesB: 0,
    viewCount: 0,
    createdBy: 'x',
    comments: [],
  },
];

describe('orderTopicsByUnread', () => {
  it('puts unseen topics first', () => {
    const ordered = orderTopicsByUnread(sampleTopics, ['a']);
    expect(ordered.map((topic) => topic.id)).toEqual(['b', 'a']);
  });
});

describe('groupTopicsByCategory', () => {
  it('groups topics by category', () => {
    const groups = groupTopicsByCategory(sampleTopics);
    expect(groups['仕事']).toHaveLength(1);
    expect(groups['グルメ']).toHaveLength(1);
  });
});

describe('buildFeedTopics', () => {
  it('skips voted topics when unvoted remain', () => {
    const feed = buildFeedTopics(sampleTopics, {
      votedTopicIds: ['a'],
      seenTopicIds: [],
      categoryFilter: ALL_CATEGORIES_FILTER,
      skipVoted: true,
    });
    expect(feed.map((topic) => topic.id)).toEqual(['b']);
  });

  it('loops all topics when every topic is voted', () => {
    const feed = buildFeedTopics(sampleTopics, {
      votedTopicIds: ['a', 'b'],
      seenTopicIds: [],
      categoryFilter: ALL_CATEGORIES_FILTER,
      skipVoted: true,
    });
    expect(feed.map((topic) => topic.id)).toEqual(['a', 'b']);
  });

  it('filters by category', () => {
    const feed = buildFeedTopics(sampleTopics, {
      votedTopicIds: [],
      seenTopicIds: [],
      categoryFilter: '仕事',
      skipVoted: false,
    });
    expect(feed.map((topic) => topic.id)).toEqual(['a']);
  });

  it('orders unread topics first after filters', () => {
    const feed = buildFeedTopics(sampleTopics, {
      votedTopicIds: [],
      seenTopicIds: ['a'],
      categoryFilter: ALL_CATEGORIES_FILTER,
      skipVoted: false,
    });
    expect(feed.map((topic) => topic.id)).toEqual(['b', 'a']);
  });
});
