import { supabase } from '../../lib/supabase/client';

function requireClient() {
  if (!supabase) throw new Error('WardWise Supabase is not configured.');
  return supabase;
}

async function requireUserId(): Promise<string> {
  const client = requireClient();
  const { data, error } = await client.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('Sign in to manage your learning bookmarks.');
  return data.user.id;
}

export async function getLearningBookmark(topicId: string): Promise<boolean> {
  const client = requireClient();
  const userId = await requireUserId();
  const { data, error } = await client
    .from('learning_bookmarks')
    .select('id')
    .eq('user_id', userId)
    .eq('topic_id', topicId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function setLearningBookmark(topicId: string, saved: boolean): Promise<void> {
  const client = requireClient();
  const userId = await requireUserId();
  if (saved) {
    const { error } = await client
      .from('learning_bookmarks')
      .upsert({ user_id: userId, topic_id: topicId }, {
        onConflict: 'user_id,topic_id',
        ignoreDuplicates: true,
      });
    if (error) throw error;
    return;
  }

  const { error } = await client
    .from('learning_bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('topic_id', topicId);
  if (error) throw error;
}
