import { useEffect, useState } from 'react';
import { MainFeed } from './components/MainFeed';
import { getLegalPath, type LegalPath } from './lib/legalRoutes';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import './index.css';

function LegalRouter({ path }: { path: LegalPath }) {
  if (path === '/terms') return <TermsPage />;
  return <PrivacyPage />;
}

function App() {
  const [legalPath, setLegalPath] = useState<LegalPath | null>(() => getLegalPath());

  useEffect(() => {
    const syncPath = () => setLegalPath(getLegalPath());
    window.addEventListener('popstate', syncPath);
    return () => window.removeEventListener('popstate', syncPath);
  }, []);

  if (legalPath) {
    return <LegalRouter path={legalPath} />;
  }

  return <MainFeed />;
}

export default App;
