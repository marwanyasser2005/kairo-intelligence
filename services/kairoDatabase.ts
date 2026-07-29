import type { Scenario } from '../types';
import type { AudienceId, CapabilityId } from '../config/kairoCapabilities';
import { ensureKairoIdentity, isSupabaseConfigured, supabase } from '../utils/supabase';

type ReportModule = Exclude<CapabilityId, 'foresight' | 'scenarios'> | 'carbon';

const requireClient = () => {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }
  return supabase;
};

export const upsertKairoProfile = async (
  audience: AudienceId,
  preferredLanguage: 'ar' | 'en',
) => {
  const client = requireClient();
  const userId = await ensureKairoIdentity();
  const { error } = await client.from('kairo_profiles').upsert(
    {
      user_id: userId,
      audience,
      preferred_language: preferredLanguage,
    },
    { onConflict: 'user_id' },
  );
  if (error) throw error;
};

export const upsertModuleReport = async (
  module: ReportModule,
  payload: unknown,
  score?: number | null,
) => {
  if (!payload) return;
  const client = requireClient();
  const userId = await ensureKairoIdentity();
  const { error } = await client.from('kairo_module_reports').upsert(
    {
      user_id: userId,
      module,
      payload,
      score: Number.isFinite(score) ? score : null,
    },
    { onConflict: 'user_id,module' },
  );
  if (error) throw error;
};

export const loadModuleReports = async (): Promise<Record<string, unknown>> => {
  const client = requireClient();
  await ensureKairoIdentity();
  const { data, error } = await client
    .from('kairo_module_reports')
    .select('module,payload,updated_at')
    .order('updated_at', { ascending: false });
  if (error) throw error;

  return (data ?? []).reduce<Record<string, unknown>>((reports, row) => {
    if (!(row.module in reports)) reports[row.module] = row.payload;
    return reports;
  }, {});
};

export const saveEnvironmentalSnapshot = async (snapshot: {
  coordinates?: unknown;
  air?: unknown;
  water?: unknown;
  deviceContext?: unknown;
}) => {
  const client = requireClient();
  const userId = await ensureKairoIdentity();
  const { error } = await client.from('kairo_environmental_snapshots').insert({
    user_id: userId,
    coordinates: snapshot.coordinates ?? null,
    air: snapshot.air ?? null,
    water: snapshot.water ?? null,
    device_context: snapshot.deviceContext ?? null,
  });
  if (error) throw error;
};

const rowToScenario = (row: any): Scenario => ({
  id: row.id,
  name: row.name,
  timestamp: new Date(row.created_at).getTime(),
  audience: row.audience,
  horizonMonths: row.horizon_months,
  baseline: row.baseline,
  levers: row.levers,
  outcomes: row.outcomes,
  synced: true,
});

export const listCloudScenarios = async (): Promise<Scenario[]> => {
  const client = requireClient();
  await ensureKairoIdentity();
  const { data, error } = await client
    .from('kairo_scenarios')
    .select('id,name,audience,horizon_months,baseline,levers,outcomes,created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToScenario);
};

export const saveCloudScenario = async (scenario: Scenario): Promise<Scenario> => {
  const client = requireClient();
  const userId = await ensureKairoIdentity();
  const { data, error } = await client
    .from('kairo_scenarios')
    .insert({
      id: scenario.id,
      user_id: userId,
      name: scenario.name,
      audience: scenario.audience,
      horizon_months: scenario.horizonMonths,
      baseline: scenario.baseline,
      levers: scenario.levers,
      outcomes: scenario.outcomes,
    })
    .select('id,name,audience,horizon_months,baseline,levers,outcomes,created_at')
    .single();
  if (error) throw error;
  return rowToScenario(data);
};

export const deleteCloudScenario = async (id: string) => {
  const client = requireClient();
  await ensureKairoIdentity();
  const { error } = await client.from('kairo_scenarios').delete().eq('id', id);
  if (error) throw error;
};
