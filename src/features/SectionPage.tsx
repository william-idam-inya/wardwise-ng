import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ClipboardList, FileHeart, FolderSearch, LockKeyhole, Search, ShieldCheck, Sparkles, Stethoscope, UserRound, UsersRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { SectionId } from '../app/navigation';
import { ClinicalGuideView } from './learning/ClinicalGuideView';
import { findOfflineGuide, offlineGuides } from './learning/learning.data';
import { VirtualPatientSimulation } from './simulation/VirtualPatientSimulation';

type Props = { section: Exclude<SectionId, 'workspace'>; query?: string; onNavigate: (section: SectionId) => void };
type Feature = { title: string; detail: string };
type Module = { title: string; eyebrow: string; intro: string; icon: LucideIcon; status: string; features: Feature[]; action?: SectionId };
type CatalogueTopic = { title: string; aliases?: string[] };
type CatalogueSpecialty = { title: string; topics: CatalogueTopic[] };
type CatalogueDiscipline = { title: string; specialties: CatalogueSpecialty[] };

const modules: Record<Exclude<SectionId, 'workspace'>, Module> = {
  clerking: { title: 'AI Guided Clinical Clerking', eyebrow: 'STRUCTURED HISTORY-TAKING', icon: ClipboardList, status: 'Guided workflow available', intro: 'Work through biodata, each presenting complaint, review of systems, examination, investigations and assessment without losing the thread of the history.', features: [
    { title: 'Biodata & case setup', detail: 'Use a synthetic or de-identified case label and record the source and reliability of the history.' },
    { title: 'One complaint at a time', detail: 'Use Complaint, Course, Cause/context, Complications and Care received for every presenting complaint.' },
    { title: 'A distinct review of systems', detail: 'Keep system review separate and mark unanswered questions honestly.' },
    { title: 'Live note & review', detail: 'Build a concise note, review missing details and print or save a PDF.' },
  ]},
  'clinical-tutor': { title: 'Clinical Tutor', eyebrow: 'LEARN THE CLINICAL FRAMEWORK', icon: Stethoscope, status: offlineGuides.length + ' source-linked offline guides', intro: 'Revise focused history-taking, examination, investigation choices and clinical red flags using source-linked summaries and knowledge checks.', features: [], action: 'learning-catalogue' },
  simulation: { title: 'Virtual Patient Simulation', eyebrow: 'PRACTISE A SAFE CLINICAL INTERVIEW', icon: UsersRound, status: 'Scripted fictional scenarios', intro: 'Interview a fictional patient, request examination and investigation findings, then review a domain-based examiner debrief.', features: [
    { title: 'Fictional scenarios', detail: 'Consistent case facts, symptoms and chronology throughout the exercise.' },
    { title: 'Learner-led questioning', detail: 'Ask focused questions without seeing the teaching impression too early.' },
    { title: 'Examiner feedback', detail: 'Review which history domains you explored and which were missed.' },
    { title: 'Clear simulation boundary', detail: 'Every scenario is labelled “SIMULATION — NOT A REAL PATIENT”.' },
  ]},
  'case-library': { title: 'Case Library', eyebrow: 'YOUR CASES, ORGANISED', icon: FileHeart, status: 'Owner-restricted case storage', intro: 'Reopen a learning case, continue an unfinished history, revise the assessment and manage your own saved case records.', features: [
    { title: 'Save & reopen', detail: 'Continue work after leaving the page or refreshing the browser.' },
    { title: 'Edit, archive or delete', detail: 'Keep revisions organised and remove records from your account.' },
    { title: 'Search & filter', detail: 'Find cases by specialty, presentation, status and update date.' },
    { title: 'Print a reviewed note', detail: 'Review a note before printing or exporting a PDF copy.' },
  ]},
  'learning-catalogue': { title: 'Learning Catalogue', eyebrow: 'DISCIPLINE → SPECIALTY → TOPIC', icon: BookOpen, status: 'Starter taxonomy · ' + offlineGuides.length + ' detailed offline guides', intro: 'Browse clinical disciplines, specialties and presentations in a structured hierarchy, or search the entire catalogue. Detailed guides are clearly marked.', features: [] },
  'profile-settings': { title: 'Profile & settings', eyebrow: 'MAKE YOUR WORKSPACE YOURS', icon: UserRound, status: 'Account profile', intro: 'Your profile holds the minimum details needed to personalise learning. Account security and profile access are provided through Supabase.', features: [
    { title: 'Student profile', detail: 'Name, sex, age in years, study level, institution and optional training site.' },
    { title: 'Display preferences', detail: 'Light/dark mode and responsive typography.' },
    { title: 'Privacy & data', detail: 'Understand what is stored, why it is needed, retention and deletion.' },
    { title: 'Account security', detail: 'Registration, sign-in, password reset and protected private pages.' },
  ]},
};

