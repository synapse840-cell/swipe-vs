/**
 * 利用規約・プライバシーポリシーで共通利用する運営情報。
 * お問い合わせは Google フォーム（VITE_CONTACT_FORM_URL）を使用します。
 */
export const LEGAL = {
  serviceName: 'Swipe VS',
  operatorName: 'Swipe VS 運営',
  serviceUrl: 'https://swipe-vs.vercel.app',
  /** Google フォームの公開 URL（未設定時は「準備中」と表示） */
  contactFormUrl: import.meta.env.VITE_CONTACT_FORM_URL?.trim() ?? '',
  contactFormLabel: 'お問い合わせフォーム',
  jurisdictionCourt: '東京地方裁判所',
  effectiveDate: '2026年7月12日',
  lastUpdated: '2026年7月12日',
} as const;

export function isContactFormConfigured(): boolean {
  return Boolean(LEGAL.contactFormUrl);
}
