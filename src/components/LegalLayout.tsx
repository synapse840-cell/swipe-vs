import type { ReactNode } from 'react';
import { navigateTo } from '../lib/legalRoutes';

interface LegalLayoutProps {
  title: string;
  updatedAt: string;
  children: ReactNode;
}

export function LegalLayout({ title, updatedAt, children }: LegalLayoutProps) {
  return (
    <div className="legal-page">
      <header className="legal-page__header">
        <button
          type="button"
          className="legal-page__back"
          onClick={() => navigateTo('/')}
        >
          ← 戻る
        </button>
        <h1 className="legal-page__title">{title}</h1>
        <p className="legal-page__updated">最終更新日: {updatedAt}</p>
      </header>
      <main className="legal-page__body">{children}</main>
      <footer className="legal-page__footer">
        <button type="button" className="legal-page__footer-link" onClick={() => navigateTo('/terms')}>
          利用規約
        </button>
        <span aria-hidden="true">·</span>
        <button type="button" className="legal-page__footer-link" onClick={() => navigateTo('/privacy')}>
          プライバシーポリシー
        </button>
      </footer>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="legal-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
