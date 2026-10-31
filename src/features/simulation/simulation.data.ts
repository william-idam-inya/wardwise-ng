export type SimulationRoute = {
  keywords: string[];
  domain: string;
  domainLabel: string;
  response: string;
};

export type SimulationAnswer = {
  response: string;
  domain: string | null;
  domainLabel: string | null;
};

export type VirtualPatientScenario = {
  id: string;
  label: string;
  setting: string;
  age: string;
  sex: string;
  opening: string;
  presentingSummary: string;
  routes: SimulationRoute[];
  examination: string;
  investigations: string;
  requiredDomains: Array<{ id: string; label: string }>;
  examinerRubric: {
    examinationPoints: string[];
    differentialConsiderations: string[];
    reasoningPoints: string[];
  };
  teachingDiagnosis: string;
  examinerNote: string;
};

export const virtualPatientScenarios: VirtualPatientScenario[] = [
  {
    id: 'adult-abdominal-pain',
    label: 'Adult with abdominal pain',
    setting: 'Emergency assessment area',
    age: '19 years',
    sex: 'Male',
    opening: 'Doctor, I have had pain in my tummy since yesterday.',
    presentingSummary: 'A young adult presents with abdominal pain.',
    routes: [
      { keywords: ['when', 'start', 'started', 'begin', 'began', 'how long', 'duration'], domain: 'chronology', domainLabel: 'Onset and chronology', response: 'It started about 18 hours ago. At first it was around my belly button.' },
      { keywords: ['where', 'site', 'location', 'move', 'moved', 'shift', 'travel', 'radiat'], domain: 'pain-site', domainLabel: 'Site and migration', response: 'It began around my belly button and later moved to the lower right side of my abdomen.' },
      { keywords: ['character', 'kind of pain', 'feel like', 'sharp', 'dull', 'cramp'], domain: 'pain-character', domainLabel: 'Character of pain', response: 'It feels sharp and has become more constant.' },
      { keywords: ['worse', 'aggravate', 'relieve', 'better', 'cough', 'walk', 'movement'], domain: 'pain-modifier', domainLabel: 'Aggravating and relieving factors', response: 'Walking, coughing and moving make it worse. Lying still helps a little.' },
      { keywords: ['severity', 'score', 'scale', 'pain out of', 'intensity'], domain: 'pain-severity', domainLabel: 'Severity of pain', response: 'I would rate it about 7 out of 10 now.' },
      { keywords: ['vomit', 'nausea', 'fever', 'temperature', 'stool', 'bowel', 'diarrh', 'constipat', 'urine', 'urinary', 'burn', 'dysuria', 'testicle', 'appetite'], domain: 'associated-symptoms', domainLabel: 'Associated symptoms', response: 'I have felt nauseated and vomited once. I have not had diarrhoea or urinary pain. I have not noticed blood in my urine or stool.' },
      { keywords: ['previous', 'past medical', 'medical history', 'operation', 'surgery', 'admission', 'illness'], domain: 'past-history', domainLabel: 'Past history', response: 'I have not had a major illness or abdominal operation before.' },
      { keywords: ['drug', 'medication', 'medicine', 'tablet', 'allerg'], domain: 'medications-allergies', domainLabel: 'Medicines and allergies', response: 'I have not taken any regular medicines. I do not know of any drug allergies.' },
      { keywords: ['family history', 'hereditary'], domain: 'family-social', domainLabel: 'Family history', response: 'There is no similar illness that I know of in my family.' },
      { keywords: ['alcohol', 'smoke', 'smoking', 'social history', 'occupation', 'work', 'school'], domain: 'family-social', domainLabel: 'Social history', response: 'I am a student. I do not smoke and I do not drink alcohol.' },
    ],
    examination: 'SIMULATED EXAMINATION FINDINGS: He appears uncomfortable but is alert. Temperature 37.8 °C, pulse 102 beats/min and blood pressure 116/72 mmHg. The abdomen is soft with right lower quadrant tenderness and localised guarding. No generalised rigidity is described. These are scenario findings, not findings from a real patient.',
    investigations: 'SIMULATED RESULTS: Full blood count shows a raised white cell count. CRP is mildly raised. Urinalysis does not show nitrites or blood. No imaging result is supplied in this scenario. Do not assume an unlisted result.',
    requiredDomains: [
      { id: 'chronology', label: 'Onset and chronology' },
      { id: 'pain-site', label: 'Site and migration' },
      { id: 'pain-character', label: 'Character of pain' },
      { id: 'pain-modifier', label: 'Aggravating / relieving factors' },
      { id: 'associated-symptoms', label: 'Associated symptoms' },
      { id: 'past-history', label: 'Past history' },
      { id: 'medications-allergies', label: 'Medicines and allergies' },
      { id: 'examination', label: 'Request examination findings' },
      { id: 'investigations', label: 'Request investigation results' },
    ],
    examinerRubric: {
      examinationPoints: [
        'Review general condition and vital signs, including pulse and temperature.',
        'Assess the abdomen systematically and document the exact site of tenderness and any guarding or peritoneal signs.',
        'Consider examination of hernial orifices and genitalia when clinically appropriate, with consent and a chaperone as required.',
        'Request senior review if peritoneal signs or physiological deterioration are present.',
      ],
      differentialConsiderations: [
        'Acute appendicitis.',
        'Gastroenteritis or another infective/inflammatory abdominal condition.',
        'Urinary tract pathology, including ureteric colic or UTI.',
        'Testicular torsion in a male with lower abdominal pain, especially if genital symptoms are present.',
      ],
      reasoningPoints: [
        'Migration from the periumbilical region to the right lower quadrant is an important historical feature.',
        'Localised right lower quadrant tenderness and guarding support an inflammatory process but do not prove appendicitis.',
        'Raised white cell count and CRP are supportive but non-specific; they do not confirm the diagnosis.',
        'No imaging result is supplied in this scenario, so do not state that imaging confirms the diagnosis.',
        'The absence of described generalised rigidity does not exclude early or evolving disease.',
      ],
    },
    teachingDiagnosis: 'Scenario teaching impression: acute appendicitis is a leading consideration from the supplied pattern. This is not a real diagnosis and would require clinical assessment and appropriate investigations.',
    examinerNote: 'The scenario rewards clarification of migration, chronology, character, aggravating factors, associated symptoms and relevant past history. Ask for examination and investigations explicitly; do not infer unprovided findings.',
  },
  {
    id: 'child-fever-urinary',
    label: 'Child with fever and urinary symptoms',
    setting: 'Paediatric assessment unit',
    age: '5 years',
    sex: 'Female',
    opening: 'My daughter has had fever and says it hurts when she passes urine.',
    presentingSummary: 'A child is brought by a caregiver because of fever and urinary discomfort.',
    routes: [
      { keywords: ['when', 'start', 'started', 'begin', 'began', 'how long', 'duration'], domain: 'chronology', domainLabel: 'Onset and duration', response: 'The fever started about two days ago. She started complaining about pain when passing urine yesterday.' },
      { keywords: ['urine', 'urinary', 'pass urine', 'wee', 'dysuria', 'burn', 'frequency', 'frequent', 'bedwet', 'blood', 'cloudy', 'smell', 'odour', 'odor'], domain: 'urinary-symptoms', domainLabel: 'Urinary symptoms', response: 'She says it burns when she passes urine and she has been going more often than usual. I have not noticed blood in the urine.' },
      { keywords: ['fever', 'temperature', 'shiver', 'rigor', 'hot', 'cold'], domain: 'fever', domainLabel: 'Fever and systemic symptoms', response: 'She has felt hot, especially at night. I have not measured the temperature at home.' },
      { keywords: ['vomit', 'drink', 'fluid', 'feed', 'appetite', 'eat', 'activity', 'play'], domain: 'systemic-symptoms', domainLabel: 'Feeding, vomiting and activity', response: 'She is eating less than usual but is still drinking. She vomited once this morning and is less playful.' },
      { keywords: ['abdominal', 'tummy', 'stomach', 'loin', 'back', 'suprapubic', 'pain'], domain: 'pain', domainLabel: 'Abdominal or loin symptoms', response: 'She points to the lower part of her tummy when asked where it hurts. She has not complained of back or side pain.' },
      { keywords: ['previous', 'past', 'history', 'uti', 'infection', 'admission', 'hospital'], domain: 'past-history', domainLabel: 'Previous UTI and history', response: 'She has not had a confirmed urine infection before, and she has not been admitted to hospital.' },
      { keywords: ['drug', 'medicine', 'medication', 'antibiotic', 'allerg'], domain: 'medications-allergies', domainLabel: 'Medicines and allergies', response: 'She has not received an antibiotic for this illness. The caregiver is not aware of any medicine allergy.' },
      { keywords: ['family', 'social', 'birth', 'antenatal', 'delivery', 'development'], domain: 'background', domainLabel: 'Relevant background history', response: 'She was born at term according to her caregiver and has been growing well.' },
    ],
    examination: 'SIMULATED EXAMINATION FINDINGS: The child is awake and responds to the caregiver. Temperature 38.2 °C, pulse 118 beats/min and capillary refill about 2 seconds. Mild suprapubic tenderness is present. No loin tenderness is described. These are scenario findings, not findings from a real child.',
    investigations: 'SIMULATED URINE DIPSTICK: leukocyte esterase positive and nitrite positive. Urine culture has been sent and is pending. No microscopy result is supplied. Do not assume the culture result.',
    requiredDomains: [
      { id: 'chronology', label: 'Onset and duration' },
      { id: 'urinary-symptoms', label: 'Urinary symptoms' },
      { id: 'fever', label: 'Fever' },
      { id: 'systemic-symptoms', label: 'Feeding, vomiting and activity' },
      { id: 'pain', label: 'Abdominal or loin symptoms' },
      { id: 'past-history', label: 'Previous UTI and history' },
      { id: 'medications-allergies', label: 'Medicines and allergies' },
      { id: 'examination', label: 'Request examination findings' },
      { id: 'investigations', label: 'Request investigation results' },
    ],
    examinerRubric: {
      examinationPoints: [
        'Assess the child’s general appearance, activity, hydration, perfusion and age-appropriate vital signs.',
        'Examine the abdomen for suprapubic tenderness, palpable bladder or mass where appropriate.',
        'Assess for loin tenderness and look for alternative sources of fever.',
        'Record the child’s weight and relevant clinical observations when required by the local pathway.',
      ],
      differentialConsiderations: [
        'Lower urinary tract infection (cystitis).',
        'Upper urinary tract infection (pyelonephritis), particularly when systemic features or loin symptoms are present.',
        'Vulvovaginitis or local irritation as an alternative explanation for dysuria.',
        'Other sources of fever, including respiratory or gastrointestinal infection.',
        'Constipation or dysfunctional voiding as relevant contributors to recurrent urinary symptoms.',
      ],
      reasoningPoints: [
        'Dysuria, frequency and fever increase the likelihood of UTI when considered together.',
        'Both leukocyte esterase and nitrite are positive in this scenario; the interpretation should follow the applicable age-specific guideline.',
        'The culture is pending: distinguish a clinically supported working diagnosis from a culture-confirmed result.',
        'The dipstick alone does not establish the level of infection or exclude every alternative source of illness.',
        'A child who is seriously unwell or deteriorating requires prompt senior assessment.',
      ],
    },
    teachingDiagnosis: 'Scenario teaching impression: suspected urinary tract infection. The scenario includes a positive urine dipstick, but the culture is pending. Do not convert this into a confirmed diagnosis.',
    examinerNote: 'The scenario rewards urinary symptom clarification, fever chronology, hydration and systemic features, abdominal/loin symptoms, previous UTI, medication history and requests for examination and urine results. Keep the distinction between suspected infection and pending culture.',
  },
];

export function answerVirtualPatientQuestion(scenario: VirtualPatientScenario, question: string): SimulationAnswer {
  const normalised = question.trim().toLowerCase();
  if (!normalised) return { response: 'Please ask a question about the patient.', domain: null, domainLabel: null };

  if (['examination', 'examine', 'look at', 'palpate', 'vital signs'].some((word) => normalised.includes(word))) {
    return { response: scenario.examination, domain: 'examination', domainLabel: 'Request examination findings' };
  }

  if (['investigation', 'blood test', 'urine test', 'dipstick', 'scan', 'ultrasound', 'imaging', 'results'].some((word) => normalised.includes(word))) {
    return { response: scenario.investigations, domain: 'investigations', domainLabel: 'Request investigation results' };
  }

  const route = scenario.routes.find((item) => item.keywords.some((word) => normalised.includes(word)));
  if (route) return { response: route.response, domain: route.domain, domainLabel: route.domainLabel };

  return {
    response: 'I am not sure about that detail. You can ask about the symptom, its timing and pattern, associated symptoms, past history, medicines and allergies, examination or investigations. I will not invent information that is not in this scenario.',
    domain: null,
    domainLabel: null,
  };
}
