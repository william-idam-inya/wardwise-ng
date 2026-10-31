import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ClinicalGuideView } from './ClinicalGuideView';
import { offlineGuides } from './learning.data';

describe('ClinicalGuideView', () => {
  it('renders source-linked guide content and reveals a quiz explanation', () => {
    const guide = offlineGuides[0];
    render(<ClinicalGuideView guide={guide} onBack={() => undefined} />);
    expect(screen.getByRole('heading', { name: guide.title })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /focused history/i })).toBeInTheDocument();
    expect(screen.getByText(/differential framework/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /management principles/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open source/i })).toHaveAttribute('href', guide.sources[0].url);
    fireEvent.click(screen.getByRole('button', { name: guide.questions[0].options[guide.questions[0].answerIndex] }));
    expect(screen.getByText(/correct\./i)).toBeInTheDocument();
    expect(screen.getByText(guide.questions[0].explanation)).toBeInTheDocument();
  });
});
