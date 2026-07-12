import { useEffect, useRef, useState } from 'react';
import {
  animate,
  motion,
  useMotionValue,
  type PanInfo,
} from 'framer-motion';
import type { Topic, VoteSide } from '../types';
import {
  checkVerticalSkip,
  getStampThresholdPx,
  isHorizontalDominant,
  resolveHorizontalVote,
} from '../utils/swipeGesture';
import { VoteResult } from './VoteResult';
import { TopicChoiceImage } from './TopicChoiceImage';

interface SwipeCardProps {
  topic: Topic;
  voted: VoteSide | null;
  showResult: boolean;
  isUnread?: boolean;
  onVote: (side: VoteSide) => void;
  onNext: () => void;
  onCloseResult: () => void;
  onReopenResult: () => void;
  isActive: boolean;
}

export function SwipeCard({
  topic,
  voted,
  showResult,
  isUnread = false,
  onVote,
  onNext,
  onCloseResult,
  onReopenResult,
  isActive,
}: SwipeCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragX, setDragX] = useState(0);
  const isCommittingRef = useRef(false);

  const exitX = useMotionValue(0);
  const exitY = useMotionValue(0);

  const resultVisible = showResult && Boolean(voted) && !isAnimating;
  const stampThreshold = getStampThresholdPx();

  useEffect(() => {
    exitX.set(0);
    exitY.set(0);
    setDragX(0);
    setIsAnimating(false);
    isCommittingRef.current = false;
  }, [topic.id, exitX, exitY]);

  useEffect(() => {
    if (showResult || voted) {
      exitX.set(0);
      exitY.set(0);
      setDragX(0);
      setIsAnimating(false);
      isCommittingRef.current = false;
    }
  }, [showResult, voted, exitX, exitY]);

  async function exitUp() {
    if (isCommittingRef.current) return;
    isCommittingRef.current = true;
    setIsAnimating(true);

    await animate(exitY, -window.innerHeight * 0.9, {
      duration: 0.35,
      ease: [0.32, 0.72, 0, 1],
    });

    exitY.set(0);
    exitX.set(0);
    setDragX(0);
    setIsAnimating(false);
    isCommittingRef.current = false;
    onNext();
  }

  async function voteAndFlyOut(side: VoteSide) {
    if (voted || isCommittingRef.current) return;

    isCommittingRef.current = true;
    setIsAnimating(true);

    const targetX = side === 'A' ? -window.innerWidth * 1.1 : window.innerWidth * 1.1;

    await animate(exitX, targetX, {
      duration: 0.28,
      ease: [0.4, 0, 0.2, 1],
    });

    onVote(side);
  }

  async function snapBack() {
    setDragX(0);
    await Promise.all([
      animate(exitX, 0, { type: 'spring', stiffness: 380, damping: 34 }),
      animate(exitY, 0, { type: 'spring', stiffness: 380, damping: 34 }),
    ]);
  }

  function handleDrag(_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (isAnimating || !allowHorizontalVote || isCommittingRef.current) return;
    setDragX(info.offset.x);
  }

  async function handleDragEnd(_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (isAnimating || isCommittingRef.current) return;

    const { offset } = info;
    setDragX(0);

    if (voted) {
      if (checkVerticalSkip(offset)) {
        await exitUp();
      } else {
        await snapBack();
      }
      return;
    }

    const voteSide = resolveHorizontalVote(offset);
    if (voteSide) {
      await voteAndFlyOut(voteSide);
      return;
    }

    if (isHorizontalDominant(offset)) {
      await snapBack();
      return;
    }

    if (checkVerticalSkip(offset)) {
      await exitUp();
      return;
    }

    await snapBack();
  }

  const canDrag = isActive && !isAnimating && !isCommittingRef.current;
  const allowHorizontalVote = !voted && !showResult;
  const isReviewMode = Boolean(voted) && !showResult;
  const enableVerticalNext = isReviewMode;
  const enableGesture = canDrag && (allowHorizontalVote || enableVerticalNext);
  const dragAxis = allowHorizontalVote ? true : 'y';

  return (
    <div
      className={`swipe-card ${!isActive ? 'swipe-card--inactive' : ''} ${showResult ? 'swipe-card--voted' : ''} ${isReviewMode ? 'swipe-card--review' : ''}`}
    >
      <motion.div className="swipe-card__inner" style={{ x: exitX, y: exitY }}>
        <div className="swipe-card__title-row">
          <div className="swipe-card__title-head">
            <div className="swipe-card__title-main">
              {isUnread && <span className="swipe-card__unread">NEW</span>}
              <span className={`swipe-card__category swipe-card__category--${topic.category}`}>
                {topic.category}
              </span>
              <h2 className="swipe-card__title">{topic.title}</h2>
            </div>
            {isReviewMode && (
              <button
                type="button"
                className="swipe-card__reopen-result"
                onClick={(event) => {
                  event.stopPropagation();
                  onReopenResult();
                }}
              >
                結果に戻る
              </button>
            )}
          </div>
        </div>

        <div className="swipe-card__choices-area">
          <div className="swipe-card__choices">
            <div className="swipe-card__choice swipe-card__choice--a">
            <TopicChoiceImage src={topic.optionA.imageUrl} alt={topic.optionA.text} />
            <div className="swipe-card__choice-label swipe-card__choice-label--a">
              <span className="swipe-card__choice-badge swipe-card__choice-badge--a">A</span>
              <p>{topic.optionA.text}</p>
            </div>
            {allowHorizontalVote && dragX < -stampThreshold && (
              <div className="swipe-card__stamp swipe-card__stamp--a">A</div>
            )}
            {allowHorizontalVote && (
              <span className="swipe-card__guide swipe-card__guide--a">← A</span>
            )}
          </div>

          <div className="swipe-card__divider" />

          <div className="swipe-card__choice swipe-card__choice--b">
            <TopicChoiceImage src={topic.optionB.imageUrl} alt={topic.optionB.text} />
            <div className="swipe-card__choice-label swipe-card__choice-label--b">
              <span className="swipe-card__choice-badge swipe-card__choice-badge--b">B</span>
              <p>{topic.optionB.text}</p>
            </div>
            {allowHorizontalVote && dragX > stampThreshold && (
              <div className="swipe-card__stamp swipe-card__stamp--b">B</div>
            )}
            {allowHorizontalVote && (
              <span className="swipe-card__guide swipe-card__guide--b">B →</span>
            )}
          </div>
        </div>

          {!showResult && !voted && (
            <p className="swipe-card__skip-hint">↑ スワイプでスキップ</p>
          )}

          {isReviewMode && (
            <p className="swipe-card__skip-hint">↑ スワイプで次へ</p>
          )}
        </div>

        {resultVisible && voted && (
          <VoteResult
            votesA={topic.votesA}
            votesB={topic.votesB}
            userVote={voted}
            visible
            onClose={onCloseResult}
            onNext={onNext}
          />
        )}

        {enableGesture && (
          <motion.div
            className="swipe-card__gesture-layer"
            drag={dragAxis}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.06}
            dragMomentum={false}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
          />
        )}
      </motion.div>
    </div>
  );
}
