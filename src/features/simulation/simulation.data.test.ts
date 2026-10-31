import { describe, expect, it } from 'vitest';
import { answerVirtualPatientQuestion, virtualPatientScenarios } from './simulation.data';

describe('scripted virtual patient scenarios', () => {
  it('provides examination, differential and reasoning points for each examiner rubric', () => {
    for (const scenario of virtualPatientScenarios) {
      expect(scenario.examinerRubric.examinationPoints.length).toBeGreaterThan(0);
      expect(scenario.examinerRubric.differentialConsiderations.length).toBeGreaterThan(0);
      expect(scenario.examinerRubric.reasoningPoints.length).toBeGreaterThan(0);
    }
  });

  it('answers a chronology question from supplied scenario facts', () => {
    const answer = answerVirtualPatientQuestion(virtualPatientScenarios[0], 'When did the pain start?');
    expect(answer.domain).toBe('chronology');
    expect(answer.response).toMatch(/18 hours ago/i);
  });
  it('does not invent a response for an unlisted detail', () => {
    const answer = answerVirtualPatientQuestion(virtualPatientScenarios[0], 'What was the exact birth weight?');
    expect(answer.domain).toBeNull();
    expect(answer.response).toMatch(/will not invent information/i);
  });
  it('returns examination details only when requested', () => {
    const scenario = virtualPatientScenarios[0];
    expect(answerVirtualPatientQuestion(scenario, 'Please examine the abdomen').response).toContain('SIMULATED EXAMINATION FINDINGS');
  });
});
