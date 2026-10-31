import { supabase } from '../../lib/supabase/client';

export type SimulationTurn = {
  speaker: 'learner' | 'patient';
  message: string;
};

export type SimulationAssessment = {
  coveredDomainIds: string[];
  missedDomainIds: string[];
  rubricVersion: 'formative-v1';
  completedAt: string;
};

export type SimulationSessionSummary = {
  id: string;
  scenario_id: string;
  assessment: SimulationAssessment;
  score: number | null;
  created_at: string;
};

export type SavedSimulationSession = SimulationSessionSummary & {
  transcript: SimulationTurn[];
};

function requireClient() {
  if (!supabase) throw new Error('WardWise Supabase is not configured.');
  return supabase;
}

async function requireUserId(): Promise<string> {
  const client = requireClient();
  const { data, error } = await client.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('Sign in to use your private simulation history.');
  return data.user.id;
}

export async function listSimulationSessions(): Promise<SimulationSessionSummary[]> {
  const client = requireClient();
  const userId = await requireUserId();
  const { data, error } = await client
    .from('simulation_sessions')
    .select('id, scenario_id, assessment, score, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data ?? []) as SimulationSessionSummary[];
}

export async function loadSimulationSession(sessionId: string): Promise<SavedSimulationSession> {
  const client = requireClient();
  const userId = await requireUserId();
  const { data, error } = await client
    .from('simulation_sessions')
    .select('id, scenario_id, assessment, score, created_at, transcript')
    .eq('user_id', userId)
    .eq('id', sessionId)
    .single();
  if (error) throw error;
  return data as SavedSimulationSession;
}

export async function saveSimulationSession(input: {
  scenarioId: string;
  transcript: SimulationTurn[];
  assessment: SimulationAssessment;
}): Promise<SimulationSessionSummary> {
  const client = requireClient();
  const userId = await requireUserId();
  const { data, error } = await client
    .from('simulation_sessions')
    .insert({
      user_id: userId,
      scenario_id: input.scenarioId,
      transcript: input.transcript,
      assessment: input.assessment,
      score: null,
    })
    .select('id, scenario_id, assessment, score, created_at')
    .single();
  if (error) throw error;
  return data as SimulationSessionSummary;
}