const areas: CatalogueDiscipline[] = [
  {
    title: 'Medicine',
    specialties: [
      { title: 'General / Internal Medicine', topics: [
        { title: 'Approach to the medical patient' }, { title: 'Fever in an adult' }, { title: 'Weight loss' }, { title: 'Fatigue and weakness' },
      ]},
      { title: 'Cardiology', topics: [
        { title: 'Cardiology overview' }, { title: 'Chest pain' }, { title: 'Heart failure' }, { title: 'Hypertension' }, { title: 'Palpitations' }, { title: 'Syncope' },
      ]},
      { title: 'Respiratory Medicine', topics: [
        { title: 'Cough' }, { title: 'Dyspnoea' }, { title: 'Haemoptysis' }, { title: 'Asthma' }, { title: 'Pneumonia' }, { title: 'Pleural effusion' },
      ]},
      { title: 'Gastroenterology & Hepatology', topics: [
        { title: 'Jaundice evaluation', aliases: ['yellow eyes', 'yellow skin', 'scleral icterus'] }, { title: 'Upper gastrointestinal bleeding' }, { title: 'Lower gastrointestinal bleeding' }, { title: 'Chronic liver disease' }, { title: 'Ascites' }, { title: 'Dysphagia' },
      ]},
      { title: 'Endocrinology', topics: [
        { title: 'Diabetes mellitus' }, { title: 'Thyroid enlargement / goitre' }, { title: 'Thyrotoxicosis' }, { title: 'Hypothyroidism' }, { title: 'Adrenal disorders' },
      ]},
      { title: 'Neurology', topics: [
        { title: 'Headache' }, { title: 'Seizures' }, { title: 'Stroke' }, { title: 'Weakness and paralysis' }, { title: 'Altered mental status' },
      ]},
      { title: 'Renal Medicine', topics: [
        { title: 'Acute kidney injury' }, { title: 'Chronic kidney disease' }, { title: 'Haematuria' }, { title: 'Proteinuria' }, { title: 'Electrolyte disorders' },
      ]},
      { title: 'Infectious Diseases', topics: [
        { title: 'Malaria' }, { title: 'HIV-related presentations' }, { title: 'Tuberculosis' }, { title: 'Sepsis' }, { title: 'Meningitis' },
      ]},
      { title: 'Haematology', topics: [
        { title: 'Anaemia' }, { title: 'Sickle cell disease' }, { title: 'Bleeding disorders' }, { title: 'Lymphadenopathy' },
      ]},
    ],
  },
  {
    title: 'Surgery',
    specialties: [
      { title: 'General & Gastrointestinal Surgery', topics: [
        { title: 'Acute abdominal pain', aliases: ['acute abdomen'] }, { title: 'Appendicitis', aliases: ['acute appendicitis', 'right iliac fossa pain', 'RIF pain'] }, { title: 'Intestinal obstruction' }, { title: 'Peritonitis' }, { title: 'Hernias' }, { title: 'Peptic ulcer complications' },
      ]},
      { title: 'Hepatobiliary & Pancreatic Surgery', topics: [
        { title: 'Gallstone disease' }, { title: 'Acute cholecystitis' }, { title: 'Obstructive jaundice' }, { title: 'Pancreatitis' }, { title: 'Liver masses' },
      ]},
      { title: 'Endocrine Surgery', topics: [
        { title: 'Thyroid nodules and goitre' }, { title: 'Thyroid malignancy' }, { title: 'Parathyroid disease' }, { title: 'Adrenal masses' },
      ]},
      { title: 'Breast & Colorectal Surgery', topics: [
        { title: 'Breast lump' }, { title: 'Breast cancer assessment' }, { title: 'Colorectal cancer' }, { title: 'Anorectal disorders' },
      ]},
      { title: 'Trauma & Emergency Surgery', topics: [
        { title: 'Initial trauma assessment' }, { title: 'Abdominal trauma' }, { title: 'Thoracic trauma' }, { title: 'Burns assessment' }, { title: 'Acute surgical abdomen' },
      ]},
      { title: 'Orthopaedics & Traumatology', topics: [
        { title: 'Fracture assessment' }, { title: 'Limb deformity' }, { title: 'Joint pain' }, { title: 'Bone and joint infection' }, { title: 'Spinal injury' },
      ]},
      { title: 'Urology', topics: [
        { title: 'Lower urinary tract symptoms' }, { title: 'Urinary retention' }, { title: 'Haematuria' }, { title: 'Renal / ureteric stones' }, { title: 'Benign prostatic enlargement' }, { title: 'Hypospadias' }, { title: 'Posterior urethral valves' },
      ]},
      { title: 'Ear, Nose & Throat (ENT)', topics: [
        { title: 'Hearing loss' }, { title: 'Otalgia and ear discharge' }, { title: 'Epistaxis' }, { title: 'Sore throat' }, { title: 'Neck lump' },
      ]},
      { title: 'Neurosurgery', topics: [
        { title: 'Head injury' }, { title: 'Raised intracranial pressure' }, { title: 'Spinal cord compression' }, { title: 'Hydrocephalus' },
      ]},
      { title: 'Cardiothoracic Surgery', topics: [
        { title: 'Chest trauma' }, { title: 'Lung mass' }, { title: 'Pleural disease' }, { title: 'Congenital heart disease overview' },
      ]},
      { title: 'Plastic, Reconstructive Surgery & Burns', topics: [
        { title: 'Burns' }, { title: 'Wound assessment' }, { title: 'Skin and soft-tissue defects' }, { title: 'Hand injuries' },
      ]},
      { title: 'Paediatric Surgery', topics: [
        { title: 'Hypospadias' }, { title: 'Posterior urethral valves' }, { title: 'Undescended testis' }, { title: 'Intussusception' }, { title: 'Congenital abdominal wall defects' },
      ]},
      { title: 'Vascular Surgery', topics: [
        { title: 'Peripheral arterial disease' }, { title: 'Acute limb ischaemia' }, { title: 'Varicose veins' }, { title: 'Diabetic foot' },
      ]},
      { title: 'Ophthalmology & Maxillofacial Surgery', topics: [
        { title: 'Red eye' }, { title: 'Visual loss' }, { title: 'Facial trauma' }, { title: 'Maxillofacial infection' },
      ]},
    ],
  },
  {
    title: 'Paediatrics',
    specialties: [
      { title: 'General Paediatrics', topics: [
        { title: 'Fever in a child' }, { title: 'Suspected UTI in a child', aliases: ['urinary tract infection in a child', 'paediatric UTI'] }, { title: 'Failure to thrive' }, { title: 'Cough and difficulty breathing' }, { title: 'Diarrhoea and vomiting' },
      ]},
      { title: 'Neonatology', topics: [
        { title: 'Neonatal jaundice' }, { title: 'Neonatal sepsis' }, { title: 'Neonatal respiratory distress' }, { title: 'Prematurity' },
      ]},
      { title: 'Growth & Development', topics: [
        { title: 'Growth assessment' }, { title: 'Developmental milestones' }, { title: 'Immunisation review' }, { title: 'Nutritional assessment' },
      ]},
      { title: 'Paediatric Emergencies', topics: [
        { title: 'Paediatric initial assessment' }, { title: 'Dehydration' }, { title: 'Convulsions' }, { title: 'Severe acute malnutrition' },
      ]},
    ],
  },
  {
    title: 'Obstetrics & Gynaecology',
    specialties: [
      { title: 'Obstetrics', topics: [
        { title: 'Antenatal booking' }, { title: 'Hypertensive disorders of pregnancy' }, { title: 'Antepartum haemorrhage' }, { title: 'Labour assessment' }, { title: 'Postpartum haemorrhage' },
      ]},
      { title: 'Gynaecology', topics: [
        { title: 'Abnormal uterine bleeding' }, { title: 'Pelvic pain' }, { title: 'Vaginal discharge' }, { title: 'Ectopic pregnancy' }, { title: 'Infertility' },
      ]},
    ],
  },
  {
    title: 'Emergency Medicine',
    specialties: [
      { title: 'Initial Assessment & Resuscitation', topics: [
        { title: 'ABCDE approach' }, { title: 'Shock' }, { title: 'Sepsis recognition' }, { title: 'Altered consciousness' },
      ]},
      { title: 'Acute Presentations', topics: [
        { title: 'Acute chest pain' }, { title: 'Acute dyspnoea' }, { title: 'Acute abdominal pain', aliases: ['acute abdomen'] }, { title: 'Poisoning and overdose' },
      ]},
      { title: 'Trauma', topics: [
        { title: 'Primary trauma survey' }, { title: 'Head injury' }, { title: 'Spinal trauma' }, { title: 'Burns' },
      ]},
    ],
  },
  {
    title: 'Family, Psychiatry & Community Medicine',
    specialties: [
      { title: 'Family Medicine', topics: [
        { title: 'Primary care consultation' }, { title: 'Multimorbidity' }, { title: 'Preventive care' },
      ]},
      { title: 'Psychiatry', topics: [
        { title: 'Depression assessment' }, { title: 'Psychosis assessment' }, { title: 'Anxiety disorders' }, { title: 'Substance use disorders' },
      ]},
      { title: 'Community & Public Health', topics: [
        { title: 'Epidemiology principles' }, { title: 'Screening and prevention' }, { title: 'Health promotion' }, { title: 'Outbreak investigation' },
      ]},
    ],
  },
];

