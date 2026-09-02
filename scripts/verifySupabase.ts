import { config as loadEnv } from 'dotenv';

loadEnv({ path: '.env.local', quiet: true });
loadEnv({ path: '.env.development.local', quiet: true, override: true });

const projectUrl = process.env.VITE_SUPABASE_URL?.trim().replace(/\/$/, '');
const browserKey =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  process.env.VITE_SUPABASE_ANON_KEY?.trim();

if (!projectUrl || !browserKey) {
  throw new Error('Supabase browser configuration is missing.');
}

const parsed = new URL(projectUrl);
if (parsed.protocol !== 'https:' || !parsed.hostname.endsWith('.supabase.co')) {
  throw new Error('Supabase project URL is invalid.');
}

if (browserKey.startsWith('sb_secret_')) {
  throw new Error('A secret Supabase key must never be used by the browser.');
}

const headers = {
  apikey: browserKey,
  Authorization: `Bearer ${browserKey}`,
};

const [authResponse, restResponse] = await Promise.all([
  fetch(`${projectUrl}/auth/v1/settings`, { headers }),
  fetch(`${projectUrl}/rest/v1/kairo_profiles?select=user_id&limit=0`, { headers }),
]);

if (!authResponse.ok || !restResponse.ok) {
  throw new Error(
    `Supabase verification failed (auth ${authResponse.status}, rest ${restResponse.status}).`,
  );
}

console.log(
  JSON.stringify({
    ok: true,
    project: parsed.hostname.split('.')[0],
    auth: authResponse.status,
    rest: restResponse.status,
    keyExposed: false,
  }),
);
