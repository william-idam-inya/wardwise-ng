import { beforeEach, describe, expect, it, vi } from 'vitest';
import { requestNextClerkingQuestion } from './clinicalAssistant.service';

const { invoke } = vi.hoisted(() => ({ invoke: vi.fn() }));
vi.mock('../../lib/supabase/client', () => ({
  supabase: { functions: { invoke } },
}));

beforeEach(() => { vi.clearAllMocks(); });

describe('clinical assistant service', () => {
  it('calls the authenticated Edge Function with one stage context', async () => {
    invoke.mockResolvedValue({
      data: {
        assistant_message: 'When did the abdominal pain begin?',
        question_purpose: 'Establish the onset and chronology of the symptom.',
        input_type: 'text',
        required: true,
        missing_information: ['Onset'],
        safety_flags: [],
        model: 'gemini-3.8-flash',
      },
      error: null,
    });

    const response = await requestNextClerkingQuestion({
      stage: 3,
      stageTitle: 'History of each complaint',
      caseCategory: 'synthetic',
      specialty: 'Paediatric Surgery',
      setting: 'Teaching hospital',
      clinicalContext: { symptom: 'Abdominal pain', duration: '2 days' },
    });

    expect(invoke).toHaveBeenCalledWith('clinical-assistant', {
      body: {
        operation: 'next_question',
        stage: 3,
        stageTitle: 'History of each complaint',
        caseCategory: 'synthetic',
        specialty: 'Paediatric Surgery',
        setting: 'Teaching hospital',
        clinicalContext: { symptom: 'Abdominal pain', duration: '2 days' },
      },
    });
    expect(response.assistant_message).toBe('When did the abdominal pain begin?');
  });

  it('rejects an incomplete model response', async () => {
    invoke.mockResolvedValue({
      data: { assistant_message: 'When did it begin?' },
      error: null,
    });

    await expect(requestNextClerkingQuestion({
      stage: 3,
      stageTitle: 'History of each complaint',
      caseCategory: 'synthetic',
      specialty: 'General Surgery',
      setting: 'Ward',
      clinicalContext: {},
    })).rejects.toThrow(/failed validation/i);
  });

  it('shows an Edge Function error message without losing the entered draft', async () => {
    const errorResponse = new Response(JSON.stringify({ error: 'The model quota is currently unavailable.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
    invoke.mockResolvedValue({ data: null, error: { message: 'Edge Function returned 429', context: errorResponse } });

    await expect(requestNextClerkingQuestion({
      stage: 3,
      stageTitle: 'History of each complaint',
      caseCategory: 'synthetic',
      specialty: 'General Surgery',
      setting: 'Ward',
      clinicalContext: { symptom: 'Abdominal pain' },
    })).rejects.toThrow(/model quota is currently unavailable/i);
  });
});
