import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AuthProvider } from '../features/auth/AuthContext';
import { AuthPage } from '../features/auth/AuthPage';
import { Workspace } from '../features/Workspace';
import { SectionPage } from '../features/SectionPage';

beforeEach(() => { cleanup(); window.localStorage.clear(); window.scrollTo = () => undefined; });

describe('WardWise NG access and workspace foundation', () => {
  it('keeps the private workspace inaccessible until Supabase is configured', () => {
    render(<AuthProvider><AuthPage /></AuthProvider>);
    expect(screen.getByRole('heading', { name: /connect your wardwise workspace/i })).toBeInTheDocument();
    expect(screen.getByText(/private workspace access stays locked/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^sign in/i })).not.toBeInTheDocument();
  });

  it('renders the workspace and honest empty state after access is granted', () => {
    const onNavigate = vi.fn();
    render(<Workspace onNavigate={onNavigate} />);
    expect(screen.getByRole('heading', { name: /good to have you here/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /your case library starts here/i })).toBeInTheDocument();
    expect(screen.getByText(/after secure account and storage features are connected/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /start a clinical clerking/i }));
    expect(onNavigate).toHaveBeenCalledWith('clerking');
  });

  it('opens and filters the learning catalogue', () => {
    render(<SectionPage section="learning-catalogue" onNavigate={vi.fn()} />);
    fireEvent.change(screen.getByRole('textbox', { name: /search learning catalogue/i }), { target: { value: 'neonatology' } });
    expect(screen.getByRole('button', { name: /neonatology/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /cardiology/i })).not.toBeInTheDocument();
  });

  it('shows a clear no-results state', () => {
    render(<SectionPage section="learning-catalogue" onNavigate={vi.fn()} query="not-a-real-topic-123" />);
    expect(screen.getByRole('heading', { name: /no matching topics found/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /clear search/i }));
    expect(screen.getByRole('button', { name: /cardiology/i })).toBeInTheDocument();
  });
});
