import { useState, type FormEvent } from 'react';
import { ArrowRight, Building2, CalendarDays, GraduationCap, ShieldCheck, UserRound } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import { ProcessingIndicator } from '../../components/ProcessingIndicator';
import { useAuth } from './AuthContext';
import { STUDY_LEVELS, type ProfileInput, type SexValue, type StudentProfile, type StudyLevel } from './profile.types';
import { saveStudentProfile } from './profile.service';

type Props = { profile?: StudentProfile | null; onCancel?: () => void };
const sexOptions: Array<{ value: SexValue; label: string }> = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'intersex', label: 'Intersex' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export function ProfileSetup({ profile = null, onCancel }: Props) {
  const { user, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? (typeof user?.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : ''));
  const [sex, setSex] = useState<SexValue | ''>(profile?.sex ?? '');
  const [age, setAge] = useState(profile?.age_years?.toString() ?? '');
  const [studyLevel, setStudyLevel] = useState<StudyLevel | ''>(profile?.study_level ?? '');
  const [institution, setInstitution] = useState(profile?.institution ?? '');
  const [trainingSite, setTrainingSite] = useState(profile?.training_site ?? '');
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    if (!user || !supabase || !studyLevel) return;

    const ageNumber = age.trim() ? Number(age) : null;
    if (ageNumber !== null && (!Number.isInteger(ageNumber) || ageNumber < 10 || ageNumber > 120)) {
      setErrorMessage('Enter a valid age in whole years, or leave it blank.');
      return;
    }

    const values: ProfileInput = {
      full_name: fullName.trim(),
      sex: sex || null,
      age_years: ageNumber,
      study_level: studyLevel,
      institution: institution.trim(),
      training_site: trainingSite.trim() || null,
    };

    setBusy(true);
    try {
      await saveStudentProfile(user.id, values);
      await refreshProfile();
      setSuccessMessage('Your student profile has been saved.');
      if (onCancel) onCancel();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'We could not save your profile. Your entries remain on this form.');
    } finally {
      setBusy(false);
    }
  }

  return <main className="profile-setup-screen">
    <section className="profile-setup-card">
      <div className="auth-brand"><span><UserRound size={22}/></span><strong>WardWise <em>NG</em></strong></div>
      <div className="auth-copy"><span className="kicker">{profile ? 'ACCOUNT DETAILS' : 'ONE LAST STEP'}</span><h1>{profile ? 'Edit your student profile' : 'Set up your student profile'}</h1><p>These details personalise your learning space. Only your account can access this profile.</p></div>
      {errorMessage ? <div className="auth-error" role="alert">{errorMessage}</div> : null}
      {successMessage ? <div className="auth-banner" role="status">{successMessage}</div> : null}
      <form className="profile-form" onSubmit={handleSubmit}>
        <label>Full name<div className="input-wrap"><UserRound size={17}/><input autoComplete="name" required minLength={2} maxLength={120} value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your name"/></div></label>
        <div className="profile-form-row">
          <label>Sex <small>Optional</small><select value={sex} onChange={(event) => setSex(event.target.value as SexValue | '')}><option value="">Not provided</option>{sexOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <label>Age in years <small>Optional</small><div className="input-wrap"><CalendarDays size={17}/><input type="number" min="10" max="120" step="1" inputMode="numeric" value={age} onChange={(event) => setAge(event.target.value)} placeholder="e.g. 23"/></div></label>
        </div>
        <label>Level of study<div className="input-wrap"><GraduationCap size={17}/><select required value={studyLevel} onChange={(event) => setStudyLevel(event.target.value as StudyLevel | '')}><option value="">Select your level</option>{STUDY_LEVELS.map((level) => <option key={level}>{level}</option>)}</select></div></label>
        <label>Institution<div className="input-wrap"><Building2 size={17}/><input required minLength={2} maxLength={180} value={institution} onChange={(event) => setInstitution(event.target.value)} placeholder="University or medical school"/></div></label>
        <label>Teaching hospital / training site <small>Optional</small><div className="input-wrap"><Building2 size={17}/><input maxLength={180} value={trainingSite} onChange={(event) => setTrainingSite(event.target.value)} placeholder="Training site"/></div></label>
        {busy ? <ProcessingIndicator label="Saving student profile" detail="Waiting for the database to confirm the change."/> : null}
        <div className="profile-form-actions">{onCancel ? <button className="btn btn-secondary" type="button" onClick={onCancel}>Cancel</button> : null}<button className="btn btn-primary" type="submit" disabled={busy}>{profile ? 'Save changes' : 'Complete profile'} <ArrowRight size={16}/></button></div>
      </form>
      <p className="profile-privacy"><ShieldCheck size={16}/> No date of birth is collected. Avoid entering patient details in your profile.</p>
    </section>
  </main>;
}
