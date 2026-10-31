import { describe, expect, it } from 'vitest';
import { createInitialClerkingDraft } from './clerking.types';
import { formatClerkingNote } from './noteFormatter';

describe('clerking note formatter', () => {
  it('keeps unanswered review-of-systems items as not elicited, not negative', () => {
    const draft = createInitialClerkingDraft();
    const note = formatClerkingNote(draft);

    expect(note).toContain('REVIEW OF SYSTEMS');
    expect(note).toContain('Not elicited: General / constitutional');
    expect(note).not.toContain('Negative: General / constitutional');
    expect(note).toContain('PATIENT CLERKING NOTE — SYNTHETIC CASE');
  });

  it('formats the history framework separately for each presenting complaint', () => {
    const draft = createInitialClerkingDraft();
    draft.complaints[0] = {
      ...draft.complaints[0],
      symptom: 'Abdominal pain',
      duration: '2 days',
      course: 'Gradual onset and progressive',
      causeContext: 'No known precipitating factor elicited',
      complications: 'Vomiting reported',
      careReceived: 'Analgesia received at a clinic',
    };
    draft.complaints.push({
      ...draft.complaints[0],
      id: 'complaint-second',
      symptom: 'Fever',
      duration: '1 day',
      course: 'Intermittent',
      causeContext: '',
      complications: '',
      careReceived: '',
    });

    const note = formatClerkingNote(draft);
    expect(note).toContain('1. Abdominal pain — 2 days');
    expect(note).toContain('2. Fever — 1 day');
    expect(note).toContain('Course: Gradual onset and progressive');
    expect(note).toContain('Course: Intermittent');
    expect(note).toContain('Cause / context: Not elicited');
  });

  it('begins the biodata with an I present statement using only supplied details', () => {
    const draft = createInitialClerkingDraft();
    draft.biodata.age = '8 years';
    draft.biodata.sex = 'male';
    draft.biodata.residenceContext = 'Anambra State';
    draft.complaints[0] = { ...draft.complaints[0], symptom: 'Abdominal pain', duration: '2 days' };

    const note = formatClerkingNote(draft);
    expect(note).toContain('I present a male patient aged 8 years from Anambra State presenting with Abdominal pain (2 days).');
    expect(note).toContain('Place of origin / residence context: Anambra State');
  });

  it('does not invent age, sex, origin or a presenting complaint', () => {
    const note = formatClerkingNote(createInitialClerkingDraft());
    expect(note).toContain('I present a patient for clinical assessment.');
    expect(note).not.toContain('I present a male patient');
    expect(note).not.toContain('from Anambra State');
  });

  it('does not fabricate examination or investigation results', () => {
    const note = formatClerkingNote(createInitialClerkingDraft());
    expect(note).toContain('Status: Not assessed');
    expect(note).toContain('No investigation results entered.');
    expect(note).toContain('Opposing features / uncertainties: Not elicited');
  });
});
