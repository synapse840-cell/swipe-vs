import type { ReactNode } from 'react';
import { LEGAL, buildContactMailto } from '../lib/legalConfig';

interface LegalContactBlockProps {
  subject: string;
  children?: ReactNode;
}

export function LegalContactBlock({ subject, children }: LegalContactBlockProps) {
  const mailto = buildContactMailto(subject);

  return (
    <div className="legal-contact">
      {children ?? (
        <p>
          本{subject.includes('プライバシー') ? 'ポリシー' : '規約'}に関するお問い合わせは、
          {LEGAL.operatorName}までご連絡ください。
        </p>
      )}
      {mailto ? (
        <p>
          メール:{' '}
          <a className="legal-contact__link" href={mailto}>
            {LEGAL.contactEmail}
          </a>
        </p>
      ) : (
        <p className="legal-contact__pending">
          お問い合わせメールアドレスは準備中です。公開前に設定されます。
        </p>
      )}
      <p className="legal-contact__meta">
        運営者: {LEGAL.operatorName}
        <br />
        サービスURL:{' '}
        <a className="legal-contact__link" href={LEGAL.serviceUrl} target="_blank" rel="noopener noreferrer">
          {LEGAL.serviceUrl}
        </a>
      </p>
    </div>
  );
}

export function LegalOperatorSummary() {
  return (
    <section className="legal-section legal-section--operator">
      <h2>運営者情報</h2>
      <dl className="legal-operator">
        <div>
          <dt>サービス名</dt>
          <dd>{LEGAL.serviceName}</dd>
        </div>
        <div>
          <dt>運営者</dt>
          <dd>{LEGAL.operatorName}</dd>
        </div>
        <div>
          <dt>サービスURL</dt>
          <dd>
            <a className="legal-contact__link" href={LEGAL.serviceUrl} target="_blank" rel="noopener noreferrer">
              {LEGAL.serviceUrl}
            </a>
          </dd>
        </div>
        <div>
          <dt>お問い合わせ</dt>
          <dd>
            {LEGAL.contactEmail ? (
              <a className="legal-contact__link" href={buildContactMailto('Swipe VS お問い合わせ') ?? undefined}>
                {LEGAL.contactEmail}
              </a>
            ) : (
              '準備中'
            )}
          </dd>
        </div>
      </dl>
    </section>
  );
}
