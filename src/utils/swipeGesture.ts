import type { PanInfo } from 'framer-motion';
import type { VoteSide } from '../types';

const HORIZONTAL_DOMINANCE_RATIO = 2;
const MAX_HORIZONTAL_ANGLE_RATIO = 0.45;
const SKIP_DOMINANCE_RATIO = 1.8;

export function getVoteThresholdPx() {
  return window.innerWidth * 0.2;
}

export function getSkipThresholdPx() {
  return window.innerHeight * 0.12;
}

export function getStampThresholdPx() {
  return getVoteThresholdPx() * 0.35;
}

/** 水平方向が主なドラッグか（斜め上でも横スキップ扱いにしない） */
export function isHorizontalDominant(offset: PanInfo['offset']): boolean {
  return Math.abs(offset.x) > Math.abs(offset.y);
}

/** 意図的な水平スワイプのみ A/B を返す */
export function resolveHorizontalVote(offset: PanInfo['offset']): VoteSide | null {
  const voteThreshold = getVoteThresholdPx();
  const absX = Math.abs(offset.x);
  const absY = Math.abs(offset.y);

  if (absX < voteThreshold) return null;
  if (absX < absY * HORIZONTAL_DOMINANCE_RATIO) return null;
  if (absY / absX > MAX_HORIZONTAL_ANGLE_RATIO) return null;

  return offset.x < 0 ? 'A' : 'B';
}

/** 意図的な上方向スワイプか */
export function checkVerticalSkip(offset: PanInfo['offset']): boolean {
  const skipThreshold = getSkipThresholdPx();
  const absX = Math.abs(offset.x);
  const absY = Math.abs(offset.y);

  return offset.y < 0 && absY >= skipThreshold && absY >= absX * SKIP_DOMINANCE_RATIO;
}
