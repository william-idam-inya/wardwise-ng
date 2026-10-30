import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ClerkingWorkspace } from './ClerkingWorkspace';
import { createInitialClerkingDraft } from './clerking.types';

describe('guided clerking workspace', () => {
  it('starts with case setup and navigates one stage at a time', () => {
    const draft = createInitialClerkingDraft();
    render(<ClerkingWorkspace draft={draft} onDraftChange={vi.fn()} onNavigate={vi.fn()} onStartNew={vi.fn()} />);

    expect(screen.getByRole('heading', { name: /ai guided clinical clerking/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /case setup/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /next stage/i }));
    expect(screen.getByRole('heading', { name: /biodata/i })).toBeInTheDocument();
  });

  it('provides a distinct review-of-systems stage', () => {
    const draft = createInitialClerkingDraft();
    render(<ClerkingWorkspace draft={draft} onDraftChange={vi.fn()} onNavigate={vi.fn()} onStartNew={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /review of systems/i }));
    expect(screen.getByRole('heading', { name: /review of systems/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/cardiovascular status/i)).toHaveValue('Not elicited');
  });

  it('shows the generated note preview without claiming the draft is saved', () => {
    const draft = createInitialClerkingDraft();
    render(<ClerkingWorkspace draft={draft} onDraftChange={vi.fn()} onNavigate={vi.fn()} onStartNew={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /review note/i }));
    expect(screen.getByText(/PATIENT CLERKING NOTE — SYNTHETIC \/ DE-IDENTIFIED CASE/)).toBeInTheDocument();
    expect(screen.getByText(/not saved to a database/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mark note reviewed/i })).toBeInTheDocument();
  });
});
