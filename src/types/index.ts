export type VoteSide = 'A' | 'B';

export const TOPIC_CATEGORIES = [
  '仕事',
  'グルメ',
  'ライフスタイル',
  'エンタメ',
  '恋愛',
  'その他',
] as const;

export type TopicCategory = (typeof TOPIC_CATEGORIES)[number];

export interface Option {
  text: string;
  imageUrl: string;
}

export interface Comment {
  id: string;
  side: VoteSide;
  text: string;
  author: string;
  createdAt: string;
  likes: number;
}

export interface Topic {
  id: string;
  title: string;
  category: TopicCategory;
  optionA: Option;
  optionB: Option;
  votesA: number;
  votesB: number;
  viewCount: number;
  likeCount?: number;
  isPublished?: boolean;
  createdBy: string;
  comments: Comment[];
}

export interface UserTopic extends Topic {
  notifications: number;
}
