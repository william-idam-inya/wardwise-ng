import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardList, RotateCcw, Send, ShieldAlert, Stethoscope } from 'lucide-react';
import { answerVirtualPatientQuestion, virtualPatientScenarios } from './simulation.data';

type Turn = { speaker: 'learner' | 'patient'; message: string };
type Props = { onBack: () => void };

export function VirtualPatientSimulation({ onBack }: Props) {
  const [scenarioId, setScenarioId] = useState(virtualPatientScenarios[0].id);
  const [turns, setTurns] = useState<Turn[]>([{ speaker: 'patient', message: virtualPatientScenarios[0].opening }]);
  const [question, setQuestion] = useState('');
  const [domains, setDomains] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const scenario = virtualPatientScenarios.find((item) => item.id === scenarioId) ?? virtualPatientScenarios[0];
  const covered = scenario.requiredDomains.filter((item) => domains.includes(item.id));

  function reset(nextScenarioId = scenarioId) {
    const nextScenario = virtualPatientScenarios.find((item) => item.id === nextScenarioId) ?? virtualPatientScenarios[0];
    setScenarioId(nextScenario.id);
    setTurns([{ speaker: 'patient', message: nextScenario.opening }]);
    setQuestion('');
    setDomains([]);
    setFinished(false);
  }

  function submitQuestion() {
    const prompt = question.trim();
    if (!prompt || finished) return;
    const answer = answerVirtualPatientQuestion(scenario, prompt);
    setTurns((previous) => [...previous, { speaker: 'learner', message: prompt }, { speaker: 'patient', message: answer.response }]);
    if (answer.domain) setDomains((previous) => previous.includes(answer.domain!) ? previous : [...previous, answer.domain!]);
    setQuestion('');
  }

  return <div className="page-stack simulation-page">
    <button className="back-link" type="button" onClick={onBack}><ArrowLeft size={15}/> Back to workspace</button>
    <section className="simulation-banner"><span><ShieldAlert size={20}/></span><div><b>SIMULATION — NOT A REAL PATIENT</b><p>All cases and answers are fictional and scripted for clinical learning. This exercise does not connect to hospital records or represent a real patient encounter.</p></div></section>
    <section className="module-hero simulation-hero"><div><div className="eyebrow"><span/> VIRTUAL PATIENT & INTERACTIVE EXAMINER</div><h1>Virtual Patient Simulation</h1><p>Practise focused questions, request examination or investigation findings, then review examiner feedback. The scenario teaching impression remains hidden until you finish the interview.</p><small className="module-status"><i/> Scripted offline scenario · consistent case facts</small></div><span className="module-icon"><Stethoscope size={40}/></span></section>
    <section className="simulation-case-select">
      <label><span>Choose a fictional case</span><select value={scenarioId} disabled={finished} onChange={(event)=>reset(event.target.value)}>{virtualPatientScenarios.map((item)=><option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
      <div><small>{scenario.setting}</small><b>{scenario.age} · {scenario.sex}</b><small>{scenario.presentingSummary}</small></div>
      <button type="button" className="btn btn-secondary btn-small" onClick={()=>reset()}><RotateCcw size={14}/> Restart</button>
    </section>
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
        {!finished ? <button type="button" className="btn btn-secondary btn-small" onClick={()=>setFinished(true)} disabled={turns.filter((turn)=>turn.speaker==='learner').length===0}>Finish interview <ArrowRight size={14}/></button> : null}
      </aside>
    </section>
    {finished ? <section className="surface-card simulation-feedback">
      <div className="simulation-feedback-heading"><span><ClipboardList size={20}/></span><div><span className="kicker">EXAMINER FEEDBACK</span><h2>Interview debrief</h2><p>Feedback is based on domains you explicitly asked about in this scripted scenario.</p></div></div>
      <div className="simulation-score"><b>{covered.length} of {scenario.requiredDomains.length}</b><small>key domains explored</small></div>
      <h3>Domains to revisit</h3>
      {scenario.requiredDomains.filter((item)=>!domains.includes(item.id)).length ? <ul>{scenario.requiredDomains.filter((item)=>!domains.includes(item.id)).map((item)=><li key={item.id}>{item.label}</li>)}</ul> : <p>You explored every domain listed in this scenario rubric.</p>}
      <div className="simulation-diagnosis"><span className="kicker">SCENARIO TEACHING IMPRESSION — REVEALED AFTER INTERVIEW</span><p>{scenario.teachingDiagnosis}</p></div>
      <p className="simulation-examiner-note">{scenario.examinerNote}</p>
      <button className="btn btn-primary btn-small" type="button" onClick={()=>reset()}><RotateCcw size={14}/> Start again</button>
    </section> : null}
    <p className="module-note"><ShieldAlert size={15}/> Fictional teaching exercise only. It does not provide clinical clearance, a diagnosis or treatment instructions. Confirm real clinical decisions with a qualified supervisor.</p>
  </div>;
}
