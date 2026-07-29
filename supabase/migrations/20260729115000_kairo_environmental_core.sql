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
