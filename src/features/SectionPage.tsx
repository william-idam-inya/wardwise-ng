import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ClipboardList, FileHeart, FolderSearch, LockKeyhole, Search, ShieldCheck, Sparkles, Stethoscope, UserRound, UsersRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { SectionId } from '../app/navigation';

type Props = { section: Exclude<SectionId, 'workspace'>; query?: string; onNavigate: (section: SectionId) => void };
type Feature = { title: string; detail: string };
type Module = { title: string; eyebrow: string; intro: string; icon: LucideIcon; status: string; features: Feature[]; action?: SectionId };

const modules: Record<Exclude<SectionId, 'workspace'>, Module> = {
  clerking: { title: 'AI Guided Clinical Clerking', eyebrow: 'STRUCTURED HISTORY-TAKING', icon: ClipboardList, status: 'Clerking workspace foundation', intro: 'Work through biodata, each presenting complaint, review of systems, examination, investigations and assessment without losing the thread of the history.', features: [
    { title: 'Biodata & case setup', detail: 'Use a synthetic or de-identified case label and record the source and reliability of the history.' },
    { title: 'One complaint at a time', detail: 'Use Complaint, Course, Cause/context, Complications and Care received for every presenting complaint.' },
    { title: 'A distinct review of systems', detail: 'Keep system review separate and mark unanswered questions honestly.' },
    { title: 'Live note & review', detail: 'Build a concise note, review missing details and prepare an export.' },
  ]},
  'clinical-tutor': { title: 'Clinical Tutor', eyebrow: 'LEARN THE CLINICAL FRAMEWORK', icon: Stethoscope, status: 'Tutor workspace foundation', intro: 'Review focused guides for history-taking, examination, investigations, differentials and management principles across core clinical disciplines.', features: [
    { title: 'Presentation guides', detail: 'Organised approaches to common symptoms and clinical presentations.' },
    { title: 'Examination guides', detail: 'Structured examination sequences and findings to look for.' },
    { title: 'Reasoning frameworks', detail: 'Compare leading diagnoses with supporting and opposing features.' },
    { title: 'Offline reference templates', detail: 'Deterministic learning content alongside clearly labelled AI support.' },
  ], action: 'learning-catalogue' },
  simulation: { title: 'Virtual Patient Simulation', eyebrow: 'PRACTISE A SAFE CLINICAL INTERVIEW', icon: UsersRound, status: 'Simulation workspace foundation', intro: 'Practise interviewing a fictional patient, choose relevant follow-up questions and receive feedback on history-taking and clinical reasoning.', features: [
    { title: 'Fictional scenarios', detail: 'Consistent case facts, symptoms and chronology throughout the exercise.' },
    { title: 'Learner-led questioning', detail: 'Use free-text or guided questions without seeing the diagnosis too early.' },
    { title: 'Examiner feedback', detail: 'Review missed questions, examination, differentials and reasoning.' },
    { title: 'Clear simulation boundary', detail: 'Every scenario will read “SIMULATION — NOT A REAL PATIENT”.' },
  ]},
  'case-library': { title: 'Case Library', eyebrow: 'YOUR CASES, ORGANISED', icon: FileHeart, status: 'Private storage not connected yet', intro: 'Return to learning notes, continue an unfinished history, revise the assessment and manage exported copies of your own cases.', features: [
    { title: 'Save & reopen', detail: 'Continue work after leaving the page or refreshing the browser.' },
    { title: 'Edit, duplicate or archive', detail: 'Keep revisions organised without overwriting the wrong case.' },
    { title: 'Search & filter', detail: 'Find cases by specialty, presentation, status and update date.' },
    { title: 'Export when ready', detail: 'Review a note before printing or exporting a copy.' },
  ]},
  'learning-catalogue': { title: 'Learning Catalogue', eyebrow: 'EXPLORE BY DISCIPLINE, SPECIALTY & TOPIC', icon: BookOpen, status: 'Catalogue structure foundation', intro: 'Find material through one connected catalogue. Choose a discipline or search for a presentation or topic.', features: [] },
  'profile-settings': { title: 'Profile & settings', eyebrow: 'MAKE YOUR WORKSPACE YOURS', icon: UserRound, status: 'Account setup not connected yet', intro: 'Your profile will hold the minimum details needed to personalise learning. Authentication and private storage must be connected before personal records can be saved.', features: [
    { title: 'Student profile', detail: 'Name, sex, age policy, study level, institution and optional training site.' },
    { title: 'Display preferences', detail: 'Light/dark mode and comfortable responsive typography.' },
    { title: 'Privacy & data', detail: 'Understand what is stored, why it is needed, retention and deletion.' },
    { title: 'Account security', detail: 'Registration, sign-in, password reset and protected private pages.' },
  ]},
};

