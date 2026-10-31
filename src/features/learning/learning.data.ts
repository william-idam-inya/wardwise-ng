export type LearningQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type DifferentialConsideration = {
  diagnosisGroup: string;
  featuresToExplore: string[];
  caution: string;
};

export type ClinicalLearningGuide = {
  id: string;
  title: string;
  discipline: string;
  subtitle: string;
  summary: string;
  learningObjectives: string[];
  historyPrompts: string[];
  examinationPrompts: string[];
  investigationsToConsider: string[];
  differentialFrameworks: DifferentialConsideration[];
  managementPrinciples: string[];
  escalationFeatures: string[];
  keyPoints: string[];
  questions: LearningQuestion[];
  aliases: string[];
  sources: Array<{ label: string; url: string; detail: string }>;
  reviewedOn: string;
  educationalNote: string;
};

export const offlineGuides: ClinicalLearningGuide[] = [
  {
    id: 'jaundice-assessment',
    title: 'Approach to a patient with jaundice',
    discipline: 'Medicine · Hepatology',
    subtitle: 'History, examination and initial evaluation',
    summary: 'Jaundice is yellow discoloration of the sclerae, skin and mucous membranes due to hyperbilirubinaemia. Establish the chronology, associated symptoms, relevant exposures and features suggesting hepatic dysfunction or biliary disease.',
    learningObjectives: [
      'Establish the onset and duration of jaundice and whether dark urine appeared earlier.',
      'Explore stool colour, pruritus, steatorrhoea, abdominal pain, fever and systemic symptoms.',
      'Identify history that may suggest haemolysis, hepatocellular disease or cholestasis.',
      'Recognise red flags and choose initial investigations according to the clinical context.',
    ],
    historyPrompts: [
      'Onset, duration and course of yellow discoloration: progressive, intermittent or recurrent.',
      'Dark urine and its timing relative to jaundice; pale or clay-coloured stools.',
      'Pruritus, steatorrhoea, fever, malaise, myalgia, nausea and vomiting.',
      'Abdominal pain: site, onset, character, severity, duration, radiation and associated symptoms.',
      'Weight loss, anorexia, easy bruising, bleeding, melaena or haematemesis.',
      'Past hepatobiliary disease, gallstones, hepatitis, haemolytic disorders and biliary surgery.',
      'Medication, herbal preparations, alcohol, recreational drugs, toxins and hepatitis exposure risks.',
      'Vaccination against hepatitis and family history of recurrent jaundice or hereditary disease.',
    ],
    examinationPrompts: [
      'General appearance, vital signs, fever, hypotension, tachycardia, lethargy and cachexia.',
      'Inspect sclerae in natural light; assess skin for jaundice, excoriations, bruising and other signs.',
      'Inspect abdomen for distension, scars, collateral veins, ascites or visible masses.',
      'Assess the liver, spleen, tenderness, masses and ascites where appropriate.',
      'Assess mental state and look for asterixis when hepatic dysfunction is suspected.',
    ],
    investigationsToConsider: [
      'Total and direct bilirubin, aminotransferases and alkaline phosphatase.',
      'Coagulation profile when hepatic insufficiency, bleeding or bruising is suspected.',
      'Full blood count and haemolysis tests where increased bilirubin production is considered.',
      'Hepatitis serology and other targeted tests guided by exposure history and examination.',
      'Abdominal ultrasound is commonly used when cholestasis or biliary obstruction is suspected; further imaging depends on findings.',
    ],
    differentialFrameworks: [
      {
        diagnosisGroup: 'Predominantly unconjugated / pre-hepatic pattern',
        featuresToExplore: ['Haemolysis or increased red-cell breakdown', 'Anaemia, pallor, splenomegaly or a relevant inherited history', 'Bilirubin fraction and haemolysis markers'],
        caution: 'A history or one laboratory value cannot establish haemolysis. Confirm the biochemical pattern and investigate the cause under clinical supervision.',
      },
      {
        diagnosisGroup: 'Hepatocellular pattern',
        featuresToExplore: ['Viral or other infectious hepatitis risks and prodromal symptoms', 'Recent medicines, herbal products, alcohol or toxin exposure', 'Autoimmune, metabolic or ischaemic context where relevant'],
        caution: 'Several causes can produce overlapping symptoms and enzyme patterns. Review the full history, liver tests and clinical context rather than assuming one cause.',
      },
      {
        diagnosisGroup: 'Cholestatic / biliary pattern',
        featuresToExplore: ['Dark urine, pale stools and pruritus', 'Gallstone history or biliary pain', 'Fever with persistent right-upper-quadrant pain', 'Ultrasound evidence of bile-duct dilatation or an obstructive lesion'],
        caution: 'A cholestatic pattern does not by itself identify the level or cause of obstruction. Fever and marked continuous right-upper-quadrant pain raise concern for cholangitis.',
      },
    ],
    managementPrinciples: [
      'First assess physiological stability and evidence of hepatic dysfunction, encephalopathy, bleeding or sepsis.',
      'Use bilirubin fractionation and the liver-test pattern to guide the next diagnostic questions; interpret results with symptoms and examination.',
      'Review medicines, herbal preparations, alcohol and possible toxins with a senior clinician; do not assume a suspected exposure is the confirmed cause.',
      'Select imaging according to the suspected mechanism; ultrasound is commonly used when biliary obstruction is suspected.',
      'Urgently escalate suspected ascending cholangitis, encephalopathy, coagulopathy or haemodynamic compromise through local hospital pathways.',
      'Definitive management depends on the cause and requires clinician assessment; this guide does not provide a prescribing regimen.',
    ],
    escalationFeatures: [
      'Altered mental status or asterixis.',
      'Evidence of significant coagulopathy or gastrointestinal bleeding.',
      'Fever with marked, continuous right upper quadrant pain or systemic toxicity.',
      'Hypotension, tachycardia or other evidence of haemodynamic compromise.',
    ],
    keyPoints: [
      'Dark urine may precede visible jaundice in conjugated or mixed hyperbilirubinaemia.',
      'Jaundice is a sign, not a diagnosis; consider increased bilirubin production, impaired hepatic handling and impaired bile flow.',
      'Severity is suggested by hepatic dysfunction, encephalopathy and coagulopathy—not simply the intensity of yellow discoloration.',
    ],
    questions: [
      {
        question: 'Which history detail may indicate conjugated hyperbilirubinaemia before jaundice becomes visible?',
        options: ['Dark urine', 'Joint pain alone', 'A remote surgical scar', 'An isolated headache'],
        answerIndex: 0,
        explanation: 'Conjugated bilirubin is water-soluble and can be excreted in urine, so dark urine may precede visible jaundice.',
      },
      {
        question: 'Which finding is particularly concerning for severe hepatic dysfunction?',
        options: ['Mild isolated pruritus', 'Asterixis with altered mental status', 'A normal appetite', 'A remote history of childhood fever'],
        answerIndex: 1,
        explanation: 'Encephalopathy, including mental-status change and asterixis, is a concerning feature that warrants urgent clinical assessment.',
      },
    ],
    aliases: ['jaundice', 'yellow eyes', 'yellow skin', 'scleral icterus', 'hyperbilirubinaemia', 'hyperbilirubinemia'],
    sources: [
      {
        label: 'Merck Manual Professional Edition — Jaundice',
        url: 'https://www.merckmanuals.com/professional/hepatic-and-biliary-disorders/approach-to-the-patient-with-liver-disease/jaundice',
        detail: 'Professional review covering history, examination, interpretation and testing.',
      },
    ],
    reviewedOn: '31 October 2026',
    educationalNote: 'This guide is an adult-focused educational overview. Paediatric jaundice, pregnancy and special populations require age- and context-specific guidance.',
  },
  {
    id: 'uti-child-assessment',
    title: 'Suspected urinary tract infection in a child',
    discipline: 'Paediatrics',
    subtitle: 'Symptoms, urine assessment and age-specific risk',
    summary: 'The history helps determine whether urine testing is appropriate and whether a child may be seriously unwell. Use symptoms and signs together with clinical judgement; a single feature should not decide the diagnosis.',
    learningObjectives: [
      'Ask about urinary symptoms, fever, hydration and abdominal or loin symptoms.',
      'Elicit previous confirmed UTI and relevant urinary tract history.',
      'Recognise the urgency of suspected UTI in babies younger than 3 months.',
      'Understand that sample collection and testing strategy vary with age and clinical risk.',
    ],
    historyPrompts: [
      'Dysuria, frequency, urgency where age-appropriate, new bedwetting or altered voiding pattern.',
      'Urine appearance or odour: cloudy, dark, malodorous urine or visible blood.',
      'Fever, shivering, reduced fluid intake, vomiting, abdominal pain, loin pain or suprapubic discomfort.',
      'Previous confirmed UTI, recurrent fever of uncertain origin and previous investigations.',
      'Poor urine flow, constipation, dysfunctional voiding or known antenatal renal/urinary abnormality.',
      'Family history of vesicoureteral reflux or renal disease.',
      'General condition, feeding, activity and hydration using age-appropriate questions.',
    ],
    examinationPrompts: [
      'Assess general appearance, activity, hydration and level of illness.',
      'Record temperature, heart rate, respiratory rate, perfusion and other age-appropriate observations.',
      'Assess the abdomen for tenderness, palpable bladder or mass where appropriate.',
      'Assess loin tenderness and relevant external/genital findings with consent, privacy and chaperone practice.',
      'Consider alternative sources of fever; do not assume every febrile child has a UTI.',
    ],
    investigationsToConsider: [
      'Urine testing is guided by symptoms, signs, age and clinical judgement.',
      'Collect urine before antibiotics when feasible; do not delay urgent care in a seriously ill child because a sample is difficult to obtain.',
      'Use clean-catch collection wherever possible; other methods depend on the child and setting.',
      'For suspected UTI in a baby younger than 3 months, NICE recommends paediatric specialist referral and urgent urine microscopy and culture.',
      'In children aged 3 years and over, NICE provides a dipstick strategy; interpret results in the context of symptoms, risk and the guideline.',
    ],
    differentialFrameworks: [
      {
        diagnosisGroup: 'Lower urinary tract infection (cystitis)',
        featuresToExplore: ['Dysuria, frequency or urgency', 'Suprapubic discomfort', 'Absence or presence of systemic illness'],
        caution: 'Symptoms may be atypical in young children. Use the age-specific testing strategy and do not label a lower UTI from one symptom alone.',
      },
      {
        diagnosisGroup: 'Upper urinary tract infection (pyelonephritis)',
        featuresToExplore: ['Fever and systemic illness', 'Loin pain or tenderness', 'Vomiting, reduced intake or poor general condition'],
        caution: 'Clinical severity and age matter. A baby younger than 3 months with suspected UTI needs urgent paediatric specialist assessment.',
      },
      {
        diagnosisGroup: 'Alternative source of fever or urinary discomfort',
        featuresToExplore: ['Respiratory, ear, gastrointestinal or other infectious symptoms', 'Vulval irritation or vulvovaginitis where relevant', 'Constipation or dysfunctional voiding in recurrent urinary symptoms'],
        caution: 'These possibilities do not rule out UTI. Interpret the whole assessment, urine results and clinical course together.',
      },
    ],
    managementPrinciples: [
      'Assess illness severity, age, hydration, perfusion and risk of sepsis before focusing on the urine result.',
      'For suspected UTI in a baby younger than 3 months, arrange urgent paediatric specialist referral and urine microscopy/culture in line with the applicable pathway.',
      'Collect urine before antimicrobials when feasible, but do not delay urgent assessment or treatment in a seriously ill child because a sample is difficult to obtain.',
      'Use age-appropriate urine testing and review microscopy/culture results; assess the clinical response and investigate atypical or recurrent features.',
      'Antimicrobial choice and duration must follow current local paediatric guidance, allergy history, culture results and local resistance patterns.',
      'NICE NG224 is a UK guideline; learners in Nigeria must also follow current institutional and national guidance.',
    ],
    escalationFeatures: [
      'Suspected UTI in a baby younger than 3 months: urgent paediatric specialist referral.',
      'High risk of serious illness, suspected sepsis, poor perfusion or marked systemic illness.',
      'Poor urine flow, an abdominal/bladder mass, raised creatinine or known urinary tract abnormality.',
      'Failure to improve as expected or diagnostic uncertainty in a child who remains unwell.',
    ],
    keyPoints: [
      'NICE NG224 lists dysuria, frequency, new bedwetting, malodorous/dark/cloudy urine, haematuria, reduced fluid intake, fever, shivering, abdominal pain and loin/suprapubic tenderness among features that can increase UTI likelihood.',
      'A single symptom or sign in isolation should not determine whether urine testing is needed.',
      'NICE recommends referral of babies under 3 months with suspected UTI to paediatric specialist care, with urgent urine microscopy and culture.',
    ],
    questions: [
      {
        question: 'A 6-week-old baby is suspected to have a UTI. What is the recommended next step in NICE NG224?',
        options: ['Manage as an uncomplicated older-child presentation', 'Refer urgently to paediatric specialist care', 'Wait one week before collecting urine', 'Use one symptom to confirm UTI'],
        answerIndex: 1,
        explanation: 'NICE NG224 recommends referral of babies under 3 months with suspected UTI to paediatric specialist care and urgent urine microscopy and culture.',
      },
      {
        question: 'How should cloudy urine alone be used when considering UTI?',
        options: ['It confirms UTI by itself', 'It excludes UTI by itself', 'It contributes to the overall assessment but should not decide alone', 'It makes examination unnecessary'],
        answerIndex: 2,
        explanation: 'NICE advises that a single symptom or sign in isolation should not necessarily determine whether urine testing is needed.',
      },
    ],
    aliases: ['uti', 'urinary tract infection', 'child with dysuria', 'paediatric uti', 'pediatric uti', 'urine infection in child'],
    sources: [
      {
        label: 'NICE NG224 — Urinary tract infection in under 16s',
        url: 'https://www.nice.org.uk/guidance/ng224/chapter/Recommendations',
        detail: 'Published 27 July 2022; the recommendations page includes a November 2025 link update.',
      },
    ],
    reviewedOn: '31 October 2026',
    educationalNote: 'This guide summarises NICE NG224. Follow current Nigerian/local paediatric protocols and senior clinical guidance; do not transfer a UK guideline into practice without considering local policy.',
  },
  {
    id: 'acute-abdominal-pain',
    title: 'Approach to acute abdominal pain',
    discipline: 'Surgery · Emergency Medicine',
    subtitle: 'Focused pain history, examination and early risk assessment',
    summary: 'Acute abdominal pain requires systematic history-taking and careful examination. Establish illness severity first and identify features suggesting peritoneal irritation or impaired perfusion.',
    learningObjectives: [
      'Characterise pain by site, onset, progression, severity, radiation and associated symptoms.',
      'Recognise the importance of general appearance, vital signs and peripheral perfusion.',
      'Use a systematic abdominal examination sequence.',
      'Identify features warranting urgent senior review.',
    ],
    historyPrompts: [
      'Site and onset: where pain began, sudden or gradual onset and what the patient was doing.',
      'Course and progression: constant or intermittent, worsening or improving, pattern and duration.',
      'Character: sharp, dull, cramping, burning or the patient’s own description.',
      'Radiation, severity, aggravating and relieving factors.',
      'Associated vomiting, bowel habit change, distension, fever, urinary symptoms, bleeding or inability to pass stool/flatus.',
      'Previous similar episodes, abdominal surgery, medical history, medication and possible pregnancy where applicable.',
    ],
    examinationPrompts: [
      'Assess general appearance, consciousness, blood pressure, pulse and peripheral perfusion.',
      'Examine the abdomen systematically: inspection, auscultation, percussion and palpation.',
      'Begin palpation gently and away from the area of greatest pain.',
      'Assess focal tenderness, involuntary guarding, rigidity, rebound and masses.',
      'Consider rectal or pelvic examination only when clinically indicated, appropriate, consented and performed by a qualified clinician.',
    ],
    investigationsToConsider: [
      'Choose tests according to history, examination, age, pregnancy possibility and suspected pathology.',
      'Laboratory tests and imaging may be required; there is no single panel appropriate for every patient.',
      'Choose imaging modality and urgency according to the clinical question and local pathway.',
      'Do not delay emergency senior review or resuscitation priorities while completing routine clerking.',
    ],
    differentialFrameworks: [
      {
        diagnosisGroup: 'Inflammatory or infective abdominal conditions',
        featuresToExplore: ['Appendicitis: possible migration of pain towards the right lower quadrant with focal tenderness', 'Cholecystitis: right-upper-quadrant pain and relevant biliary history', 'Gastroenteritis: diarrhoea, vomiting, exposure history and diffuse cramps'],
        caution: 'Pain location and associated symptoms are suggestive, not diagnostic. Early disease and atypical presentations can overlap.',
      },
      {
        diagnosisGroup: 'Obstructive or perforating surgical conditions',
        featuresToExplore: ['Distension, vomiting and inability to pass stool or flatus', 'Previous abdominal surgery or hernia history', 'Sudden severe pain, peritoneal signs or systemic deterioration'],
        caution: 'Obstruction and perforation can deteriorate rapidly. Do not delay urgent senior/surgical review while completing routine clerking.',
      },
      {
        diagnosisGroup: 'Urinary, gynaecological, vascular or extra-abdominal causes',
        featuresToExplore: ['Dysuria, haematuria or loin-to-groin pain', 'Pregnancy possibility, vaginal bleeding or pelvic symptoms where relevant', 'Back pain with shock, vascular risk factors or chest/cardiac symptoms'],
        caution: 'The differential depends on age, sex, pregnancy possibility, comorbidities and examination. Consider time-critical alternatives even when a surgical cause seems likely.',
      },
    ],
    managementPrinciples: [
      'Begin with severity assessment, vital signs, consciousness and peripheral perfusion; stabilisation takes priority when the patient is unstable.',
      'Seek early senior or surgical review for peritonitis, shock, severe worsening pain or suspected time-critical pathology.',
      'Choose laboratory tests and imaging to answer the clinical question; there is no single investigation panel suitable for every patient.',
      'Consider pregnancy testing where biologically relevant and appropriate, and include urinary, gynaecological, vascular and extra-abdominal causes.',
      'Reassess the patient after initial measures and whenever symptoms or vital signs change.',
      'Analgesia, resuscitation and definitive treatment should follow qualified clinician direction and local emergency protocols.',
    ],
    escalationFeatures: [
      'Haemodynamic instability, poor peripheral perfusion, altered consciousness or toxic appearance.',
      'Involuntary guarding, rigidity or rebound tenderness suggesting peritoneal irritation.',
      'Severe or rapidly worsening pain, especially with systemic features.',
      'Significant gastrointestinal bleeding, persistent vomiting with deterioration or a concerning abdominal mass.',
    ],
    keyPoints: [
      'Merck describes the abdominal examination sequence as inspection, auscultation, percussion and palpation.',
      'Guarding, rigidity and rebound are features suggesting peritoneal irritation.',
      'In seriously ill patients, evaluation and urgent management may need to proceed simultaneously with early surgical consultation.',
    ],
    questions: [
      {
        question: 'Which abdominal examination sequence is described in the Merck Manual Professional Edition?',
        options: ['Palpation, inspection, percussion, auscultation', 'Inspection, auscultation, percussion, palpation', 'Auscultation, palpation, inspection, percussion', 'Percussion, palpation, auscultation, inspection'],
        answerIndex: 1,
        explanation: 'The referenced sequence is inspection, auscultation, percussion and palpation.',
      },
      {
        question: 'Which combination is concerning for peritoneal irritation?',
        options: ['Mild nausea alone', 'Involuntary guarding, rigidity and rebound', 'Normal appetite and no tenderness', 'An isolated headache'],
        answerIndex: 1,
        explanation: 'Guarding, rigidity and rebound are clinical findings associated with peritoneal irritation.',
      },
    ],
    aliases: ['acute abdomen', 'abdominal pain', 'acute abdominal pain', 'abdominal examination', 'acute surgical abdomen'],
    sources: [
      {
        label: 'Merck Manual Professional Edition — Acute Abdominal Pain',
        url: 'https://www.merckmanuals.com/professional/gastrointestinal-disorders/acute-abdomen-and-surgical-gastroenterology/acute-abdominal-pain',
        detail: 'Professional reference on history, physical examination and initial assessment.',
      },
    ],
    reviewedOn: '31 October 2026',
    educationalNote: 'This is an assessment framework, not a diagnostic or treatment algorithm. Use local emergency pathways and senior clinical assessment where indicated.',
  },

  {
    id: 'appendicitis-assessment',
    title: 'Approach to suspected acute appendicitis',
    discipline: 'Surgery · General Surgery',
    subtitle: 'History, examination, investigation and early surgical assessment',
    summary: 'Acute appendicitis is a common surgical emergency. A typical history may include pain that begins centrally and later localises to the right lower quadrant, but presentations vary. Clinical risk assessment combined with appropriate imaging improves diagnostic accuracy; no single symptom, sign or blood test confirms the diagnosis.',
    learningObjectives: [
      'Elicit the chronology and possible migration of abdominal pain, associated symptoms and relevant alternative causes.',
      'Recognise examination features that may suggest localised or generalised peritoneal irritation.',
      'Understand the role and limitations of clinical risk scores, laboratory tests and imaging.',
      'Identify situations requiring urgent senior surgical assessment.',
    ],
    historyPrompts: [
      'Pain onset, initial site, subsequent site, course, severity, character, radiation and aggravating or relieving factors.',
      'Anorexia, nausea, vomiting and fever; clarify the sequence of pain and vomiting rather than assuming it.',
      'Bowel symptoms including diarrhoea, constipation, abdominal distension and ability to pass flatus.',
      'Urinary symptoms, loin-to-groin pain and previous urinary stones or infection.',
      'Previous similar episodes, abdominal surgery, relevant medical conditions and immunosuppression.',
      'Medication, allergy and recent treatment history.',
      'Menstrual history and pregnancy possibility where biologically relevant; ask about vaginal bleeding or discharge where appropriate.',
      'Scrotal or testicular pain in patients with testes, because torsion can present with lower abdominal pain.',
    ],
    examinationPrompts: [
      'Assess general appearance, vital signs, hydration, perfusion and evidence of systemic illness.',
      'Inspect the abdomen and examine systematically, documenting the exact site and extent of tenderness.',
      'Assess for involuntary guarding, rebound or rigidity; distinguish these from voluntary tensing where possible.',
      'Consider hernial orifices and genital examination when clinically indicated, with consent, privacy and chaperone practice.',
      'In a patient who may be pregnant, consider the relevant pelvic and obstetric differential and urgent referral pathway.',
      'Repeat examination when symptoms evolve or the initial findings are equivocal; do not treat one sign as diagnostic.',
    ],
    investigationsToConsider: [
      'Full blood count and inflammatory markers may support assessment but are not diagnostic in isolation.',
      'Urinalysis can help identify urinary alternatives; interpret findings in the clinical context.',
      'Pregnancy testing where biologically relevant and appropriate.',
      'Use an appropriate clinical risk score as an adjunct to, not a replacement for, clinical assessment.',
      'Ultrasound is a reasonable first-line imaging option in children and in settings where avoiding ionising radiation is important; CT or MRI may be required when the diagnosis remains uncertain or according to local pathways.',
      'Select imaging according to age, pregnancy status, risk, availability and local radiology/surgical guidance.',
    ],
    differentialFrameworks: [
      {
        diagnosisGroup: 'Gastrointestinal and inflammatory alternatives',
        featuresToExplore: ['Gastroenteritis: diarrhoea, vomiting, exposure and diffuse cramps', 'Mesenteric adenitis: often follows an upper respiratory infection and can mimic appendicitis', 'Crohn disease, Meckel diverticulitis or other bowel inflammation where relevant'],
        caution: 'Symptoms overlap. Diarrhoea or vomiting does not by itself exclude appendicitis.',
      },
      {
        diagnosisGroup: 'Urinary and renal alternatives',
        featuresToExplore: ['Urinary tract infection: dysuria, frequency or systemic urinary symptoms', 'Ureteric colic: loin-to-groin pain and haematuria where present'],
        caution: 'Urinalysis can support an alternative diagnosis, but an abnormal urine result should be interpreted alongside the abdominal examination.',
      },
      {
        diagnosisGroup: 'Gynaecological and genital alternatives',
        featuresToExplore: ['Ectopic pregnancy, ovarian torsion or pelvic inflammatory disease where biologically relevant', 'Testicular torsion in a patient with testes, particularly when there is scrotal or testicular pain'],
        caution: 'These conditions may be time-critical. Ask relevant questions and arrange appropriate urgent assessment rather than anchoring on appendicitis.',
      },
    ],
    managementPrinciples: [
      'Assess stability first and escalate promptly if there is shock, sepsis, generalised peritonitis or clinical deterioration.',
      'Use history, examination, risk stratification and imaging together to reduce diagnostic uncertainty and negative appendectomy.',
      'Seek early senior surgical assessment when appendicitis is suspected or the patient is deteriorating.',
      'Laparoscopic appendectomy remains a standard surgical approach; operative versus non-operative management requires patient-specific assessment and shared decision-making by the surgical team.',
      'Antibiotic-only management is an option for selected patients with uncomplicated appendicitis in some guidelines, but recurrence, complications, access to follow-up and patient preferences matter.',
      'The timing and type of intervention depend on whether disease is uncomplicated or complicated, the patient’s physiology and available local resources.',
      'Do not prescribe or delay urgent care based on this educational guide; follow the current hospital protocol and supervising surgeon’s plan.',
    ],
    escalationFeatures: [
      'Haemodynamic instability, shock, poor perfusion or suspected sepsis.',
      'Generalised guarding, rigidity or other features of diffuse peritonitis.',
      'Severe or rapidly worsening pain, persistent vomiting or systemic deterioration.',
      'Possible ectopic pregnancy, ovarian torsion or testicular torsion.',
      'Diagnostic uncertainty in a patient who remains unwell or has worsening serial examination findings.',
    ],
    keyPoints: [
      'Pain migration to the right lower quadrant is a useful historical feature but is not present in every patient.',
      'Clinical risk scores and imaging can improve diagnostic accuracy and reduce negative appendectomy rates.',
      'Ultrasound is a reasonable first-line imaging option; CT and MRI may provide more definitive imaging when required.',
      'The 2025 WSES Jerusalem guideline update emphasises population-specific decision-making and adaptation to local resources.',
    ],
    questions: [
      {
        question: 'According to the 2025 WSES Jerusalem guideline update, what combination improves diagnostic accuracy and can reduce negative appendectomy?',
        options: ['A single symptom alone', 'Clinical risk scores combined with appropriate imaging', 'CRP alone', 'Routine antibiotics before assessment'],
        answerIndex: 1,
        explanation: 'The 2025 WSES guideline update identifies clinical risk scores and imaging together as improving diagnostic accuracy and reducing negative appendectomy rates.',
      },
      {
        question: 'Which imaging option is reasonable as a first-line study, particularly when radiation avoidance matters?',
        options: ['Ultrasound', 'Plain abdominal radiograph for every patient', 'No imaging is ever required', 'CT for every child'],
        answerIndex: 0,
        explanation: 'SAGES describes ultrasound as a reasonable first-line study because it is relatively low cost and avoids ionising radiation; CT and MRI are more definitive when needed.',
      },
      {
        question: 'Which statement about antibiotic-only management is most accurate?',
        options: ['It is suitable for every patient without review', 'It is never discussed in current guidelines', 'It may be considered for selected uncomplicated cases after surgical assessment and shared decision-making', 'It removes the need for follow-up'],
        answerIndex: 2,
        explanation: 'Current guidelines allow non-operative treatment in selected patients, but selection, recurrence, complications and follow-up must be considered by the clinical team.',
      },
    ],
    aliases: ['appendicitis', 'acute appendicitis', 'suspected appendicitis', 'right iliac fossa pain', 'rif pain', 'right lower quadrant pain'],
    sources: [
      {
        label: 'WSES — 2025 Edition of the Jerusalem Guidelines for Acute Appendicitis',
        url: 'https://pubmed.ncbi.nlm.nih.gov/41604201/',
        detail: 'Published online 28 January 2026; evidence review through May 2025, 35 GRADE-based recommendations.',
      },
      {
        label: 'SAGES — Guideline for the Diagnosis and Treatment of Appendicitis',
        url: 'https://www.sages.org/publications/guidelines/guideline-for-the-diagnosis-and-treatment-of-appendicitis/',
        detail: 'Society guideline on imaging, operative and non-operative options and perioperative considerations.',
      },
    ],
    reviewedOn: '31 October 2026',
    educationalNote: 'This is a student learning framework, not a diagnostic or treatment protocol. Follow current Nigerian/institutional pathways and the supervising surgical team; WSES and SAGES recommendations must be adapted to local resources and patient factors.',
  },
  {
    id: 'posterior-urethral-valves',
    title: 'Approach to suspected posterior urethral valves',
    discipline: 'Surgery · Paediatric Urology',
    subtitle: 'Neonatal presentation, assessment, VCUG and specialist management principles',
    summary: 'Posterior urethral valves (PUV) are congenital obstructing urethral membranes in boys and are an important cause of congenital lower urinary tract obstruction. The obstruction may affect bladder function, upper urinary tract drainage and long-term renal function. Suspected neonatal obstruction requires urgent paediatric urology assessment.',
    learningObjectives: [
      'Recognise antenatal and postnatal features that raise suspicion of PUV.',
      'Elicit urinary stream, urine output, infection, feeding and renal-related symptoms.',
      'Understand the role of ultrasound, renal biochemistry and voiding cystourethrography (VCUG).',
      'Describe the principles of initial bladder drainage, stabilisation, valve ablation and lifelong follow-up.',
    ],
    historyPrompts: [
      'Antenatal ultrasound findings: enlarged or persistently distended bladder, bilateral hydroureteronephrosis, thick-walled bladder, increased renal echogenicity or oligohydramnios.',
      'Pregnancy and birth history, gestational age, delivery, neonatal admission and any prenatal specialist assessment.',
      'Urinary stream from birth: weak, thin, intermittent or prolonged stream; straining, dribbling, poor wet-nappy output or episodes of retention.',
      'Urine output and wet nappies: frequency, volume where measured, recent reduction or absence of urine.',
      'Symptoms of urinary infection or systemic illness: fever, lethargy, poor feeding, vomiting, irritability or previous febrile UTI.',
      'Abdominal distension, palpable bladder previously noted, failure to thrive or poor weight gain.',
      'Previous catheterisation, urinary diversion, VCUG, cystoscopy, valve ablation or other urological procedures.',
      'Relevant associated congenital findings and family history of congenital urinary tract abnormalities.',
    ],
    examinationPrompts: [
      'Assess neonatal/infant general condition, temperature, heart rate, respiratory status, perfusion, hydration and weight.',
      'Assess urine output and fluid balance; review the clinical record for oliguria or anuria.',
      'Inspect and palpate the abdomen for a distended bladder, abdominal mass or ascites.',
      'Examine the external genitalia and document both testes and any associated genital or inguinal abnormality.',
      'Assess for oedema, signs of renal dysfunction, hypertension where measurable, and respiratory compromise that may accompany severe antenatal oligohydramnios.',
    ],
    investigationsToConsider: [
      'Renal and bladder ultrasound to assess renal parenchyma, hydronephrosis/hydroureter, bladder wall and bladder distension; ultrasound findings raise suspicion but do not replace urethral imaging for confirmation.',
      'Serum creatinine, urea and electrolytes, monitored closely in the first postnatal days and interpreted as a trend rather than a single isolated value.',
      'Urinalysis and urine culture when infection is suspected, using an age-appropriate collection method.',
      'Voiding cystourethrography (VCUG/MCUG) with lateral urethral views during the voiding phase and without a catheter remaining in the urethra during those views; this is recommended by the EAU when PUV is suspected.',
      'Renal nuclear imaging such as DMSA or MAG3 may be used by the specialist team to assess differential renal function or scarring when indicated.',
      'Further functional assessment, including urodynamics, may be required during follow-up when bladder dysfunction is suspected.',
    ],
    differentialFrameworks: [
      {
        diagnosisGroup: 'Other congenital lower urinary tract obstruction',
        featuresToExplore: ['Anterior urethral valve or diverticulum', 'Urethral atresia or stenosis', 'Other congenital outlet abnormalities'],
        caution: 'These conditions can overlap in antenatal or postnatal imaging appearances; anatomical definition and specialist assessment are important.',
      },
      {
        diagnosisGroup: 'Other causes of poor urinary stream or retention',
        featuresToExplore: ['Neurogenic bladder or spinal dysraphism', 'Meatal or urethral narrowing', 'Severe dysfunctional bladder emptying'],
        caution: 'A poor stream alone is not diagnostic of PUV. Consider the age, antenatal findings, examination and imaging.',
      },
      {
        diagnosisGroup: 'Associated urinary tract pathology',
        featuresToExplore: ['Vesicoureteric reflux', 'Renal dysplasia or parenchymal impairment', 'Upper tract dilatation'],
        caution: 'Associated findings may affect renal prognosis and follow-up but do not independently establish the valve diagnosis.',
      },
    ],
    managementPrinciples: [
      'A newborn with suspected infravesical obstruction needs urgent paediatric urology/neonatal assessment. The EAU recommends prompt bladder drainage, commonly by transurethral catheterisation or suprapubic drainage as clinically appropriate.',
      'Stabilisation includes close monitoring of renal function, electrolytes, fluid balance, urine output, infection and respiratory status, with paediatric nephrology involvement when indicated.',
      'After bladder drainage and stabilisation, endoscopic valve ablation is generally attempted when the urethra and available equipment permit. The procedure and timing are specialist decisions.',
      'If the child is too small or not sufficiently stable for endoscopic ablation, prolonged bladder drainage or a urinary diversion may be considered by the paediatric urology team.',
      'The team should demonstrate improvement after initial treatment and arrange appropriate imaging, renal and bladder function review.',
      'Long-term and lifelong monitoring is required because chronic kidney disease and bladder dysfunction can develop despite treatment.',
    ],
    escalationFeatures: [
      'Newborn with suspected infravesical obstruction, markedly poor stream, retention or a distended bladder.',
      'Oliguria or anuria, rising creatinine, significant electrolyte disturbance or suspected acute kidney injury.',
      'Fever, lethargy, poor feeding, poor perfusion or other features concerning for neonatal sepsis/urosepsis.',
      'Respiratory distress or history of severe oligohydramnios suggesting possible pulmonary hypoplasia.',
      'Worsening hydronephrosis, recurrent febrile UTI or failure to improve after bladder drainage.',
    ],
    keyPoints: [
      'PUV is a potentially life-threatening congenital urinary tract anomaly and an important cause of congenital lower urinary tract obstruction in boys.',
      'Antenatal clues include a distended or thick-walled bladder, upper tract dilatation and oligohydramnios; these findings raise suspicion but are not by themselves definitive.',
      'The EAU recommends VCUG for suspected PUV, including lateral views of the urethra during voiding without a catheter in situ.',
      'The EAU recommends bladder drainage in newborns with suspected infravesical obstruction, followed by stabilisation and an attempt at endoscopic valve ablation when feasible.',
      'Renal function and bladder function require long-term, lifelong monitoring.',
    ],
    questions: [
      {
        question: 'Which imaging study is specifically recommended by the EAU when posterior urethral valves are suspected?',
        options: ['Plain abdominal radiograph', 'Voiding cystourethrography with lateral urethral views during voiding', 'Routine CT abdomen for every neonate', 'Intravenous urography as the first confirmatory test'],
        answerIndex: 1,
        explanation: 'The EAU recommends VCUG. Lateral views of the urethra during the voiding phase, without a catheter in situ for those views, help outline the posterior urethral anatomy.',
      },
      {
        question: 'A newborn has a poor urinary stream, a distended bladder and antenatal bilateral urinary tract dilatation. What is the key immediate management principle?',
        options: ['Wait for outpatient review after several weeks', 'Urgent specialist assessment and bladder drainage', 'Perform definitive valve ablation before stabilisation', 'Restrict all fluids without monitoring'],
        answerIndex: 1,
        explanation: 'Suspected infravesical obstruction in a newborn requires urgent assessment and bladder drainage. Stabilisation and renal/electrolyte monitoring precede definitive endoscopic treatment when feasible.',
      },
      {
        question: 'Which statement about follow-up after treatment of PUV is most accurate?',
        options: ['Follow-up can stop once the stream improves', 'Only repeat urine culture is required', 'Lifelong renal and bladder function monitoring is required', 'A normal early ultrasound excludes future bladder dysfunction'],
        answerIndex: 2,
        explanation: 'Renal impairment and bladder dysfunction may persist or emerge over time. EAU guidance emphasises lifelong monitoring of renal and bladder function.',
      },
    ],
    aliases: ['posterior urethral valves', 'puv', 'valves in the posterior urethra', 'congenital lower urinary tract obstruction', 'cluto', 'poor urinary stream in a male neonate'],
    sources: [
      {
        label: 'EAU Guidelines on Paediatric Urology 2026 — Congenital Lower Urinary Tract Obstruction',
        url: 'https://uroweb.org/guidelines/paediatric-urology/chapter/congenital-lower-urinary-tract-obstruction',
        detail: '2026 edition; sections on PUV diagnosis, postnatal management, follow-up and recommendations.',
      },
    ],
    reviewedOn: '31 October 2026',
    educationalNote: 'This is an educational summary of EAU guidance, not a neonatal emergency protocol. A suspected PUV requires urgent assessment by the paediatric/neonatal and urology teams. Follow current local Nigerian protocols and the treating specialist team.',
  },
];

export function findOfflineGuide(topic: string): ClinicalLearningGuide | undefined {
  const query = topic.trim().toLowerCase();
  if (!query) return undefined;
  return offlineGuides.find((guide) =>
    [guide.title, guide.id, ...guide.aliases].some((value) => value.toLowerCase() === query)
    || [guide.title, ...guide.aliases].some((value) => value.toLowerCase().includes(query) || query.includes(value.toLowerCase())),
  );
}
