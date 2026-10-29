import { beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import App from '../app/App';

beforeEach(() => { cleanup(); window.localStorage.clear(); });

describe('WardWise NG foundation', () => {
  it('renders the workspace and honest empty state', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /good to have you here/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /your case library starts here/i })).toBeInTheDocument();
    expect(screen.getByText(/after secure account and storage features are connected/i)).toBeInTheDocument();
  });
  it('navigates to the clinical clerking foundation', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /start a new clerking/i }));
    expect(screen.getByRole('heading', { name: /ai guided clinical clerking/i })).toBeInTheDocument();
    expect(screen.getByText(/does not save a case/i)).toBeInTheDocument();
  });
  it('opens and filters the learning catalogue', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /explore learning topics/i }));
    fireEvent.change(screen.getByRole('textbox', { name: /search learning catalogue/i }), { target: { value: 'neonatology' } });
    expect(screen.getByRole('button', { name: /neonatology/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /cardiology/i })).not.toBeInTheDocument();
  });
  it('toggles and stores dark mode', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /switch to dark mode/i }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(window.localStorage.getItem('wardwise-theme')).toBe('dark');
  });
});
