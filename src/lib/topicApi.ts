import type { Comment, Topic, VoteSide } from '../types';
import type { Database } from '../types/database';
import { getSupabase } from './supabase';
import { mapCommentRow, mapTopicRow, topicToInsertRow } from './topicMappers';

type TopicRow = Database['public']['Tables']['topics']['Row'];

export const FEED_PAGE_SIZE = 10;

async function fetchProfiles(userIds: string[]): Promise<Record<string, string>> {
  if (userIds.length === 0) return {};

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', userIds);

  if (error) throw error;

  return Object.fromEntries((data ?? []).map((row) => [row.id, row.display_name]));
}

async function fetchCommentsForTopics(
  topicIds: string[],
  currentUserId: string,
): Promise<Record<string, Comment[]>> {
  if (topicIds.length === 0) return {};

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .in('topic_id', topicIds)
    .order('created_at', { ascending: true });

  if (error) throw error;

  const commentRows = data ?? [];
  const authorIds = [...new Set(commentRows.map((row) => row.user_id))];
  const profiles = await fetchProfiles(authorIds);

  const grouped: Record<string, Comment[]> = {};
  for (const row of commentRows) {
    const comment = mapCommentRow(row, profiles[row.user_id] ?? '匿名ユーザー', currentUserId);
    grouped[row.topic_id] = [...(grouped[row.topic_id] ?? []), comment];
  }

  return grouped;
}

async function mapTopicRows(
  rows: TopicRow[],
  userId: string,
): Promise<Topic[]> {
  const topicIds = rows.map((row) => row.id);
  const commentsByTopic = await fetchCommentsForTopics(topicIds, userId);
  return rows.map((row) => mapTopicRow(row, commentsByTopic[row.id] ?? []));
}

/** フィード用: 公開中のお題のみページング取得 */
export async function fetchFeedTopics(
  userId: string,
  offset = 0,
  limit = FEED_PAGE_SIZE,
): Promise<Topic[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return mapTopicRows((data ?? []) as TopicRow[], userId);
}

/** マイページ用: 自分が作成した公開中のお題 */
export async function fetchMyCreatedTopics(userId: string): Promise<Topic[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('created_by', userId)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return mapTopicRows((data ?? []) as TopicRow[], userId);
}

/** マイページ用: いいねしたお題 */
export async function fetchLikedTopics(userId: string): Promise<Topic[]> {
  const supabase = getSupabase();
  const { data: likes, error: likesError } = await supabase
    .from('topic_likes')
    .select('topic_id')
    .eq('user_id', userId);

  if (likesError) throw likesError;

  const topicIds = [...new Set((likes ?? []).map((row) => row.topic_id))];
  if (topicIds.length === 0) return [];

  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .in('id', topicIds)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return mapTopicRows((data ?? []) as TopicRow[], userId);
}

/** マイページ用: 投票したお題 */
export async function fetchVotedTopicsWithSide(
  userId: string,
): Promise<{ topic: Topic; side: VoteSide }[]> {
  const supabase = getSupabase();
  const { data: voteRows, error: votesError } = await supabase
    .from('votes')
    .select('topic_id, side')
    .eq('user_id', userId);

  if (votesError) throw votesError;
  if (!voteRows?.length) return [];

  const topicIds = voteRows.map((row) => row.topic_id);
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .in('id', topicIds)
    .eq('is_published', true);

  if (error) throw error;

  const topics = await mapTopicRows((data ?? []) as TopicRow[], userId);
  const topicMap = new Map(topics.map((topic) => [topic.id, topic]));

  return voteRows
    .map((row) => {
      const topic = topicMap.get(row.topic_id);
      return topic ? { topic, side: row.side as VoteSide } : null;
    })
    .filter((item): item is { topic: Topic; side: VoteSide } => item !== null);
}

/** 共有URLなどで単一お題を取得 */
export async function fetchTopicById(topicId: string, userId: string): Promise<Topic | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('id', topicId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as TopicRow;
  if (!row.is_published && row.created_by !== userId) return null;

  const [topic] = await mapTopicRows([row], userId);
  return topic ?? null;
}

