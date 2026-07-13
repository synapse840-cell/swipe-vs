import { useCallback, useEffect, useState } from 'react';
import {
  FEED_PAGE_SIZE,
  fetchFeedTopics,
  fetchLikedTopics,
  fetchMyCreatedTopics,
  fetchTopicById,
  fetchVotedTopicsWithSide,
} from '../lib/topicApi';
import { withTimeout } from '../lib/withTimeout';
import type { Topic, VoteSide } from '../types';

const FETCH_TIMEOUT_MS = 15_000;

export interface MyPageTopics {
  created: Topic[];
  voted: { topic: Topic; side: VoteSide }[];
  liked: Topic[];
}

interface RefreshOptions {
  silent?: boolean;
}

export function useSupabaseTopics(userId: string | null, enabled: boolean) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [myPageTopics, setMyPageTopics] = useState<MyPageTopics | null>(null);

  const refreshTopics = useCallback(async (options?: RefreshOptions) => {
    if (!enabled || !userId) {
      setLoading(false);
      return;
    }

    if (!options?.silent) {
      setLoading(true);
    }
    setError(null);

    try {
      const nextTopics = await withTimeout(
        fetchFeedTopics(userId, 0, FEED_PAGE_SIZE),
        FETCH_TIMEOUT_MS,
        'お題の取得がタイムアウトしました。Supabase の接続状態を確認してください。',
      );
      setTopics(nextTopics);
      setHasMore(nextTopics.length >= FEED_PAGE_SIZE);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'お題の取得に失敗しました');
    } finally {
      if (!options?.silent) {
        setLoading(false);
      }
    }
  }, [enabled, userId]);

  const loadMoreTopics = useCallback(async () => {
    if (!enabled || !userId || !hasMore || loadingMore) return;

    setLoadingMore(true);
    try {
      const nextTopics = await withTimeout(
        fetchFeedTopics(userId, topics.length, FEED_PAGE_SIZE),
        FETCH_TIMEOUT_MS,
        'お題の取得がタイムアウトしました。Supabase の接続状態を確認してください。',
      );

      setTopics((prev) => {
        const existingIds = new Set(prev.map((topic) => topic.id));
        const merged = [...prev];
        for (const topic of nextTopics) {
          if (!existingIds.has(topic.id)) {
            merged.push(topic);
          }
        }
        return merged;
      });
      setHasMore(nextTopics.length >= FEED_PAGE_SIZE);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'お題の取得に失敗しました');
    } finally {
      setLoadingMore(false);
    }
  }, [enabled, userId, hasMore, loadingMore, topics.length]);

  const loadMyPageTopics = useCallback(async () => {
    if (!enabled || !userId) return;

    try {
      const [created, voted, liked] = await Promise.all([
        fetchMyCreatedTopics(userId),
        fetchVotedTopicsWithSide(userId),
        fetchLikedTopics(userId),
      ]);
      setMyPageTopics({ created, voted, liked });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'マイページの取得に失敗しました');
    }
  }, [enabled, userId]);

  const ensureTopicLoaded = useCallback(async (topicId: string) => {
    if (!enabled || !userId) return null;

    let cached: Topic | null = null;
    setTopics((prev) => {
      cached = prev.find((topic) => topic.id === topicId) ?? null;
      return prev;
    });
    if (cached) return cached;

    const topic = await fetchTopicById(topicId, userId);
    if (!topic || topic.isPublished === false) return null;

    setTopics((prev) => (prev.some((item) => item.id === topicId) ? prev : [topic, ...prev]));
    return topic;
  }, [enabled, userId]);

  useEffect(() => {
    void refreshTopics();
  }, [refreshTopics]);

  const patchTopic = useCallback((topicId: string, patch: Partial<Topic>) => {
    setTopics((prev) =>
      prev.map((topic) => (topic.id === topicId ? { ...topic, ...patch } : topic)),
    );
    setMyPageTopics((prev) => {
      if (!prev) return prev;
      const patchList = (list: Topic[]) =>
        list.map((topic) => (topic.id === topicId ? { ...topic, ...patch } : topic));
      return {
        created: patchList(prev.created),
        voted: prev.voted.map((item) =>
          item.topic.id === topicId
            ? { ...item, topic: { ...item.topic, ...patch } }
            : item,
        ),
        liked: patchList(prev.liked),
      };
    });
  }, []);

  const removeTopic = useCallback((topicId: string) => {
    setTopics((prev) => prev.filter((topic) => topic.id !== topicId));
    setMyPageTopics((prev) => {
      if (!prev) return prev;
      return {
        created: prev.created.filter((topic) => topic.id !== topicId),
        voted: prev.voted.filter((item) => item.topic.id !== topicId),
        liked: prev.liked.filter((topic) => topic.id !== topicId),
      };
    });
  }, []);

  const prependTopic = useCallback((topic: Topic) => {
    setTopics((prev) => [topic, ...prev.filter((item) => item.id !== topic.id)]);
    setMyPageTopics((prev) => {
      const created = prev
        ? [topic, ...prev.created.filter((item) => item.id !== topic.id)]
        : [topic];
      return {
        created,
        voted: prev?.voted ?? [],
        liked: prev?.liked ?? [],
      };
    });
  }, []);

  return {
    topics,
    hasMore,
    loading,
    loadingMore,
    error,
    myPageTopics,
    refreshTopics,
    loadMoreTopics,
    loadMyPageTopics,
    ensureTopicLoaded,
    patchTopic,
    removeTopic,
    prependTopic,
  };
}
