export type ImpactMetricId = 'energy' | 'water' | 'food' | 'carbon' | 'cost';

export interface ImpactMetricDefinition {
  id: ImpactMetricId;
  unit: string;
  label: { ar: string; en: string };
  annualUnit: string;
}

export interface ImpactMeasurement {
  id: string;
  metric: ImpactMetricId;
  baselineValue: number;
  baselineDays: number;
  followUpValue: number;
  followUpDays: number;
  unitCost?: number;
  baselineEvidence: string;
  followUpEvidence: string;
  sameScope: boolean;
}

export interface ImpactAction {
  title: string;
  owner: string;
  startedAt: string;
  scope: string;
  notes: string;
}

export interface VerifiedMetricResult {
  id: string;
  metric: ImpactMetricId;
  unit: string;
  baselineDaily: number;
  followUpDaily: number;
  savedDuringFollowUp: number;
  annualizedSaving: number;
  percentChange: number;
  financialSaving: number;
  evidenceScore: number;
  status: 'documented' | 'supported' | 'indicative';
}

export const IMPACT_METRICS: ImpactMetricDefinition[] = [
  { id: 'energy', unit: 'kWh', annualUnit: 'kWh/year', label: { ar: 'الطاقة', en: 'Energy' } },
  { id: 'water', unit: 'm³', annualUnit: 'm³/year', label: { ar: 'المياه', en: 'Water' } },
  { id: 'food', unit: 'kg', annualUnit: 'kg/year', label: { ar: 'هدر الغذاء', en: 'Food waste' } },
  { id: 'carbon', unit: 'kg CO₂e', annualUnit: 'kg CO₂e/year', label: { ar: 'الانبعاثات', en: 'Emissions' } },
  { id: 'cost', unit: 'EGP', annualUnit: 'EGP/year', label: { ar: 'التكلفة المباشرة', en: 'Direct cost' } },
];

const finitePositive = (value: number) => Number.isFinite(value) && value > 0;
const round = (value: number, precision = 2) => {
  const multiplier = 10 ** precision;
  return Math.round((value + Number.EPSILON) * multiplier) / multiplier;
};

export const calculateEvidenceScore = (
  measurement: ImpactMeasurement,
  action: ImpactAction,
) => {
  let score = 0;
  if (measurement.baselineEvidence.trim().length >= 3) score += 20;
  if (measurement.followUpEvidence.trim().length >= 3) score += 20;
  if (measurement.sameScope) score += 20;
  if (measurement.baselineDays >= 7 && measurement.followUpDays >= 7) score += 15;
  if (action.title.trim() && action.startedAt) score += 15;
  if (action.owner.trim() && action.scope.trim()) score += 10;
  return Math.min(score, 100);
};

export const calculateImpactMetric = (
  measurement: ImpactMeasurement,
  action: ImpactAction,
): VerifiedMetricResult | null => {
  if (
    !finitePositive(measurement.baselineValue) ||
    !finitePositive(measurement.baselineDays) ||
    !Number.isFinite(measurement.followUpValue) ||
    measurement.followUpValue < 0 ||
    !finitePositive(measurement.followUpDays)
  ) {
    return null;
  }

  const definition = IMPACT_METRICS.find((item) => item.id === measurement.metric);
  if (!definition) return null;

  const baselineDaily = measurement.baselineValue / measurement.baselineDays;
  const followUpDaily = measurement.followUpValue / measurement.followUpDays;
  const dailySaving = baselineDaily - followUpDaily;
  const savedDuringFollowUp = dailySaving * measurement.followUpDays;
  const annualizedSaving = dailySaving * 365;
  const percentChange = (dailySaving / baselineDaily) * 100;
  const financialSaving =
    measurement.metric === 'cost'
      ? savedDuringFollowUp
      : savedDuringFollowUp * Math.max(0, measurement.unitCost ?? 0);
  const evidenceScore = calculateEvidenceScore(measurement, action);

  return {
    id: measurement.id,
    metric: measurement.metric,
    unit: definition.unit,
    baselineDaily: round(baselineDaily),
    followUpDaily: round(followUpDaily),
    savedDuringFollowUp: round(savedDuringFollowUp),
    annualizedSaving: round(annualizedSaving),
    percentChange: round(percentChange, 1),
    financialSaving: round(financialSaving),
    evidenceScore,
    status:
      evidenceScore >= 85
        ? 'documented'
        : evidenceScore >= 60
          ? 'supported'
          : 'indicative',
  };
};

export const calculateImpactPortfolio = (
  measurements: ImpactMeasurement[],
  action: ImpactAction,
) => {
  const results = measurements
    .map((measurement) => calculateImpactMetric(measurement, action))
    .filter((result): result is VerifiedMetricResult => Boolean(result));
  const positiveResults = results.filter((result) => result.savedDuringFollowUp > 0);
  const averageEvidence = results.length
    ? Math.round(results.reduce((sum, result) => sum + result.evidenceScore, 0) / results.length)
    : 0;

  return {
    results,
    positiveResults: positiveResults.length,
    averageEvidence,
    totalFinancialSaving: round(
      results.reduce((sum, result) => sum + Math.max(0, result.financialSaving), 0),
    ),
    repeatable:
      results.length > 0 &&
      positiveResults.length === results.length &&
      averageEvidence >= 85,
  };
};

