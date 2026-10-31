import type { ClerkingDraft } from '../clerking/clerking.types';

export type ClinicalCaseStatus = 'draft' | 'completed' | 'archived';
export type ClinicalCaseCategory = 'synthetic' | 'deidentified';

export type ClinicalCaseSummary = {
  id: string;
  title: string;
  specialty: string;
  setting: string;
  status: ClinicalCaseStatus;
  case_category: ClinicalCaseCategory;
  created_at: string;
  updated_at: string;
};

export type ClinicalCaseRecord = ClinicalCaseSummary & {
  user_id: string;
  structured_data: ClerkingDraft;
  structured_note: string;
};

export type ClerkingSessionRecord = {
  id: string;
  case_id: string;
  user_id: string;
  current_stage: number;
  answers: ClerkingDraft;
  created_at: string;
  updated_at: string;
};
