import { useCallback, useMemo, useRef, useState } from 'react';
import { getOrCreateAnonymousUserId } from '../lib/anonymousUser';
import {
  loadUserData,
  saveUserData,
  type FeedState,
  type MyPageState,
  type UserLocalData,
} from '../lib/userStorage';
import type { Comment, Topic, VoteSide } from '../types';

function normalizeTopic(topic: Topic): Topic {
  return {
    ...topic,
    category: topic.category ?? 'その他',
  };
}

export function useAnonymousSession() {
  const userId = useMemo(() => getOrCreateAnonymousUserId(), []);
  const [initialData] = useState(() => loadUserData());
  const [votes, setVotes] = useState<Record<string, VoteSide>>(initialData.votes);
  const [likes, setLikes] = useState<Record<string, boolean>>(initialData.likes);
  const [extraComments, setExtraComments] = useState<Record<string, Comment[]>>(
    initialData.extraComments,
  );
  const [createdTopics, setCreatedTopics] = useState<Topic[]>(
    initialData.createdTopics.map(normalizeTopic),
  );
  const [topicVoteAdjustments, setTopicVoteAdjustments] = useState(
    initialData.topicVoteAdjustments,
  );
  const [topicViewAdjustments, setTopicViewAdjustments] = useState(
    initialData.topicViewAdjustments,
  );
  const [topicLikeAdjustments, setTopicLikeAdjustments] = useState(
    initialData.topicLikeAdjustments,
  );
  const [commentLikes, setCommentLikes] = useState<Record<string, boolean>>(
    initialData.commentLikes,
  );
  const [feedState, setFeedState] = useState<FeedState | null>(initialData.feedState);
  const [myPageState, setMyPageState] = useState<MyPageState>(initialData.myPageState);
  const [seenTopicIds, setSeenTopicIds] = useState<string[]>(initialData.seenTopicIds);

  const snapshotRef = useRef<UserLocalData>(initialData);

  snapshotRef.current = {
    votes,
    likes,
    extraComments,
    createdTopics,
    topicVoteAdjustments,
    topicViewAdjustments,
    topicLikeAdjustments,
    commentLikes,
    seenTopicIds,
    feedState,
    myPageState,
  };

  const persist = useCallback((patch: Partial<UserLocalData>) => {
    const next = { ...snapshotRef.current, ...patch };
    saveUserData(next);
    snapshotRef.current = next;
  }, []);

  const recordVote = useCallback((topicId: string, side: VoteSide): boolean => {
    const current = snapshotRef.current;
    if (current.votes[topicId]) return false;

    const nextVotes = { ...current.votes, [topicId]: side };
    const adjustment = current.topicVoteAdjustments[topicId] ?? { votesA: 0, votesB: 0 };
    const nextAdjustments = {
      ...current.topicVoteAdjustments,
      [topicId]: {
        votesA: adjustment.votesA + (side === 'A' ? 1 : 0),
        votesB: adjustment.votesB + (side === 'B' ? 1 : 0),
      },
    };

    persist({
      votes: nextVotes,
      topicVoteAdjustments: nextAdjustments,
    });
    setVotes(nextVotes);
    setTopicVoteAdjustments(nextAdjustments);
    return true;
  }, [persist]);

  const recordView = useCallback((topicId: string) => {
    const current = snapshotRef.current;
    const nextViewAdjustments = {
      ...current.topicViewAdjustments,
      [topicId]: (current.topicViewAdjustments[topicId] ?? 0) + 1,
    };

    persist({ topicViewAdjustments: nextViewAdjustments });
    setTopicViewAdjustments(nextViewAdjustments);
  }, [persist]);

  const toggleLike = useCallback((topicId: string) => {
    const current = snapshotRef.current;
    const wasLiked = Boolean(current.likes[topicId]);
    const nextLiked = !wasLiked;
    const nextLikes = { ...current.likes };
    if (nextLiked) {
      nextLikes[topicId] = true;
    } else {
      delete nextLikes[topicId];
    }
    const currentLikeCount = current.topicLikeAdjustments[topicId] ?? 0;
    const nextLikeAdjustments = {
      ...current.topicLikeAdjustments,
      [topicId]: Math.max(0, currentLikeCount + (nextLiked ? 1 : -1)),
    };

    persist({
      likes: nextLikes,
      topicLikeAdjustments: nextLikeAdjustments,
    });
    setLikes(nextLikes);
    setTopicLikeAdjustments(nextLikeAdjustments);
  }, [persist]);

  const toggleCommentLike = useCallback((commentId: string) => {
    setCommentLikes((prev) => {
      const next = { ...prev, [commentId]: !prev[commentId] };
      persist({ commentLikes: next });
      return next;
    });
  }, [persist]);

  const addComment = useCallback((topicId: string, comment: Comment) => {
    setExtraComments((prev) => {
      const next = {
        ...prev,
        [topicId]: [...(prev[topicId] ?? []), comment],
      };
      persist({ extraComments: next });
      return next;
    });
  }, [persist]);

  const deleteComment = useCallback((topicId: string, commentId: string) => {
    const current = snapshotRef.current;
    const topicComments = current.extraComments[topicId] ?? [];
    const target = topicComments.find((comment) => comment.id === commentId);
    if (!target || target.author !== 'あなた') return;

    const nextExtraComments = {
      ...current.extraComments,
      [topicId]: topicComments.filter((comment) => comment.id !== commentId),
    };
    const nextCommentLikes = { ...current.commentLikes };
    delete nextCommentLikes[commentId];

    persist({
      extraComments: nextExtraComments,
      commentLikes: nextCommentLikes,
    });
    setExtraComments(nextExtraComments);
    setCommentLikes(nextCommentLikes);
  }, [persist]);

  const unpublishTopic = useCallback((topicId: string, ownerId: string) => {
    const current = snapshotRef.current;
    const target = current.createdTopics.find((topic) => topic.id === topicId);
    if (!target || target.createdBy !== ownerId) return;

    const nextCreatedTopics = current.createdTopics.filter((topic) => topic.id !== topicId);
    const nextVotes = { ...current.votes };
    delete nextVotes[topicId];

    const nextLikes = { ...current.likes };
    delete nextLikes[topicId];

    const nextExtraComments = { ...current.extraComments };
    delete nextExtraComments[topicId];

    const nextVoteAdjustments = { ...current.topicVoteAdjustments };
    delete nextVoteAdjustments[topicId];

    const nextViewAdjustments = { ...current.topicViewAdjustments };
    delete nextViewAdjustments[topicId];

    const nextLikeAdjustments = { ...current.topicLikeAdjustments };
    delete nextLikeAdjustments[topicId];

    const nextSeenTopicIds = current.seenTopicIds.filter((id) => id !== topicId);

    const commentIds = new Set([
      ...target.comments.map((comment) => comment.id),
      ...(current.extraComments[topicId] ?? []).map((comment) => comment.id),
    ]);
    const nextCommentLikes = { ...current.commentLikes };
    for (const commentId of commentIds) {
      delete nextCommentLikes[commentId];
    }

    const patch = {
      createdTopics: nextCreatedTopics,
      votes: nextVotes,
      likes: nextLikes,
      extraComments: nextExtraComments,
      topicVoteAdjustments: nextVoteAdjustments,
      topicViewAdjustments: nextViewAdjustments,
      topicLikeAdjustments: nextLikeAdjustments,
      seenTopicIds: nextSeenTopicIds,
      commentLikes: nextCommentLikes,
    };

    persist(patch);
    setCreatedTopics(nextCreatedTopics.map(normalizeTopic));
    setVotes(nextVotes);
    setLikes(nextLikes);
    setExtraComments(nextExtraComments);
    setTopicVoteAdjustments(nextVoteAdjustments);
    setTopicViewAdjustments(nextViewAdjustments);
    setTopicLikeAdjustments(nextLikeAdjustments);
    setSeenTopicIds(nextSeenTopicIds);
    setCommentLikes(nextCommentLikes);
  }, [persist]);

  const addCreatedTopic = useCallback((topic: Topic) => {
    setCreatedTopics((prev) => {
      const next = [topic, ...prev];
      persist({ createdTopics: next });
      return next;
    });
  }, [persist]);

  const markTopicSeen = useCallback((topicId: string) => {
    const current = snapshotRef.current;
    if (current.seenTopicIds.includes(topicId)) return;

    const nextSeenTopicIds = [...current.seenTopicIds, topicId];
    persist({ seenTopicIds: nextSeenTopicIds });
    setSeenTopicIds(nextSeenTopicIds);
  }, [persist]);

  const saveFeedState = useCallback((state: FeedState) => {
    setFeedState(state);
    persist({ feedState: state });
  }, [persist]);

  const markMyPageOpened = useCallback((myTopics: Topic[]) => {
    const voteSnapshots = Object.fromEntries(
      myTopics.map((topic) => [topic.id, topic.votesA + topic.votesB]),
    );
    const nextMyPageState: MyPageState = {
      lastOpenedAt: Date.now(),
      voteSnapshots,
    };

    setMyPageState(nextMyPageState);
    persist({ myPageState: nextMyPageState });
  }, [persist]);

  return {
    userId,
    votes,
    likes,
    extraComments,
    createdTopics,
    topicVoteAdjustments,
    topicViewAdjustments,
    topicLikeAdjustments,
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
    addCreatedTopic,
    unpublishTopic,
    saveFeedState,
    markMyPageOpened,
  };
}
