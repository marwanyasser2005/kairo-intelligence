/**
 * The public Supabase binding for every KAIRO deployment.
 *
 * These values are public by design — the browser talks to Supabase directly
 * with the publishable key, exactly like the previous VITE_ env vars did.
 * Baking them into the client keeps local builds, Vercel previews, and
 * production on the same project without depending on per-hosting dashboard
 * variables, which we cannot always update from the repository.
 *
 * `VITE_SUPABASE_CLOUD_ENABLED=false` remains the environment kill-switch that
 * turns cloud sync off entirely (see utils/supabase.ts).
 */
export const KAIRO_SUPABASE_URL = 'https://cuhuquqqwzaekfanujch.supabase.co';
export const KAIRO_SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_FFjnlN50qDf8MKBLTIoO6w_vM8NHJ0V';
