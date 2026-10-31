import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SectionPage } from '../SectionPage';

describe('Clinical Tutor and learning catalogue', () => {
  it('shows the available offline guides in Clinical Tutor', () => {
    render(<SectionPage section="clinical-tutor" onNavigate={vi.fn()} />);
    expect(screen.getByRole('heading', { name: /starter clinical guides/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /approach to a patient with jaundice/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /suspected urinary tract infection in a child/i })).toBeInTheDocument();
  });

  it('opens a selected guide and returns to catalogue search results', () => {
    render(<SectionPage section="learning-catalogue" onNavigate={vi.fn()} />);
    fireEvent.change(screen.getByRole('textbox', { name: /search learning catalogue/i }), { target: { value: 'jaundice' } });
    fireEvent.click(screen.getByRole('button', { name: /jaundice evaluation/i }));
    expect(screen.getAllByRole('heading', { name: /approach to a patient with jaundice/i }).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: /back to learning/i }));
    expect(screen.getByRole('textbox', { name: /search learning catalogue/i })).toHaveValue('jaundice');
  });

  it('labels catalogue topics without a detailed guide', () => {
    render(<SectionPage section="learning-catalogue" onNavigate={vi.fn()} />);
    fireEvent.change(screen.getByRole('textbox', { name: /search learning catalogue/i }), { target: { value: 'cardiology' } });
    fireEvent.click(screen.getByRole('button', { name: /cardiology/i }));
    expect(screen.getByRole('heading', { name: /cardiology/i })).toBeInTheDocument();
    expect(screen.getByText(/detailed offline guide is still being prepared/i)).toBeInTheDocument();
  });

  it('routes the simulation section to the fictional patient experience', () => {
    render(<SectionPage section="simulation" onNavigate={vi.fn()} />);
    expect(screen.getByRole('heading', { name: /virtual patient simulation/i })).toBeInTheDocument();
    expect(screen.getByText(/SIMULATION — NOT A REAL PATIENT/i)).toBeInTheDocument();
  });
});
