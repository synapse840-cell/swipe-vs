import type { Topic } from '../types';

export const ALL_CATEGORIES_FILTER = 'すべて';

export function orderTopicsByUnread(topics: Topic[], seenTopicIds: string[]): Topic[] {
  if (seenTopicIds.length === 0) return topics;

  const seen = new Set(seenTopicIds);
  const unread = topics.filter((topic) => !seen.has(topic.id));
  const read = topics.filter((topic) => seen.has(topic.id));
  return [...unread, ...read];
}

export function buildFeedTopics(
  topics: Topic[],
  options: {
    votedTopicIds: string[];
    seenTopicIds: string[];
    categoryFilter: string;
    skipVoted: boolean;
  },
): Topic[] {
  let list = topics;

  if (options.categoryFilter !== ALL_CATEGORIES_FILTER) {
    list = list.filter((topic) => topic.category === options.categoryFilter);
  }

  if (options.skipVoted) {
    const voted = new Set(options.votedTopicIds);
    const unvoted = list.filter((topic) => !voted.has(topic.id));
    if (unvoted.length > 0) {
      list = unvoted;
    }
    // 未投票がなくなったら同カテゴリの全お題を最初からループ
  }

  return orderTopicsByUnread(list, options.seenTopicIds);
}

export function groupTopicsByCategory(topics: Topic[]): Record<string, Topic[]> {
  return topics.reduce<Record<string, Topic[]>>((groups, topic) => {
    const key = topic.category;
    groups[key] = [...(groups[key] ?? []), topic];
    return groups;
  }, {});
}
