import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import { isAdSenseConfigured, resolveAdSenseUnit } from '../lib/adConfig';
import { mountAdSenseUnit } from '../lib/loadAdSense';

interface AdOverlayProps {
  open: boolean;
  onClose: () => void;
}

const SKIP_COUNTDOWN_SEC = 3;
const MOBILE_MEDIA_QUERY = '(max-width: 768px)';

export function AdOverlay({ open, onClose }: AdOverlayProps) {
  const [countdown, setCountdown] = useState(SKIP_COUNTDOWN_SEC);
  const adSlotRef = useRef<HTMLDivElement>(null);
  const useLiveAd = isAdSenseConfigured();

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

  useEffect(() => {
    if (!open || !useLiveAd) return;

    const container = adSlotRef.current;
    if (!container) return;

    const isMobile = window.matchMedia(MOBILE_MEDIA_QUERY).matches;
    const unit = resolveAdSenseUnit(isMobile);
    if (!unit) return;

    const cleanup = mountAdSenseUnit(container, unit);
    return cleanup;
  }, [open, useLiveAd]);

  if (!open) return null;

  const canSkip = countdown === 0;

  function handleClose(e: MouseEvent | PointerEvent) {
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
        {useLiveAd ? (
          <div ref={adSlotRef} className="ad-overlay__slot" aria-label="広告枠" />
        ) : (
          <div className="ad-overlay__mock">
            <p>広告枠（Google AdSense）</p>
            <p className="ad-overlay__sub">
              VITE_ADSENSE_CLIENT_ID と VITE_ADSENSE_SLOT_ID を設定すると本番広告が表示されます
            </p>
          </div>
        )}
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
