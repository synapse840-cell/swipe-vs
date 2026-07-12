import type { AdSenseUnitConfig } from './adConfig';

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

const SCRIPT_ID = 'adsense-script';

function pushAdUnit() {
  try {
    window.adsbygoogle = window.adsbygoogle ?? [];
    window.adsbygoogle.push({});
  } catch {
    // AdSense script not ready
  }
}

function findAdSenseScript(): HTMLScriptElement | null {
  return (
    (document.getElementById(SCRIPT_ID) as HTMLScriptElement | null) ??
    document.querySelector('script[src*="adsbygoogle.js"]')
  );
}

function ensureAdSenseScript(clientId: string, onReady: () => void) {
  const existing = findAdSenseScript();
  if (existing) {
    if (existing.dataset.loaded === 'true' || window.adsbygoogle) {
      onReady();
      return;
    }
    existing.addEventListener('load', onReady, { once: true });
    return;
  }

  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`;
  script.crossOrigin = 'anonymous';
  script.addEventListener(
    'load',
    () => {
      script.dataset.loaded = 'true';
      onReady();
    },
    { once: true },
  );
  document.head.appendChild(script);
}

/** オーバーレイ表示のたびに広告ユニットをマウントする */
export function mountAdSenseUnit(
  container: HTMLElement,
  { clientId, slotId }: AdSenseUnitConfig,
): () => void {
  container.replaceChildren();

  const ins = document.createElement('ins');
  ins.className = 'adsbygoogle';
  ins.style.display = 'block';
  ins.style.minHeight = '250px';
  ins.setAttribute('data-ad-client', clientId);
  ins.setAttribute('data-ad-slot', slotId);
  ins.setAttribute('data-ad-format', 'auto');
  ins.setAttribute('data-full-width-responsive', 'true');
  container.appendChild(ins);

  ensureAdSenseScript(clientId, pushAdUnit);

  return () => {
    container.replaceChildren();
  };
}
