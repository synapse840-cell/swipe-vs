import type { Comment, Topic, VoteSide } from '../types';
import { ALL_CATEGORIES_FILTER } from './feedOrder';

const USER_DATA_KEY = 'swipe-vs-user-data';

export interface TopicVoteAdjustment {
  votesA: number;
  votesB: number;
}

export interface FeedState {
  topicId: string;
  scrollCount: number;
  nextAdAt: number;
  categoryFilter: string;
}

export interface MyPageState {
  lastOpenedAt: number;
  voteSnapshots: Record<string, number>;
}

export interface UserLocalData {
  votes: Record<string, VoteSide>;
  likes: Record<string, boolean>;
  extraComments: Record<string, Comment[]>;
  createdTopics: Topic[];
  topicVoteAdjustments: Record<string, TopicVoteAdjustment>;
  topicViewAdjustments: Record<string, number>;
  topicLikeAdjustments: Record<string, number>;
  commentLikes: Record<string, boolean>;
  seenTopicIds: string[];
  feedState: FeedState | null;
  myPageState: MyPageState;
}

const EMPTY_MY_PAGE_STATE: MyPageState = {
  lastOpenedAt: 0,
  voteSnapshots: {},
};

const EMPTY_DATA: UserLocalData = {
  votes: {},
  likes: {},
  extraComments: {},
  createdTopics: [],
  topicVoteAdjustments: {},
  topicViewAdjustments: {},
  topicLikeAdjustments: {},
  commentLikes: {},
  seenTopicIds: [],
  feedState: null,
  myPageState: EMPTY_MY_PAGE_STATE,
};

function isUserLocalData(value: unknown): value is UserLocalData {
  if (!value || typeof value !== 'object') return false;
  const data = value as UserLocalData;
  return (
    typeof data.votes === 'object' &&
    typeof data.likes === 'object' &&
    typeof data.extraComments === 'object' &&
    Array.isArray(data.createdTopics)
  );
}

export function loadUserData(): UserLocalData {
  if (typeof window === 'undefined') return { ...EMPTY_DATA };

  try {
    const raw = localStorage.getItem(USER_DATA_KEY);
    if (!raw) return { ...EMPTY_DATA };

    const parsed: unknown = JSON.parse(raw);
    if (!isUserLocalData(parsed)) return { ...EMPTY_DATA };

    return {
      votes: parsed.votes ?? {},
      likes: parsed.likes ?? {},
      extraComments: parsed.extraComments ?? {},
      createdTopics: (parsed.createdTopics ?? []).map((topic) => ({
        ...topic,
        category: topic.category ?? 'その他',
      })),
      topicVoteAdjustments: parsed.topicVoteAdjustments ?? {},
      topicViewAdjustments: parsed.topicViewAdjustments ?? {},
      topicLikeAdjustments: parsed.topicLikeAdjustments ?? {},
      commentLikes: parsed.commentLikes ?? {},
      seenTopicIds: parsed.seenTopicIds ?? [],
      feedState: parsed.feedState
        ? {
            ...parsed.feedState,
            categoryFilter: parsed.feedState.categoryFilter ?? ALL_CATEGORIES_FILTER,
          }
        : null,
      myPageState: parsed.myPageState ?? EMPTY_MY_PAGE_STATE,
    };
  } catch {
    return { ...EMPTY_DATA };
  }
}

export function saveUserData(data: UserLocalData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
  } catch {
    // Local Storage が使えない環境ではメモリ上のみで動作
  }
}
