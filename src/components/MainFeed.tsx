import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MOCK_TOPICS } from '../data/mockTopics';
import type { Topic, VoteSide } from '../types';
import { useAnonymousSession } from '../hooks/useAnonymousSession';
import { useSupabaseSession } from '../hooks/useSupabaseSession';
import { useSupabaseTopics } from '../hooks/useSupabaseTopics';
import { ALL_CATEGORIES_FILTER, buildFeedTopics } from '../lib/feedOrder';
import { createLocalId } from '../lib/id';
import { buildMyPageNotifications } from '../lib/myPageNotifications';
import { createTopic } from '../lib/topicApi';
import { uploadTopicImage } from '../lib/imageStorage';
import { isSupabaseConfigured } from '../lib/supabase';
import { applyTopicAdjustments } from '../lib/topicUtils';
import { updateTopicMeta } from '../lib/topicMeta';
import {
  buildTopicShareUrl,
  clearTopicUrl,
  getTopicIdFromUrl,
  syncTopicUrl,
} from '../lib/topicUrl';
import { AppLoading } from './AppLoading';
import { SwipeCard } from './SwipeCard';
import { ActionBar } from './ActionBar';
import { CommentSheet } from './CommentSheet';
import { CreateTopicModal } from './CreateTopicModal';
import { MyPageDrawer } from './MyPageDrawer';
import { CategoryFilterBar } from './CategoryFilterBar';
import { FeedEmptyState } from './FeedEmptyState';

function findTopicById(topics: Topic[], topicId: string) {
  return topics.find((topic) => topic.id === topicId) ?? null;
}

async function shareTopic(topic: Topic, onCopied?: () => void) {
  const url = buildTopicShareUrl(topic.id);
  const text = `${topic.optionA.text} vs ${topic.optionB.text}`;

  if (navigator.share) {
    try {
      await navigator.share({ title: topic.title, text, url });
      return;
    } catch {
      // ユーザーがキャンセルした場合など
    }
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    onCopied?.();
  }
}

