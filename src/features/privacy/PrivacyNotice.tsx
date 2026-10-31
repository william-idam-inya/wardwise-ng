import { useState } from 'react';
import { AlertTriangle, Copy, ExternalLink, FileText, LockKeyhole, ShieldCheck } from 'lucide-react';

export function PrivacyNotice() {
  const [issueType, setIssueType] = useState('Clinical content may be inaccurate or outdated');
  const [topic, setTopic] = useState('');
  const [details, setDetails] = useState('');
  const [copyStatus, setCopyStatus] = useState('');

  async function copyIssueReport() {
    const report = [
      'WARDWISE NG — CONTENT / SAFETY REPORT',
      'Issue type: ' + issueType,
      'Topic or screen: ' + (topic.trim() || 'Not specified'),
      'Details: ' + (details.trim() || 'No details supplied'),
      'Environment: Development build',
      'Reminder: Do not include patient identifiers, medical record numbers, addresses or other personal/clinical data.',
    ].join('\n');
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(report);
      setCopyStatus('Report draft copied. Send it through an approved WardWise feedback channel; this screen does not submit reports.');
    } catch {
      setCopyStatus('Clipboard access is unavailable. You can select the report details and copy them manually.');
    }
  }

  return <section className="privacy-notice">
    <div className="privacy-notice-heading">
      <div><span className="kicker">ACCOUNT, DATA & CLINICAL SAFETY</span><h2>Privacy and safety notice</h2><p>What WardWise is designed to store and what is not yet ready for live clinical use.</p></div>
      <span className="privacy-notice-icon"><ShieldCheck size={24}/></span>
    </div>
    <div className="privacy-development-alert" role="note">
      <AlertTriangle size={18}/>
      <div><b>Development notice — not a final privacy policy</b><p>A dedicated WardWise Supabase project has been created and the initial database migrations are applied. Sign-in and email flows, two-account privacy isolation, live save journeys, AI secrets and clinical governance are still being verified. Do not enter identifiable patient information or real clinical records.</p></div>
    </div>

    <div className="privacy-information-grid">
      <article className="privacy-information-card">
        <span><LockKeyhole size={18}/></span><h3>Account and profile information</h3>
        <p>The WardWise database now has a private profile table for your name, optional sex and age in years, study level, institution and optional training site. Profile creation and editing require a working, signed-in account and are still subject to live authentication testing.</p>
      </article>
      <article className="privacy-information-card">
        <span><FileText size={18}/></span><h3>Cases and clerking drafts</h3>
        <p>Private case, clerking-session and simulation-session tables have been created. The app includes save, reopen and edit workflows, but full journeys have not yet been verified with real user accounts. Use synthetic or properly de-identified learning cases only.</p>
      </article>
      <article className="privacy-information-card">
        <span><ShieldCheck size={18}/></span><h3>Access and security</h3>
        <p>All six WardWise public tables have row-level security enabled and owner-specific policies are present. The database security advisor currently reports no findings. Isolation between two real accounts, account recovery and other browser-level security checks remain outstanding.</p>
      </article>
      <article className="privacy-information-card">
        <span><ExternalLink size={18}/></span><h3>Gemini and external processing</h3>
        <p>The authenticated Gemini Edge Function has been deployed with JWT verification. It will send only the current clerking stage's limited context after the server-side GEMINI_API_KEY and approved application origins are configured. The request uses store:false, but this does not mean zero provider-side processing or retention; applicable Google terms must be reviewed before release.</p>
      </article>
    </div>

    <section className="privacy-detail-section">
      <h3>What you must not enter</h3>
      <p>Do not enter patient names, initials that identify a patient, hospital or folder numbers, phone numbers, email addresses, street addresses, exact dates of birth, identifiable photographs, scans or any information that could identify a patient. Do not use real patient records unless the institution has formally authorised the processing and an approved de-identification and governance process exists.</p>
    </section>
    <section className="privacy-detail-section">
      <h3>Retention, export and deletion</h3>
      <p>Automatic retention and backup periods have not yet been configured. The Case Library code supports deleting a case and its linked clerking session, but account/profile deletion and a formal data-subject request workflow are not implemented. Do not assume that deleting a browser session removes data from a future database or provider backup.</p>
    </section>
    <section className="privacy-detail-section">
      <h3>Data protection in Nigeria</h3>
      <p>The Nigeria Data Protection Act 2023 governs relevant processing of personal data in Nigeria. WardWise has not completed a legal review, data protection impact assessment, processor agreement review or institutional privacy approval. This notice is a development summary, not a statement that the app is compliant.</p>
      <a href="https://ndpc.gov.ng/ndp-act-2023/" target="_blank" rel="noreferrer">Read the Nigeria Data Protection Act via the NDPC <ExternalLink size={13}/></a>
    </section>

    <section className="privacy-report-panel">
      <span className="kicker">CONTENT QUALITY & SAFETY FEEDBACK</span>
      <h3>Prepare a report about an unsafe or outdated topic</h3>
      <p>This creates a report draft for you to copy. There is no connected in-app report receiver yet. Send it through an approved WardWise administrator or teaching-supervisor channel.</p>
      <label>Issue type
        <select value={issueType} onChange={(event)=>{setIssueType(event.target.value);setCopyStatus('');}}>
          <option>Clinical content may be inaccurate or outdated</option>
          <option>Potentially unsafe clinical advice</option>
          <option>Missing or broken learning topic</option>
          <option>Privacy or security concern</option>
          <option>Technical problem in the app</option>
        </select>
      </label>
      <label>Topic or screen
        <input value={topic} maxLength={160} onChange={(event)=>{setTopic(event.target.value);setCopyStatus('');}} placeholder="e.g. Appendicitis guide / Case Library"/>
      </label>
      <label>What needs review?
        <textarea value={details} maxLength={1200} rows={4} onChange={(event)=>{setDetails(event.target.value);setCopyStatus('');}} placeholder="Describe the issue without adding patient or personal information."/>
      </label>
      <button className="btn btn-secondary btn-small" type="button" onClick={()=>void copyIssueReport()}><Copy size={14}/> Copy report draft</button>
      {copyStatus ? <p className="privacy-report-status" role="status">{copyStatus}</p> : null}
    </section>
    <p className="privacy-final-note">Educational use only. WardWise NG is not a licensed clinician, a hospital record system or a replacement for clinical supervision, local protocols or urgent care pathways.</p>
  </section>;
}
