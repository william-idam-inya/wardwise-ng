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
  'learning-catalogue': { title: 'Learning Catalogue', eyebrow: 'EXPLORE BY DISCIPLINE, SPECIALTY & TOPIC', icon: BookOpen, status: 'Starter catalogue · ' + offlineGuides.length + ' detailed offline guides', intro: 'Search a presenting complaint or browse by clinical discipline. Detailed source-linked guides are clearly distinguished from topics still being prepared.', features: [] },
  'profile-settings': { title: 'Profile & settings', eyebrow: 'MAKE YOUR WORKSPACE YOURS', icon: UserRound, status: 'Account profile', intro: 'Your profile holds the minimum details needed to personalise learning. Account security and profile access are provided through Supabase.', features: [
    { title: 'Student profile', detail: 'Name, sex, age in years, study level, institution and optional training site.' },
    { title: 'Display preferences', detail: 'Light/dark mode and responsive typography.' },
    { title: 'Privacy & data', detail: 'Understand what is stored, why it is needed, retention and deletion.' },
    { title: 'Account security', detail: 'Registration, sign-in, password reset and protected private pages.' },
  ]},
};

const areas = [
  { title: 'Medicine', topics: ['Cardiology', 'Respiratory medicine', 'Gastroenterology', 'Jaundice evaluation', 'Endocrinology', 'Neurology', 'Renal medicine', 'Infectious diseases', 'Haematology', 'Diabetes mellitus', 'Hypertension'] },
  { title: 'Surgery', topics: ['General & gastrointestinal surgery', 'Acute abdominal pain', 'Appendicitis', 'Hepatobiliary & pancreatic', 'Endocrine surgery', 'Breast & colorectal', 'Trauma & emergency surgery', 'Orthopaedics & traumatology', 'Urology', 'ENT', 'Neurosurgery', 'Cardiothoracic surgery', 'Plastic surgery & burns', 'Paediatric surgery', 'Vascular surgery', 'Ophthalmology & maxillofacial'] },
  { title: 'Paediatrics', topics: ['Neonatology', 'Growth & development', 'Suspected UTI in a child', 'Paediatric emergencies', 'Common childhood presentations'] },
  { title: 'Obstetrics & Gynaecology', topics: ['Antenatal care', 'Labour & delivery', 'Gynaecological presentations', 'Maternal emergencies'] },
  { title: 'Emergency Medicine', topics: ['Initial assessment', 'Shock', 'Acute pain', 'Trauma', 'Resuscitation principles'] },
  { title: 'Family, Psychiatry & Community Medicine', topics: ['Primary care', 'Mental health', 'Epidemiology', 'Prevention & screening'] },
];

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
      .map((area) => ({ ...area, topics: area.topics.filter((topic) => !q || topic.toLowerCase().includes(q) || area.title.toLowerCase().includes(q)) }))
      .filter((area) => !q || area.title.toLowerCase().includes(q) || area.topics.length > 0);
  }, [term, discipline]);

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
      <div className="catalogue-toolbar"><label className="catalogue-search"><Search size={17}/><input aria-label="Search learning catalogue" value={term} onChange={(event)=>setTerm(event.target.value)} placeholder="Try “jaundice”, “abdominal pain” or “cardiology”…"/><small>{filtered.reduce((count,area)=>count+area.topics.length,0)} topics</small></label><label className="discipline-select"><span>Discipline</span><select value={discipline} onChange={(event)=>setDiscipline(event.target.value)}><option>All disciplines</option>{areas.map((area)=><option key={area.title}>{area.title}</option>)}</select></label></div>
      {filtered.length ? <div className="catalogue-grid">{filtered.map((area)=><article className="catalogue-area" key={area.title}><header><span><BookOpen size={17}/></span><h2>{area.title}</h2><small>{area.topics.length}</small></header><div>{area.topics.map((topic)=>{
        const hasGuide=Boolean(findOfflineGuide(topic));
        return <button type="button" key={topic} onClick={()=>{setSelectedTopic(topic);}}><span>{topic}{hasGuide?<small className="topic-available">Offline guide</small>:null}</span><ArrowRight size={14}/></button>;
      })}</div></article>)}</div> : <div className="no-results"><FolderSearch size={28}/><h3>No matching topics found</h3><p>Try a broader term or choose “All disciplines”. The starter catalogue does not yet include the full topic library.</p><button className="btn btn-secondary btn-small" type="button" onClick={()=>{setTerm('');setDiscipline('All disciplines');}}>Clear search</button></div>}
      <p className="catalogue-note"><ShieldCheck size={15}/> Verify clinical advice with current references, local protocols and clinical supervisors.</p>
    </section> : null}

    {section === 'profile-settings' ? <section className="profile-grid">
      <div className="surface-card profile-card"><span className="profile-avatar"><UserRound size={30}/></span><small className="kicker">YOUR PROFILE</small><h2>Student profile</h2><p>Your account details are managed through the private WardWise profile setup.</p><button className="btn btn-primary" type="button" onClick={()=>onNavigate('workspace')}>Return to workspace <ArrowRight size={15}/></button></div>
      <div className="surface-card security-card"><small className="kicker">PRIVACY & SECURITY</small><h2>What is protected</h2>{[{title:'Private account access',detail:'Registration and protected routes.'},{title:'Your own case records',detail:'Database row-level security per user.'},{title:'Server-side AI credentials',detail:'Gemini keys never bundled into browser code.'},{title:'Clear privacy controls',detail:'Data use, retention and deletion guidance.'}].map((row)=><div className="security-row" key={row.title}><span><LockKeyhole size={17}/></span><div><b>{row.title}</b><small>{row.detail}</small></div><CheckCircle2 size={16}/></div>)}</div>
    </section> : null}

    {section !== 'clinical-tutor' && section !== 'learning-catalogue' && section !== 'profile-settings' ? <><section className="feature-grid">{item.features.map((feature,index)=><article className="feature-card" key={feature.title}><span>{String(index+1).padStart(2,'0')}</span><div><h2>{feature.title}</h2><p>{feature.detail}</p></div><small><i/> Implemented in the workflow</small></article>)}</section><section className="module-next"><span><Sparkles size={20}/></span><div><b>This module is being expanded.</b><p>Use the available workflow and check every generated or simulated item against its stated source and context.</p></div><button className="btn btn-secondary btn-small" type="button" onClick={()=>onNavigate(item.action||'workspace')}>{item.action?'Browse learning catalogue':'Back to workspace'} <ArrowRight size={14}/></button></section></> : null}
    <p className="module-note"><ShieldCheck size={15}/> Educational use only. Do not enter identifiable patient information. Confirm care decisions with your clinical supervisor.</p>
  </div>;
}
