import { isSupabaseConfigured, supabase } from '../utils/supabase';

/**
 * Anonymous analysis telemetry.
 *
 * Purpose: give the KAIRO team real-world runs to review so the deterministic
 * models (tariff, water, food) and the prompt design can be improved over time.
 *
 * Privacy rules enforced here:
 * - no user identity is attached; the client never calls ensureKairoIdentity
 * - callers pass a numeric/enum projection, never raw user objects
 * - names, notes, meter numbers, device models, images, and free text are dropped
 * - failures are swallowed: telemetry must never affect the user experience
 */
export type TelemetryModule = 'water' | 'energy' | 'food' | 'mobility' | 'exposure' | 'ewaste' | 'transport';

export interface AnalysisRunPayload {
  module: TelemetryModule;
  language: 'ar' | 'en';
  audience?: string | null;
  inputs: Record<string, unknown>;
  facts?: Record<string, unknown>;
  metrics?: Record<string, unknown>;
  reviewRequired?: boolean;
}

const SENSITIVE_KEY = /name|note|model|serial|meter|address|phone|image|base64|evidence|receipt|url|email|token|coordinate|lat|lon|method|summary|insight|description|comment|text|message/i;
const MAX_DEPTH = 4;
const MAX_KEYS = 60;
const MAX_STRING = 160;

/** Strip anything that could identify a person or a device from a payload. */
export const scrubTelemetryValue = (value: unknown, depth = 0): unknown => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.slice(0, MAX_STRING);
  if (depth >= MAX_DEPTH) return null;
  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => scrubTelemetryValue(item, depth + 1));
  }
  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>).slice(0, MAX_KEYS)) {
      if (SENSITIVE_KEY.test(key)) continue;
      const scrubbed = scrubTelemetryValue(item, depth + 1);
      if (scrubbed !== null && scrubbed !== undefined) result[key] = scrubbed;
    }
    // Prune empty branches so a scrubbed payload carries no structural hints.
    return Object.keys(result).length > 0 ? result : null;
  }
  return null;
};

const scrubRecord = (value: Record<string, unknown> | undefined): Record<string, unknown> => {
  const scrubbed = scrubTelemetryValue(value ?? {}, 0);
  return scrubbed && typeof scrubbed === 'object' && !Array.isArray(scrubbed)
    ? (scrubbed as Record<string, unknown>)
    : {};
};

export const buildAnalysisRunRow = (payload: AnalysisRunPayload) => ({
  module: payload.module,
  language: payload.language,
  audience: payload.audience ?? null,
  app_version: 'kairo-web',
  review_required: Boolean(payload.reviewRequired),
  inputs: scrubRecord(payload.inputs),
  facts: scrubRecord(payload.facts),
  metrics: scrubRecord(payload.metrics),
});

/**
 * Fire-and-forget insert. Returns true when the row was stored, false when the
 * cloud is unavailable; it never throws and never blocks the caller.
 */
const DISABLE_COOLDOWN_MS = 10 * 60 * 1000;
let telemetryDisabledUntil = 0;

export const recordAnalysisRun = async (payload: AnalysisRunPayload): Promise<boolean> => {
  if (!supabase || !isSupabaseConfigured) return false;
  // Stop retrying for a while once the table is missing, so an un-migrated
  // project never adds a failing request to every analysis.
  if (telemetryDisabledUntil > Date.now()) return false;
  try {
    const { error } = await supabase.from('kairo_analysis_runs').insert(buildAnalysisRunRow(payload));
    if (error) throw error;
    return true;
  } catch {
    // Telemetry is best-effort: a missing migration or offline device is fine.
    telemetryDisabledUntil = Date.now() + DISABLE_COOLDOWN_MS;
    return false;
  }
};

/** Convenience wrapper used by the analysis services. */
export const recordAnalysisRunSafe = (payload: AnalysisRunPayload): void => {
  void recordAnalysisRun(payload);
};
