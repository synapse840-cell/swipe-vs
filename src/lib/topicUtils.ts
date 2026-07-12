import type { Topic } from '../types';
import type { TopicVoteAdjustment } from './userStorage';

export function applyTopicAdjustments(
  topics: Topic[],
  voteAdjustments: Record<string, TopicVoteAdjustment>,
  viewAdjustments: Record<string, number>,
): Topic[] {
  return topics.map((topic) => {
    const voteAdj = voteAdjustments[topic.id];
    const viewDelta = viewAdjustments[topic.id] ?? 0;

    if (!voteAdj && viewDelta === 0) return topic;

    return {
      ...topic,
      votesA: topic.votesA + (voteAdj?.votesA ?? 0),
      votesB: topic.votesB + (voteAdj?.votesB ?? 0),
      viewCount: topic.viewCount + viewDelta,
    };
  });
}

/** @deprecated Use applyTopicAdjustments instead */
export function applyVoteAdjustments(
  topics: Topic[],
  adjustments: Record<string, TopicVoteAdjustment>,
): Topic[] {
  return applyTopicAdjustments(topics, adjustments, {});
}
