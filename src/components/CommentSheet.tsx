import { useEffect, useState } from 'react';
import { motion, useDragControls, type PanInfo } from 'framer-motion';
import type { Comment, VoteSide } from '../types';

const CURRENT_USER_NAME = 'あなた';
const DISMISS_OFFSET_PX = 100;
const DISMISS_VELOCITY = 400;

interface CommentSheetProps {
  open: boolean;
  comments: Comment[];
  userVote: VoteSide;
  commentLikes: Record<string, boolean>;
  adjustLikeCount?: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
  onToggleCommentLike: (commentId: string) => void;
  onDeleteComment?: (commentId: string) => void;
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function CommentSheet({
  open,
  comments,
  userVote,
  commentLikes,
  adjustLikeCount = false,
  onClose,
  onSubmit,
  onToggleCommentLike,
  onDeleteComment,
}: CommentSheetProps) {
  const [text, setText] = useState('');
  const dragControls = useDragControls();

  useEffect(() => {
    if (!open) setText('');
  }, [open]);

  function getLikeState(comment: Comment) {
    const liked = commentLikes[comment.id] ?? false;
    const count = adjustLikeCount && liked ? comment.likes + 1 : comment.likes;
    return { liked, count };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText('');
  }

  function handleDragEnd(_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (info.offset.y > DISMISS_OFFSET_PX || info.velocity.y > DISMISS_VELOCITY) {
      onClose();
    }
  }

  const sideClass = userVote.toLowerCase();

  return (
    <>
      <div
        className={`overlay-backdrop ${open ? 'overlay-backdrop--visible' : ''}`}
        onClick={onClose}
      />
      <motion.div
        className="comment-sheet"
        initial={false}
        animate={{ y: open ? 0 : '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 34 }}
        drag={open ? 'y' : false}
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.45 }}
        onDragEnd={handleDragEnd}
      >
        <div
          className="comment-sheet__drag-zone"
          onPointerDown={(event) => dragControls.start(event)}
        >
          <div className="comment-sheet__handle" onClick={onClose} />
          <div className="comment-sheet__header">
            <h3>白熱の議論</h3>
            <span className={`comment-sheet__side comment-sheet__side--${sideClass}`}>
              あなたは {userVote} 派
            </span>
          </div>
        </div>

        <div className="comment-sheet__list">
          {comments.map((c) => {
            const isOwn = c.author === CURRENT_USER_NAME;
            const { liked, count } = getLikeState(c);
            const side = c.side.toLowerCase();

            return (
              <div
                key={c.id}
                className={`comment-bubble comment-bubble--${side}`}
              >
                <div className="comment-bubble__avatar">{c.author[0]}</div>
                <div className="comment-bubble__body">
                  <span className="comment-bubble__author">
                    {c.author}
                    {isOwn && (
                      <span className={`comment-bubble__self comment-bubble__self--${side}`}>
                        （自分）
                      </span>
                    )}
                  </span>
                  <p>{c.text}</p>
                  <div className="comment-bubble__actions">
                    <button
                      type="button"
                      className={`comment-bubble__like comment-bubble__like--${side} ${liked ? 'comment-bubble__like--active' : ''}`}
                      onClick={() => onToggleCommentLike(c.id)}
                      aria-label="いいね"
                    >
                      <HeartIcon filled={liked} />
                      <span>{count}</span>
                    </button>
                    {isOwn && onDeleteComment && (
                      <button
                        type="button"
                        className="comment-bubble__delete"
                        onClick={() => onDeleteComment(c.id)}
                        aria-label="コメントを削除"
                      >
                        削除
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <form
          className={`comment-sheet__input comment-sheet__input--${sideClass}`}
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            placeholder="意見をぶつけろ..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit" disabled={!text.trim()}>
            送信
          </button>
        </form>
      </motion.div>
    </>
  );
}
