import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { VirtualPatientSimulation } from './VirtualPatientSimulation';
import { listSimulationSessions, loadSimulationSession, saveSimulationSession } from './simulation.service';

vi.mock('./simulation.service', () => ({
  listSimulationSessions: vi.fn(),
  loadSimulationSession: vi.fn(),
  saveSimulationSession: vi.fn(),
}));

afterEach(() => cleanup());

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(listSimulationSessions).mockResolvedValue([]);
  vi.mocked(loadSimulationSession).mockRejectedValue(new Error('No saved session'));
  vi.mocked(saveSimulationSession).mockResolvedValue({
    id: 'session-1',
    scenario_id: 'adult-abdominal-pain',
    assessment: {coveredDomainIds: ['chronology'], missedDomainIds: [], rubricVersion: 'formative-v1', completedAt: '2026-10-31T08:00:00.000Z'},
    score: null,
    created_at: '2026-10-31T08:00:00.000Z',
  });
});

describe('Virtual Patient Simulation', () => {
  it('labels the case as fictional and hides the teaching impression before interview completion', () => {
    render(<VirtualPatientSimulation onBack={() => undefined}/>);
    expect(screen.getByText(/SIMULATION — NOT A REAL PATIENT/i)).toBeInTheDocument();
    expect(screen.queryByText(/acute appendicitis is a leading consideration/i)).not.toBeInTheDocument();
  });

  it('reveals examiner feedback after the learner finishes and saves the debrief', async () => {
    render(<VirtualPatientSimulation onBack={() => undefined}/>);
    fireEvent.change(screen.getByLabelText(/ask the patient a question/i), {target:{value:'When did the pain start?'}});
    fireEvent.click(screen.getByRole('button',{name:/^ask$/i}));
    expect(screen.getByText(/18 hours ago/i)).toBeInTheDocument();
    expect(screen.queryByRole('heading',{name:/interview debrief/i})).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:/finish interview/i}));
    expect(screen.getByRole('heading',{name:/interview debrief/i})).toBeInTheDocument();
    expect(screen.getByText(/acute appendicitis is a leading consideration/i)).toBeInTheDocument();
    expect(saveSimulationSession).toHaveBeenCalled();
    expect(await screen.findByText(/saved to your private WardWise account/i)).toBeInTheDocument();
  });

  it('shows an honest error and keeps the interview when saving is unavailable', async () => {
    vi.mocked(saveSimulationSession).mockRejectedValue(new Error('WardWise database is not configured.'));
    render(<VirtualPatientSimulation onBack={() => undefined}/>);
    fireEvent.change(screen.getByLabelText(/ask the patient a question/i), {target:{value:'When did the pain start?'}});
    fireEvent.click(screen.getByRole('button',{name:/^ask$/i}));
    fireEvent.click(screen.getByRole('button',{name:/finish interview/i}));
    expect(await screen.findByText(/WardWise database is not configured/i)).toBeInTheDocument();
    expect(screen.getByText(/18 hours ago/i)).toBeInTheDocument();
  });

  it('loads the learner account simulation history', async () => {
    vi.mocked(listSimulationSessions).mockResolvedValue([{
      id: 'session-1',
      scenario_id: 'adult-abdominal-pain',
      assessment: {coveredDomainIds: ['chronology'], missedDomainIds: [], rubricVersion: 'formative-v1', completedAt: '2026-10-31T08:00:00.000Z'},
      score: null,
      created_at: '2026-10-31T08:00:00.000Z',
    }]);
    render(<VirtualPatientSimulation onBack={() => undefined}/>);
    fireEvent.click(screen.getByRole('button',{name:/^saved history$/i}));
    expect(await screen.findByText(/Adult with abdominal pain/i)).toBeInTheDocument();
  });
});
