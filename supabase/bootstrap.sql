-- KAIRO database bootstrap.
--
-- Generated from supabase/migrations — do not edit by hand.
-- Regenerate with: npm run supabase:bootstrap
--
-- Usage: paste this whole file into the Supabase SQL Editor of a fresh
-- project and run it once. It is idempotent: tables, policies, and grants
-- use "if not exists" / "drop ... if exists" so re-running is safe.
--
-- Before or after running it, enable Authentication > Sign In / Providers >
-- "Allow anonymous sign-ins" in the Supabase dashboard. KAIRO writes user
-- data through anonymous sessions, so cloud persistence stays disabled
-- without it (the app degrades to local-device storage).

-- ========================================================================
-- Migration 1/3: 20260729115000_kairo_environmental_core.sql
-- ========================================================================
-- KAIRO environmental intelligence data layer.
-- All user-owned records require an authenticated Supabase identity and are
-- protected by row-level security.

create extension if not exists pgcrypto with schema extensions;

create or replace function public.kairo_set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create table if not exists public.kairo_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  audience text not null default 'individual'
    check (audience in ('individual', 'community', 'education', 'business', 'government')),
  preferred_language text not null default 'ar'
    check (preferred_language in ('ar', 'en')),
  consent jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.kairo_module_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  module text not null
    check (module in ('carbon', 'water', 'food', 'energy', 'mobility', 'exposure', 'ewaste')),
  score numeric,
  payload jsonb not null default '{}'::jsonb,
  source_version text not null default 'kairo-web-2026',
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  unique (user_id, module)
);

create table if not exists public.kairo_scenarios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  audience text not null default 'individual'
    check (audience in ('individual', 'community', 'education', 'business', 'government')),
  horizon_months integer not null default 12 check (horizon_months between 1 and 60),
  baseline jsonb not null default '{}'::jsonb,
  levers jsonb not null default '{}'::jsonb,
  outcomes jsonb not null default '{}'::jsonb,
  analysis jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.kairo_environmental_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  coordinates jsonb,
  air jsonb,
  water jsonb,
  device_context jsonb,
  captured_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists kairo_module_reports_user_updated_idx
  on public.kairo_module_reports (user_id, updated_at desc);
create index if not exists kairo_scenarios_user_created_idx
  on public.kairo_scenarios (user_id, created_at desc);
create index if not exists kairo_environmental_snapshots_user_captured_idx
  on public.kairo_environmental_snapshots (user_id, captured_at desc);

drop trigger if exists kairo_profiles_set_updated_at on public.kairo_profiles;
create trigger kairo_profiles_set_updated_at
before update on public.kairo_profiles
for each row execute function public.kairo_set_updated_at();

drop trigger if exists kairo_module_reports_set_updated_at on public.kairo_module_reports;
create trigger kairo_module_reports_set_updated_at
before update on public.kairo_module_reports
for each row execute function public.kairo_set_updated_at();

drop trigger if exists kairo_scenarios_set_updated_at on public.kairo_scenarios;
create trigger kairo_scenarios_set_updated_at
before update on public.kairo_scenarios
for each row execute function public.kairo_set_updated_at();

alter table public.kairo_profiles enable row level security;
alter table public.kairo_module_reports enable row level security;
alter table public.kairo_scenarios enable row level security;
alter table public.kairo_environmental_snapshots enable row level security;

drop policy if exists "Kairo users manage own profile" on public.kairo_profiles;
create policy "Kairo users manage own profile"
on public.kairo_profiles
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Kairo users manage own module reports" on public.kairo_module_reports;
create policy "Kairo users manage own module reports"
on public.kairo_module_reports
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Kairo users manage own scenarios" on public.kairo_scenarios;
create policy "Kairo users manage own scenarios"
on public.kairo_scenarios
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Kairo users manage own environmental snapshots"
  on public.kairo_environmental_snapshots;
create policy "Kairo users manage own environmental snapshots"
on public.kairo_environmental_snapshots
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

revoke all on public.kairo_profiles from anon;
revoke all on public.kairo_module_reports from anon;
revoke all on public.kairo_scenarios from anon;
revoke all on public.kairo_environmental_snapshots from anon;

grant select, insert, update, delete on public.kairo_profiles to authenticated;
grant select, insert, update, delete on public.kairo_module_reports to authenticated;
grant select, insert, update, delete on public.kairo_scenarios to authenticated;
grant select, insert, update, delete on public.kairo_environmental_snapshots to authenticated;

-- Repair the advisor finding on the existing public.users table. Authorization
-- must use app_metadata because auth user_metadata is editable by end users.
do $$
begin
  if to_regclass('public.users') is not null then
    execute 'drop policy if exists "Admins can manage all users" on public.users';
    execute $policy$
      create policy "Admins can manage all users"
      on public.users
      for all
      to authenticated
      using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
      with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    $policy$;
  end if;
end
$$;

comment on table public.kairo_module_reports is
  'Latest user-owned output for each KAIRO environmental capability.';
comment on table public.kairo_scenarios is
  'User-owned environmental scenarios with visible baselines, levers, and outcomes.';
comment on table public.kairo_environmental_snapshots is
  'Consent-led environmental foresight snapshots; no raw audio is stored.';

