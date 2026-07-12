import { useCallback, useEffect, useState } from 'react';
import { fetchTopics } from '../lib/topicApi';
import { withTimeout } from '../lib/withTimeout';
import type { Topic } from '../types';

const FETCH_TIMEOUT_MS = 15_000;

export function useSupabaseTopics(userId: string | null, enabled: boolean) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTopics = useCallback(async () => {
    if (!enabled || !userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const nextTopics = await withTimeout(
        fetchTopics(userId),
        FETCH_TIMEOUT_MS,
        'お題の取得がタイムアウトしました。Supabase の接続状態を確認してください。',
      );
      setTopics(nextTopics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'お題の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [enabled, userId]);

  useEffect(() => {
    void refreshTopics();
  }, [refreshTopics]);

  const patchTopic = useCallback((topicId: string, patch: Partial<Topic>) => {
    setTopics((prev) =>
      prev.map((topic) => (topic.id === topicId ? { ...topic, ...patch } : topic)),
    );
  }, []);

  const removeTopic = useCallback((topicId: string) => {
    setTopics((prev) => prev.filter((topic) => topic.id !== topicId));
  }, []);

  const prependTopic = useCallback((topic: Topic) => {
    setTopics((prev) => [topic, ...prev.filter((item) => item.id !== topic.id)]);
  }, []);

  return {
    topics,
    loading,
    error,
    refreshTopics,
    patchTopic,
    removeTopic,
    prependTopic,
  };
}
