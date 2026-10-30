export type SexAtPresentation = 'female' | 'male' | 'intersex' | 'not_recorded';
export type RosStatus = 'Positive' | 'Negative' | 'Not elicited' | 'Not applicable';

export type PresentingComplaint = {
  id: string;
  symptom: string;
  duration: string;
  course: string;
  causeContext: string;
  complications: string;
  careReceived: string;
  associatedSymptoms: string;
  symptomSpecific: string;
};

export type RosEntry = { system: string; status: RosStatus; details: string; reviewed: boolean };
export type Investigation = {
  id: string;
  test: string;
  result: string;
  unit: string;
  referenceInterval: string;
  dateTime: string;
  interpretation: string;
};

export type ClerkingDraft = {
  caseLabel: string;
  specialty: string;
  setting: string;
  biodata: {
    age: string;
    sex: SexAtPresentation;
    occupation: string;
    residenceContext: string;
    source: string;
    reliability: string;
  };
  complaints: PresentingComplaint[];
  ros: RosEntry[];
  pastHistory: {
    medical: string;
    surgical: string;
    admissions: string;
    transfusion: string;
    medications: string;
    allergies: string;
    immunisation: string;
    obstetricGynaecological: string;
    developmental: string;
  };
  familySocial: {
    family: string;
    occupationSchooling: string;
    livingCircumstances: string;
    diet: string;
    substanceExposure: string;
    functionalStatus: string;
  };
  examination: {
    status: 'Performed' | 'Not performed' | 'Not assessed';
    general: string;
    bloodPressure: string;
    pulse: string;
    respiratoryRate: string;
    temperature: string;
    oxygenSaturation: string;
    systemFindings: string;
  };
  investigations: Investigation[];
  assessment: {
    summary: string;
    leadingDiagnosis: string;
    differentials: string;
    supportingFeatures: string;
    opposingFeatures: string;
  };
  plan: {
    furtherInvestigations: string;
    managementConsiderations: string;
    redFlags: string;
    escalationTriggers: string;
  };
};

export const ROS_SYSTEMS = [
  'General / constitutional',
  'Cardiovascular',
  'Respiratory',
  'Gastrointestinal',
  'Genitourinary',
  'Musculoskeletal',
  'Nervous system',
  'Endocrine',
  'Haematological',
  'Skin',
  'Psychiatric',
] as const;

export function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return prefix + '-' + crypto.randomUUID();
  return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
}

export function createEmptyComplaint(): PresentingComplaint {
  return {
    id: createId('complaint'),
    symptom: '',
    duration: '',
    course: '',
    causeContext: '',
    complications: '',
    careReceived: '',
    associatedSymptoms: '',
    symptomSpecific: '',
  };
}

export function createInitialClerkingDraft(): ClerkingDraft {
  return {
    caseLabel: '',
    specialty: 'General',
    setting: 'Teaching hospital',
    biodata: { age: '', sex: 'not_recorded', occupation: '', residenceContext: '', source: '', reliability: '' },
    complaints: [createEmptyComplaint()],
    ros: ROS_SYSTEMS.map((system): RosEntry => ({ system, status: 'Not elicited', details: '', reviewed: false })),
    pastHistory: {
      medical: '', surgical: '', admissions: '', transfusion: '', medications: '',
      allergies: '', immunisation: '', obstetricGynaecological: '', developmental: '',
    },
    familySocial: {
      family: '', occupationSchooling: '', livingCircumstances: '', diet: '',
      substanceExposure: '', functionalStatus: '',
    },
    examination: {
      status: 'Not assessed', general: '', bloodPressure: '', pulse: '',
      respiratoryRate: '', temperature: '', oxygenSaturation: '', systemFindings: '',
    },
    investigations: [],
    assessment: { summary: '', leadingDiagnosis: '', differentials: '', supportingFeatures: '', opposingFeatures: '' },
    plan: { furtherInvestigations: '', managementConsiderations: '', redFlags: '', escalationTriggers: '' },
  };
}
