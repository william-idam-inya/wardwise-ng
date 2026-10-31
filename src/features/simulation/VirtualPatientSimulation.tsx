import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardList, History, LoaderCircle, RotateCcw, Save, Send, ShieldAlert, Stethoscope } from 'lucide-react';
import { ProcessingIndicator } from '../../components/ProcessingIndicator';
import {
  listSimulationSessions,
  loadSimulationSession,
  saveSimulationSession,
  type SimulationAssessment,
  type SimulationSessionSummary,
  type SimulationTurn,
} from './simulation.service';
import { answerVirtualPatientQuestion, virtualPatientScenarios } from './simulation.data';

type Props = { onBack: () => void };

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export function VirtualPatientSimulation({ onBack }: Props) {
  const [scenarioId, setScenarioId] = useState(virtualPatientScenarios[0].id);
  const [turns, setTurns] = useState<SimulationTurn[]>([{ speaker: 'patient', message: virtualPatientScenarios[0].opening }]);
  const [question, setQuestion] = useState('');
  const [domains, setDomains] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [savedSessionId, setSavedSessionId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [history, setHistory] = useState<SimulationSessionSummary[]>([]);
  const [historyError, setHistoryError] = useState('');
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);

  const scenario = virtualPatientScenarios.find((item) => item.id === scenarioId) ?? virtualPatientScenarios[0];
  const covered = scenario.requiredDomains.filter((item) => domains.includes(item.id));
  const missing = scenario.requiredDomains.filter((item) => !domains.includes(item.id));

  function reset(nextScenarioId = scenarioId) {
    const nextScenario = virtualPatientScenarios.find((item) => item.id === nextScenarioId) ?? virtualPatientScenarios[0];
    setScenarioId(nextScenario.id);
    setTurns([{ speaker: 'patient', message: nextScenario.opening }]);
    setQuestion('');
    setDomains([]);
    setFinished(false);
    setSaveState('idle');
    setSavedSessionId(null);
    setSaveMessage('');
  }

  function submitQuestion() {
    const prompt = question.trim();
    if (!prompt || finished) return;
    const answer = answerVirtualPatientQuestion(scenario, prompt);
    setTurns((previous) => [...previous, { speaker: 'learner', message: prompt }, { speaker: 'patient', message: answer.response }]);
    if (answer.domain) setDomains((previous) => previous.includes(answer.domain!) ? previous : [...previous, answer.domain!]);
    setQuestion('');
  }

  async function saveFinishedSession() {
    if (saveState === 'saving' || savedSessionId) return;
    setSaveState('saving');
    setSaveMessage('');
    const assessment: SimulationAssessment = {
      coveredDomainIds: [...domains],
      missedDomainIds: missing.map((domain) => domain.id),
      rubricVersion: 'formative-v1',
      completedAt: new Date().toISOString(),
    };
    try {
      const saved = await saveSimulationSession({ scenarioId, transcript: turns, assessment });
      setSavedSessionId(saved.id);
      setSaveState('saved');
      setSaveMessage('This fictional simulation and its formative debrief have been saved to your private WardWise account.');
      if (historyOpen) await refreshHistory();
    } catch (error) {
      setSaveState('error');
      setSaveMessage(error instanceof Error
        ? error.message
        : 'The debrief is available in this session, but could not be saved. Your answers remain on this page.');
    }
  }

  function finishInterview() {
    if (finished || turns.every((turn) => turn.speaker !== 'learner')) return;
    setFinished(true);
    void saveFinishedSession();
  }

  async function refreshHistory() {
    setHistoryLoading(true);
    setHistoryError('');
    try {
      setHistory(await listSimulationSessions());
    } catch (error) {
      setHistoryError(error instanceof Error ? error.message : 'Your simulation history could not be loaded.');
    } finally {
      setHistoryLoading(false);
    }
  }

  async function openSavedSession(sessionId: string) {
    setLoadingSessionId(sessionId);
    setHistoryError('');
    try {
      const saved = await loadSimulationSession(sessionId);
      const selectedScenario = virtualPatientScenarios.find((item) => item.id === saved.scenario_id);
      if (!selectedScenario) throw new Error('This saved session belongs to a scenario that is not available in this version.');
      if (!Array.isArray(saved.transcript) || !saved.assessment || !Array.isArray(saved.assessment.coveredDomainIds)) {
        throw new Error('The saved simulation record is incomplete and cannot be reopened.');
      }
      setScenarioId(selectedScenario.id);
      setTurns(saved.transcript);
      setDomains(saved.assessment.coveredDomainIds);
      setFinished(true);
      setSavedSessionId(saved.id);
      setSaveState('saved');
      setSaveMessage('Viewing a previously saved fictional simulation session.');
      setHistoryOpen(false);
      setQuestion('');
    } catch (error) {
      setHistoryError(error instanceof Error ? error.message : 'The saved simulation could not be opened.');
    } finally {
      setLoadingSessionId(null);
    }
  }

  return <div className="page-stack simulation-page">
    <button className="back-link" type="button" onClick={onBack}><ArrowLeft size={15}/> Back to workspace</button>
    <section className="simulation-banner"><span><ShieldAlert size={20}/></span><div><b>SIMULATION — NOT A REAL PATIENT</b><p>All cases and answers are fictional and scripted for clinical learning. This exercise does not connect to hospital records or represent a real patient encounter.</p></div></section>
    <section className="module-hero simulation-hero"><div><div className="eyebrow"><span/> VIRTUAL PATIENT & INTERACTIVE EXAMINER</div><h1>Virtual Patient Simulation</h1><p>Practise focused questions, request examination or investigation findings, then review examiner feedback. The scenario teaching impression remains hidden until you finish the interview.</p><small className="module-status"><i/> Scripted offline scenario · consistent case facts</small></div><span className="module-icon"><Stethoscope size={40}/></span></section>
    <section className="simulation-case-select">
      <label><span>Choose a fictional case</span><select value={scenarioId} disabled={finished} onChange={(event)=>reset(event.target.value)}>{virtualPatientScenarios.map((item)=><option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
      <div><small>{scenario.setting}</small><b>{scenario.age} · {scenario.sex}</b><small>{scenario.presentingSummary}</small></div>
      <button type="button" className="btn btn-secondary btn-small" onClick={()=>reset()}><RotateCcw size={14}/> Restart</button>
      <button type="button" className="btn btn-secondary btn-small" onClick={()=>{setHistoryOpen((value)=>!value);if(!historyOpen)void refreshHistory();}}><History size={14}/> {historyOpen?'Hide history':'Saved history'}</button>
    </section>

    {historyOpen ? <section className="surface-card simulation-history">
      <div className="simulation-history-heading"><div><span className="kicker">PRIVATE ACCOUNT RECORDS</span><h2>Saved simulation sessions</h2></div><button type="button" className="icon-btn" aria-label="Refresh simulation history" onClick={()=>void refreshHistory()} disabled={historyLoading}><RotateCcw size={15}/></button></div>
      {historyLoading ? <ProcessingIndicator label="Loading simulation history" detail="Retrieving sessions belonging to your signed-in account."/> :
        historyError ? <p className="auth-error" role="alert">{historyError}</p> :
        history.length ? <div className="simulation-history-list">{history.map((entry)=>{
          const matching=virtualPatientScenarios.find((item)=>item.id===entry.scenario_id);
          return <button type="button" key={entry.id} onClick={()=>void openSavedSession(entry.id)} disabled={loadingSessionId!==null}>
            <span><b>{matching?.label ?? entry.scenario_id}</b><small>Saved {formatDate(entry.created_at)} · {entry.assessment.coveredDomainIds.length} domains explored</small></span>
            {loadingSessionId===entry.id?<LoaderCircle size={16}/>:<ArrowRight size={15}/>}
          </button>;
        })}</div> : <p className="simulation-history-empty">No saved simulation sessions were found for this account.</p>}
    </section> : null}

    <section className="simulation-layout">
      <div className="surface-card simulation-chat">
        <div className="simulation-chat-header"><span><span className="simulation-avatar">P</span><span><b>Fictional patient</b><small>Scenario conversation</small></span></span><span className="neutral-pill">{turns.filter((turn)=>turn.speaker==='learner').length} questions asked</span></div>
        <div className="simulation-transcript" aria-live="polite">{turns.map((turn,index)=><div className={'simulation-turn simulation-turn--'+turn.speaker} key={index}><small>{turn.speaker==='learner'?'You':'Patient'}</small><p>{turn.message}</p></div>)}</div>
        {!finished ? <form className="simulation-compose" aria-label="Ask the fictional patient a question" onSubmit={(event)=>{event.preventDefault();submitQuestion();}}>
          <label htmlFor="simulation-question">Ask the patient a question</label>
          <div><input id="simulation-question" value={question} onChange={(event)=>setQuestion(event.target.value)} placeholder="e.g. When did the pain begin?" autoComplete="off"/><button className="btn btn-primary btn-small" type="submit" disabled={!question.trim()}><Send size={14}/> Ask</button></div>
          <small>Ask one question at a time. The patient answers only from the selected fictional scenario.</small>
        </form> : <div className="simulation-finished"><CheckCircle2 size={17}/> Interview completed. Examiner feedback is available.</div>}
      </div>
      <aside className="surface-card simulation-checklist"><span className="kicker">CLERKING DOMAINS</span><h2>Areas explored</h2><p>These domains are counted when you ask about them. Unasked domains remain unelicited, not negative.</p>
        <div className="simulation-domain-list">{scenario.requiredDomains.map((domain)=><div key={domain.id} className={domains.includes(domain.id)?'covered':''}><span>{domains.includes(domain.id)?<CheckCircle2 size={15}/>:<span className="empty-domain"/>}</span>{domain.label}</div>)}</div>
        {!finished ? <button type="button" className="btn btn-secondary btn-small" onClick={()=>void finishInterview()} disabled={turns.filter((turn)=>turn.speaker==='learner').length===0 || saveState==='saving'}><ArrowRight size={14}/> Finish interview</button> : null}
      </aside>
    </section>
    {finished ? <section className="surface-card simulation-feedback">
      <div className="simulation-feedback-heading"><span><ClipboardList size={20}/></span><div><span className="kicker">EXAMINER FEEDBACK</span><h2>Interview debrief</h2><p>Feedback is based on domains you explicitly asked about in this scripted scenario.</p></div></div>
      <div className="simulation-score"><b>{covered.length} of {scenario.requiredDomains.length}</b><small>key domains explored</small></div>
      <h3>Domains to revisit</h3>
      {missing.length ? <ul>{missing.map((item)=><li key={item.id}>{item.label}</li>)}</ul> : <p>You explored every domain listed in this scenario rubric.</p>}
      <section className="simulation-examiner-rubric">
        <span className="kicker">EXAMINER RUBRIC — REVIEW AFTER YOUR INTERVIEW</span>
        <p className="simulation-rubric-intro">Compare your interview with these expected clinical learning points. This is formative feedback, not an automated judgement of your competence.</p>
        <div className="simulation-rubric-grid">
          <article><h3>Examination points</h3><ul>{scenario.examinerRubric.examinationPoints.map((point)=><li key={point}>{point}</li>)}</ul></article>
          <article><h3>Differential diagnoses to consider</h3><ul>{scenario.examinerRubric.differentialConsiderations.map((item)=><li key={item}>{item}</li>)}</ul></article>
          <article><h3>Clinical reasoning checkpoints</h3><ul>{scenario.examinerRubric.reasoningPoints.map((point)=><li key={point}>{point}</li>)}</ul></article>
        </div>
      </section>
      <div className="simulation-diagnosis"><span className="kicker">SCENARIO TEACHING IMPRESSION — REVEALED AFTER INTERVIEW</span><p>{scenario.teachingDiagnosis}</p></div>
      <p className="simulation-examiner-note">{scenario.examinerNote}</p>
      {saveState==='saving' ? <ProcessingIndicator label="Saving simulation session" detail="Saving the fictional interview and formative feedback to your private account."/> : null}
      {saveMessage ? <p className={saveState==='error'?'auth-error':'auth-banner'} role="status">{saveMessage}</p> : null}
      {saveState==='error' ? <button type="button" className="btn btn-secondary btn-small" onClick={()=>void saveFinishedSession()}><Save size={14}/> Retry saving</button> : null}
      <button className="btn btn-primary btn-small" type="button" onClick={()=>reset()}><RotateCcw size={14}/> Start again</button>
    </section> : null}
    <p className="module-note"><ShieldAlert size={15}/> Fictional teaching exercise only. It does not provide clinical clearance, a diagnosis or treatment instructions. Confirm real clinical decisions with a qualified supervisor.</p>
  </div>;
}