export function MainFeed() {
  const useSupabase = isSupabaseConfigured();

  const localSession = useAnonymousSession();
  const supabaseSession = useSupabaseSession({
    enabled: useSupabase,
  }  );

  const supabaseTopics = useSupabaseTopics(
    useSupabase && supabaseSession.ready ? supabaseSession.userId : null,
    useSupabase,
  );

  const {
    userId,
    votes,
    likes,
    extraComments,
    createdTopics,
    topicVoteAdjustments,
    topicViewAdjustments,
    commentLikes,
    seenTopicIds,
    feedState,
    myPageState,
    recordVote,
    recordView,
    markTopicSeen,
    toggleLike,
    toggleCommentLike,
    deleteComment,
    addCreatedTopic,
    unpublishTopic,
    saveFeedState,
    markMyPageOpened,
  } = useSupabase
    ? {
        userId: supabaseSession.userId,
        votes: supabaseSession.votes,
        likes: supabaseSession.likes,
        extraComments: {} as Record<string, import('../types').Comment[]>,
        createdTopics: [] as Topic[],
        topicVoteAdjustments: {},
        topicViewAdjustments: {},
        commentLikes: supabaseSession.commentLikes,
        seenTopicIds: supabaseSession.seenTopicIds,
        feedState: supabaseSession.feedState,
        myPageState: supabaseSession.myPageState,
        recordVote: supabaseSession.recordVote,
        recordView: supabaseSession.recordView,
        markTopicSeen: supabaseSession.markTopicSeen,
        toggleLike: supabaseSession.toggleLike,
        toggleCommentLike: supabaseSession.toggleCommentLike,
        deleteComment: supabaseSession.deleteComment,
        addCreatedTopic: localSession.addCreatedTopic,
        unpublishTopic: supabaseSession.unpublishTopic,
        saveFeedState: supabaseSession.saveFeedState,
        markMyPageOpened: supabaseSession.markMyPageOpened,
      }
    : localSession;

  const {
    patchTopic,
    removeTopic,
    prependTopic,
    loadMoreTopics,
    loadMyPageTopics,
    ensureTopicLoaded,
    myPageTopics,
  } = supabaseTopics;

  const [categoryFilter, setCategoryFilter] = useState(
    feedState?.categoryFilter ?? ALL_CATEGORIES_FILTER,
  );

  const allTopics = useMemo(() => {
    if (useSupabase) {
      return supabaseTopics.topics;
    }

    const mockIds = new Set(MOCK_TOPICS.map((t) => t.id));
    const uniqueCreated = createdTopics.filter((t) => !mockIds.has(t.id));
    const merged = [...uniqueCreated, ...MOCK_TOPICS];
    return applyTopicAdjustments(merged, topicVoteAdjustments, topicViewAdjustments);
  }, [
    useSupabase,
    supabaseTopics.topics,
    createdTopics,
    topicVoteAdjustments,
    topicViewAdjustments,
  ]);

  const feedSourceTopics = useMemo(() => {
    if (!useSupabase) return allTopics;
    return allTopics.filter((topic) => topic.isPublished !== false);
  }, [useSupabase, allTopics]);

  const votedTopicIds = useMemo(() => Object.keys(votes), [votes]);

  const feedTopics = useMemo(
    () => buildFeedTopics(feedSourceTopics, {
      votedTopicIds,
      seenTopicIds,
      categoryFilter,
      skipVoted: true,
    }),
    [feedSourceTopics, votedTopicIds, seenTopicIds, categoryFilter],
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedReady, setFeedReady] = useState(false);
  const [hasInitializedFeed, setHasInitializedFeed] = useState(false);
  const [pinnedTopicId, setPinnedTopicId] = useState<string | null>(null);
  const [missingTopicId, setMissingTopicId] = useState<string | null>(null);

  const [commentOpen, setCommentOpen] = useState(false);
  const [commentTopicId, setCommentTopicId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [resultTopicId, setResultTopicId] = useState<string | null>(null);
  const [shareToast, setShareToast] = useState(false);

  const viewedTopicIdsRef = useRef<Set<string>>(new Set());
  const [activeTopicId, setActiveTopicId] = useState<string | null>(feedState?.topicId ?? null);
  const hasRestoredFeedPositionRef = useRef(false);

  const pinnedTopic = pinnedTopicId ? findTopicById(allTopics, pinnedTopicId) : null;

  const currentTopic = useMemo(() => {
    if (pinnedTopicId) return pinnedTopic;
    if (feedTopics.length === 0) return null;
    if (activeTopicId) {
      const topic = findTopicById(feedTopics, activeTopicId);
      if (topic) return topic;
    }
    return feedTopics[currentIndex % feedTopics.length] ?? null;
  }, [pinnedTopicId, pinnedTopic, feedTopics, activeTopicId, currentIndex]);

  const currentVote = currentTopic ? votes[currentTopic.id] ?? null : null;
  const showResult = currentTopic ? resultTopicId === currentTopic.id : false;
  const isCurrentTopicLiked = currentTopic ? Boolean(likes[currentTopic.id]) : false;
  const currentLikeCount = currentTopic
    ? (useSupabase
      ? currentTopic.likeCount ?? 0
      : localSession.topicLikeAdjustments[currentTopic.id] ?? 0)
    : 0;
  const isUnread = currentTopic ? !seenTopicIds.includes(currentTopic.id) : false;

  const commentSheetTopic = commentTopicId ? findTopicById(allTopics, commentTopicId) : null;
  const commentSheetVote = commentTopicId ? votes[commentTopicId] ?? null : null;

  const allComments = useMemo(() => {
    if (!currentTopic) return [];
    const extra = extraComments[currentTopic.id] ?? [];
    return [...currentTopic.comments, ...extra];
  }, [currentTopic, extraComments]);

  const commentSheetComments = useMemo(() => {
    if (!commentSheetTopic) return [];
    const extra = extraComments[commentSheetTopic.id] ?? [];
    return [...commentSheetTopic.comments, ...extra];
  }, [commentSheetTopic, extraComments]);

  const myTopics = useMemo(() => {
    if (useSupabase && myPageTopics) {
      return myPageTopics.created;
    }
    return allTopics.filter((t) => t.createdBy === userId);
  }, [useSupabase, myPageTopics, allTopics, userId]);

  const votedTopics = useMemo(() => {
    if (useSupabase && myPageTopics) {
      return myPageTopics.voted;
    }
    return Object.entries(votes)
      .map(([topicId, side]) => {
        const topic = allTopics.find((t) => t.id === topicId);
        return topic ? { topic, side } : null;
      })
      .filter((item): item is { topic: Topic; side: VoteSide } => item !== null);
  }, [useSupabase, myPageTopics, votes, allTopics]);

  const likedTopics = useMemo(() => {
    if (useSupabase && myPageTopics) {
      return myPageTopics.liked;
    }
    return allTopics.filter((topic) => likes[topic.id]);
  }, [useSupabase, myPageTopics, allTopics, likes]);

  const myPageNotifications = useMemo(
    () => buildMyPageNotifications(
      myTopics,
      extraComments,
      myPageState.lastOpenedAt,
      myPageState.voteSnapshots,
    ),
    [myTopics, extraComments, myPageState],
  );

  const feedIsEmpty = !currentTopic && !missingTopicId;
  const showNotFound = Boolean(missingTopicId);
  const hasNoTopicsAtAll = allTopics.length === 0;

  const openTopic = useCallback(async (
    topicId: string,
    options?: { showResultIfVoted?: boolean; ifMissing?: 'not-found' | 'feed' },
  ) => {
    let topic = findTopicById(allTopics, topicId);
    if (!topic && useSupabase) {
      topic = await ensureTopicLoaded(topicId);
    }

    if (!topic) {
      if (options?.ifMissing !== 'feed') {
        setMissingTopicId(topicId);
      } else {
        setMissingTopicId(null);
        setCurrentIndex(0);
      }
      setPinnedTopicId(null);
      setResultTopicId(null);
      setCommentOpen(false);
      clearTopicUrl();
      return false;
    }

    setMissingTopicId(null);
    setPinnedTopicId(topicId);
    setActiveTopicId(topicId);
    setResultTopicId(
      options?.showResultIfVoted && votes[topicId] ? topicId : null,
    );
    setCommentOpen(false);
    syncTopicUrl(topicId);

    const feedIndex = feedTopics.findIndex((item) => item.id === topicId);
    if (feedIndex >= 0) {
      setCurrentIndex(feedIndex);
      setPinnedTopicId(null);
    }

    return true;
  }, [allTopics, feedTopics, votes, useSupabase, ensureTopicLoaded]);

  useEffect(() => {
    if (hasInitializedFeed) return;
    if (useSupabase && supabaseTopics.loading) return;

    void (async () => {
      const topicId = getTopicIdFromUrl();
      if (topicId) {
        hasRestoredFeedPositionRef.current = true;
        await openTopic(topicId, { showResultIfVoted: true, ifMissing: 'feed' });
      } else {
        clearTopicUrl();
        setMissingTopicId(null);
      }

      setFeedReady(true);
      setHasInitializedFeed(true);
    })();
  }, [hasInitializedFeed, openTopic, useSupabase, supabaseTopics.loading]);

  useEffect(() => {
    if (!feedReady || pinnedTopicId || hasRestoredFeedPositionRef.current) return;
    if (!feedState?.topicId) return;

    const nextIndex = feedTopics.findIndex((topic) => topic.id === feedState.topicId);
    if (nextIndex >= 0) {
      setActiveTopicId(feedState.topicId);
      setCurrentIndex(nextIndex);
    }
    hasRestoredFeedPositionRef.current = true;
  }, [feedReady, feedState?.topicId, feedTopics, pinnedTopicId]);

  useEffect(() => {
    if (!feedReady || pinnedTopicId) return;
    if (feedTopics.length === 0) return;

    if (!activeTopicId) {
      setActiveTopicId(feedTopics[0].id);
      return;
    }

    const nextIndex = feedTopics.findIndex((topic) => topic.id === activeTopicId);
    if (nextIndex >= 0) {
      setCurrentIndex(nextIndex);
      return;
    }

    const fallbackIndex = Math.min(currentIndex, feedTopics.length - 1);
    const fallbackTopic = feedTopics[fallbackIndex];
    if (fallbackTopic) {
      setActiveTopicId(fallbackTopic.id);
    }
  }, [feedTopics, feedReady, pinnedTopicId, activeTopicId, currentIndex]);

  useEffect(() => {
    if (!feedReady || !activeTopicId) return;
    if (viewedTopicIdsRef.current.has(activeTopicId)) return;

    const topic = findTopicById(allTopics, activeTopicId);
    if (!topic) return;

    const baseViewCount = topic.viewCount;
    viewedTopicIdsRef.current.add(activeTopicId);

    void (async () => {
      await recordView(activeTopicId);
      if (useSupabase) {
        patchTopic(activeTopicId, { viewCount: baseViewCount + 1 });
      }
      markTopicSeen(activeTopicId);
    })();
  }, [activeTopicId, feedReady, recordView, markTopicSeen, useSupabase, patchTopic, allTopics]);

  useEffect(() => {
    if (!feedReady || !activeTopicId) return;

    saveFeedState({
      topicId: activeTopicId,
      categoryFilter,
    });
  }, [activeTopicId, categoryFilter, feedReady, saveFeedState]);

  useEffect(() => {
    if (!feedReady || !activeTopicId) return;
    syncTopicUrl(activeTopicId);
    const topic = findTopicById(allTopics, activeTopicId);
    if (topic) {
      updateTopicMeta(topic);
    }
  }, [activeTopicId, feedReady, allTopics]);

  useEffect(() => {
    const onPopState = () => {
      const topicId = getTopicIdFromUrl();
      if (!topicId) {
        setMissingTopicId(null);
        setPinnedTopicId(null);
        setResultTopicId(null);
        setActiveTopicId(null);
        setCurrentIndex(0);
        return;
      }

      openTopic(topicId, { showResultIfVoted: true, ifMissing: 'feed' });
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [openTopic]);

  useEffect(() => {
    if (!shareToast) return;
    const timer = window.setTimeout(() => setShareToast(false), 2000);
    return () => window.clearTimeout(timer);
  }, [shareToast]);

  const handleVote = useCallback((topicId: string, side: VoteSide) => {
    void (async () => {
      const recorded = await recordVote(topicId, side);
      if (!recorded) return;

      if (useSupabase) {
        patchTopic(topicId, (topic) => ({
          ...topic,
          votesA: topic.votesA + (side === 'A' ? 1 : 0),
          votesB: topic.votesB + (side === 'B' ? 1 : 0),
        }));
      }

      setPinnedTopicId(topicId);
      setActiveTopicId(topicId);
      setResultTopicId(topicId);
    })();
  }, [recordVote, useSupabase, patchTopic]);

  const handleCloseResult = useCallback(() => {
    setResultTopicId(null);
  }, []);

  const handleReopenResult = useCallback(() => {
    if (!currentTopic) return;
    if (!votes[currentTopic.id]) return;
    setResultTopicId(currentTopic.id);
  }, [currentTopic, votes]);

  const handleNext = useCallback(() => {
    setCommentOpen(false);
    setResultTopicId(null);

    if (pinnedTopicId) {
      setPinnedTopicId(null);
      return;
    }

    if (feedTopics.length > 0) {
      setCurrentIndex((index) => {
        const nextIndex = index + 1;
        const nextTopic = feedTopics[nextIndex % feedTopics.length];
        if (nextTopic) {
          setActiveTopicId(nextTopic.id);
        }
        if (useSupabase && nextIndex >= feedTopics.length - 2) {
          void loadMoreTopics();
        }
        return nextIndex;
      });
    }
  }, [pinnedTopicId, feedTopics, useSupabase, loadMoreTopics]);

  useEffect(() => {
    if (!pinnedTopicId) return;
    if (!findTopicById(allTopics, pinnedTopicId)) {
      setMissingTopicId(pinnedTopicId);
      setPinnedTopicId(null);
    }
  }, [pinnedTopicId, allTopics]);

  const handleCategoryChange = useCallback((category: string) => {
    setCategoryFilter(category);
    setPinnedTopicId(null);
    setMissingTopicId(null);
    setActiveTopicId(null);
    setCurrentIndex(0);
    setResultTopicId(null);
    setCommentOpen(false);
    clearTopicUrl();
  }, []);

  const handleCommentOpen = useCallback(() => {
    if (!currentTopic || !currentVote) return;
    setCommentTopicId(currentTopic.id);
    setCommentOpen(true);
  }, [currentTopic, currentVote]);

  const handleCommentClose = useCallback(() => {
    setCommentOpen(false);
    setCommentTopicId(null);
  }, []);

  const handleCommentSubmit = useCallback((text: string) => {
    if (!commentTopicId || !commentSheetVote) return;

    void (async () => {
      if (useSupabase) {
        const comment = await supabaseSession.addComment(commentTopicId, text, commentSheetVote);
        if (comment) {
          patchTopic(commentTopicId, (topic) => ({
            ...topic,
            comments: [...topic.comments, comment],
          }));
        }
        return;
      }

      localSession.addComment(commentTopicId, {
        id: createLocalId('new'),
        side: commentSheetVote,
        text,
        author: 'あなた',
        createdAt: new Date().toISOString(),
        likes: 0,
      });
    })();
  }, [commentTopicId, commentSheetVote, useSupabase, supabaseSession, localSession, patchTopic]);

  const handleCommentDelete = useCallback((commentId: string) => {
    if (!commentTopicId) return;

    void (async () => {
      await deleteComment(commentTopicId, commentId);
      if (useSupabase) {
        patchTopic(commentTopicId, (topic) => ({
          ...topic,
          comments: topic.comments.filter((comment) => comment.id !== commentId),
        }));
        return;
      }
    })();
  }, [deleteComment, commentTopicId, useSupabase, patchTopic]);

  const handleCreateTopic = useCallback(async (
    data: Omit<Topic, 'id' | 'votesA' | 'votesB' | 'viewCount' | 'comments'>,
  ) => {
    let newTopic: Topic;

    if (useSupabase) {
      newTopic = await createTopic(data, userId);
      prependTopic(newTopic);
    } else {
      newTopic = {
        ...data,
        id: createLocalId('user'),
        votesA: 0,
        votesB: 0,
        viewCount: 0,
        comments: [],
      };
      addCreatedTopic(newTopic);
    }

    setMissingTopicId(null);
    setPinnedTopicId(newTopic.id);
    setActiveTopicId(newTopic.id);
    setCurrentIndex(0);
    setResultTopicId(null);
    viewedTopicIdsRef.current.delete(newTopic.id);
    syncTopicUrl(newTopic.id);
  }, [addCreatedTopic, prependTopic, useSupabase, userId]);

  const handleTopicSelect = useCallback((topicId: string) => {
    setDrawerOpen(false);
    markMyPageOpened(myTopics);
    void openTopic(topicId, { showResultIfVoted: true });
  }, [markMyPageOpened, myTopics, openTopic]);

  const handleUnpublishTopic = useCallback((topicId: string) => {
    const confirmed = window.confirm('このお題を非公開にしますか？フィードとマイページから非表示になります。');
    if (!confirmed) return;

    void (async () => {
      try {
        await unpublishTopic(topicId, userId);
        if (useSupabase) {
          removeTopic(topicId);
        }
      } catch (err) {
        window.alert(err instanceof Error ? err.message : 'お題の非公開に失敗しました');
        return;
      }

      viewedTopicIdsRef.current.delete(topicId);

      if (activeTopicId === topicId) {
        const remaining = feedTopics.filter((topic) => topic.id !== topicId);
        if (remaining.length > 0) {
          setActiveTopicId(remaining[0].id);
        } else {
          setActiveTopicId(null);
        }
      }

      if (pinnedTopicId === topicId) {
        setPinnedTopicId(null);
      }
      if (commentTopicId === topicId) {
        setCommentOpen(false);
        setCommentTopicId(null);
      }
      if (currentTopic?.id === topicId) {
        setResultTopicId(null);
      }
      if (missingTopicId === topicId) {
        setMissingTopicId(null);
      }
    })();
  }, [
    unpublishTopic,
    userId,
    useSupabase,
    removeTopic,
    pinnedTopicId,
    commentTopicId,
    currentTopic?.id,
    missingTopicId,
    activeTopicId,
    feedTopics,
  ]);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    markMyPageOpened(myTopics);
  }, [markMyPageOpened, myTopics]);

  const handleDrawerOpen = useCallback(() => {
    if (useSupabase) {
      void loadMyPageTopics();
    }
    setDrawerOpen(true);
  }, [useSupabase, loadMyPageTopics]);

  const handleCreateFromDrawer = useCallback(() => {
    setDrawerOpen(false);
    setCreateOpen(true);
  }, []);

  const handleNotificationSelect = useCallback((topicId: string) => {
    handleTopicSelect(topicId);
  }, [handleTopicSelect]);

  const handleShare = useCallback(() => {
    if (!currentTopic) return;
    void shareTopic(currentTopic, () => setShareToast(true));
  }, [currentTopic]);

  const handleUploadImage = useCallback((file: File, side: 'a' | 'b') => {
    return uploadTopicImage(userId, file, side);
  }, [userId]);

  const handleBackToFeed = useCallback(() => {
    setMissingTopicId(null);
    setPinnedTopicId(null);
    setResultTopicId(null);
    setActiveTopicId(null);
    setCurrentIndex(0);
    clearTopicUrl();
  }, []);

  const handleLikeToggle = useCallback(() => {
    if (!currentTopic) return;

    const topicId = currentTopic.id;
    const wasLiked = Boolean(likes[topicId]);

    void (async () => {
      try {
        await toggleLike(topicId);
        if (useSupabase) {
          patchTopic(topicId, (topic) => ({
            ...topic,
            likeCount: Math.max(0, (topic.likeCount ?? 0) + (wasLiked ? -1 : 1)),
          }));
        }
      } catch {
        // toggleLike rolls back likes state on failure
      }
    })();
  }, [currentTopic, likes, toggleLike, useSupabase, patchTopic]);

  if (useSupabase && !supabaseSession.ready) {
    return <AppLoading message="Supabase に接続中..." />;
  }

  if (useSupabase && supabaseTopics.loading && supabaseTopics.topics.length === 0) {
    return <AppLoading message="お題を読み込み中..." />;
  }

  if (useSupabase && (supabaseSession.initError || supabaseTopics.error)) {
    const errorMessage = supabaseSession.initError ?? supabaseTopics.error ?? '接続に失敗しました';
    return (
      <AppLoading
        message={errorMessage}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <button className="app-header__menu" onClick={handleDrawerOpen} aria-label="メニュー">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h1 className="app-header__logo">Swipe <span>VS</span></h1>
        <div className="app-header__spacer" />
      </header>

      <CategoryFilterBar value={categoryFilter} onChange={handleCategoryChange} />

      <main className="feed">
        {showNotFound ? (
          <FeedEmptyState
            categoryFilter={categoryFilter}
            variant="not-found"
            onResetCategory={() => handleCategoryChange(ALL_CATEGORIES_FILTER)}
            onBackToFeed={handleBackToFeed}
          />
        ) : feedIsEmpty ? (
          <FeedEmptyState
            categoryFilter={categoryFilter}
            variant={hasNoTopicsAtAll ? 'empty-site' : 'no-topics'}
            onResetCategory={() => handleCategoryChange(ALL_CATEGORIES_FILTER)}
            onCreateTopic={() => setCreateOpen(true)}
          />
        ) : currentTopic && (
          <SwipeCard
            key={currentTopic.id}
            topic={currentTopic}
            voted={currentVote}
            showResult={showResult}
            isUnread={isUnread}
            onVote={(side) => handleVote(currentTopic.id, side)}
            onNext={handleNext}
            onCloseResult={handleCloseResult}
            onReopenResult={handleReopenResult}
            isActive
          />
        )}
      </main>

      {currentTopic && (
        <ActionBar
          key={currentTopic.id}
          liked={isCurrentTopicLiked}
          likeCount={currentLikeCount}
          voted={!!currentVote}
          commentCount={allComments.length}
          onLike={handleLikeToggle}
          onComment={handleCommentOpen}
          onShare={handleShare}
          onCreate={() => setCreateOpen(true)}
        />
      )}

      {commentSheetTopic && commentSheetVote && (
        <CommentSheet
          open={commentOpen}
          comments={commentSheetComments}
          userVote={commentSheetVote}
          commentLikes={commentLikes}
          adjustLikeCount={!useSupabase}
          onClose={handleCommentClose}
          onSubmit={handleCommentSubmit}
          onToggleCommentLike={(commentId) => {
            void (async () => {
              if (!commentTopicId) return;
              try {
                const wasLiked = await toggleCommentLike(commentId);
                if (wasLiked === null) return;
                if (useSupabase) {
                  patchTopic(commentTopicId, (topic) => ({
                    ...topic,
                    comments: topic.comments.map((comment) =>
                      comment.id === commentId
                        ? { ...comment, likes: Math.max(0, comment.likes + (wasLiked ? -1 : 1)) }
                        : comment,
                    ),
                  }));
                }
              } catch {
                // toggleCommentLike rolls back on failure
              }
            })();
          }}
          onDeleteComment={handleCommentDelete}
        />
      )}

      <CreateTopicModal
        open={createOpen}
        userId={userId}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateTopic}
        uploadImage={useSupabase ? handleUploadImage : undefined}
      />

      <MyPageDrawer
        open={drawerOpen}
        userId={userId}
        createdTopics={myTopics}
        votedTopics={votedTopics}
        likedTopics={likedTopics}
        votedCount={votedTopics.length}
        notifications={myPageNotifications}
        onClose={closeDrawer}
        onTopicSelect={handleTopicSelect}
        onNotificationSelect={handleNotificationSelect}
        onCreateTopic={handleCreateFromDrawer}
        onUnpublishTopic={handleUnpublishTopic}
      />


      {shareToast && (
        <div className="share-toast" role="status">
          リンクをコピーしました
        </div>
      )}
    </div>
  );
}
