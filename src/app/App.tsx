import { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { ProcessingIndicator } from '../components/ProcessingIndicator';
import { Workspace } from '../features/Workspace';
import { SectionPage } from '../features/SectionPage';
import { AuthPage } from '../features/auth/AuthPage';
import { AuthProvider, useAuth } from '../features/auth/AuthContext';
import { ProfileSetup } from '../features/auth/ProfileSetup';
import type { SectionId } from './navigation';

type Theme = 'light' | 'dark';

function initialTheme(): Theme {
  try {
    const saved = window.localStorage.getItem('wardwise-theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch { /* storage unavailable */ }
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function AppContent() {
  const auth = useAuth();
  const [section, setSection] = useState<SectionId>('workspace');
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [catalogueQuery, setCatalogueQuery] = useState('');
  const [accountError, setAccountError] = useState('');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { window.localStorage.setItem('wardwise-theme', theme); } catch { /* session-only preference */ }
  }, [theme]);

  const navigate = (next: SectionId, query = '') => {
    if (next === 'learning-catalogue') setCatalogueQuery(query);
    setSection(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!auth.configured) return <AuthPage />;
  if (auth.loading) return <main className="auth-screen"><ProcessingIndicator label="Restoring your sign-in session" detail="Checking your WardWise account." /></main>;
  if (!auth.session) return <AuthPage />;
  if (auth.recoveryRequired) return <AuthPage />;
  if (auth.profileLoading) return <main className="auth-screen"><ProcessingIndicator label="Loading your student profile" detail="Checking your private account record." /></main>;

  if (auth.profileError) {
    return <main className="auth-screen"><section className="auth-card setup-card">
      <div className="auth-brand"><span><AlertCircle size={22}/></span><strong>WardWise <em>NG</em></strong></div>
      <div className="auth-copy"><span className="kicker">PROFILE CONNECTION ISSUE</span><h1>We could not load your profile</h1><p>Your sign-in is active, but the profile table could not be read. Confirm that the WardWise profiles migration has been applied and that Data API grants and row-level security are active.</p></div>
      <div className="auth-error" role="alert">{auth.profileError}</div>
      <button className="btn btn-primary auth-submit" type="button" onClick={() => { void auth.refreshProfile().catch(() => undefined); }}><RefreshCw size={16}/> Retry profile connection</button>
      <button className="auth-plain-link" type="button" onClick={() => { void auth.signOut().catch((error: unknown) => setAccountError(error instanceof Error ? error.message : 'Sign out failed.')); }}>Sign out</button>
      {accountError ? <p role="alert" className="auth-error">{accountError}</p> : null}
    </section></main>;
  }

  if (!auth.profile) return <ProfileSetup />;

  if (section === 'profile-settings') {
    return <ProfileSetup profile={auth.profile} onCancel={() => navigate('workspace')} />;
  }

  return <AppShell
    activeSection={section}
    theme={theme}
    studentName={auth.profile.full_name}
    email={auth.user?.email ?? ''}
    onNavigate={navigate}
    onToggleTheme={() => setTheme((value) => value === 'light' ? 'dark' : 'light')}
    onSignOut={async () => {
      try { await auth.signOut(); setAccountError(''); }
      catch (error) { setAccountError(error instanceof Error ? error.message : 'Sign out failed.'); }
    }}
  >
    {section === 'workspace'
      ? <Workspace onNavigate={(next) => navigate(next)} />
      : <SectionPage
          key={section === 'learning-catalogue' ? section + '-' + catalogueQuery : section}
          section={section}
          onNavigate={(next) => navigate(next)}
          query={section === 'learning-catalogue' ? catalogueQuery : ''}
        />}
    {accountError ? <p className="auth-error" role="alert">{accountError}</p> : null}
    <span className="visually-hidden" aria-live="polite">Current section: {section}</span>
  </AppShell>;
}

export default function App() {
  return <AuthProvider><AppContent /></AuthProvider>;
}
