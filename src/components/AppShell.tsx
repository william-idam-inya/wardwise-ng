import { useState, type ReactNode, type FormEvent } from 'react';
import { Activity, Bell, ChevronDown, Command, LogOut, Menu, Moon, PanelLeftClose, PanelLeftOpen, Search, ShieldCheck, Sun } from 'lucide-react';
import { navigationItems, type SectionId } from '../app/navigation';

type Props = {
  activeSection: SectionId;
  theme: 'light' | 'dark';
  studentName: string;
  email: string;
  onNavigate: (section: SectionId, query?: string) => void;
  onToggleTheme: () => void;
  onSignOut: () => void | Promise<void>;
  children: ReactNode;
};
const groups = [{ id: 'main', label: 'Workspace' }, { id: 'clinical', label: 'Clinical practice' }, { id: 'study', label: 'Learning' }, { id: 'account', label: 'Personal' }] as const;

export function AppShell({ activeSection, theme, studentName, email, onNavigate, onToggleTheme, onSignOut, children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const submitSearch = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); onNavigate('learning-catalogue', search.trim()); };
  const current = navigationItems.find((item) => item.id === activeSection);
  const initials = studentName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || 'S';

  return <div className={'app-frame ' + (theme === 'dark' ? 'theme-dark' : '')}>
    {mobileOpen ? <button className="scrim" type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)} /> : null}
    <aside className={'sidebar ' + (collapsed ? 'sidebar--collapsed ' : '') + (mobileOpen ? 'sidebar--open' : '')} aria-label="Main navigation">
      <div className="brand-row"><span className="brand-mark"><Activity size={22} /></span>{!collapsed ? <div className="brand-wordmark"><strong>WardWise <em>NG</em></strong><small>Clinical learning</small></div> : null}<button className="icon-btn collapse-btn" type="button" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={() => setCollapsed(!collapsed)}>{collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}</button></div>
      <div className="workspace-switch"><span className="workspace-symbol">W</span>{!collapsed ? <><span><b>Student workspace</b><small>Personal learning space</small></span><ChevronDown size={15} /></> : null}</div>
      <nav className="side-nav">{groups.map((group) => <div className="nav-group" key={group.id}>{!collapsed ? <p>{group.label}</p> : <hr />}{navigationItems.filter((item) => item.group === group.id).map((item) => { const Icon = item.icon; return <button key={item.id} type="button" className={'nav-item ' + (activeSection === item.id ? 'active' : '')} aria-current={activeSection === item.id ? 'page' : undefined} title={collapsed ? item.label : undefined} onClick={() => { onNavigate(item.id); setMobileOpen(false); }}><Icon size={19} /><span>{!collapsed ? item.label : null}</span>{!collapsed && item.id === 'clerking' ? <i aria-label="Featured" /> : null}</button>; })}</div>)}</nav>
      {!collapsed ? <div className="sidebar-bottom"><div className="privacy-card"><ShieldCheck size={19} /><b>Learning, with care</b><p>Use fictional or de-identified cases. Keep patient identifiers out of WardWise.</p></div><div className="sidebar-user"><span>{initials}</span><div><b>{studentName}</b><small>{email}</small></div><button type="button" aria-label="Sign out" title="Sign out" onClick={() => void onSignOut()}><LogOut size={17} /></button></div></div> : null}
    </aside>
    <div className="app-main">
      <header className="topbar"><button className="icon-btn mobile-menu" type="button" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={20} /></button><div className="breadcrumb"><span>WardWise NG</span><b>/</b><strong>{current?.label}</strong></div><div className="topbar-actions"><form className="global-search" role="search" onSubmit={submitSearch}><Search size={16} /><input aria-label="Search clinical topics" placeholder="Search clinical topics…" value={search} onChange={(event) => setSearch(event.target.value)} /><kbd><Command size={11} /> K</kbd></form><button className="icon-btn" type="button" onClick={onToggleTheme} aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'} title="Toggle theme">{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button><span className="topbar-divider" /><button className="icon-btn" type="button" aria-label="Notifications are not connected yet" title="Notifications will be available when the account is connected"><Bell size={18} /></button><button className="avatar" type="button" aria-label="Open profile and settings" onClick={() => onNavigate('profile-settings')}>{initials}</button></div></header>
      <main className="main-content" id="main-content" tabIndex={-1}>{children}</main>
      <footer className="app-footer"><strong>WardWise NG</strong><span>For clinical education · Not a substitute for clinical supervision</span></footer>
    </div>
  </div>;
}
