import type { VoteSide } from '../types';

interface VoteResultProps {
  votesA: number;
  votesB: number;
  userVote: VoteSide;
  visible: boolean;
  onClose: () => void;
}

export function VoteResult({ votesA, votesB, userVote, visible, onClose }: VoteResultProps) {
  const total = votesA + votesB;
  const pctA = total === 0 ? 50 : Math.round((votesA / total) * 100);
  const pctB = 100 - pctA;

  const userPct = userVote === 'A' ? pctA : pctB;
  const otherPct = userVote === 'A' ? pctB : pctA;
  const verdict =
    userPct > otherPct ? '多数派' : userPct < otherPct ? '少数派' : '同率派';

  return (
    <div
      className={`vote-result ${visible ? 'vote-result--visible' : ''}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="投票結果"
    >
      <div
        className="vote-result__card"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="vote-result__close"
          onClick={onClose}
          aria-label="結果を閉じる"
        >
          ×
        </button>

        <div className="vote-result__percentages">
          <div className="vote-result__pct-block vote-result__pct-block--a">
            {userVote === 'A' && (
              <span className="vote-result__your-label vote-result__your-label--a">
                あなたの選択（{pctA}%）
              </span>
            )}
            <span className="vote-result__pct vote-result__pct--a">{pctA}%</span>
          </div>

          <span className="vote-result__divider">:</span>

          <div className="vote-result__pct-block vote-result__pct-block--b">
            {userVote === 'B' && (
              <span className="vote-result__your-label vote-result__your-label--b">
                あなたの選択（{pctB}%）
              </span>
            )}
            <span className="vote-result__pct vote-result__pct--b">{pctB}%</span>
          </div>
        </div>

        <div className="vote-result__bar">
          <div
            className="vote-result__bar-a"
            style={{ width: `${pctA}%` }}
          />
          <div
            className="vote-result__bar-b"
            style={{ width: `${pctB}%` }}
          />
        </div>

        <p className={`vote-result__verdict vote-result__verdict--${userVote.toLowerCase()}`}>
          あなたは{verdict}です！
        </p>
      </div>

      <p className="vote-result__hint">背景タップで質問に戻る</p>
    </div>
  );
}
