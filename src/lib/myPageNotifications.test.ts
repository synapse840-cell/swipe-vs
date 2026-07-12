import { describe, expect, it } from 'vitest';
import { buildMyPageNotifications } from './myPageNotifications';
import type { Topic } from '../types';

const myTopic: Topic = {
  id: 'mine',
  title: '自分のお題',
  category: 'その他',
  optionA: { text: 'A', imageUrl: '' },
  optionB: { text: 'B', imageUrl: '' },
  votesA: 9,
  votesB: 1,
  viewCount: 0,
  createdBy: 'me',
  comments: [],
};

describe('buildMyPageNotifications', () => {
  it('creates milestone notification when vote threshold is crossed', () => {
    const notifications = buildMyPageNotifications([myTopic], {}, 0, { mine: 5 });
    expect(notifications.some((item) => item.id.includes('milestone'))).toBe(true);
  });

  it('creates comment notification for new comments from others', () => {
    const notifications = buildMyPageNotifications(
      [myTopic],
      {
        mine: [{
          id: 'c1',
          side: 'A',
          text: 'hello',
          author: '他人',
          createdAt: new Date().toISOString(),
          likes: 0,
        }],
      },
      Date.now() - 1000,
      {},
    );

    expect(notifications.some((item) => item.id.startsWith('comment-'))).toBe(true);
  });

  it('ignores own comments for notifications', () => {
    const notifications = buildMyPageNotifications(
      [myTopic],
      {
        mine: [{
          id: 'c1',
          side: 'A',
          text: 'hello',
          author: 'あなた',
          createdAt: new Date().toISOString(),
          likes: 0,
        }],
      },
      Date.now() - 1000,
      {},
    );

    expect(notifications.some((item) => item.id.startsWith('comment-'))).toBe(false);
  });

  it('limits notifications to five items', () => {
    const topics = Array.from({ length: 8 }, (_, index) => ({
      ...myTopic,
      id: `mine-${index}`,
      title: `お題${index}`,
      votesA: 100,
      votesB: 0,
    }));

    const notifications = buildMyPageNotifications(topics, {}, 0, {});
    expect(notifications.length).toBeLessThanOrEqual(5);
  });
});
