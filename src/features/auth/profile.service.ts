import { supabase } from '../../lib/supabase/client';
import type { ProfileInput, StudentProfile } from './profile.types';

export async function getStudentProfile(userId: string): Promise<StudentProfile | null> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, sex, age_years, study_level, institution, training_site, created_at, updated_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data as StudentProfile | null;
}

export async function saveStudentProfile(userId: string, values: ProfileInput): Promise<StudentProfile> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...values }, { onConflict: 'id' })
    .select('id, full_name, sex, age_years, study_level, institution, training_site, created_at, updated_at')
    .single();

  if (error) throw error;
  return data as StudentProfile;
}