const areas = [
  { title: 'Medicine', topics: ['Cardiology', 'Respiratory medicine', 'Gastroenterology', 'Endocrinology', 'Neurology', 'Renal medicine', 'Infectious diseases', 'Haematology'] },
  { title: 'Surgery', topics: ['General & gastrointestinal surgery', 'Hepatobiliary & pancreatic', 'Endocrine surgery', 'Breast & colorectal', 'Trauma & emergency surgery', 'Orthopaedics & traumatology', 'Urology', 'ENT', 'Neurosurgery', 'Cardiothoracic surgery', 'Plastic surgery & burns', 'Paediatric surgery', 'Vascular surgery', 'Ophthalmology & maxillofacial'] },
  { title: 'Paediatrics', topics: ['Neonatology', 'Growth & development', 'Paediatric emergencies', 'Common childhood presentations'] },
  { title: 'Obstetrics & Gynaecology', topics: ['Antenatal care', 'Labour & delivery', 'Gynaecological presentations', 'Maternal emergencies'] },
  { title: 'Emergency Medicine', topics: ['Initial assessment', 'Shock', 'Acute pain', 'Trauma', 'Resuscitation principles'] },
  { title: 'Family, Psychiatry & Community Medicine', topics: ['Primary care', 'Mental health', 'Epidemiology', 'Prevention & screening'] },
];

export function SectionPage({ section, query = '', onNavigate }: Props) {
  const item = modules[section];
  const Icon = item.icon;
  const [term, setTerm] = useState(query);
  const [discipline, setDiscipline] = useState('All disciplines');
  const filtered = useMemo(() => {
    const q = term.trim().toLowerCase();
    return areas
      .filter((area) => discipline === 'All disciplines' || area.title === discipline)
      .map((area) => ({ ...area, topics: area.topics.filter((topic) => !q || topic.toLowerCase().includes(q) || area.title.toLowerCase().includes(q)) }))
      .filter((area) => !q || area.title.toLowerCase().includes(q) || area.topics.length > 0);
  }, [term, discipline]);

  return <div className="page-stack module-page">
    <button className="back-link" type="button" onClick={() => onNavigate('workspace')}><ArrowLeft size={15} /> Back to workspace</button>
    <section className="module-hero"><div><div className="eyebrow"><span /> {item.eyebrow}</div><h1>{item.title}</h1><p>{item.intro}</p><small className="module-status"><i /> {item.status}</small></div><span className="module-icon"><Icon size={40} /></span></section>
    {section === 'learning-catalogue' ? <section className="surface-card catalogue-panel">
      <div className="catalogue-toolbar"><label className="catalogue-search"><Search size={17} /><input aria-label="Search learning catalogue" value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Try “appendicitis”, “cardiology” or “neonatology”…" /><small>{filtered.reduce((count, area) => count + area.topics.length, 0)} topics</small></label><label className="discipline-select"><span>Discipline</span><select value={discipline} onChange={(event) => setDiscipline(event.target.value)}><option>All disciplines</option>{areas.map((area) => <option key={area.title}>{area.title}</option>)}</select></label></div>
      {filtered.length ? <div className="catalogue-grid">{filtered.map((area) => <article className="catalogue-area" key={area.title}><header><span><BookOpen size={17} /></span><h2>{area.title}</h2><small>{area.topics.length}</small></header><div>{area.topics.map((topic) => <button type="button" key={topic} onClick={() => setTerm(topic)}>{topic}<ArrowRight size={14} /></button>)}</div></article>)}</div> : <div className="no-results"><FolderSearch size={28} /><h3>No matching topics found</h3><p>Try a broader term or choose “All disciplines”. This starter catalogue does not yet include the full topic library.</p><button className="btn btn-secondary btn-small" type="button" onClick={() => { setTerm(''); setDiscipline('All disciplines'); }}>Clear search</button></div>}
      <p className="catalogue-note"><ShieldCheck size={15} /> Verify clinical advice with current references, local protocols and clinical supervisors.</p>
    </section> : section === 'profile-settings' ? <section className="profile-grid">
      <div className="surface-card profile-card"><span className="profile-avatar"><UserRound size={30} /></span><small className="kicker">YOUR PROFILE</small><h2>Set up your student profile</h2><p>Personal details become active after the authentication and database security layers are implemented.</p><button className="btn btn-primary" type="button" onClick={() => onNavigate('workspace')}>Return to workspace <ArrowRight size={15} /></button></div>
      <div className="surface-card security-card"><small className="kicker">PRIVACY & SECURITY</small><h2>What will be protected</h2>{[{ title: 'Private account access', detail: 'Registration and protected routes.' }, { title: 'Your own case records', detail: 'Database row-level security per user.' }, { title: 'Server-side AI credentials', detail: 'Gemini keys never bundled into browser code.' }, { title: 'Clear privacy controls', detail: 'Data use, retention and deletion guidance.' }].map((row) => <div className="security-row" key={row.title}><span><LockKeyhole size={17} /></span><div><b>{row.title}</b><small>{row.detail}</small></div><CheckCircle2 size={16} /></div>)}</div>
    </section> : <><section className="feature-grid">{item.features.map((feature, index) => <article className="feature-card" key={feature.title}><span>{String(index + 1).padStart(2, '0')}</span><div><h2>{feature.title}</h2><p>{feature.detail}</p></div><small><i /> Planned</small></article>)}</section><section className="module-next"><span><Sparkles size={20} /></span><div><b>This module becomes interactive in the next build milestones.</b><p>This foundation does not save a case, send an AI request or generate a diagnosis.</p></div><button className="btn btn-secondary btn-small" type="button" onClick={() => onNavigate(item.action || 'workspace')}>{item.action ? 'Browse learning catalogue' : 'Back to workspace'} <ArrowRight size={14} /></button></section></>}
    <p className="module-note"><ShieldCheck size={15} /> Educational use only. Do not enter identifiable patient information. Confirm care decisions with your clinical supervisor.</p>
  </div>;
}
