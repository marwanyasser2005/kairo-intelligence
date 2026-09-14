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
