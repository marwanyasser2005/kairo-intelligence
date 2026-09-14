/**
 * Builds supabase/bootstrap.sql: every migration concatenated in filename
 * order, so a fresh Supabase project can be provisioned with one paste in the
 * SQL Editor. The migration files stay the source of truth; this artifact is
 * regenerated with `npm run supabase:bootstrap` and checked by a test so it
 * never drifts.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export const MIGRATIONS_DIR = 'supabase/migrations';
export const BOOTSTRAP_PATH = 'supabase/bootstrap.sql';

export interface MigrationFile {
  name: string;
  sql: string;
}

export const listMigrationFiles = (directory: string = MIGRATIONS_DIR): string[] =>
  readdirSync(directory)
    .filter((name) => name.endsWith('.sql'))
    .sort();

export const buildBootstrapSql = (
  files: MigrationFile[],
  generatedFrom = MIGRATIONS_DIR,
): string => {
  const header = [
    '-- KAIRO database bootstrap.',
    '--',
    `-- Generated from ${generatedFrom} — do not edit by hand.`,
    '-- Regenerate with: npm run supabase:bootstrap',
    '--',
    '-- Usage: paste this whole file into the Supabase SQL Editor of a fresh',
    '-- project and run it once. It is idempotent: tables, policies, and grants',
    '-- use "if not exists" / "drop ... if exists" so re-running is safe.',
    '--',
    '-- Before or after running it, enable Authentication > Sign In / Providers >',
    '-- "Allow anonymous sign-ins" in the Supabase dashboard. KAIRO writes user',
    '-- data through anonymous sessions, so cloud persistence stays disabled',
    '-- without it (the app degrades to local-device storage).',
    '',
  ].join('\n');

  const sections = files.map(
    (file, index) =>
      [
        `-- ${'='.repeat(72)}`,
        `-- Migration ${index + 1}/${files.length}: ${file.name}`,
        `-- ${'='.repeat(72)}`,
        file.sql.trimEnd(),
        '',
      ].join('\n'),
  );

  return `${header}\n${sections.join('\n')}`;
};

export const readMigrationFiles = (directory: string = MIGRATIONS_DIR): MigrationFile[] =>
  listMigrationFiles(directory).map((name) => ({
    name,
    sql: readFileSync(join(directory, name), 'utf8'),
  }));

const isDirectRun =
  process.argv[1] !== undefined &&
  import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop() ?? '');

if (isDirectRun) {
  const files = readMigrationFiles();
  if (files.length === 0) {
    throw new Error(`No migrations found in ${MIGRATIONS_DIR}.`);
  }
  writeFileSync(BOOTSTRAP_PATH, buildBootstrapSql(files), 'utf8');
  console.log(`Wrote ${BOOTSTRAP_PATH} from ${files.length} migrations: ${files.map((f) => f.name).join(', ')}`);
}
