import { useEffect, useRef } from 'react';
import { isAdSenseConfigured, resolveAdSenseUnit } from '../lib/adConfig';
import { mountAdSenseUnit } from '../lib/loadAdSense';

interface AdBannerProps {
  onDismiss: () => void;
}

const MOBILE_MEDIA_QUERY = '(max-width: 768px)';

export function AdBanner({ onDismiss }: AdBannerProps) {
  const adSlotRef = useRef<HTMLDivElement>(null);
  const useLiveAd = isAdSenseConfigured();

  useEffect(() => {
    if (!useLiveAd) return;

    const container = adSlotRef.current;
    if (!container) return;

    const isMobile = window.matchMedia(MOBILE_MEDIA_QUERY).matches;
    const unit = resolveAdSenseUnit(isMobile);
    if (!unit) return;

    return mountAdSenseUnit(container, unit);
  }, [useLiveAd]);

  return (
    <aside className="ad-banner" aria-label="広告">
      <p className="ad-banner__label">広告</p>
      {useLiveAd ? (
        <div ref={adSlotRef} className="ad-banner__slot" />
      ) : (
        <div className="ad-banner__mock">
          <p>広告枠（Google AdSense）</p>
          <p className="ad-banner__sub">
            審査通過後に VITE_ADSENSE_CLIENT_ID と VITE_ADSENSE_SLOT_ID を設定すると表示されます
          </p>
        </div>
      )}
      <button type="button" className="ad-banner__next" onClick={onDismiss}>
        次へ
      </button>
    </aside>
  );
}
