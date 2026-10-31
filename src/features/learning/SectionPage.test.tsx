import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { SectionPage } from '../SectionPage';

afterEach(() => cleanup());

describe('Clinical Tutor and learning catalogue', () => {
  it('shows the available offline guides in Clinical Tutor', () => {
    render(<SectionPage section="clinical-tutor" onNavigate={vi.fn()} />);
    expect(screen.getByRole('heading', { name: /starter clinical guides/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /approach to a patient with jaundice/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /suspected urinary tract infection in a child/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /approach to suspected acute appendicitis/i })).toBeInTheDocument();
  });

  it('opens a selected guide and returns to catalogue search results', () => {
    render(<SectionPage section="learning-catalogue" onNavigate={vi.fn()} />);
    fireEvent.change(screen.getByRole('textbox', { name: /search learning catalogue/i }), { target: { value: 'jaundice' } });
    fireEvent.click(screen.getByRole('button', { name: /jaundice evaluation/i }));
    expect(screen.getAllByRole('heading', { name: /approach to a patient with jaundice/i }).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: /back to learning/i }));
    expect(screen.getByRole('textbox', { name: /search learning catalogue/i })).toHaveValue('jaundice');
  });

  it('groups surgery topics under specialties and finds appendicitis via a common presentation alias', () => {
    render(<SectionPage section="learning-catalogue" onNavigate={vi.fn()} />);
    fireEvent.change(screen.getByRole('textbox', { name: /search learning catalogue/i }), { target: { value: 'RIF pain' } });
    expect(screen.getByRole('heading', { name: /general & gastrointestinal surgery/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /appendicitis/i })).toBeInTheDocument();
  });

  it('filters the catalogue by discipline and specialty name', () => {
    render(<SectionPage section="learning-catalogue" onNavigate={vi.fn()} />);
    fireEvent.change(screen.getByRole('textbox', { name: /search learning catalogue/i }), { target: { value: 'urology' } });
    expect(screen.getAllByRole('heading', { name: /urology/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /hypospadias/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /cardiology/i })).not.toBeInTheDocument();
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
