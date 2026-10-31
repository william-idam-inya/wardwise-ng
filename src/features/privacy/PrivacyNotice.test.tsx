import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PrivacyNotice } from './PrivacyNotice';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('PrivacyNotice', () => {
  it('clearly identifies the notice as a development notice and describes the live backend status', () => {
    render(<PrivacyNotice />);
    expect(screen.getByText(/development notice — not a final privacy policy/i)).toBeInTheDocument();
    expect(screen.getByText(/dedicated WardWise Supabase project has been created and the initial database migrations are applied/i)).toBeInTheDocument();
    expect(screen.getByText(/data-subject request workflow are not implemented/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /read the nigeria data protection act/i })).toHaveAttribute('href', 'https://ndpc.gov.ng/ndp-act-2023/');
  });

  it('creates a report draft without implying that it was submitted', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    render(<PrivacyNotice />);
    fireEvent.change(screen.getByLabelText(/topic or screen/i), { target: { value: 'Appendicitis guide' } });
    fireEvent.change(screen.getByLabelText(/what needs review/i), { target: { value: 'Please review this point.' } });
    fireEvent.click(screen.getByRole('button', { name: /copy report draft/i }));

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('Appendicitis guide'));
    expect(await screen.findByRole('status')).toHaveTextContent(/does not submit reports/i);
  });
});
