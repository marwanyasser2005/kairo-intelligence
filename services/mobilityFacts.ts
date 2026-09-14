import type { MobilityInputs } from '../types';

export const MOBILITY_FACTORS_KG_CO2_PER_KM: Record<string, number> = {
  Metro: 0.04, Train: 0.04, Bus: 0.08, Microbus: 0.1,
  'Private Car': 0.19, Uber: 0.19, Careem: 0.19,
  Motorcycle: 0.09, Walking: 0, Bicycle: 0,
};
const COST: Record<string, number> = { 'Under 300': 150, '300-600': 450, '600-1000': 800, '1000-2000': 1500, '2000+': 2500 };
const MINUTES: Record<string, number> = { '< 15 min': 7.5, '15-30': 22.5, '30-60': 45, '60-90': 75, '90+': 105 };
const numberOr = (value: unknown, fallback: number) => {
  if (value === '' || value == null) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};
const round = (value: number) => Math.round(value * 100) / 100;

/** Stable planning facts. Factors are declared estimates, not live measurements. */
export const computeMobilityFacts = (input: MobilityInputs) => {
  const monthlyDays = Math.min(7, numberOr(input.weeklyCommuteDays, 0)) * 52 / 12;
  const minutes = numberOr(input.dailyCommuteMinutes, MINUTES[input.commuteTime] ?? 0);
  const cost = numberOr(input.actualMonthlyCostEgp, COST[input.monthlySpending] ?? 0);
  const hasDistance = Number.isFinite(input.oneWayDistanceKm) && Number(input.oneWayDistanceKm) >= 0;
  const distance = hasDistance ? Number(input.oneWayDistanceKm) : minutes / 60 * 20 / 2;
  const passengers = Math.max(1, Math.min(8, numberOr(input.passengers, 1)));
  const factor = (mode: string) => {
    const base = MOBILITY_FACTORS_KG_CO2_PER_KM[mode] ?? 0.19;
    return ['Private Car', 'Uber', 'Careem'].includes(mode) ? base / passengers : base;
  };
  const returnMode = input.returnTransport === 'Same as Primary' ? input.primaryTransport : input.returnTransport;
  const carbon = distance * monthlyDays * (factor(input.primaryTransport) + factor(returnMode));
  const hours = minutes / 60 * monthlyDays;
  return {
    version: 'mobility-planning-v1' as const,
    distanceSource: hasDistance ? 'user-distance' as const : 'assumed-speed-20-kmh' as const,
    costSource: input.actualMonthlyCostEgp !== undefined ? 'user-cost' as const : 'spending-band-midpoint' as const,
    oneWayDistanceKm: round(distance),
    monthlyDistanceKm: round(distance * monthlyDays * 2),
    outboundFactorKgPerKm: factor(input.primaryTransport),
    returnFactorKgPerKm: factor(returnMode),
    reviewRequired: !hasDistance || input.actualMonthlyCostEgp === undefined,
    metrics: {
      monthly_cost_egp: monthlyDays === 0 ? 0 : round(cost),
      monthly_carbon_kg: round(carbon),
      annual_carbon_kg: round(carbon * 12),
      monthly_hours_lost: round(hours),
      annual_time_lost: round(hours * 12),
    },
  };
};
