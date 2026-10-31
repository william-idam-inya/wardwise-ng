import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ClerkingWorkspace } from './ClerkingWorkspace';
import { createInitialClerkingDraft } from './clerking.types';
import { requestNextClerkingQuestion } from './clinicalAssistant.service';

vi.mock('./clinicalAssistant.service', () => ({
  requestNextClerkingQuestion: vi.fn(),
}));

function renderClerking() {
  const draft = createInitialClerkingDraft();
  return render(
    <ClerkingWorkspace
      draft={draft}
      onDraftChange={vi.fn()}
      onNavigate={vi.fn()}
      onStartNew={vi.fn()}
      userId="test-user"
      currentCaseId={null}
      onCaseSaved={vi.fn()}
      currentStage={0}
      onCurrentStageChange={vi.fn()}
    />,
  );
}

beforeEach(() => { vi.clearAllMocks(); });

describe('guided clerking workspace', () => {
  it('starts with case setup and navigates one stage at a time', () => {
    renderClerking();
    expect(screen.getByRole('heading', { name: /ai guided clinical clerking/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /case setup/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /next stage/i }));
    expect(screen.getByRole('heading', { name: /biodata/i })).toBeInTheDocument();
  });

  it('provides a distinct review-of-systems stage', () => {
    renderClerking();
    fireEvent.click(screen.getAllByRole('button', { name: /review of systems/i })[0]);
    expect(screen.getByRole('heading', { name: /review of systems/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/cardiovascular status/i)).toHaveValue('Not elicited');
  });

  it('requests one focused next question and displays its purpose', async () => {
    vi.mocked(requestNextClerkingQuestion).mockResolvedValue({
      assistant_message: 'When did the symptom first begin?',
      question_purpose: 'Establish the onset and chronology.',
      input_type: 'text',
      required: true,
      missing_information: ['Onset'],
      safety_flags: [],
      model: 'gemini-3.8-flash',
    });
    renderClerking();
    fireEvent.click(screen.getAllByRole('button', { name: /biodata/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: /ask for next question/i }));

    expect(await screen.findByRole('heading', { name: /when did the symptom first begin/i })).toBeInTheDocument();
    expect(screen.getByText(/establish the onset and chronology/i)).toBeInTheDocument();
    expect(screen.getByText(/ai-generated educational prompt/i)).toBeInTheDocument();
  });

  it('shows the generated note preview and review action', () => {
    renderClerking();
    fireEvent.click(screen.getAllByRole('button', { name: /review note/i })[0]);
    expect(screen.getByText(/PATIENT CLERKING NOTE — SYNTHETIC CASE/)).toBeInTheDocument();
    expect(screen.getByText(/unsaved changes are held in memory/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mark note reviewed/i })).toBeInTheDocument();
  });
});
