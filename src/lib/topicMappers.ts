import type { Database } from '../types/database';
import type { Comment, Topic, TopicCategory } from '../types';

type TopicRow = Database['public']['Tables']['topics']['Row'];
type CommentRow = Database['public']['Tables']['comments']['Row'];

export function mapCommentRow(
  row: CommentRow,
  authorName: string,
  currentUserId: string,
): Comment {
  return {
    id: row.id,
    side: row.side,
    text: row.text,
    author: row.user_id === currentUserId ? 'あなた' : authorName,
    createdAt: row.created_at,
    likes: row.likes_count,
  };
}

export function mapTopicRow(row: TopicRow, comments: Comment[]): Topic {
  return {
    id: row.id,
    title: row.title,
    category: row.category as TopicCategory,
    optionA: { text: row.option_a_text, imageUrl: row.option_a_image_url },
    optionB: { text: row.option_b_text, imageUrl: row.option_b_image_url },
    votesA: row.votes_a,
    votesB: row.votes_b,
    viewCount: row.view_count,
    likeCount: row.likes_count ?? 0,
    isPublished: row.is_published,
    createdBy: row.created_by,
    comments,
  };
}

export function topicToInsertRow(
  topic: Omit<Topic, 'id' | 'votesA' | 'votesB' | 'viewCount' | 'comments' | 'likeCount'>,
  userId: string,
): Database['public']['Tables']['topics']['Insert'] {
  return {
    title: topic.title,
    category: topic.category,
    option_a_text: topic.optionA.text,
    option_a_image_url: topic.optionA.imageUrl,
    option_b_text: topic.optionB.text,
    option_b_image_url: topic.optionB.imageUrl,
    created_by: userId,
    is_published: true,
  };
}
