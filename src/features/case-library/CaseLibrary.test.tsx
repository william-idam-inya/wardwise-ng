import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { CaseLibrary } from './CaseLibrary';
import { archiveClinicalCase, listClinicalCases } from './case.service';

vi.mock('./case.service', () => ({
  archiveClinicalCase: vi.fn(),
  deleteClinicalCase: vi.fn(),
  listClinicalCases: vi.fn(),
}));

const exampleCase = {
  id: 'case-1',
  title: 'Synthetic child with abdominal pain',
  specialty: 'Paediatric Surgery',
  setting: 'Teaching hospital',
  status: 'draft' as const,
  case_category: 'synthetic' as const,
  created_at: '2026-10-30T08:00:00.000Z',
  updated_at: '2026-10-30T09:00:00.000Z',
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.mocked(listClinicalCases).mockResolvedValue([]);
  vi.mocked(archiveClinicalCase).mockResolvedValue(undefined);
  vi.stubGlobal('confirm', vi.fn(() => true));
});

describe('private case library', () => {
  it('loads and opens only the selected learner case', async () => {
    const onOpenCase = vi.fn();
    vi.mocked(listClinicalCases).mockResolvedValue([exampleCase]);
    render(<CaseLibrary userId="user-a" onOpenCase={onOpenCase} onStartNew={vi.fn()} />);

    expect(await screen.findByText('Synthetic child with abdominal pain')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /open/i }));
    expect(onOpenCase).toHaveBeenCalledWith('case-1');
    expect(listClinicalCases).toHaveBeenCalledWith('user-a');
  });

  it('shows an honest empty state when no cases exist', async () => {
    render(<CaseLibrary userId="user-a" onOpenCase={vi.fn()} onStartNew={vi.fn()} />);
    expect(await screen.findByRole('heading', { name: /your case library is empty/i })).toBeInTheDocument();
  });

  it('archives a case using the authenticated user's case action', async () => {
    vi.mocked(listClinicalCases)
      .mockResolvedValueOnce([exampleCase])
      .mockResolvedValueOnce([{ ...exampleCase, status: 'archived' }]);
    render(<CaseLibrary userId="user-a" onOpenCase={vi.fn()} onStartNew={vi.fn()} />);

    await screen.findByText('Synthetic child with abdominal pain');
    fireEvent.click(screen.getByRole('button', { name: /archive synthetic child with abdominal pain/i }));
    expect(archiveClinicalCase).toHaveBeenCalledWith('case-1', 'user-a');
  });
});
