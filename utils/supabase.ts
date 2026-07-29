import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const runtimeEnv: Record<string, string | boolean | undefined> =
  (import.meta as ImportMeta & {
    env?: Record<string, string | boolean | undefined>;
  }).env ?? {};
const supabaseUrl =
  typeof runtimeEnv.VITE_SUPABASE_URL === 'string'
    ? runtimeEnv.VITE_SUPABASE_URL.trim()
    : undefined;
const supabasePublishableKey =
  typeof runtimeEnv.VITE_SUPABASE_PUBLISHABLE_KEY === 'string'
    ? runtimeEnv.VITE_SUPABASE_PUBLISHABLE_KEY.trim()
    : undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabasePublishableKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'kairo_supabase_session',
      },
      global: {
        headers: {
          'x-application-name': 'kairo-web',
        },
      },
    })
  : null;

let identityPromise: Promise<string> | null = null;

export const ensureKairoIdentity = async (): Promise<string> => {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  if (!identityPromise) {
    identityPromise = (async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;
      if (session?.user?.id) return session.user.id;

      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      if (!data.user?.id) throw new Error('Supabase did not return a user identity.');
      return data.user.id;
    })().catch((error) => {
      identityPromise = null;
      throw error;
    });
  }

  return identityPromise;
};

export const getSupabaseConnectionState = async () => {
  if (!supabase) {
    return { configured: false, connected: false, userId: null, error: null };
  }

  try {
    const userId = await ensureKairoIdentity();
    return { configured: true, connected: true, userId, error: null };
  } catch (error) {
    return {
      configured: true,
      connected: false,
      userId: null,
      error: error instanceof Error ? error.message : 'Supabase connection failed.',
    };
  }
};
