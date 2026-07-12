const CLIENT_ID = import.meta.env.VITE_ADSENSE_CLIENT_ID?.trim() ?? '';
const SLOT_ID = import.meta.env.VITE_ADSENSE_SLOT_ID?.trim() ?? '';
const MOBILE_SLOT_ID = import.meta.env.VITE_ADSENSE_SLOT_ID_MOBILE?.trim() ?? '';

export interface AdSenseUnitConfig {
  clientId: string;
  slotId: string;
}

export function isAdSenseConfigured(): boolean {
  return Boolean(CLIENT_ID && SLOT_ID);
}

export function resolveAdSenseUnit(isMobile: boolean): AdSenseUnitConfig | null {
  if (!CLIENT_ID || !SLOT_ID) return null;

  const slotId = isMobile && MOBILE_SLOT_ID ? MOBILE_SLOT_ID : SLOT_ID;
  return { clientId: CLIENT_ID, slotId };
}

/** ca-pub- 形式か簡易チェック */
export function isValidAdSenseClientId(clientId: string): boolean {
  return /^ca-pub-\d+$/i.test(clientId);
}

/** 数字のみの広告ユニット ID か簡易チェック */
export function isValidAdSenseSlotId(slotId: string): boolean {
  return /^\d+$/.test(slotId);
}
