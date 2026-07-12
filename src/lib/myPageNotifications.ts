import type { Comment, Topic } from '../types';

export interface MyPageNotification {
  id: string;
  message: string;
  isNew: boolean;
  topicId?: string;
}

const MILESTONES = [10, 50, 100, 1000, 10000];
export const MY_PAGE_NOTIFICATION_LIMIT = 5;

function truncateTitle(title: string, max = 14) {
  return title.length > max ? `${title.slice(0, max)}…` : title;
}

export function buildMyPageNotifications(
  myTopics: Topic[],
  extraComments: Record<string, Comment[]>,
  lastOpenedAt: number,
  voteSnapshots: Record<string, number>,
): MyPageNotification[] {
  const notifications: MyPageNotification[] = [];

  for (const topic of myTopics) {
    const comments = [
      ...topic.comments,
      ...(extraComments[topic.id] ?? []),
    ];
    const newComments = comments.filter(
      (comment) =>
        comment.author !== 'あなた' &&
        new Date(comment.createdAt).getTime() > lastOpenedAt,
    );

    if (newComments.length > 0) {
      notifications.push({
        id: `comment-${topic.id}`,
        message: `「${truncateTitle(topic.title)}」にコメントが${newComments.length}件`,
        isNew: true,
        topicId: topic.id,
      });
    }

    const totalVotes = topic.votesA + topic.votesB;
    const previousVotes = voteSnapshots[topic.id] ?? 0;
    const milestone = [...MILESTONES].reverse().find((value) => totalVotes >= value);

    if (milestone && previousVotes < milestone) {
      notifications.push({
        id: `milestone-${topic.id}-${milestone}`,
        message: `「${truncateTitle(topic.title)}」が${milestone.toLocaleString()}票突破！`,
        isNew: true,
        topicId: topic.id,
      });
    }
  }

  return notifications.slice(0, MY_PAGE_NOTIFICATION_LIMIT);
}
