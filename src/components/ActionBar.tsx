interface ActionBarProps {
  liked: boolean;
  likeCount: number;
  voted: boolean;
  commentCount: number;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onCreate: () => void;
}

export function ActionBar({
  liked,
  likeCount,
  voted,
  commentCount,
  onLike,
  onComment,
  onShare,
  onCreate,
}: ActionBarProps) {
  return (
    <div className="action-bar">
      <button
        className={`action-bar__btn ${liked ? 'action-bar__btn--active' : ''}`}
        onClick={onLike}
        aria-label="いいね"
      >
        <svg viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        {likeCount > 0 && (
          <span className="action-bar__badge action-bar__badge--like">{likeCount}</span>
        )}
      </button>

      <button
        className={`action-bar__btn ${!voted ? 'action-bar__btn--locked' : ''}`}
        onClick={voted ? onComment : undefined}
        aria-label="コメント"
        disabled={!voted}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {voted && commentCount > 0 && (
          <span className="action-bar__badge">{commentCount}</span>
        )}
        {!voted && <span className="action-bar__lock">🔒</span>}
      </button>

      <button className="action-bar__btn" onClick={onShare} aria-label="シェア">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      </button>

      <button className="action-bar__btn action-bar__btn--create" onClick={onCreate} aria-label="お題作成">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}
