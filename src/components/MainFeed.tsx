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
import { AdBanner } from './AdBanner';
import { CategoryFilterBar } from './CategoryFilterBar';
import { FeedEmptyState } from './FeedEmptyState';

const AD_INTERVAL_MIN = 3;
const AD_INTERVAL_MAX = 4;

function randomAdInterval() {
  return AD_INTERVAL_MIN + Math.floor(Math.random() * (AD_INTERVAL_MAX - AD_INTERVAL_MIN + 1));
}

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
  const refreshTopicsRef = useRef<() => Promise<void>>(async () => {});

  const localSession = useAnonymousSession();
  const supabaseSession = useSupabaseSession({
    enabled: useSupabase,
    onTopicsChanged: () => refreshTopicsRef.current(),
  });
  const supabaseTopics = useSupabaseTopics(
    useSupabase && supabaseSession.ready ? supabaseSession.userId : null,
    useSupabase,
  );

  refreshTopicsRef.current = supabaseTopics.refreshTopics;

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

  const { patchTopic, removeTopic, prependTopic } = supabaseTopics;

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
  const [scrollCount, setScrollCount] = useState(feedState?.scrollCount ?? 0);
  const [nextAdAt, setNextAdAt] = useState(feedState?.nextAdAt ?? randomAdInterval);
  const [showAd, setShowAd] = useState(false);
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

  const nextAdAtRef = useRef(nextAdAt);
  const viewedTopicIdsRef = useRef<Set<string>>(new Set());

  nextAdAtRef.current = nextAdAt;

  const pinnedTopic = pinnedTopicId ? findTopicById(allTopics, pinnedTopicId) : null;

  const currentTopic = useMemo(() => {
    if (pinnedTopicId) return pinnedTopic;
    if (feedTopics.length === 0) return null;
    return feedTopics[currentIndex % feedTopics.length];
  }, [pinnedTopicId, pinnedTopic, feedTopics, currentIndex]);

  const currentVote = currentTopic ? votes[currentTopic.id] ?? null : null;
  const showResult = currentTopic ? resultTopicId === currentTopic.id : false;
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

  const myTopics = useMemo(
    () => allTopics.filter((t) => t.createdBy === userId),
    [allTopics, userId],
  );

  const votedTopics = useMemo(
    () =>
      Object.entries(votes)
        .map(([topicId, side]) => {
          const topic = allTopics.find((t) => t.id === topicId);
          return topic ? { topic, side } : null;
        })
        .filter((item): item is { topic: Topic; side: VoteSide } => item !== null),
    [votes, allTopics],
  );

  const likedTopics = useMemo(
    () => allTopics.filter((topic) => likes[topic.id]),
    [allTopics, likes],
  );

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

  const openTopic = useCallback((
    topicId: string,
    options?: { showResultIfVoted?: boolean; ifMissing?: 'not-found' | 'feed' },
  ) => {
    const topic = findTopicById(allTopics, topicId);
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
  }, [allTopics, feedTopics, votes]);

  useEffect(() => {
    if (hasInitializedFeed) return;
    if (useSupabase && supabaseTopics.loading) return;

    const topicId = getTopicIdFromUrl();
    if (topicId) {
      openTopic(topicId, { showResultIfVoted: true, ifMissing: 'feed' });
    } else {
      clearTopicUrl();
      setMissingTopicId(null);
    }

    setFeedReady(true);
    setHasInitializedFeed(true);
  }, [hasInitializedFeed, openTopic, useSupabase, supabaseTopics.loading]);

  useEffect(() => {
    if (!feedReady) return;
    if (pinnedTopicId) return;

    setCurrentIndex((prev) => {
      if (feedTopics.length === 0) return 0;
      const topicId = feedTopics[prev % feedTopics.length]?.id;
      if (!topicId) return 0;
      const nextIndex = feedTopics.findIndex((topic) => topic.id === topicId);
      return nextIndex >= 0 ? nextIndex : 0;
    });
  }, [feedTopics, feedReady, pinnedTopicId]);

  useEffect(() => {
    if (!feedReady || !currentTopic) return;
    if (viewedTopicIdsRef.current.has(currentTopic.id)) return;

    viewedTopicIdsRef.current.add(currentTopic.id);

    void (async () => {
      await recordView(currentTopic.id);
      if (useSupabase) {
        patchTopic(currentTopic.id, { viewCount: currentTopic.viewCount + 1 });
      }
      markTopicSeen(currentTopic.id);
    })();
  }, [currentTopic?.id, feedReady, recordView, markTopicSeen, useSupabase, patchTopic, currentTopic?.viewCount]);

  useEffect(() => {
    if (!feedReady || !currentTopic) return;

    saveFeedState({
      topicId: currentTopic.id,
      scrollCount,
      nextAdAt,
      categoryFilter,
    });
  }, [currentTopic?.id, scrollCount, nextAdAt, categoryFilter, feedReady, saveFeedState]);

  useEffect(() => {
    if (!feedReady || !currentTopic) return;
    syncTopicUrl(currentTopic.id);
    updateTopicMeta(currentTopic);
  }, [currentTopic?.id, feedReady]);

  useEffect(() => {
    const onPopState = () => {
      const topicId = getTopicIdFromUrl();
      if (!topicId) {
        setMissingTopicId(null);
        setPinnedTopicId(null);
        setResultTopicId(null);
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
      const topic = findTopicById(allTopics, topicId);
      const recorded = await recordVote(topicId, side);
      if (!recorded && !votes[topicId]) return;

      if (useSupabase && topic) {
        patchTopic(topicId, {
          votesA: topic.votesA + (side === 'A' ? 1 : 0),
          votesB: topic.votesB + (side === 'B' ? 1 : 0),
        });
      }

      setPinnedTopicId(topicId);
      setResultTopicId(topicId);
    })();
  }, [recordVote, votes, useSupabase, patchTopic, allTopics]);

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

    let shouldShowAd = false;
    setScrollCount((prev) => {
      const next = prev + 1;
      if (next >= nextAdAtRef.current) {
        shouldShowAd = true;
        return 0;
      }
      return next;
    });

    if (shouldShowAd) {
      setShowAd(true);
      setNextAdAt(randomAdInterval());
      return;
    }

    if (feedTopics.length > 0) {
      setCurrentIndex((i) => i + 1);
    }
  }, [pinnedTopicId, feedTopics.length]);

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
    setCurrentIndex(0);
    setResultTopicId(null);
    setCommentOpen(false);
    clearTopicUrl();
  }, []);

  const handleAdClose = useCallback(() => {
    setShowAd(false);
    setResultTopicId(null);
    if (feedTopics.length > 0) {
      setCurrentIndex((i) => i + 1);
    }
  }, [feedTopics.length]);

  const handleCommentOpen = useCallback(() => {
    if (!currentTopic || !currentVote) return;
    setCommentTopicId(currentTopic.id);
    setCommentOpen(true);
  }, [currentTopic, currentVote]);

  const handleCommentClose = useCallback(() => {
    setCommentOpen(false);
  }, []);

  const handleCommentSubmit = useCallback((text: string) => {
    if (!commentTopicId || !commentSheetVote) return;

    void (async () => {
      if (useSupabase) {
        await supabaseSession.addComment(commentTopicId, text, commentSheetVote);
        await supabaseTopics.refreshTopics();
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
  }, [commentTopicId, commentSheetVote, useSupabase, supabaseSession, supabaseTopics, localSession]);

  const handleCommentDelete = useCallback((commentId: string) => {
    if (!commentTopicId) return;

    void (async () => {
      await deleteComment(commentTopicId, commentId);
      if (useSupabase) {
        await supabaseTopics.refreshTopics();
      }
    })();
  }, [deleteComment, commentTopicId, useSupabase, supabaseTopics]);

  const handleCreateTopic = useCallback((
    data: Omit<Topic, 'id' | 'votesA' | 'votesB' | 'viewCount' | 'comments'>,
  ) => {
    void (async () => {
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
      setCurrentIndex(0);
      setScrollCount(0);
      setNextAdAt(randomAdInterval());
      setResultTopicId(null);
      viewedTopicIdsRef.current.delete(newTopic.id);
      syncTopicUrl(newTopic.id);
    })();
  }, [addCreatedTopic, prependTopic, useSupabase, userId]);

  const handleTopicSelect = useCallback((topicId: string) => {
    setDrawerOpen(false);
    markMyPageOpened(myTopics);
    openTopic(topicId, { showResultIfVoted: true });
  }, [markMyPageOpened, myTopics, openTopic]);

  const handleUnpublishTopic = useCallback((topicId: string) => {
    const confirmed = window.confirm('このお題を非公開にしますか？フィードとマイページから非表示になります。');
    if (!confirmed) return;

    void (async () => {
      await unpublishTopic(topicId, userId);
      if (useSupabase) {
        removeTopic(topicId);
      }

      viewedTopicIdsRef.current.delete(topicId);

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
  ]);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    markMyPageOpened(myTopics);
  }, [markMyPageOpened, myTopics]);

  const handleDrawerOpen = useCallback(() => {
    setDrawerOpen(true);
  }, []);

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
    setCurrentIndex(0);
    clearTopicUrl();
  }, []);

  const handleLikeToggle = useCallback(() => {
    if (!currentTopic) return;

    void (async () => {
      const wasLiked = Boolean(likes[currentTopic.id]);
      const baseCount = useSupabase
        ? currentTopic.likeCount ?? 0
        : localSession.topicLikeAdjustments[currentTopic.id] ?? 0;
      await toggleLike(currentTopic.id);
      patchTopic(currentTopic.id, {
        likeCount: Math.max(0, baseCount + (wasLiked ? -1 : 1)),
      });
    })();
  }, [currentTopic, likes, toggleLike, useSupabase, patchTopic, localSession]);

  if (useSupabase && !supabaseSession.ready) {
    return <AppLoading message="Supabase に接続中..." />;
  }

  if (useSupabase && supabaseTopics.loading) {
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

      <main className={`feed ${showAd ? 'feed--with-ad' : ''}`}>
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
          <>
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
              isActive={!showAd}
            />
            {showAd && <AdBanner onDismiss={handleAdClose} />}
          </>
        )}
      </main>

      {currentTopic && (
        <ActionBar
          liked={!!likes[currentTopic.id]}
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
            void toggleCommentLike(commentId);
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
