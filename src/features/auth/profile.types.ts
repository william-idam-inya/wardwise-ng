export const STUDY_LEVELS = [
  '100 Level',
  '200 Level',
  '300 Level',
  '400 Level',
  '500 Level',
  '600 Level',
  '700 Level',
  'Graduate',
  'Other',
] as const;

export type StudyLevel = (typeof STUDY_LEVELS)[number];
export type SexValue = 'female' | 'male' | 'intersex' | 'prefer_not_to_say';

export type StudentProfile = {
  id: string;
  full_name: string;
  sex: SexValue | null;
  age_years: number | null;
  study_level: StudyLevel;
  institution: string;
  training_site: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfileInput = {
  full_name: string;
  sex: SexValue | null;
  age_years: number | null;
  study_level: StudyLevel;
  institution: string;
  training_site: string | null;
};
