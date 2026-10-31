import { useState } from 'react';
import { ArrowLeft, BookOpen, CheckCircle2, ExternalLink, GraduationCap, ShieldAlert, Stethoscope } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ClinicalLearningGuide } from './learning.data';

type Props = { guide: ClinicalLearningGuide; onBack: () => void };

function ContentList({ title, items, icon: Icon }: { title: string; items: string[]; icon: LucideIcon }) {
  return <section className="guide-content-card">
    <header><span><Icon size={17}/></span><h2>{title}</h2><small>{items.length}</small></header>
    <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
  </section>;
}

export function ClinicalGuideView({ guide, onBack }: Props) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const answered = Object.keys(answers).length;
  const correct = Object.entries(answers).filter(([index, answer]) => guide.questions[Number(index)]?.answerIndex === answer).length;

  return <div className="page-stack clinical-guide-page">
    <button className="back-link" type="button" onClick={onBack}><ArrowLeft size={15}/> Back to learning</button>
    <section className="guide-hero">
      <div>
        <div className="eyebrow"><span/> OFFLINE CLINICAL LEARNING GUIDE</div>
        <small className="guide-discipline">{guide.discipline}</small>
        <h1>{guide.title}</h1>
        <p>{guide.subtitle}</p>
        <div className="guide-meta"><span><CheckCircle2 size={14}/> Available offline</span><span>Content reviewed {guide.reviewedOn}</span></div>
      </div>
      <span className="module-icon"><GraduationCap size={39}/></span>
    </section>
    <section className="guide-summary"><span><BookOpen size={19}/></span><div><b>Overview</b><p>{guide.summary}</p></div></section>
    <section className="guide-content-grid">
      <ContentList title="Learning objectives" items={guide.learningObjectives} icon={GraduationCap}/>
      <ContentList title="Focused history" items={guide.historyPrompts} icon={BookOpen}/>
      <ContentList title="Examination framework" items={guide.examinationPrompts} icon={Stethoscope}/>
      <ContentList title="Investigations to consider" items={guide.investigationsToConsider} icon={CheckCircle2}/>
      <ContentList title="Management principles" items={guide.managementPrinciples} icon={ShieldAlert}/>
    </section>
    <section className="guide-differentials">
      <span className="kicker">DIFFERENTIAL FRAMEWORK</span>
      <p className="guide-differential-intro">Compare possible groups using the supplied history, examination and results. These are teaching prompts, not diagnoses.</p>
      <div className="guide-differential-grid">
        {guide.differentialFrameworks.map((item) => (
          <article className="guide-differential-card" key={item.diagnosisGroup}>
            <h3>{item.diagnosisGroup}</h3>
            <b>Features to explore</b>
            <ul>{item.featuresToExplore.map((feature) => <li key={feature}>{feature}</li>)}</ul>
            <p><b>Clinical caution:</b> {item.caution}</p>
          </article>
        ))}
      </div>
    </section>
    <section className="guide-alerts"><span><ShieldAlert size={19}/></span><div><b>Features requiring senior clinical review</b><ul>{guide.escalationFeatures.map((item)=><li key={item}>{item}</li>)}</ul></div></section>
    <section className="guide-keypoints"><span className="kicker">HIGH-YIELD POINTS</span><ul>{guide.keyPoints.map((point)=><li key={point}>{point}</li>)}</ul></section>
    <section className="surface-card guide-quiz">
      <div className="guide-quiz-heading"><div><span className="kicker">CHECK YOUR UNDERSTANDING</span><h2>Quick knowledge check</h2><p>Select an answer to reveal the explanation. This is a learning exercise, not a formal assessment.</p></div><span className="guide-quiz-score">{answered}/{guide.questions.length} answered</span></div>
      {guide.questions.map((item,index)=><article className="guide-question" key={item.question}>
        <h3>{index+1}. {item.question}</h3>
        <div className="guide-options">{item.options.map((option,optionIndex)=>{
          const selected=answers[index]===optionIndex;
          const revealed=answers[index]!==undefined;
          const correctAnswer=item.answerIndex===optionIndex;
          return <button key={option} type="button" className={'guide-option '+(selected?'selected ':'')+(revealed&&correctAnswer?'correct ':'')+(selected&&!correctAnswer?'incorrect':'')} aria-pressed={selected} onClick={()=>setAnswers((previous)=>({...previous,[index]:optionIndex}))}>{option}</button>;
        })}</div>
        {answers[index]!==undefined?<p className="guide-explanation"><b>{answers[index]===item.answerIndex?'Correct.':'Review this point.'}</b> {item.explanation}</p>:null}
      </article>)}
      {answered===guide.questions.length?<p className="guide-final-score" role="status">You answered {correct} of {guide.questions.length} questions correctly. Revisit any explanation before moving on.</p>:null}
      <button className="btn btn-secondary btn-small guide-reset" type="button" onClick={()=>setAnswers({})}>Reset questions</button>
    </section>
    <section className="surface-card guide-sources"><span className="kicker">REFERENCES</span>
      {guide.sources.map((source)=><div className="guide-source" key={source.url}><div><b>{source.label}</b><small>{source.detail}</small></div><a href={source.url} target="_blank" rel="noreferrer">Open source <ExternalLink size={13}/></a></div>)}
      <p>{guide.educationalNote}</p>
      <small>Educational summary only. Check the linked source, current local protocols and clinical supervisor guidance before applying it.</small>
    </section>
  </div>;
}
