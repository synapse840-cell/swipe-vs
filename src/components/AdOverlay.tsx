import { useEffect, useState } from 'react';

interface AdOverlayProps {
  open: boolean;
  onClose: () => void;
}

const SKIP_COUNTDOWN_SEC = 3;

export function AdOverlay({ open, onClose }: AdOverlayProps) {
  const [countdown, setCountdown] = useState(SKIP_COUNTDOWN_SEC);

  useEffect(() => {
    if (!open) {
      setCountdown(SKIP_COUNTDOWN_SEC);
      return;
    }

    setCountdown(SKIP_COUNTDOWN_SEC);
    const timer = window.setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [open]);

  if (!open) return null;

  const canSkip = countdown === 0;

  function handleClose(e: React.MouseEvent | React.PointerEvent) {
    if (!canSkip) return;
    e.preventDefault();
    e.stopPropagation();
    onClose();
  }

  return (
    <div
      className="ad-overlay"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="ad-overlay__content">
        <span className="ad-overlay__label">広告</span>
        <div className="ad-overlay__mock">
          <p>Swipe VS プレミアム</p>
          <p className="ad-overlay__sub">広告なしで無限スワイプ</p>
        </div>
        <button
          type="button"
          className={`ad-overlay__skip ${canSkip ? 'ad-overlay__skip--ready' : ''}`}
          disabled={!canSkip}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={handleClose}
        >
          {canSkip ? 'スキップ' : `スキップ（${countdown}）`}
        </button>
      </div>
    </div>
  );
}
