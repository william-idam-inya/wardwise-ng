import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ClinicalGuideView } from './ClinicalGuideView';
import { offlineGuides } from './learning.data';
import { getLearningBookmark, setLearningBookmark } from './bookmark.service';

vi.mock('./bookmark.service', () => ({
  getLearningBookmark: vi.fn(),
  setLearningBookmark: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getLearningBookmark).mockResolvedValue(false);
  vi.mocked(setLearningBookmark).mockResolvedValue(undefined);
});

describe('ClinicalGuideView', () => {
  it('lets a signed-in learner bookmark an offline guide', async () => {
    const guide = offlineGuides[0];
    render(<ClinicalGuideView guide={guide} onBack={() => undefined} />);
    fireEvent.click(await screen.findByRole('button', { name: /save guide/i }));
    expect(setLearningBookmark).toHaveBeenCalledWith(guide.id, true);
    expect(await screen.findByText(/added to your learning bookmarks/i)).toBeInTheDocument();
  });

  it('renders source-linked guide content and reveals a quiz explanation', () => {
    const guide = offlineGuides[0];
    render(<ClinicalGuideView guide={guide} onBack={() => undefined} />);
    expect(screen.getAllByRole('heading', { name: guide.title }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('heading', { name: /focused history/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/differential framework/i).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('heading', { name: /management principles/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /open source/i }).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: guide.questions[0].options[guide.questions[0].answerIndex] }));
    expect(screen.getByText(/correct\./i)).toBeInTheDocument();
    expect(screen.getByText(guide.questions[0].explanation)).toBeInTheDocument();
  });
});
