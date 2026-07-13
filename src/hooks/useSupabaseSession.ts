import { useCallback, useEffect, useState } from 'react';
import {
  addCommentRemote,
  deleteCommentRemote,
  loadUserSessionData,
  recordViewRemote,
  recordVoteRemote,
  toggleCommentLikeRemote,
  toggleTopicLikeRemote,
  unpublishTopicRemote,
} from '../lib/topicApi';
import {
  loadUserData,
  saveUserData,
  type FeedState,
  type MyPageState,
  type UserLocalData,
} from '../lib/userStorage';
import { ensureAnonymousAuth } from '../lib/supabase';
import type { VoteSide } from '../types';

interface UseSupabaseSessionOptions {
  enabled: boolean;
  onTopicsChanged?: () => Promise<void> | void;
}

export function useSupabaseSession({ enabled, onTopicsChanged }: UseSupabaseSessionOptions) {
  const [ready, setReady] = useState(!enabled);
  const [initError, setInitError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, VoteSide>>({});
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [commentLikes, setCommentLikes] = useState<Record<string, boolean>>({});
  const [seenTopicIds, setSeenTopicIds] = useState<string[]>(() => loadUserData().seenTopicIds);
  const [feedState, setFeedState] = useState<FeedState | null>(() => loadUserData().feedState);
  const [myPageState, setMyPageState] = useState<MyPageState>(() => loadUserData().myPageState);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function init() {
      try {
        const authUserId = await ensureAnonymousAuth();
        const sessionData = await loadUserSessionData(authUserId);

        if (cancelled) return;

        setUserId(authUserId);
        setVotes(sessionData.votes);
        setLikes(sessionData.likes);
        setCommentLikes(sessionData.commentLikes);
        setInitError(null);
        setReady(true);
      } catch (err) {
        if (cancelled) return;
        setInitError(err instanceof Error ? err.message : '接続に失敗しました');
        setReady(true);
      }
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const persistLocal = useCallback((patch: Partial<UserLocalData>) => {
    const current = loadUserData();
    saveUserData({ ...current, ...patch });
  }, []);

  const recordVote = useCallback(async (topicId: string, side: VoteSide): Promise<boolean> => {
    if (!userId || votes[topicId]) return false;

    const recorded = await recordVoteRemote(topicId, userId, side);
    if (!recorded) return false;

    setVotes((prev) => ({ ...prev, [topicId]: side }));
    return true;
  }, [userId, votes]);

  const recordView = useCallback(async (topicId: string) => {
    if (!userId) return;
    await recordViewRemote(topicId, userId);
  }, [userId]);

  const toggleLike = useCallback(async (topicId: string) => {
    if (!userId) return;

    let wasLiked = false;
    setLikes((prev) => {
      wasLiked = Boolean(prev[topicId]);
      const next = { ...prev };
      if (wasLiked) {
        delete next[topicId];
      } else {
        next[topicId] = true;
      }
      return next;
    });

    try {
      await toggleTopicLikeRemote(topicId, userId, wasLiked);
    } catch (err) {
      setLikes((prev) => {
        const next = { ...prev };
        if (wasLiked) {
          next[topicId] = true;
        } else {
          delete next[topicId];
        }
        return next;
      });
      throw err;
    }
  }, [userId]);

  const toggleCommentLike = useCallback(async (commentId: string) => {
    if (!userId) return;

    const wasLiked = Boolean(commentLikes[commentId]);
    await toggleCommentLikeRemote(commentId, userId, wasLiked);
    setCommentLikes((prev) => ({ ...prev, [commentId]: !wasLiked }));
    await onTopicsChanged?.();
  }, [userId, commentLikes, onTopicsChanged]);

  const addComment = useCallback(async (topicId: string, text: string, side: VoteSide) => {
    if (!userId) return null;
    return addCommentRemote(topicId, userId, side, text);
  }, [userId]);

  const deleteComment = useCallback(async (topicId: string, commentId: string) => {
    if (!userId) return;

    await deleteCommentRemote(commentId, userId);
    setCommentLikes((prev) => {
      const next = { ...prev };
      delete next[commentId];
      return next;
    });
    void topicId;
  }, [userId]);

  const unpublishTopic = useCallback(async (topicId: string, ownerId: string) => {
    if (!userId || userId !== ownerId) return;
    await unpublishTopicRemote(topicId, userId);
  }, [userId]);

  const markTopicSeen = useCallback((topicId: string) => {
    setSeenTopicIds((prev) => {
      if (prev.includes(topicId)) return prev;
      const next = [...prev, topicId];
      persistLocal({ seenTopicIds: next });
      return next;
    });
  }, [persistLocal]);

  const saveFeedState = useCallback((state: FeedState) => {
    setFeedState(state);
    persistLocal({ feedState: state });
  }, [persistLocal]);

  const markMyPageOpened = useCallback((myTopics: { id: string; votesA: number; votesB: number }[]) => {
    const voteSnapshots = Object.fromEntries(
      myTopics.map((topic) => [topic.id, topic.votesA + topic.votesB]),
    );
    const nextMyPageState: MyPageState = {
      lastOpenedAt: Date.now(),
      voteSnapshots,
    };
    setMyPageState(nextMyPageState);
    persistLocal({ myPageState: nextMyPageState });
  }, [persistLocal]);

  return {
    ready,
    initError,
    userId: userId ?? '',
    votes,
    likes,
    commentLikes,
    seenTopicIds,
    feedState,
    myPageState,
    recordVote,
    recordView,
    markTopicSeen,
    toggleLike,
    toggleCommentLike,
    addComment,
    deleteComment,
    unpublishTopic,
    saveFeedState,
    markMyPageOpened,
  };
}
