import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Clipboard, FilePlus2, Plus, Printer, ShieldCheck, Trash2 } from 'lucide-react';
import type { SectionId } from '../../app/navigation';
import { formatClerkingNote } from './noteFormatter';
import { ProcessingIndicator } from '../../components/ProcessingIndicator';
import { saveClerkingDraft, PartialCaseSaveError } from '../case-library/case.service';
import { requestNextClerkingQuestion, type ClinicalAssistantResponse } from './clinicalAssistant.service';
import {
  createEmptyComplaint,
  createId,
  type CaseCategory,
  type ClerkingDraft,
  type Investigation,
  type PresentingComplaint,
  type RosStatus,
  type SexAtPresentation,
} from './clerking.types';

type Props = {
  draft: ClerkingDraft;
  onDraftChange: (draft: ClerkingDraft) => void;
  onNavigate: (section: SectionId) => void;
  onStartNew: () => void;
  userId: string;
  currentCaseId: string | null;
  onCaseSaved: (caseId: string) => void;
  currentStage: number;
  onCurrentStageChange: (stage: number) => void;
}

const steps = [
  { title: 'Case setup', detail: 'Specialty and setting' },
  { title: 'Biodata', detail: 'Age, sex and source' },
  { title: 'Presenting complaints', detail: 'Each complaint and duration' },
  { title: 'History of each complaint', detail: 'Course, cause, complications and care' },
  { title: 'Associated symptoms', detail: 'Relevant positives and negatives' },
  { title: 'Review of systems', detail: 'A distinct systems review' },
  { title: 'Past history', detail: 'Medical, surgical and drug history' },
  { title: 'Family and social history', detail: 'Hereditary and living context' },
  { title: 'Examination', detail: 'Findings and vital signs' },
  { title: 'Investigations', detail: 'Results, units and intervals' },
  { title: 'Assessment', detail: 'Summary and differential diagnoses' },
  { title: 'Plan', detail: 'Educational plan and escalation' },
  { title: 'Review note', detail: 'Read and copy the note' },
] as const;

const specialties = [
  'General Medicine', 'General Surgery', 'Paediatric Surgery', 'Paediatrics',
  'Obstetrics & Gynaecology', 'Emergency Medicine', 'Orthopaedics',
  'Urology', 'ENT', 'Family Medicine', 'Psychiatry', 'Community Medicine', 'Other',
];

const reliabilityOptions = ['Reliable', 'Fairly reliable', 'Unreliable', 'Not assessed'];
const rosOptions: RosStatus[] = ['Positive', 'Negative', 'Not elicited', 'Not applicable'];

function filled(values: string[]): boolean {
  return values.some((value) => value.trim().length > 0);
}

function Field({ label, value, onChange, placeholder, rows = 3, hint }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
}) {
  return <label className="clerking-field"><span>{label}</span><textarea value={value} rows={rows} onChange={(event) => onChange(event.target.value)} placeholder={placeholder ?? 'Enter information, or leave blank if not elicited.'} />{hint ? <small>{hint}</small> : null}</label>;
}

function TextInput({ label, value, onChange, placeholder, hint }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return <label className="clerking-field"><span>{label}</span><input type="text" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder ?? ''} />{hint ? <small>{hint}</small> : null}</label>;
}