function topicMatches(topic: CatalogueTopic, query: string): boolean {
  const values = [topic.title, ...(topic.aliases ?? [])];
  return values.some((value) => value.toLowerCase().includes(query) || query.includes(value.toLowerCase()));
}

export function SectionPage({ section, query = '', onNavigate }: Props) {
  const item = modules[section];
  const Icon = item.icon;
  const [term, setTerm] = useState(query);
  const [discipline, setDiscipline] = useState('All disciplines');
  const [selectedTopic, setSelectedTopic] = useState('');
  const selectedGuide = findOfflineGuide(selectedTopic);

  const filtered = useMemo(() => {
    const q = term.trim().toLowerCase();
    return areas
      .filter((area) => discipline === 'All disciplines' || area.title === discipline)
      .map((area) => {
        const disciplineMatch = Boolean(q && area.title.toLowerCase().includes(q));
        const specialties = area.specialties
          .map((specialty) => {
            const specialtyMatch = Boolean(q && specialty.title.toLowerCase().includes(q));
            const topics = !q || disciplineMatch || specialtyMatch
              ? specialty.topics
              : specialty.topics.filter((topic) => topicMatches(topic, q));
            return { ...specialty, topics };
          })
          .filter((specialty) => specialty.topics.length > 0);
        return { ...area, specialties };
      })
      .filter((area) => !q || area.title.toLowerCase().includes(q) || area.specialties.length > 0);
  }, [term, discipline]);

  const topicCount = filtered.reduce((total, area) =>
    total + area.specialties.reduce((sum, specialty) => sum + specialty.topics.length, 0), 0);

  if (section === 'simulation') return <VirtualPatientSimulation onBack={() => onNavigate('workspace')} />;

  if (selectedTopic && selectedGuide) return <ClinicalGuideView guide={selectedGuide} onBack={() => setSelectedTopic('')} />;

  if (selectedTopic && !selectedGuide) return <div className="page-stack module-page">
    <button className="back-link" type="button" onClick={() => setSelectedTopic('')}><ArrowLeft size={15}/> Back to learning catalogue</button>
    <section className="surface-card topic-unavailable">
      <span><BookOpen size={28}/></span>
      <h1>{selectedTopic}</h1>
      <p>This topic is listed in the WardWise catalogue, but its detailed offline guide is still being prepared.</p>
      <p>Use current textbooks, approved local protocols and your clinical supervisor while this topic is being developed.</p>
      <button className="btn btn-secondary btn-small" type="button" onClick={() => setSelectedTopic('')}>Return to catalogue</button>
    </section>
  </div>;

  return <div className="page-stack module-page">
    <button className="back-link" type="button" onClick={() => onNavigate('workspace')}><ArrowLeft size={15}/> Back to workspace</button>
    <section className="module-hero"><div><div className="eyebrow"><span/> {item.eyebrow}</div><h1>{item.title}</h1><p>{item.intro}</p><small className="module-status"><i/> {item.status}</small></div><span className="module-icon"><Icon size={40}/></span></section>

    {section === 'clinical-tutor' ? <section className="tutor-guides-section">
      <div className="section-heading"><div><span className="kicker">AVAILABLE OFFLINE</span><h2>Starter clinical guides</h2><p>Source-linked material remains available without an AI request.</p></div><span className="neutral-pill">{offlineGuides.length} guides</span></div>
      <div className="tutor-guide-grid">{offlineGuides.map((guide,index)=><button type="button" className="tutor-guide-card" key={guide.id} onClick={() => setSelectedTopic(guide.title)}>
        <span className="tutor-guide-number">{String(index+1).padStart(2,'0')}</span>
        <small>{guide.discipline}</small>
        <h2>{guide.title}</h2>
        <p>{guide.subtitle}</p>
        <span className="tutor-guide-action">Open guide <ArrowRight size={14}/></span>
      </button>)}</div>
      <div className="module-next"><span><Sparkles size={20}/></span><div><b>More clinical topics are being added progressively.</b><p>The full specialty catalogue is larger than the current offline guide collection.</p></div><button className="btn btn-secondary btn-small" type="button" onClick={() => onNavigate('learning-catalogue')}>Open catalogue <ArrowRight size={14}/></button></div>
    </section> : null}

    {section === 'learning-catalogue' ? <section className="surface-card catalogue-panel">
      <div className="catalogue-toolbar">
        <label className="catalogue-search"><Search size={17}/><input aria-label="Search learning catalogue" value={term} onChange={(event)=>setTerm(event.target.value)} placeholder="Search a presentation, specialty or subspecialty…"/><small>{topicCount} topics</small></label>
        <label className="discipline-select"><span>Discipline</span><select value={discipline} onChange={(event)=>setDiscipline(event.target.value)}><option>All disciplines</option>{areas.map((area)=><option key={area.title}>{area.title}</option>)}</select></label>
      </div>
      {filtered.length ? <div className="catalogue-grid">{filtered.map((area)=><article className="catalogue-area" key={area.title}>
        <header><span><BookOpen size={17}/></span><h2>{area.title}</h2><small>{area.specialties.reduce((sum,specialty)=>sum+specialty.topics.length,0)}</small></header>
        <div className="catalogue-specialties">{area.specialties.map((specialty)=><section className="catalogue-specialty" key={specialty.title}>
          <h3>{specialty.title}</h3>
          <div>{specialty.topics.map((topic)=>{
            const hasGuide=Boolean(findOfflineGuide(topic.title));
            return <button type="button" key={topic.title} onClick={()=>setSelectedTopic(topic.title)}><span>{topic.title}{hasGuide?<small className="topic-available">Offline guide</small>:null}</span><ArrowRight size={14}/></button>;
          })}</div>
        </section>)}</div>
      </article>)}</div> : <div className="no-results"><FolderSearch size={28}/><h3>No matching topics found</h3><p>Try a broader term or choose “All disciplines”. The starter catalogue does not yet include the full topic library.</p><button className="btn btn-secondary btn-small" type="button" onClick={()=>{setTerm('');setDiscipline('All disciplines');}}>Clear search</button></div>}
      <p className="catalogue-note"><ShieldCheck size={15}/> Search spans disciplines, specialties, subspecialties and topic aliases. Detailed guides are marked separately; verify clinical advice with current references and local supervisors.</p>
    </section> : null}

    {section === 'profile-settings' ? <section className="profile-grid">
      <div className="surface-card profile-card"><span className="profile-avatar"><UserRound size={30}/></span><small className="kicker">YOUR PROFILE</small><h2>Student profile</h2><p>Your account details are managed through the private WardWise profile setup.</p><button className="btn btn-primary" type="button" onClick={()=>onNavigate('workspace')}>Return to workspace <ArrowRight size={15}/></button></div>
      <div className="surface-card security-card"><small className="kicker">PRIVACY & SECURITY</small><h2>What is protected</h2>{[{title:'Private account access',detail:'Registration and protected routes.'},{title:'Your own case records',detail:'Database row-level security per user.'},{title:'Server-side AI credentials',detail:'Gemini keys never bundled into browser code.'},{title:'Clear privacy controls',detail:'Data use, retention and deletion guidance.'}].map((row)=><div className="security-row" key={row.title}><span><LockKeyhole size={17}/></span><div><b>{row.title}</b><small>{row.detail}</small></div><CheckCircle2 size={16}/></div>)}</div>
    </section> : null}

    {section !== 'clinical-tutor' && section !== 'learning-catalogue' && section !== 'profile-settings' ? <><section className="feature-grid">{item.features.map((feature,index)=><article className="feature-card" key={feature.title}><span>{String(index+1).padStart(2,'0')}</span><div><h2>{feature.title}</h2><p>{feature.detail}</p></div><small><i/> Implemented in the workflow</small></article>)}</section><section className="module-next"><span><Sparkles size={20}/></span><div><b>This module is being expanded.</b><p>Use the available workflow and check every generated or simulated item against its stated source and context.</p></div><button className="btn btn-secondary btn-small" type="button" onClick={()=>onNavigate(item.action||'workspace')}>{item.action?'Browse learning catalogue':'Back to workspace'} <ArrowRight size={14}/></button></section></> : null}
    <p className="module-note"><ShieldCheck size={15}/> Educational use only. Do not enter identifiable patient information. Confirm care decisions with your clinical supervisor.</p>
  </div>;
}
