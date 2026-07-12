/**
 * 利用規約・プライバシーポリシーで共通利用する運営情報。
 * お問い合わせメールは公開前に必ず設定してください。
 */
export const LEGAL = {
  serviceName: 'Swipe VS',
  operatorName: 'Swipe VS 運営',
  serviceUrl: 'https://swipe-vs.vercel.app',
  /** 未設定の場合、規約・ポリシー上は「準備中」と表示されます */
  contactEmail: 'qingzhenshiyuan406@gmail.com',
  jurisdictionCourt: '東京地方裁判所',
  effectiveDate: '2026年7月12日',
  lastUpdated: '2026年7月12日',
} as const;

export function buildContactMailto(subject: string): string | null {
  if (!LEGAL.contactEmail) return null;
  const params = new URLSearchParams({ subject });
  return `mailto:${LEGAL.contactEmail}?${params.toString()}`;
}