-- ========================================================================
-- Migration 2/3: 20260801000000_kairo_security_hardening.sql
-- ========================================================================
-- Defense in depth for user-owned environmental data. RLS remains the primary
-- authorization boundary; these constraints also cap abusive payload growth.

alter table public.kairo_profiles force row level security;
alter table public.kairo_module_reports force row level security;
alter table public.kairo_scenarios force row level security;
alter table public.kairo_environmental_snapshots force row level security;

revoke truncate, references, trigger on public.kairo_profiles from anon, authenticated;
revoke truncate, references, trigger on public.kairo_module_reports from anon, authenticated;
revoke truncate, references, trigger on public.kairo_scenarios from anon, authenticated;
revoke truncate, references, trigger on public.kairo_environmental_snapshots from anon, authenticated;

alter table public.kairo_profiles
  drop constraint if exists kairo_profiles_consent_object_and_size;
alter table public.kairo_profiles
  add constraint kairo_profiles_consent_object_and_size
  check (
    jsonb_typeof(consent) = 'object'
    and pg_column_size(consent) <= 65536
  ) not valid;

alter table public.kairo_module_reports
  drop constraint if exists kairo_module_reports_payload_object_and_size;
alter table public.kairo_module_reports
  add constraint kairo_module_reports_payload_object_and_size
  check (
    jsonb_typeof(payload) = 'object'
    and pg_column_size(payload) <= 1048576
  ) not valid;

alter table public.kairo_scenarios
  drop constraint if exists kairo_scenarios_json_shape_and_size;
alter table public.kairo_scenarios
  add constraint kairo_scenarios_json_shape_and_size
  check (
    jsonb_typeof(baseline) = 'object'
    and jsonb_typeof(levers) = 'object'
    and jsonb_typeof(outcomes) = 'object'
    and (analysis is null or jsonb_typeof(analysis) = 'object')
    and pg_column_size(baseline) <= 262144
    and pg_column_size(levers) <= 262144
    and pg_column_size(outcomes) <= 262144
    and (analysis is null or pg_column_size(analysis) <= 524288)
  ) not valid;

alter table public.kairo_environmental_snapshots
  drop constraint if exists kairo_snapshots_json_shape_and_size;
alter table public.kairo_environmental_snapshots
  add constraint kairo_snapshots_json_shape_and_size
  check (
    (coordinates is null or (jsonb_typeof(coordinates) = 'object' and pg_column_size(coordinates) <= 16384))
    and (air is null or (jsonb_typeof(air) = 'object' and pg_column_size(air) <= 262144))
    and (water is null or (jsonb_typeof(water) = 'object' and pg_column_size(water) <= 262144))
    and (device_context is null or (jsonb_typeof(device_context) = 'object' and pg_column_size(device_context) <= 262144))
  ) not valid;

-- ========================================================================
-- Migration 3/3: 20260915000000_kairo_analysis_runs.sql
-- ========================================================================
-- Anonymous, insert-only analysis telemetry. Its only purpose is to let the
-- KAIRO team review how the estimation models behave in the real world and
-- improve them over time.
--
-- Privacy by design: there is no user_id, no identity linkage, no meter number,
-- no image, and no free text. Rows hold only numeric inputs, computed facts,
-- and outcome metrics for a module. Clients may append; nobody may read.

create table if not exists public.kairo_analysis_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  module text not null,
  language text not null default 'ar',
  audience text,
  app_version text,
  review_required boolean not null default false,
  inputs jsonb not null default '{}'::jsonb,
  facts jsonb not null default '{}'::jsonb,
  metrics jsonb not null default '{}'::jsonb,
  constraint kairo_analysis_runs_module_check
    check (module in ('water', 'energy', 'food', 'mobility', 'exposure', 'ewaste', 'transport')),
  constraint kairo_analysis_runs_language_check
    check (language in ('ar', 'en')),
  constraint kairo_analysis_runs_shapes
    check (
      jsonb_typeof(inputs) = 'object'
      and jsonb_typeof(facts) = 'object'
      and jsonb_typeof(metrics) = 'object'
      and pg_column_size(inputs) <= 16384
      and pg_column_size(facts) <= 16384
      and pg_column_size(metrics) <= 16384
    )
);

comment on table public.kairo_analysis_runs is
  'Anonymous, append-only analysis runs used to review and improve KAIRO estimation models.';

create index if not exists kairo_analysis_runs_module_created_idx
  on public.kairo_analysis_runs (module, created_at desc);

alter table public.kairo_analysis_runs enable row level security;
alter table public.kairo_analysis_runs force row level security;

revoke all on public.kairo_analysis_runs from anon, authenticated;
grant insert on public.kairo_analysis_runs to anon, authenticated;
revoke truncate, references, trigger on public.kairo_analysis_runs from anon, authenticated;

-- Deliberately no select/update/delete policy: the table is write-only for
-- clients so no visitor can read anyone else's data (or their own) from the app.
drop policy if exists "Kairo analysis runs are append only" on public.kairo_analysis_runs;
create policy "Kairo analysis runs are append only"
  on public.kairo_analysis_runs
  for insert
  to anon, authenticated
  with check (true);
