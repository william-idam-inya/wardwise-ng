import { useEffect, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { Workspace } from '../features/Workspace';
import { SectionPage } from '../features/SectionPage';
import type { SectionId } from './navigation';

type Theme = 'light' | 'dark';
function initialTheme(): Theme {
  try { const saved = window.localStorage.getItem('wardwise-theme'); if (saved === 'light' || saved === 'dark') return saved; } catch { /* storage unavailable */ }
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
export default function App() {
  const [section, setSection] = useState<SectionId>('workspace');
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [catalogueQuery, setCatalogueQuery] = useState('');
  useEffect(() => { document.documentElement.dataset.theme = theme; try { window.localStorage.setItem('wardwise-theme', theme); } catch { /* session-only preference */ } }, [theme]);
  const navigate = (next: SectionId, query = '') => { if (next === 'learning-catalogue') setCatalogueQuery(query); setSection(next); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  return <AppShell activeSection={section} theme={theme} onNavigate={navigate} onToggleTheme={() => setTheme((value) => value === 'light' ? 'dark' : 'light')}>
    {section === 'workspace' ? <Workspace onNavigate={(next) => navigate(next)} /> : <SectionPage key={section === 'learning-catalogue' ? section + '-' + catalogueQuery : section} section={section} onNavigate={(next) => navigate(next)} query={section === 'learning-catalogue' ? catalogueQuery : ''} />}
    <span className="visually-hidden" aria-live="polite">Current section: {section}</span>
  </AppShell>;
}
