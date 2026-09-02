import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createKairoIdentityManager,
  resolveSupabaseConfig,
} from '../utils/supabase';

test('Supabase browser configuration accepts publishable and legacy anon keys', () => {
  const publishable = resolveSupabaseConfig({
    VITE_SUPABASE_URL: 'https://example.supabase.co/',
    VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_browser_safe',
  });
  assert.equal(publishable.error, null);
  assert.equal(publishable.config?.url, 'https://example.supabase.co');

  const anon = resolveSupabaseConfig({
    VITE_SUPABASE_URL: 'https://example.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'legacy-public-anon-key',
  });
  assert.equal(anon.error, null);
});

test('Supabase browser configuration rejects missing, invalid, and secret values', () => {
  assert.equal(
    resolveSupabaseConfig({ VITE_SUPABASE_CLOUD_ENABLED: 'false' }).error,
    'cloud_sync_disabled',
  );
  assert.equal(resolveSupabaseConfig({}).error, 'missing_configuration');
  assert.equal(
    resolveSupabaseConfig({
      VITE_SUPABASE_URL: 'http://attacker.test',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test',
    }).error,
    'invalid_project_url',
  );
  assert.equal(
    resolveSupabaseConfig({
      VITE_SUPABASE_URL: 'https://example.supabase.co',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_secret_never_ship_this',
    }).error,
    'secret_key_in_browser',
  );

  const serviceJwt = [
    Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'),
    Buffer.from(JSON.stringify({ role: 'service_role' })).toString('base64url'),
    'signature',
  ].join('.');
  assert.equal(
    resolveSupabaseConfig({
      VITE_SUPABASE_URL: 'https://example.supabase.co',
      VITE_SUPABASE_ANON_KEY: serviceJwt,
    }).error,
    'secret_key_in_browser',
  );
});

test('anonymous identity creation is single-flight across concurrent modules', async () => {
  let signupCalls = 0;
  const manager = createKairoIdentityManager({
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      signInAnonymously: async () => {
        signupCalls += 1;
        await new Promise((resolve) => setTimeout(resolve, 5));
        return { data: { user: { id: 'kairo-user' } }, error: null };
      },
    },
  } as never);

  const identities = await Promise.all([
    manager.ensureIdentity(),
    manager.ensureIdentity(),
    manager.ensureIdentity(),
  ]);

  assert.deepEqual(identities, ['kairo-user', 'kairo-user', 'kairo-user']);
  assert.equal(signupCalls, 1);
  assert.equal(await manager.ensureIdentity(), 'kairo-user');
  assert.equal(signupCalls, 1);
});

test('failed anonymous signup is not replayed during the retry cooldown', async () => {
  let signupCalls = 0;
  let clock = 1_000;
  const manager = createKairoIdentityManager(
    {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        signInAnonymously: async () => {
          signupCalls += 1;
          return {
            data: { user: null },
            error: new Error('signup unavailable'),
          };
        },
      },
    } as never,
    { retryCooldownMs: 10_000, now: () => clock },
  );

  await assert.rejects(manager.ensureIdentity(), /signup unavailable/);
  await assert.rejects(manager.ensureIdentity(), /signup unavailable/);
  assert.equal(signupCalls, 1);

  clock += 10_001;
  await assert.rejects(manager.ensureIdentity(), /signup unavailable/);
  assert.equal(signupCalls, 2);
});
