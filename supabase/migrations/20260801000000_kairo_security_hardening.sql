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
