import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { KAIRO_SUPABASE_PUBLISHABLE_KEY, KAIRO_SUPABASE_URL } from '../config/supabaseProject';

type SupabaseRuntimeEnv = Record<string, string | boolean | undefined>;

const runtimeEnv: Record<string, string | boolean | undefined> =
  (import.meta as ImportMeta & {
    env?: Record<string, string | boolean | undefined>;
  }).env ?? {};
const readString = (value: string | boolean | undefined) =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined;

const getJwtRole = (key: string) => {
  if (!key.startsWith('eyJ')) return null;
  try {
    const encoded = key.split('.')[1];
    if (!encoded || typeof globalThis.atob !== 'function') return null;
    const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(globalThis.atob(normalized)) as { role?: string };
    return payload.role ?? null;
  } catch {
    return null;
  }
};

export const resolveSupabaseConfig = (env: SupabaseRuntimeEnv) => {
  if (env.VITE_SUPABASE_CLOUD_ENABLED === 'false') {
    return { config: null, error: 'cloud_sync_disabled' as const };
  }
  const url = readString(env.VITE_SUPABASE_URL);
  const key = readString(env.VITE_SUPABASE_PUBLISHABLE_KEY) ?? readString(env.VITE_SUPABASE_ANON_KEY);

  if (!url || !key) {
    return { config: null, error: 'missing_configuration' as const };
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || !parsed.hostname.endsWith('.supabase.co')) {
      return { config: null, error: 'invalid_project_url' as const };
    }
  } catch {
    return { config: null, error: 'invalid_project_url' as const };
  }

  const jwtRole = getJwtRole(key);
  if (key.startsWith('sb_secret_') || jwtRole === 'service_role') {
    return { config: null, error: 'secret_key_in_browser' as const };
  }

  return { config: { url: url.replace(/\/$/, ''), key }, error: null };
};

const resolvedConfiguration = resolveSupabaseConfig({
  ...runtimeEnv,
  // The project binding is baked in (public values) so every deployment —
  // local, preview, and production — talks to the same database even when
  // hosting-level env vars are missing or stale. Only the cloud kill-switch
  // above still comes from the environment.
  VITE_SUPABASE_URL: KAIRO_SUPABASE_URL,
  VITE_SUPABASE_PUBLISHABLE_KEY: KAIRO_SUPABASE_PUBLISHABLE_KEY,
});
const supabaseUrl = resolvedConfiguration.config?.url;
const supabasePublishableKey = resolvedConfiguration.config?.key;

export const supabaseConfigurationError = resolvedConfiguration.error;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabasePublishableKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // Kairo uses HashRouter and anonymous sessions; parsing the route hash as
        // an auth callback would be both unnecessary and error-prone.
        detectSessionInUrl: false,
        flowType: 'pkce',
        storageKey: 'kairo_supabase_session',
      },
      global: {
        headers: {
          'x-application-name': 'kairo-web',
        },
      },
    })
  : null;

type IdentityClient = Pick<SupabaseClient, 'auth'>;

const DEFAULT_IDENTITY_RETRY_COOLDOWN_MS = 5 * 60 * 1000;

const normalizeIdentityError = (error: unknown) =>
  error instanceof Error
    ? error
    : new Error('Supabase identity could not be created.');

/**
 * Keeps anonymous authentication single-flight and applies a retry cooldown.
 * Several KAIRO modules initialize together, so a failed signup must never be
 * replayed once per component.
 */
export const createKairoIdentityManager = (
  client: IdentityClient,
  options: {
    retryCooldownMs?: number;
    now?: () => number;
  } = {},
) => {
  const retryCooldownMs =
    options.retryCooldownMs ?? DEFAULT_IDENTITY_RETRY_COOLDOWN_MS;
  const now = options.now ?? Date.now;
  let cachedUserId: string | null = null;
  let pendingIdentity: Promise<string> | null = null;
  let retryAfter = 0;
  let lastError: Error | null = null;

  const ensureIdentity = async (): Promise<string> => {
    if (cachedUserId) return cachedUserId;
    if (pendingIdentity) return pendingIdentity;
    if (lastError && now() < retryAfter) throw lastError;

    pendingIdentity = (async () => {
      const {
        data: { session },
        error: sessionError,
      } = await client.auth.getSession();

      if (sessionError) throw sessionError;
      if (session?.user?.id) {
        cachedUserId = session.user.id;
        return cachedUserId;
      }

      const { data, error } = await client.auth.signInAnonymously();
      if (error) throw error;
      if (!data.user?.id) {
        throw new Error('Supabase did not return a user identity.');
      }

      cachedUserId = data.user.id;
      return cachedUserId;
    })()
      .catch((error) => {
        lastError = normalizeIdentityError(error);
        retryAfter = now() + retryCooldownMs;
        throw lastError;
      })
      .finally(() => {
        pendingIdentity = null;
      });

    return pendingIdentity;
  };

  return {
    ensureIdentity,
    reset: () => {
      cachedUserId = null;
      pendingIdentity = null;
      retryAfter = 0;
      lastError = null;
    },
    getState: () => ({
      userId: cachedUserId,
      retryAfter,
      coolingDown: Boolean(lastError && now() < retryAfter),
    }),
  };
};

const identityManager = supabase
  ? createKairoIdentityManager(supabase)
  : null;

export const ensureKairoIdentity = async (): Promise<string> => {
  if (!identityManager) {
    throw new Error('Supabase is not configured.');
  }
  return identityManager.ensureIdentity();
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
