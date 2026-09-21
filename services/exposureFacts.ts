import type { ExposureAgentInputs, ExposureAnalysis } from '../types';

export const EXPOSURE_FACTS_VERSION = 'microenvironment-v1';

const transportMultiplier: Record<string, number> = {
  Walking: 1.35,
  Bicycle: 1.45,
  'Public Bus': 1.2,
  Metro: 0.7,
  'Private Car': 0.8,
  Motorcycle: 1.5,
};

const indoorMultiplier: Record<string, number> = {
  filtered: 0.35,
  closed: 0.6,
  natural: 0.8,
  smoky: 1.35,
};

const vulnerabilityMultiplier: Record<string, number> = {
  general: 1,
  child: 1.15,
  'older-adult': 1.2,
  pregnant: 1.15,
  'asthma-cardio': 1.3,
};

const activityMultiplier: Record<string, number> = { low: 0.85, moderate: 1, high: 1.35 };
const round = (value: number) => Number(value.toFixed(1));

export function computeExposureFacts(inputs: ExposureAgentInputs): Pick<ExposureAnalysis, 'exposure_profile' | 'action_window' | 'evidence'> {
  const pm25 = Math.max(1, inputs.forecastPm25 ?? Math.max(5, (inputs.forecastAqi ?? 80) * 0.28));
  const outdoorHours = Math.max(0, Math.min(24, inputs.hoursOutdoors ?? 0));
  const commuteHours = Math.max(0, (inputs.commuteMinutes ?? 0) / 60);
  const indoorHours = Math.max(0, Math.min(24, inputs.indoorHours ?? Math.max(0, 24 - outdoorHours - commuteHours)));
  const activity = activityMultiplier[inputs.activityLevel ?? 'moderate'] ?? 1;
  const commuteDose = pm25 * commuteHours * (transportMultiplier[inputs.transportMode] ?? 1);
  const outdoorDose = pm25 * outdoorHours * activity * (inputs.nearbyTraffic === 'high' ? 1.25 : inputs.nearbyTraffic === 'medium' ? 1.1 : 1);
  const indoorBase = indoorMultiplier[inputs.indoorEnvironment ?? 'home'] ?? 0.8;
  const ventilation = inputs.ventilation === 'closed' ? 1.15 : inputs.ventilation === 'filtered' ? 0.8 : 1;
  const cooking = inputs.cookingExposure === 'biomass' ? 18 : inputs.cookingExposure === 'gas-vented' ? 8 : 0;
  const indoorDose = pm25 * indoorHours * indoorBase * ventilation + cooking;
  const total = Math.max(1, commuteDose + outdoorDose + indoorDose);
  const vulnerability = vulnerabilityMultiplier[inputs.sensitiveGroup ?? 'general'] ?? 1;
  const baseline = pm25 * 24;
  const reduction = inputs.forecastAqi && inputs.forecastBestAqi
    ? Math.max(0, Math.min(90, ((inputs.forecastAqi - inputs.forecastBestAqi) / inputs.forecastAqi) * 100))
    : 0;

  return {
    exposure_profile: {
      daily_dose_index: round(Math.min(250, (total / Math.max(baseline, 1)) * 100 * vulnerability)),
      outdoor_share_percent: round((outdoorDose / total) * 100),
      commute_share_percent: round((commuteDose / total) * 100),
      indoor_share_percent: round((indoorDose / total) * 100),
      vulnerability_modifier: vulnerability,
      dominant_microenvironment: outdoorDose >= commuteDose && outdoorDose >= indoorDose ? 'outdoor' : commuteDose >= indoorDose ? 'commute' : 'indoor',
    },
    action_window: {
      recommended_time: inputs.forecastBestHour ?? 'غير متاح دون توقعات ساعية',
      reason: inputs.forecastBestHour ? 'أقل مؤشر متوقع خلال نافذة التوقع المتاحة' : 'فعّل الموقع للحصول على نافذة زمنية أدق',
      expected_reduction_percent: round(reduction),
    },
    evidence: {
      source: inputs.forecastObservedAt ? 'Open-Meteo forecast + user time-activity profile' : 'user time-activity profile + declared planning assumptions',
      observed_at: inputs.forecastObservedAt ?? new Date().toISOString(),
      confidence: inputs.forecastObservedAt ? 'live-context' : 'estimated',
    },
  };
}
