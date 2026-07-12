import type { ReactNode } from 'react';
import { LEGAL, isContactFormConfigured } from '../lib/legalConfig';

interface LegalContactBlockProps {
  subject: string;
  children?: ReactNode;
}

function ContactFormLink({ label = LEGAL.contactFormLabel }: { label?: string }) {
  if (!isContactFormConfigured()) {
    return <span className="legal-contact__pending">準備中</span>;
  }

  return (
    <a
      className="legal-contact__link"
      href={LEGAL.contactFormUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      {label}
    </a>
  );
}

export function LegalContactBlock({ subject, children }: LegalContactBlockProps) {
  const docLabel = subject.includes('プライバシー') ? 'ポリシー' : '規約';

  return (
    <div className="legal-contact">
      {children ?? (
        <p>
          本{docLabel}に関するお問い合わせは、下記の{LEGAL.contactFormLabel}より{LEGAL.operatorName}へご連絡ください。
        </p>
      )}
      {isContactFormConfigured() ? (
        <p>
          <ContactFormLink label={`${LEGAL.contactFormLabel}を開く`} />
        </p>
      ) : (
        <p className="legal-contact__pending">お問い合わせフォームは準備中です。</p>
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
            <ContactFormLink />
          </dd>
        </div>
      </dl>
    </section>
  );
}
