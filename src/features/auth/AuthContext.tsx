import { createContext, useCallback, useContext, useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../../lib/supabase/client';
import { getStudentProfile } from './profile.service';
import type { StudentProfile } from './profile.types';

type AuthContextValue = {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: StudentProfile | null;
  profileLoading: boolean;
  profileError: string | null;
  recoveryRequired: boolean;
  setRecoveryRequired: Dispatch<SetStateAction<boolean>>;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [recoveryRequired, setRecoveryRequired] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setLoading(false);
      if (event === 'PASSWORD_RECOVERY') setRecoveryRequired(true);
      if (event === 'SIGNED_OUT') {
        setProfile(null);
        setProfileError(null);
        setRecoveryRequired(false);
      }
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setProfileError('We could not restore your sign-in session. Please sign in again.');
      setSession(data.session);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const userId = session?.user.id ?? null;

  useEffect(() => {
    let active = true;
    if (!supabase || !userId) {
      setProfile(null);
      setProfileLoading(false);
      setProfileError(null);
      return () => { active = false; };
    }

    setProfile(null);
    setProfileLoading(true);
    setProfileError(null);
    void getStudentProfile(userId)
      .then((nextProfile) => { if (active) setProfile(nextProfile); })
      .catch((error: unknown) => {
        if (!active) return;
        setProfile(null);
        setProfileError(error instanceof Error ? error.message : 'We could not load your student profile.');
      })
      .finally(() => { if (active) setProfileLoading(false); });

    return () => { active = false; };
  }, [userId]);

  const refreshProfile = useCallback(async () => {
    if (!userId) return;
    try {
      const nextProfile = await getStudentProfile(userId);
      setProfile(nextProfile);
      setProfileError(null);
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'We could not refresh your student profile.');
      throw error;
    }
  }, [userId]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    configured: isSupabaseConfigured,
    loading,
    session,
    user: session?.user ?? null,
    profile,
    profileLoading,
    profileError,
    recoveryRequired,
    setRecoveryRequired,
    refreshProfile,
    signOut,
  }), [loading, session, profile, profileLoading, profileError, recoveryRequired, refreshProfile, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider.');
  return value;
}