function SelectField({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return <label className="clerking-field"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}

export function ClerkingWorkspace({ draft, onDraftChange, onNavigate, onStartNew, userId, currentCaseId, onCaseSaved, currentStage, onCurrentStageChange }: Props) {
  const [activeComplaintId, setActiveComplaintId] = useState(draft.complaints[0]?.id ?? '');
  const [copyStatus, setCopyStatus] = useState('');
  const [noteReviewed, setNoteReviewed] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');
  const [assistantState, setAssistantState] = useState<'idle' | 'waiting' | 'error'>('idle');
  const [assistantMessage, setAssistantMessage] = useState('');
  const [assistantResponse, setAssistantResponse] = useState<ClinicalAssistantResponse | null>(null);
  const [activeStep, setActiveStepState] = useState(currentStage);
  useEffect(() => { setActiveStepState(currentStage); }, [currentStage]);
  useEffect(() => {
    setAssistantState('idle');
    setAssistantMessage('');
    setAssistantResponse(null);
  }, [activeStep]);
  const setActiveStep = (stage: number) => { setActiveStepState(stage); onCurrentStageChange(stage); };
  const note = useMemo(() => formatClerkingNote(draft), [draft]);
  const activeComplaint = draft.complaints.find((complaint) => complaint.id === activeComplaintId) ?? draft.complaints[0];

  const applyDraft = (nextDraft: ClerkingDraft) => {
    onDraftChange(nextDraft);
    setNoteReviewed(false);
    setSaveState('idle');
    setSaveMessage('');
    setAssistantState('idle');
    setAssistantMessage('');
    setAssistantResponse(null);
  };

  const completion = [
    Boolean(draft.caseLabel.trim() && draft.specialty.trim() && draft.setting.trim()),
    Boolean(draft.biodata.age.trim() && draft.biodata.sex !== 'not_recorded' && draft.biodata.source.trim()),
    Boolean(draft.complaints.length && draft.complaints.every((item) => item.symptom.trim() && item.duration.trim())),
    Boolean(draft.complaints.length && draft.complaints.every((item) => filled([item.course, item.causeContext, item.complications, item.careReceived, item.symptomSpecific]))),
    Boolean(draft.complaints.length && draft.complaints.every((item) => item.associatedSymptoms.trim())),
    draft.ros.length > 0 && draft.ros.every((item) => item.reviewed),
    filled(Object.values(draft.pastHistory)),
    filled(Object.values(draft.familySocial)),
    Boolean(draft.examination.status === 'Not performed' || (draft.examination.status === 'Performed' && (draft.examination.general.trim() || draft.examination.systemFindings.trim() || filled([
      draft.examination.bloodPressure, draft.examination.pulse, draft.examination.respiratoryRate,
      draft.examination.temperature, draft.examination.oxygenSaturation,
    ])))),
    draft.investigations.some((item) => item.test.trim() && item.result.trim()),
    Boolean(draft.assessment.summary.trim() && (draft.assessment.leadingDiagnosis.trim() || draft.assessment.differentials.trim())),
    filled(Object.values(draft.plan)),
    noteReviewed,
  ];
  const completedCount = completion.filter(Boolean).length;

  const updateBiodata = <K extends keyof ClerkingDraft['biodata']>(key: K, value: ClerkingDraft['biodata'][K]) => {
    applyDraft({ ...draft, biodata: { ...draft.biodata, [key]: value } });
  };
  const updatePastHistory = (key: keyof ClerkingDraft['pastHistory'], value: string) => {
    applyDraft({ ...draft, pastHistory: { ...draft.pastHistory, [key]: value } });
  };
  const updateFamilySocial = (key: keyof ClerkingDraft['familySocial'], value: string) => {
    applyDraft({ ...draft, familySocial: { ...draft.familySocial, [key]: value } });
  };
  const updateExamination = <K extends keyof ClerkingDraft['examination']>(key: K, value: ClerkingDraft['examination'][K]) => {
    applyDraft({ ...draft, examination: { ...draft.examination, [key]: value } });
  };
  const updateAssessment = (key: keyof ClerkingDraft['assessment'], value: string) => {
    applyDraft({ ...draft, assessment: { ...draft.assessment, [key]: value } });
  };
  const updatePlan = (key: keyof ClerkingDraft['plan'], value: string) => {
    applyDraft({ ...draft, plan: { ...draft.plan, [key]: value } });
  };
  const updateComplaint = (id: string, patch: Partial<PresentingComplaint>) => {
    applyDraft({ ...draft, complaints: draft.complaints.map((item) => item.id === id ? { ...item, ...patch } : item) });
  };
  const addComplaint = () => {
    const next = createEmptyComplaint();
    applyDraft({ ...draft, complaints: [...draft.complaints, next] });
    setActiveComplaintId(next.id);
  };
  const removeComplaint = (id: string) => {
    const remaining = draft.complaints.filter((item) => item.id !== id);
    const next = remaining.length ? remaining : [createEmptyComplaint()];
    applyDraft({ ...draft, complaints: next });
    setActiveComplaintId(next[0].id);
  };
  const updateRos = (system: string, patch: { status?: RosStatus; details?: string }) => {
    applyDraft({ ...draft, ros: draft.ros.map((item) => item.system === system ? { ...item, ...patch, reviewed: true } : item) });
  };
  const updateInvestigation = (id: string, patch: Partial<Investigation>) => {
    applyDraft({ ...draft, investigations: draft.investigations.map((item) => item.id === id ? { ...item, ...patch } : item) });
  };
  const addInvestigation = () => {
    applyDraft({ ...draft, investigations: [...draft.investigations, {
      id: createId('investigation'), test: '', result: '', unit: '', referenceInterval: '', dateTime: '', interpretation: '',
    }] });
  };
  const removeInvestigation = (id: string) => {
    applyDraft({ ...draft, investigations: draft.investigations.filter((item) => item.id !== id) });
  };

  function getCurrentStageContext(): Record<string, unknown> {
    const complaintSummary = draft.complaints.map((item) => ({
      symptom: item.symptom,
      duration: item.duration,
    }));

    switch (activeStep) {
      case 1:
        return { biodata: draft.biodata };
      case 2:
        return { presentingComplaints: complaintSummary };
      case 3:
        return {
          activeComplaint: activeComplaint ? {
            symptom: activeComplaint.symptom,
            duration: activeComplaint.duration,
            course: activeComplaint.course,
            causeContext: activeComplaint.causeContext,
            complications: activeComplaint.complications,
            careReceived: activeComplaint.careReceived,
            symptomSpecific: activeComplaint.symptomSpecific,
          } : null,
          allComplaints: complaintSummary,
        };
      case 4:
        return {
          associatedSymptoms: draft.complaints.map((item) => ({
            symptom: item.symptom,
            associatedSymptoms: item.associatedSymptoms,
          })),
        };
      case 5:
        return {
          reviewOfSystems: draft.ros.map((item) => ({
            system: item.system,
            status: item.status,
            details: item.details,
            reviewed: item.reviewed,
          })),
        };
      case 6:
        return { pastHistory: draft.pastHistory };
      case 7:
        return { familyAndSocialHistory: draft.familySocial };
      case 8:
        return { examination: draft.examination };
      case 9:
        return { investigations: draft.investigations };
      case 10:
        return { assessment: draft.assessment };
      case 11:
        return { educationalPlan: draft.plan };
      default:
        return {};
    }
  }

  async function askAssistantForNextQuestion() {
    setAssistantState('waiting');
    setAssistantMessage('');
    setAssistantResponse(null);
    try {
      const response = await requestNextClerkingQuestion({
        stage: activeStep,
        stageTitle: steps[activeStep].title,
        caseCategory: draft.caseCategory,
        specialty: draft.specialty,
        setting: draft.setting,
        clinicalContext: getCurrentStageContext(),
      });
      setAssistantResponse(response);
      setAssistantState('idle');
    } catch (error) {
      setAssistantState('error');
      setAssistantMessage(
        error instanceof Error
          ? error.message
          : 'The clinical assistant could not complete the request. Your entries remain unchanged.',
      );
    }
  }

  async function saveDraft() {
    if (draft.caseLabel.trim().length < 2) {
      setSaveState('error');
      setSaveMessage('Use a non-identifying case label containing at least two characters.');
      return;
    }
    setSaveState('saving');
    setSaveMessage('');
    try {
      const saved = await saveClerkingDraft({ userId, caseId: currentCaseId, draft, currentStage: activeStep });
      onCaseSaved(saved.id);
      setSaveState('saved');
      setSaveMessage('Case and current clerking stage saved to your WardWise account.');
    } catch (error) {
      if (error instanceof PartialCaseSaveError) onCaseSaved(error.caseId);
      setSaveState('error');
      setSaveMessage(error instanceof Error ? error.message : 'The case could not be saved. Your current entries remain in this session.');
    }
  }

  async function copyNote() {
    setCopyStatus('');
    try {
      await navigator.clipboard.writeText(note);
      setCopyStatus('The note was copied to your clipboard.');
    } catch {
      setCopyStatus('Clipboard access was unavailable. Select the note text and copy it manually.');
    }
  }

  function resetDraft() {
    if (window.confirm('Start a new clerking draft? The current in-memory draft will be cleared.')) {
      onStartNew();
      setActiveStep(0);
      setCopyStatus('');
      setSaveState('idle');
      setSaveMessage('');
      setNoteReviewed(false);
      setAssistantState('idle');
      setAssistantMessage('');
      setAssistantResponse(null);
    }
  }

  const next = () => setActiveStep(Math.min(steps.length - 1, activeStep + 1));
  const back = () => setActiveStep(Math.max(0, activeStep - 1));

  return <div className="clerking-page page-stack">
    <button className="back-link" type="button" onClick={() => onNavigate('workspace')}><ArrowLeft size={15}/> Back to workspace</button>
    <section className="clerking-intro">
      <div>
        <div className="eyebrow"><span/> GUIDED CLINICAL HISTORY</div>
        <h1>AI Guided Clinical Clerking</h1>
        <p>Build a coherent clinical history one stage at a time. Each presenting complaint has its own history, followed by a separate review of systems, examination and assessment.</p>
        <div className="clerking-notice"><ShieldCheck size={17}/><span>Use synthetic or properly de-identified cases only. Unsaved changes are held in memory; choose Save draft to write this case to your private WardWise account.</span></div>
      </div>
      <div className="clerking-intro-actions">
        <button type="button" className="btn btn-secondary btn-small" onClick={resetDraft}><FilePlus2 size={15}/> New draft</button>
        <button type="button" className="btn btn-primary btn-small" onClick={()=>void saveDraft()} disabled={saveState==='saving' || !draft.caseLabel.trim()}><Clipboard size={14}/>{saveState==='saving'?'Saving…':'Save draft'}</button>
      </div>
    </section>

    {saveState==='saving' ? <ProcessingIndicator label="Saving clinical case" detail="Saving the case and clerking stage to your private account."/> : null}
    {saveMessage ? <p className={saveState==='error'?'auth-error':'auth-banner'} role="status">{saveMessage}</p> : null}
    <div className="clerking-ai-status">
      <span className="ai-status-dot" />
      <div>
        <b>WardWise clinical assistant</b>
        <small>Ask for one focused follow-up question for this stage. Check suggestions against the history and your clinical supervisor.</small>
      </div>
      {activeStep > 0 && activeStep < 12 ? (
        <button
          type="button"
          className="btn btn-secondary btn-small"
          onClick={() => void askAssistantForNextQuestion()}
          disabled={assistantState === 'waiting'}
        >
          Ask for next question <ArrowRight size={14} />
        </button>
      ) : null}
    </div>
    {assistantState === 'waiting' ? (
      <div className="assistant-response">
        <ProcessingIndicator label="Waiting for Gemini response" detail="Your stage-specific context is being sent to the authenticated WardWise function." />
      </div>
    ) : null}
    {assistantState === 'error' && assistantMessage ? (
      <div className="assistant-response assistant-response--error" role="alert">{assistantMessage}</div>
    ) : null}
    {assistantResponse ? (
      <section className="assistant-response" aria-live="polite">
        <span className="kicker">SUGGESTED NEXT QUESTION</span>
        <h3>{assistantResponse.assistant_message}</h3>
        <p><b>Why this matters:</b> {assistantResponse.question_purpose}</p>
        {assistantResponse.missing_information.length ? (
          <p><b>Details to clarify:</b> {assistantResponse.missing_information.join(' · ')}</p>
        ) : null}
        {assistantResponse.safety_flags.length ? (
          <div className="assistant-safety-flags">
            <b>Safety / escalation note</b>
            {assistantResponse.safety_flags.map((flag, index) => <p key={index}>{flag}</p>)}
          </div>
        ) : null}
        <small>AI-generated educational prompt · {assistantResponse.model} · Verify before use.</small>
      </section>
    ) : null}

    <div className="clerking-layout">
      <aside className="clerking-step-panel" aria-label="Clerking stages">
        <div className="clerking-progress-heading"><b>Clerking stages</b><small>{completedCount} of {steps.length} recorded</small></div>
        <div className="clerking-progress-track"><span style={{ width: (completedCount / steps.length * 100) + '%' }}/></div>
        <nav className="clerking-step-list">
          {steps.map((step, index) => <button type="button" key={step.title} className={'clerking-step ' + (activeStep === index ? 'active' : '')} aria-current={activeStep === index ? 'step' : undefined} onClick={() => setActiveStep(index)}>
            <span className={'clerking-step-number ' + (completion[index] ? 'complete' : '')}>{completion[index] ? <Check size={13}/> : index + 1}</span>
            <span><b>{step.title}</b><small>{step.detail}</small></span>
          </button>)}
        </nav>
      </aside>

      <section className="clerking-work-area">
        <header className="clerking-stage-header"><div><small>STAGE {activeStep + 1} OF {steps.length}</small><h2>{steps[activeStep].title}</h2><p>{steps[activeStep].detail}</p></div><span className="clerking-stage-count">{completedCount} recorded</span></header>
        <div className="clerking-form-area">
          {activeStep === 0 ? <div className="clerking-form-grid">
            <div className="clerking-stage-prompt"><b>What case are you clerking?</b><p>Use a short, non-identifying case label. Do not enter a patient's name, hospital number, phone number or address.</p></div>
            <SelectField label="Case type" value={draft.caseCategory} onChange={(value)=>applyDraft({ ...draft, caseCategory: value as CaseCategory })} options={[{value:'synthetic',label:'Synthetic case'},{value:'deidentified',label:'De-identified case'}]}/>
            <TextInput label="Case label (non-identifying)" value={draft.caseLabel} onChange={(value) => applyDraft({ ...draft, caseLabel: value })} placeholder="e.g. Child with recurrent urinary symptoms"/>
            <SelectField label="Specialty" value={draft.specialty} onChange={(value) => applyDraft({ ...draft, specialty: value })} options={specialties.map((value) => ({ value, label: value }))}/>
            <SelectField label="Clinical setting" value={draft.setting} onChange={(value) => applyDraft({ ...draft, setting: value })} options={['Teaching hospital', 'General hospital', 'Primary care', 'Emergency department', 'Outpatient clinic', 'Ward', 'Other'].map((value) => ({ value, label: value }))}/>
          </div> : null}

          {activeStep === 1 ? <div className="clerking-form-grid">
            <div className="clerking-stage-prompt"><b>Who is the source of the history?</b><p>Record only relevant, non-identifying biodata. Age can be recorded as an age band when appropriate.</p></div>
            <TextInput label="Age / age band" value={draft.biodata.age} onChange={(value) => updateBiodata('age', value)} placeholder="e.g. 8 years"/>
            <SelectField label="Sex" value={draft.biodata.sex} onChange={(value) => updateBiodata('sex', value as SexAtPresentation)} options={[{value:'not_recorded',label:'Not recorded'},{value:'female',label:'Female'},{value:'male',label:'Male'},{value:'intersex',label:'Intersex'}]}/>
            <TextInput label="Occupation / schooling" value={draft.biodata.occupation} onChange={(value) => updateBiodata('occupation', value)} placeholder="e.g. Primary school pupil"/>
            <TextInput label="Residence context (non-identifying)" value={draft.biodata.residenceContext} onChange={(value) => updateBiodata('residenceContext', value)} placeholder="e.g. Urban / rural"/>
            <TextInput label="Source of history" value={draft.biodata.source} onChange={(value) => updateBiodata('source', value)} placeholder="e.g. Patient / mother / caregiver"/>
            <SelectField label="Reliability of history" value={draft.biodata.reliability} onChange={(value) => updateBiodata('reliability', value)} options={[{value:'',label:'Not assessed'},...reliabilityOptions.map((value) => ({value,label:value}))]}/>
          </div> : null}

          {activeStep === 2 ? <div className="clerking-form-grid">
            <div className="clerking-stage-prompt"><b>What brought the patient to care?</b><p>List each presenting complaint separately and record its duration. You can add more than one complaint.</p></div>
            {draft.complaints.map((complaint, index) => <div className="clerking-repeat-card" key={complaint.id}>
              <div className="clerking-repeat-heading"><b>Presenting complaint {index + 1}</b>{draft.complaints.length > 1 ? <button className="icon-btn" type="button" aria-label={'Remove complaint ' + (index + 1)} onClick={() => removeComplaint(complaint.id)}><Trash2 size={16}/></button> : null}</div>
              <div className="clerking-repeat-fields"><TextInput label="Complaint" value={complaint.symptom} onChange={(value) => updateComplaint(complaint.id,{symptom:value})} placeholder="e.g. Abdominal pain"/><TextInput label="Duration" value={complaint.duration} onChange={(value) => updateComplaint(complaint.id,{duration:value})} placeholder="e.g. 3 days"/></div>
            </div>)}
            <button className="btn btn-secondary clerking-add-btn" type="button" onClick={addComplaint}><Plus size={15}/> Add another complaint</button>
          </div> : null}

          {activeStep === 3 ? <div className="clerking-form-grid">
            <div className="clerking-stage-prompt"><b>Explore each complaint independently.</b><p>Use the same framework for every complaint: Complaint, Course, Cause/context, Complications and Care received. Add symptom-specific questions where needed.</p></div>
            <SelectField label="Currently documenting" value={activeComplaint?.id ?? ''} onChange={setActiveComplaintId} options={draft.complaints.map((item,index)=>({value:item.id,label:(index+1)+'. '+(item.symptom.trim()||'Untitled complaint')}))}/>
            {activeComplaint ? <>
              <div className="clerking-selected-complaint">Complaint: <b>{activeComplaint.symptom || 'Not yet entered'}</b> · Duration: <b>{activeComplaint.duration || 'Not recorded'}</b></div>
              <Field label="Course" value={activeComplaint.course} onChange={(value)=>updateComplaint(activeComplaint.id,{course:value})} placeholder="Onset, chronology, progression, pattern, severity and character."/>
              <Field label="Cause / context" value={activeComplaint.causeContext} onChange={(value)=>updateComplaint(activeComplaint.id,{causeContext:value})} placeholder="Precipitating factors, risks, exposures and relevant associations. Do not assume a cause."/>
              <Field label="Complications" value={activeComplaint.complications} onChange={(value)=>updateComplaint(activeComplaint.id,{complications:value})} placeholder="Symptoms or consequences suggesting severity or complications."/>
              <Field label="Care received" value={activeComplaint.careReceived} onChange={(value)=>updateComplaint(activeComplaint.id,{careReceived:value})} placeholder="Treatment sought, medicines, procedures, response and source of care."/>
              <Field label="Symptom-specific details" value={activeComplaint.symptomSpecific} onChange={(value)=>updateComplaint(activeComplaint.id,{symptomSpecific:value})} placeholder="Add relevant dimensions such as site, radiation, timing, aggravating or relieving factors."/>
            </> : <p>Add a presenting complaint in the previous stage first.</p>}
          </div> : null}

          {activeStep === 4 ? <div className="clerking-form-grid">
            <div className="clerking-stage-prompt"><b>What other symptoms accompany each complaint?</b><p>Record relevant positives and negatives for each complaint. Do not interpret a blank field as absence of symptoms.</p></div>
            {draft.complaints.map((complaint,index)=><Field key={complaint.id} label={(index+1)+'. '+(complaint.symptom.trim()||'Presenting complaint')} value={complaint.associatedSymptoms} onChange={(value)=>updateComplaint(complaint.id,{associatedSymptoms:value})} placeholder="Relevant associated symptoms, including important positives and negatives." rows={4}/>)}
          </div> : null}

          {activeStep === 5 ? <div className="clerking-form-grid">
            <div className="clerking-stage-prompt"><b>Review each system separately.</b><p>Choose the status that reflects what was actually asked. Unanswered systems remain “Not elicited”; they are not automatically negative.</p></div>
            {draft.ros.map((entry)=><div className="clerking-ros-row" key={entry.system}>
              <b>{entry.system}</b>
              <select aria-label={entry.system+' status'} value={entry.status} onChange={(event)=>updateRos(entry.system,{status:event.target.value as RosStatus})}>{rosOptions.map((value)=><option key={value}>{value}</option>)}</select>
              <input aria-label={entry.system+' details'} value={entry.details} onChange={(event)=>updateRos(entry.system,{details:event.target.value})} placeholder="Details (optional)"/>
            </div>)}
          </div> : null}

          {activeStep === 6 ? <div className="clerking-form-grid">
            <div className="clerking-stage-prompt"><b>Relevant previous health and treatment history</b><p>Use concise statements where appropriate. Record “No known…” only when that history was specifically elicited.</p></div>
            <Field label="Past medical history" value={draft.pastHistory.medical} onChange={(value)=>updatePastHistory('medical',value)}/>
            <Field label="Past surgical history" value={draft.pastHistory.surgical} onChange={(value)=>updatePastHistory('surgical',value)}/>
            <Field label="Previous admissions" value={draft.pastHistory.admissions} onChange={(value)=>updatePastHistory('admissions',value)}/>
            <Field label="Blood transfusion history" value={draft.pastHistory.transfusion} onChange={(value)=>updatePastHistory('transfusion',value)}/>
            <Field label="Drug / medication history" value={draft.pastHistory.medications} onChange={(value)=>updatePastHistory('medications',value)}/>
            <Field label="Allergy history" value={draft.pastHistory.allergies} onChange={(value)=>updatePastHistory('allergies',value)}/>
            <Field label="Immunisation history (where relevant)" value={draft.pastHistory.immunisation} onChange={(value)=>updatePastHistory('immunisation',value)}/>
            <Field label="Obstetric / gynaecological history (where relevant)" value={draft.pastHistory.obstetricGynaecological} onChange={(value)=>updatePastHistory('obstetricGynaecological',value)}/>
            <Field label="Developmental history (where relevant)" value={draft.pastHistory.developmental} onChange={(value)=>updatePastHistory('developmental',value)}/>
          </div> : null}

          {activeStep === 7 ? <div className="clerking-form-grid">
            <div className="clerking-stage-prompt"><b>Explore the relevant family and social context.</b><p>Do not record identifying home addresses or names of relatives.</p></div>
            <Field label="Family history" value={draft.familySocial.family} onChange={(value)=>updateFamilySocial('family',value)} placeholder="Relevant hereditary and familial conditions."/>
            <Field label="Occupation / schooling" value={draft.familySocial.occupationSchooling} onChange={(value)=>updateFamilySocial('occupationSchooling',value)}/>
            <Field label="Living circumstances" value={draft.familySocial.livingCircumstances} onChange={(value)=>updateFamilySocial('livingCircumstances',value)} placeholder="Non-identifying household and support context."/>
            <Field label="Diet and nutrition" value={draft.familySocial.diet} onChange={(value)=>updateFamilySocial('diet',value)}/>
            <Field label="Substance / environmental exposure" value={draft.familySocial.substanceExposure} onChange={(value)=>updateFamilySocial('substanceExposure',value)}/>
            <Field label="Functional status" value={draft.familySocial.functionalStatus} onChange={(value)=>updateFamilySocial('functionalStatus',value)} placeholder="Relevant baseline function and activities of daily living."/>
          </div> : null}

          {activeStep === 8 ? <div className="clerking-form-grid">
            <div className="clerking-stage-prompt"><b>Record what was actually examined.</b><p>Separate observed findings from clinical interpretation. Choose “Not performed” when an examination was not done.</p></div>
            <SelectField label="Examination status" value={draft.examination.status} onChange={(value)=>updateExamination('status',value as ClerkingDraft['examination']['status'])} options={[{value:'Not assessed',label:'Not assessed'},{value:'Not performed',label:'Not performed'},{value:'Performed',label:'Performed'}]}/>
            <Field label="General examination" value={draft.examination.general} onChange={(value)=>updateExamination('general',value)} placeholder="General appearance and relevant general findings."/>
            <div className="clerking-vitals-grid">
              <TextInput label="Blood pressure" value={draft.examination.bloodPressure} onChange={(value)=>updateExamination('bloodPressure',value)} placeholder="e.g. 120/80 mmHg"/>
              <TextInput label="Pulse" value={draft.examination.pulse} onChange={(value)=>updateExamination('pulse',value)} placeholder="e.g. 84 bpm"/>
              <TextInput label="Respiratory rate" value={draft.examination.respiratoryRate} onChange={(value)=>updateExamination('respiratoryRate',value)} placeholder="e.g. 18 /min"/>
              <TextInput label="Temperature" value={draft.examination.temperature} onChange={(value)=>updateExamination('temperature',value)} placeholder="e.g. 36.8 °C"/>
              <TextInput label="Oxygen saturation" value={draft.examination.oxygenSaturation} onChange={(value)=>updateExamination('oxygenSaturation',value)} placeholder="e.g. 98%"/>
            </div>
            <Field label="System-specific examination findings" value={draft.examination.systemFindings} onChange={(value)=>updateExamination('systemFindings',value)} placeholder="Record the system examined and the findings observed. Use “Not performed” where appropriate." rows={5}/>
          </div> : null}

          {activeStep === 9 ? <div className="clerking-form-grid">
            <div className="clerking-stage-prompt"><b>Enter investigation results exactly as reported.</b><p>Include units, reference intervals and date/time where available. Do not create or infer missing results.</p></div>
            {draft.investigations.map((item,index)=><div className="clerking-repeat-card" key={item.id}>
              <div className="clerking-repeat-heading"><b>Investigation {index+1}</b><button className="icon-btn" type="button" aria-label={'Remove investigation '+(index+1)} onClick={()=>removeInvestigation(item.id)}><Trash2 size={16}/></button></div>
              <div className="clerking-repeat-fields"><TextInput label="Test" value={item.test} onChange={(value)=>updateInvestigation(item.id,{test:value})} placeholder="e.g. Serum potassium"/><TextInput label="Result" value={item.result} onChange={(value)=>updateInvestigation(item.id,{result:value})} placeholder="Exact reported result"/><TextInput label="Unit" value={item.unit} onChange={(value)=>updateInvestigation(item.id,{unit:value})} placeholder="e.g. mmol/L"/><TextInput label="Reference interval" value={item.referenceInterval} onChange={(value)=>updateInvestigation(item.id,{referenceInterval:value})}/><TextInput label="Date / time" value={item.dateTime} onChange={(value)=>updateInvestigation(item.id,{dateTime:value})}/></div>
              <Field label="Interpretation (educational)" value={item.interpretation} onChange={(value)=>updateInvestigation(item.id,{interpretation:value})} placeholder="Interpret only from the supplied result, units and context." rows={2}/>
            </div>)}
            <button className="btn btn-secondary clerking-add-btn" type="button" onClick={addInvestigation}><Plus size={15}/> Add investigation</button>
          </div> : null}

          {activeStep === 10 ? <div className="clerking-form-grid">
            <div className="clerking-stage-prompt"><b>Summarise the clinical problem before ranking possible diagnoses.</b><p>Separate the working diagnosis from differentials. Record supporting and opposing evidence without treating possibilities as confirmed.</p></div>
            <Field label="Summary / problem representation" value={draft.assessment.summary} onChange={(value)=>updateAssessment('summary',value)} rows={4}/>
            <Field label="Leading (working) diagnosis" value={draft.assessment.leadingDiagnosis} onChange={(value)=>updateAssessment('leadingDiagnosis',value)}/>
            <Field label="Ranked differential diagnoses" value={draft.assessment.differentials} onChange={(value)=>updateAssessment('differentials',value)} placeholder="List differentials in order and why they are considered."/>
            <Field label="Supporting features" value={draft.assessment.supportingFeatures} onChange={(value)=>updateAssessment('supportingFeatures',value)}/>
            <Field label="Opposing features / uncertainties" value={draft.assessment.opposingFeatures} onChange={(value)=>updateAssessment('opposingFeatures',value)}/>
          </div> : null}

          {activeStep === 11 ? <div className="clerking-form-grid">
            <div className="clerking-stage-prompt"><b>Outline an educational plan for discussion with a supervisor.</b><p>These are learning considerations, not autonomous prescribing or a substitute for local protocols.</p></div>
            <Field label="Further investigations to consider" value={draft.plan.furtherInvestigations} onChange={(value)=>updatePlan('furtherInvestigations',value)}/>
            <Field label="Management considerations" value={draft.plan.managementConsiderations} onChange={(value)=>updatePlan('managementConsiderations',value)}/>
            <Field label="Red flags / immediate priorities" value={draft.plan.redFlags} onChange={(value)=>updatePlan('redFlags',value)}/>
            <Field label="Senior review / escalation triggers" value={draft.plan.escalationTriggers} onChange={(value)=>updatePlan('escalationTriggers',value)}/>
          </div> : null}

          {activeStep === 12 ? <div className="clerking-note-preview">
            <div className="clerking-stage-prompt"><b>Review the structured note.</b><p>Check every section, correct errors and fill missing information. “Not elicited” means the information was not recorded; it is not a negative finding.</p></div>
            <div className="clerking-note-actions"><button className="btn btn-primary btn-small" type="button" onClick={()=>void copyNote()}><Clipboard size={15}/> Copy note</button><button className="btn btn-secondary btn-small" type="button" onClick={()=>window.print()}><Printer size={15}/> Print / Save PDF</button><button className="btn btn-secondary btn-small" type="button" onClick={()=>setNoteReviewed(true)}><Check size={15}/> Mark note reviewed</button>{copyStatus ? <span role="status">{copyStatus}</span> : null}</div>
            <div className="clerking-note-print"><pre className="clerking-note-text">{note}</pre></div>
          </div> : null}
        </div>
        <footer className="clerking-stage-footer">
          <button type="button" className="btn btn-secondary" onClick={back} disabled={activeStep===0}><ArrowLeft size={15}/> Previous</button>
          <span>{completion[activeStep] ? 'This stage has recorded information.' : 'You can continue with unanswered items clearly marked.'}</span>
          {activeStep < steps.length - 1 ? <button type="button" className="btn btn-primary" onClick={next}>Next stage <ArrowRight size={15}/></button> : <button type="button" className="btn btn-secondary" onClick={()=>setActiveStep(0)}>Review from beginning</button>}
        </footer>
      </section>
    </div>
    <section className="clerking-final-note"><ShieldCheck size={18}/><p><b>Clinical safety:</b> the workflow does not invent patient answers, examination findings or investigation results. Have a qualified clinician review the note and clinical plan.</p></section>
  </div>;
}
