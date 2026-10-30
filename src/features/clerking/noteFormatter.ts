import type { ClerkingDraft, PresentingComplaint, RosEntry } from './clerking.types';

function field(value: string): string {
  return value.trim() || 'Not elicited';
}

function complaintBlock(complaint: PresentingComplaint, index: number): string {
  const title = complaint.symptom.trim() || 'Presenting complaint ' + (index + 1);
  return [
    (index + 1) + '. ' + title + (complaint.duration.trim() ? ' — ' + complaint.duration.trim() : ''),
    '   Course: ' + field(complaint.course),
    '   Cause / context: ' + field(complaint.causeContext),
    '   Complications: ' + field(complaint.complications),
    '   Care received: ' + field(complaint.careReceived),
    '   Symptom-specific details: ' + field(complaint.symptomSpecific),
    '   Associated symptoms: ' + field(complaint.associatedSymptoms),
  ].join('\n');
}

function rosBlock(entries: RosEntry[]): string {
  const positive: string[] = [];
  const negative: string[] = [];
  const notElicited: string[] = [];
  const notApplicable: string[] = [];

  for (const entry of entries) {
    const details = entry.details.trim();
    const value = details ? entry.system + ': ' + details : entry.system;
    if (entry.status === 'Positive') positive.push(value);
    else if (entry.status === 'Negative') negative.push(value);
    else if (entry.status === 'Not applicable') notApplicable.push(entry.system);
    else notElicited.push(entry.system);
  }

  const lines = [
    positive.length ? 'Positive: ' + positive.join('; ') : '',
    negative.length ? 'Negative: ' + negative.join('; ') : '',
    notElicited.length ? 'Not elicited: ' + notElicited.join('; ') : '',
    notApplicable.length ? 'Not applicable: ' + notApplicable.join('; ') : '',
  ].filter(Boolean);
  return lines.length ? lines.join('\n') : 'Not elicited';
}

function investigationBlock(draft: ClerkingDraft): string {
  const entries = draft.investigations.filter((item) =>
    [item.test, item.result, item.unit, item.referenceInterval, item.dateTime, item.interpretation].some((value) => value.trim()),
  );
  if (!entries.length) return 'No investigation results entered.';
  return entries.map((item, index) => {
    const result = item.result.trim() ? item.result.trim() + (item.unit.trim() ? ' ' + item.unit.trim() : '') : 'Result not provided';
    return [
      (index + 1) + '. ' + field(item.test),
      '   Result: ' + result,
      '   Reference interval: ' + field(item.referenceInterval),
      '   Date / time: ' + field(item.dateTime),
      '   Interpretation: ' + field(item.interpretation),
    ].join('\n');
  }).join('\n');
}

export function formatClerkingNote(draft: ClerkingDraft): string {
  const complaints = draft.complaints.length ? draft.complaints.map(complaintBlock).join('\n\n') : 'Not elicited';
  const biodata = [
    'Age: ' + field(draft.biodata.age),
    'Sex: ' + (draft.biodata.sex === 'not_recorded' ? 'Not recorded' : draft.biodata.sex),
    'Occupation / schooling: ' + field(draft.biodata.occupation),
    'Residence context: ' + field(draft.biodata.residenceContext),
    'Source of history: ' + field(draft.biodata.source),
    'Reliability: ' + field(draft.biodata.reliability),
  ].join('\n');

  return [
    'PATIENT CLERKING NOTE — ' + (draft.caseCategory === 'synthetic' ? 'SYNTHETIC CASE' : 'DE-IDENTIFIED CASE'),
    'Case label: ' + field(draft.caseLabel),
    'Specialty: ' + field(draft.specialty),
    'Clinical setting: ' + field(draft.setting),
    '',
    'BIODATA',
    'I present a patient for clinical assessment. Age and other biodata are recorded below.' ,
    biodata,
    '',
    'PRESENTING COMPLAINTS AND HISTORY OF PRESENTING COMPLAINT',
    complaints,
    '',
    'REVIEW OF SYSTEMS',
    rosBlock(draft.ros),
    '',
    'PAST MEDICAL AND SURGICAL HISTORY',
    'Medical: ' + field(draft.pastHistory.medical),
    'Surgical: ' + field(draft.pastHistory.surgical),
    'Previous admissions: ' + field(draft.pastHistory.admissions),
    'Blood transfusion: ' + field(draft.pastHistory.transfusion),
    'Medications: ' + field(draft.pastHistory.medications),
    'Allergies: ' + field(draft.pastHistory.allergies),
    'Immunisation: ' + field(draft.pastHistory.immunisation),
    'Obstetric / gynaecological history: ' + field(draft.pastHistory.obstetricGynaecological),
    'Developmental history: ' + field(draft.pastHistory.developmental),
    '',
    'FAMILY AND SOCIAL HISTORY',
    'Family history: ' + field(draft.familySocial.family),
    'Occupation / schooling: ' + field(draft.familySocial.occupationSchooling),
    'Living circumstances: ' + field(draft.familySocial.livingCircumstances),
    'Diet: ' + field(draft.familySocial.diet),
    'Substance / environmental exposure: ' + field(draft.familySocial.substanceExposure),
    'Functional status: ' + field(draft.familySocial.functionalStatus),
    '',
    'EXAMINATION',
    'Status: ' + draft.examination.status,
    'General examination: ' + field(draft.examination.general),
    'Vital signs: BP ' + field(draft.examination.bloodPressure) + '; Pulse ' + field(draft.examination.pulse) +
      '; RR ' + field(draft.examination.respiratoryRate) + '; Temperature ' + field(draft.examination.temperature) +
      '; SpO2 ' + field(draft.examination.oxygenSaturation),
    'System findings: ' + field(draft.examination.systemFindings),
    '',
    'INVESTIGATIONS',
    investigationBlock(draft),
    '',
    'ASSESSMENT',
    'Summary / problem representation: ' + field(draft.assessment.summary),
    'Leading diagnosis (working): ' + field(draft.assessment.leadingDiagnosis),
    'Differential diagnoses: ' + field(draft.assessment.differentials),
    'Supporting features: ' + field(draft.assessment.supportingFeatures),
    'Opposing features / uncertainties: ' + field(draft.assessment.opposingFeatures),
    '',
    'PLAN — EDUCATIONAL DISCUSSION',
    'Further investigations: ' + field(draft.plan.furtherInvestigations),
    'Management considerations: ' + field(draft.plan.managementConsiderations),
    'Red flags: ' + field(draft.plan.redFlags),
    'Senior review / escalation triggers: ' + field(draft.plan.escalationTriggers),
    '',
    'Documentation note: Items labelled “Not elicited” were not supplied or recorded in this draft. They must not be interpreted as normal findings.',
    'Educational use only. Verify clinical decisions with a qualified supervisor and current local protocols.',
  ].join('\n');
}
