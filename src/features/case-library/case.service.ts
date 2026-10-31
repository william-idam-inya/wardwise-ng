import { supabase } from '../../lib/supabase/client';
import { formatClerkingNote } from '../clerking/noteFormatter';
import type { ClerkingDraft } from '../clerking/clerking.types';
import type { ClinicalCaseRecord, ClinicalCaseSummary, ClerkingSessionRecord } from './case.types';

export type SaveClerkingDraftInput = {
  userId: string;
  caseId?: string | null;
  draft: ClerkingDraft;
  currentStage: number;
};

export type LoadedClerkingCase = {
  clinicalCase: ClinicalCaseRecord;
  session: ClerkingSessionRecord | null;
  draft: ClerkingDraft;
  currentStage: number;
};

/** Signals that the case row was written but its stage/answer companion did not finish. */
export class PartialCaseSaveError extends Error {
  readonly caseId: string;
  constructor(caseId: string, cause: unknown) {
    super('The clinical case was saved, but its clerking progress could not be updated. Reopen the case and retry the save.');
    this.name = 'PartialCaseSaveError';
    this.caseId = caseId;
    this.cause = cause;
  }
}

function requireClient() {
  if (!supabase) throw new Error('WardWise Supabase is not configured.');
  return supabase;
}

export async function listClinicalCases(userId: string): Promise<ClinicalCaseSummary[]> {
  const client = requireClient();
  const { data, error } = await client
    .from('clinical_cases')
    .select('id, title, specialty, setting, status, case_category, created_at, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as ClinicalCaseSummary[];
}

export async function loadClinicalCase(caseId: string, userId: string): Promise<LoadedClerkingCase> {
  const client = requireClient();
  const { data: caseData, error: caseError } = await client
    .from('clinical_cases')
    .select('id, user_id, title, specialty, setting, status, case_category, structured_data, structured_note, created_at, updated_at')
    .eq('id', caseId)
    .eq('user_id', userId)
    .single();
  if (caseError) throw caseError;

  const { data: sessionData, error: sessionError } = await client
    .from('clerking_sessions')
    .select('id, case_id, user_id, current_stage, answers, created_at, updated_at')
    .eq('case_id', caseId)
    .eq('user_id', userId)
    .maybeSingle();
  if (sessionError) throw sessionError;

  const clinicalCase = caseData as unknown as ClinicalCaseRecord;
  const session = (sessionData as unknown as ClerkingSessionRecord | null) ?? null;
  const draft = session?.answers ?? clinicalCase.structured_data;
  const currentStage = session?.current_stage ?? 0;

  return { clinicalCase, session, draft, currentStage };
}

export async function saveClerkingDraft(input: SaveClerkingDraftInput): Promise<ClinicalCaseRecord> {
  const client = requireClient();
  const { userId, caseId, draft, currentStage } = input;
  if (!draft.caseLabel.trim()) throw new Error('Add a non-identifying case label before saving.');
  if (!Number.isInteger(currentStage) || currentStage < 0 || currentStage > 12) {
    throw new Error('The current clerking stage is invalid.');
  }

  const casePayload = {
    user_id: userId,
    title: draft.caseLabel.trim(),
    specialty: draft.specialty.trim() || 'General',
    setting: draft.setting.trim() || 'Teaching hospital',
    status: 'draft' as const,
    case_category: draft.caseCategory,
    structured_data: draft,
    structured_note: formatClerkingNote(draft),
  };

  let caseData: unknown;
  if (caseId) {
    const { data, error } = await client
      .from('clinical_cases')
      .update(casePayload)
      .eq('id', caseId)
      .eq('user_id', userId)
      .select('id, user_id, title, specialty, setting, status, case_category, structured_data, structured_note, created_at, updated_at')
      .single();
    if (error) throw error;
    caseData = data;
  } else {
    const { data, error } = await client
      .from('clinical_cases')
      .insert(casePayload)
      .select('id, user_id, title, specialty, setting, status, case_category, structured_data, structured_note, created_at, updated_at')
      .single();
    if (error) throw error;
    caseData = data;
  }

  const savedCase = caseData as ClinicalCaseRecord;
  const { error: sessionError } = await client
    .from('clerking_sessions')
    .upsert({
      case_id: savedCase.id,
      user_id: userId,
      current_stage: currentStage,
      answers: draft,
    }, { onConflict: 'case_id,user_id' });

  if (sessionError) throw new PartialCaseSaveError(savedCase.id, sessionError);
  return savedCase;
}

export async function archiveClinicalCase(caseId: string, userId: string): Promise<void> {
  const client = requireClient();
  const { error } = await client
    .from('clinical_cases')
    .update({ status: 'archived' })
    .eq('id', caseId)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function deleteClinicalCase(caseId: string, userId: string): Promise<void> {
  const client = requireClient();
  const { error } = await client
    .from('clinical_cases')
    .delete()
    .eq('id', caseId)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function duplicateClinicalCase(caseId: string, userId: string): Promise<ClinicalCaseRecord> {
  const loaded = await loadClinicalCase(caseId, userId);
  const copiedTitle = (`Copy of ${loaded.clinicalCase.title}`).slice(0, 180);
  const draft: ClerkingDraft = {
    ...loaded.draft,
    caseLabel: copiedTitle,
  };

  // Save as a new case ID; the original row and session are never updated.
  return saveClerkingDraft({
    userId,
    caseId: null,
    draft,
    currentStage: loaded.currentStage,
  });
}