/** @deprecated fetchFeedTopics を使用 */
export async function fetchTopics(userId: string): Promise<Topic[]> {
  return fetchFeedTopics(userId, 0, FEED_PAGE_SIZE);
}

export async function createTopic(
  input: Omit<Topic, 'id' | 'votesA' | 'votesB' | 'viewCount' | 'comments' | 'likeCount'>,
  userId: string,
): Promise<Topic> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('topics')
    .insert(topicToInsertRow(input, userId))
    .select('*')
    .single();

  if (error) throw error;
  return mapTopicRow(data as TopicRow, []);
}

export async function recordVoteRemote(
  topicId: string,
  userId: string,
  side: VoteSide,
): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from('votes').insert({
    topic_id: topicId,
    user_id: userId,
    side,
  });

  if (error) {
    if (error.code === '23505') return false;
    throw error;
  }

  return true;
}

export async function recordViewRemote(topicId: string, userId: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from('topic_views').insert({
    topic_id: topicId,
    user_id: userId,
  });

  if (error && error.code !== '23505') throw error;
}

export async function toggleTopicLikeRemote(
  topicId: string,
  userId: string,
  liked: boolean,
): Promise<void> {
  const supabase = getSupabase();

  if (liked) {
    const { error } = await supabase.from('topic_likes').delete()
      .eq('topic_id', topicId)
      .eq('user_id', userId);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from('topic_likes').insert({
    topic_id: topicId,
    user_id: userId,
  });
  if (error && error.code !== '23505') throw error;
}

export async function toggleCommentLikeRemote(
  commentId: string,
  userId: string,
  liked: boolean,
): Promise<void> {
  const supabase = getSupabase();

  if (liked) {
    const { error } = await supabase.from('comment_likes').delete()
      .eq('comment_id', commentId)
      .eq('user_id', userId);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from('comment_likes').insert({
    comment_id: commentId,
    user_id: userId,
  });
  if (error && error.code !== '23505') throw error;
}

export async function addCommentRemote(
  topicId: string,
  userId: string,
  side: VoteSide,
  text: string,
): Promise<Comment> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('comments')
    .insert({
      topic_id: topicId,
      user_id: userId,
      side,
      text,
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapCommentRow(data, 'あなた', userId);
}

export async function deleteCommentRemote(
  commentId: string,
  userId: string,
): Promise<void> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', userId)
    .select('id');

  if (error) throw error;
  if (!data?.length) {
    throw new Error('コメントの削除に失敗しました。再度ログインしてお試しください。');
  }
}

export async function unpublishTopicRemote(topicId: string, userId: string): Promise<void> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('topics')
    .update({ is_published: false })
    .eq('id', topicId)
    .eq('created_by', userId)
    .select('id');

  if (error) throw error;
  if (!data?.length) {
    throw new Error('お題の非公開に失敗しました。再度ログインしてお試しください。');
  }
}

export async function loadUserSessionData(userId: string): Promise<{
  votes: Record<string, VoteSide>;
  likes: Record<string, boolean>;
  commentLikes: Record<string, boolean>;
}> {
  const supabase = getSupabase();

  const [votesResult, likesResult, commentLikesResult] = await Promise.all([
    supabase.from('votes').select('topic_id, side').eq('user_id', userId),
    supabase.from('topic_likes').select('topic_id').eq('user_id', userId),
    supabase.from('comment_likes').select('comment_id').eq('user_id', userId),
  ]);

  if (votesResult.error) throw votesResult.error;
  if (likesResult.error) throw likesResult.error;
  if (commentLikesResult.error) throw commentLikesResult.error;

  const votes: Record<string, VoteSide> = {};
  for (const row of votesResult.data ?? []) {
    votes[row.topic_id] = row.side;
  }

  const likes: Record<string, boolean> = {};
  for (const row of likesResult.data ?? []) {
    likes[row.topic_id] = true;
  }

  const commentLikes: Record<string, boolean> = {};
  for (const row of commentLikesResult.data ?? []) {
    commentLikes[row.comment_id] = true;
  }

  return { votes, likes, commentLikes };
}
