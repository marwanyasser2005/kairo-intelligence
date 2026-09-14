import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  BOOTSTRAP_PATH,
  buildBootstrapSql,
  listMigrationFiles,
  readMigrationFiles,
} from '../scripts/generateSupabaseBootstrap.js';

test('the bootstrap artifact stays in sync with the migration files', () => {
  const files = readMigrationFiles();
  const expected = buildBootstrapSql(files);
  const actual = readFileSync(BOOTSTRAP_PATH, 'utf8');
  assert.equal(
    actual,
    expected,
    'supabase/bootstrap.sql is stale — run `npm run supabase:bootstrap`.',
  );
});

test('migrations are concatenated in filename order', () => {
  const names = listMigrationFiles();
  assert.deepEqual(names, [...names].sort());
  assert.ok(names.length >= 3);

  const sql = buildBootstrapSql(readMigrationFiles());
  const positions = names.map((name) => sql.indexOf(name));
  assert.ok(positions.every((position) => position >= 0), 'every migration is labelled');
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b), 'order is preserved');
});

test('the bootstrap covers the core tables and the anonymous telemetry table', () => {
  const sql = buildBootstrapSql(readMigrationFiles());
  for (const table of [
    'public.kairo_profiles',
    'public.kairo_module_reports',
    'public.kairo_scenarios',
    'public.kairo_environmental_snapshots',
    'public.kairo_analysis_runs',
  ]) {
    assert.ok(sql.includes(table), `bootstrap must provision ${table}`);
  }
});
