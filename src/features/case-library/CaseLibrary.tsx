import { useCallback, useEffect, useMemo, useState } from 'react';
import { Archive, Copy, FileHeart, FolderSearch, Pencil, RefreshCw, Search, ShieldCheck, Trash2 } from 'lucide-react';
import { ProcessingIndicator } from '../../components/ProcessingIndicator';
import { archiveClinicalCase, deleteClinicalCase, duplicateClinicalCase, listClinicalCases, PartialCaseSaveError } from './case.service';
import type { ClinicalCaseSummary } from './case.types';

type Props = {
  userId: string;
  refreshKey?: number;
  onOpenCase: (caseId: string) => void;
  onStartNew: () => void;
};

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export function CaseLibrary({ userId, refreshKey = 0, onOpenCase, onStartNew }: Props) {
  const [cases, setCases] = useState<ClinicalCaseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      setCases(await listClinicalCases(userId));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'We could not load your case library.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { void reload(); }, [reload, refreshKey]);

  const visibleCases = useMemo(() => {
    const term = query.trim().toLowerCase();
    return cases.filter((item) => {
      const matchesArchive = showArchived ? item.status === 'archived' : item.status !== 'archived';
      const matchesSearch = !term || [item.title, item.specialty, item.setting].some((value) => value.toLowerCase().includes(term));
      return matchesArchive && matchesSearch;
    });
  }, [cases, query, showArchived]);

  async function archive(caseId: string) {
    setWorkingId(caseId);
    setErrorMessage('');
    try {
      await archiveClinicalCase(caseId, userId);
      await reload();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'The case could not be archived.');
    } finally {
      setWorkingId(null);
    }
  }

  async function duplicate(caseId: string) {
    setWorkingId(caseId);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const copy = await duplicateClinicalCase(caseId, userId);
      setSuccessMessage('Created a separate draft: ' + copy.title);
      await reload();
    } catch (error) {
      if (error instanceof PartialCaseSaveError) {
        await reload();
        setErrorMessage(error.message + ' The copied case record exists; reopen it and retry saving its clerking progress.');
      } else {
        setErrorMessage(error instanceof Error ? error.message : 'The case could not be duplicated.');
      }
    } finally {
      setWorkingId(null);
    }
  }

  async function remove(caseId: string) {
    if (!window.confirm('Delete this case and its clerking session permanently?')) return;
    setWorkingId(caseId);
    setErrorMessage('');
    try {
      await deleteClinicalCase(caseId, userId);
      await reload();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'The case could not be deleted.');
    } finally {
      setWorkingId(null);
    }
  }

  return <div className="page-stack case-library-page">
    <section className="module-hero">
      <div><div className="eyebrow"><span/> YOUR PRIVATE LEARNING RECORDS</div><h1>Case Library</h1><p>Reopen a learning case, continue its clerking session, archive it or remove it. These records are private to your account through database row-level security.</p><small className="module-status"><i/> Owner-restricted case storage</small></div>
      <span className="module-icon"><FileHeart size={40}/></span>
    </section>
    <section className="surface-card case-library-panel">
      <div className="case-library-toolbar">
        <label className="case-library-search"><Search size={16}/><input aria-label="Search case library" value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Search by case label, specialty or setting…"/></label>
        <label className="case-archive-filter"><input type="checkbox" checked={showArchived} onChange={(event)=>setShowArchived(event.target.checked)}/> Show archived</label>
        <button className="icon-btn" type="button" onClick={()=>void reload()} aria-label="Refresh case library" disabled={loading}><RefreshCw size={16}/></button>
      </div>
      {errorMessage ? <div className="auth-error" role="alert">{errorMessage}</div> : null}
      {successMessage ? <div className="auth-banner" role="status">{successMessage}</div> : null}
      {loading ? <div className="case-library-loading"><ProcessingIndicator label="Loading your case library" detail="Waiting for the database to return your records."/></div> :
        visibleCases.length ? <div className="case-list">{visibleCases.map((item)=>(
          <article className="case-list-item" key={item.id}>
            <span className="case-list-icon"><FileHeart size={19}/></span>
            <div className="case-list-main"><b>{item.title}</b><small>{item.specialty} · {item.setting}</small><small>Updated {formatDate(item.updated_at)}</small></div>
            <span className={'case-status case-status--'+item.status}>{item.status}</span>
            <div className="case-list-actions">
              <button className="btn btn-secondary btn-small" type="button" onClick={()=>onOpenCase(item.id)}><Pencil size={13}/> Open</button>
              <button className="icon-btn" type="button" disabled={workingId===item.id} aria-label={'Duplicate '+item.title} onClick={()=>void duplicate(item.id)}><Copy size={15}/></button>
              {item.status !== 'archived' ? <button className="icon-btn" type="button" disabled={workingId===item.id} aria-label={'Archive '+item.title} onClick={()=>void archive(item.id)}><Archive size={16}/></button> : null}
              <button className="icon-btn danger-icon" type="button" disabled={workingId===item.id} aria-label={'Delete '+item.title} onClick={()=>void remove(item.id)}><Trash2 size={16}/></button>
            </div>
            {workingId===item.id ? <span className="visually-hidden" role="status">Updating case</span> : null}
          </article>
        ))}</div> : <div className="case-library-empty">
          <span><FolderSearch size={26}/></span>
          <h2>{query ? 'No matching cases' : showArchived ? 'No archived cases' : 'Your case library is empty'}</h2>
          <p>{query ? 'Try another case label or specialty.' : 'Create a synthetic or de-identified learning case. Your saved cases will appear here after the WardWise database is connected.'}</p>
          {query ? <button type="button" className="btn btn-secondary btn-small" onClick={()=>setQuery('')}>Clear search</button> : <button type="button" className="btn btn-primary btn-small" onClick={onStartNew}>Start a clerking draft</button>}
        </div>}
    </section>
    <p className="module-note"><ShieldCheck size={15}/> Use only synthetic or properly de-identified cases. Do not store patient names, hospital numbers, addresses or other identifiers.</p>
  </div>;
}
