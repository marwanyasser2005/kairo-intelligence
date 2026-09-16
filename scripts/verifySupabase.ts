import { KAIRO_SUPABASE_PUBLISHABLE_KEY, KAIRO_SUPABASE_URL } from '../config/supabaseProject';

const projectUrl = KAIRO_SUPABASE_URL.trim().replace(/\/$/, '');
const browserKey = KAIRO_SUPABASE_PUBLISHABLE_KEY.trim();

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

if (!authResponse.ok) {
  throw new Error(
    `Supabase verification failed (auth ${authResponse.status}). The project URL or the publishable key is wrong.`,
  );
}

// KAIRO's user-owned tables grant no SELECT to anon (privacy by design), so a
// migrated project answers the data probe with a privilege error, not a
// "table does not exist" schema error. Distinguish the two states:
const restBody = await restResponse.text();
const schemaNotMigrated = restResponse.status === 404 && restBody.includes('PGRST205');

if (schemaNotMigrated) {
  console.log(
    JSON.stringify({
      ok: false,
      project: parsed.hostname.split('.')[0],
      auth: authResponse.status,
      rest: restResponse.status,
      keyExposed: false,
      reason: 'schema_not_migrated',
      next: 'Run supabase/bootstrap.sql in the Supabase SQL Editor (one paste), then re-run this script.',
    }),
  );
  process.exitCode = 2;
} else {
  // Any other status — 401/403 privilege denial, or 200 — means the schema
  // exists and the browser binding is valid. Report ok:true: the datastore is
  // wired; user-owned writes additionally need anonymous sign-ins enabled.
  console.log(
    JSON.stringify({
      ok: true,
      project: parsed.hostname.split('.')[0],
      auth: authResponse.status,
      rest: restResponse.status,
      keyExposed: false,
      migrated: true,
      note: 'Schema present; user-owned cloud sync also requires Authentication > "Allow anonymous sign-ins" enabled.',
    }),
  );
}
