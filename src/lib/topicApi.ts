import type { Comment, Topic, VoteSide } from '../types';
import type { Database } from '../types/database';
import { getSupabase } from './supabase';
import { mapCommentRow, mapTopicRow, topicToInsertRow } from './topicMappers';

type TopicRow = Database['public']['Tables']['topics']['Row'];

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

export async function fetchTopics(userId: string): Promise<Topic[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .or(`is_published.eq.true,created_by.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const rows = (data ?? []) as TopicRow[];
  const topicIds = rows.map((row) => row.id);
  const commentsByTopic = await fetchCommentsForTopics(topicIds, userId);

  return rows.map((row) => mapTopicRow(row, commentsByTopic[row.id] ?? []));
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
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function unpublishTopicRemote(topicId: string, userId: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('topics')
    .update({ is_published: false })
    .eq('id', topicId)
    .eq('created_by', userId);

  if (error) throw error;
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
