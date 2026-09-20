import type { MobilityInputs, MobilityIntelligenceReport } from '../types';

export const MOBILITY_FACTS_VERSION = 'mobility-planning-v2';

const KG_CO2E_PER_PASSENGER_KM: Record<string, number> = {
  Metro: 0.04,
  Train: 0.04,
  'Intercity Train': 0.035,
  Bus: 0.08,
  'Intercity Bus': 0.06,
  Microbus: 0.1,
  'Private Car': 0.19,
  Carpool: 0.095,  // Half emissions when shared
  Taxi: 0.21,      // Higher due to deadheading
  Uber: 0.21,
  Careem: 0.21,
  'Ride-hailing': 0.21,  // Unified category
  Motorcycle: 0.09,
  'Domestic Flight': 0.255,
  Ferry: 0.115,
  Walking: 0,
  Bicycle: 0,
  'Electric Bus': 0.02,
  'Electric Metro': 0.015,
  'EV Private': 0.05,  // Lower for electric vehicles
  'EV Ride-hailing': 0.065,
};

const round = (value: number, digits = 1) => Number(value.toFixed(digits));
const COST_BAND_MIDPOINT: Record<string, number> = { 'Under 300': 150, '300-600': 450, '600-1000': 800, '1000-2000': 1500, '2000+': 2500 };

function monthlyTripCount(inputs: MobilityInputs): number {
  // Single trips are one-time events, not recurring
  if (inputs.tripPattern === 'single-round-trip' || inputs.tripPattern === 'one-way') return 1;
  // Repeated trips occur a specific number of times per month
  if (inputs.tripPattern === 'repeated') return Math.max(1, inputs.tripsPerMonth ?? 1);
  // Routine commutes are weekly patterns extrapolated to monthly
  // For distant travel (over 100km one-way), we treat it as a special case
  const isDistantTravel = (inputs.oneWayDistanceKm ?? 0) > 100;
  if (isDistantTravel && inputs.tripPattern === 'routine') {
    // Distant routine travel is infrequent - treat as special calculation
    return (inputs.weeklyCommuteDays ?? 1) * 0.3; // Reduced frequency
  }
  return Math.max(1, (inputs.weeklyCommuteDays ?? 5) * (52 / 12));
}

function carbonForLeg(distanceKm: number, mode: string, passengers: number): number {
  const factor = KG_CO2E_PER_PASSENGER_KM[mode] ?? 0.14;
  const sharedVehicle = ['Private Car', 'Carpool', 'Taxi', 'Uber', 'Careem'].includes(mode);
  return distanceKm * (sharedVehicle ? factor / Math.max(passengers, 1) : factor);
}

export function computeMobilityFacts(inputs: MobilityInputs): Pick<
  MobilityIntelligenceReport,
  'metrics' | 'trip_context'
> & {
  version: string;
  reviewRequired: boolean;
  distanceSource: 'user-distance' | 'assumed-speed-20-kmh';
  costSource: 'user-cost' | 'spending-band-midpoint';
  oneWayDistanceKm: number;
  monthlyDistanceKm: number;
} {
  const hasDistance = Number.isFinite(inputs.oneWayDistanceKm) && Number(inputs.oneWayDistanceKm) >= 0;
  const fallbackMinutes = Math.max(0, inputs.dailyCommuteMinutes ?? ({ '< 15 min': 7.5, '15-30': 22.5, '30-60': 45, '60-90': 75, '90+': 105 } as Record<string, number>)[inputs.commuteTime] ?? 0);
  const outboundDistance = hasDistance ? Math.max(0, Number(inputs.oneWayDistanceKm)) : (fallbackMinutes / 60) * 20 / 2;
  const oneWay = inputs.tripPattern === 'one-way';
  const returnDistance = oneWay ? 0 : Math.max(0, inputs.returnDistanceKm ?? outboundDistance);
  const tripCount = monthlyTripCount(inputs);
  const outboundMode = inputs.primaryTransport || 'Private Car';
  const returnMode = oneWay || inputs.returnTransport === 'Same as Primary'
    ? outboundMode
    : (inputs.returnTransport || outboundMode);
  const passengers = Math.max(1, Number(inputs.passengers ?? 1));
  const distancePerTrip = outboundDistance + returnDistance;
  const totalDistanceKm = distancePerTrip * tripCount;
  const carbonPerTrip = carbonForLeg(outboundDistance, outboundMode, passengers)
    + carbonForLeg(returnDistance, returnMode, passengers);
  const carbonForPeriod = carbonPerTrip * tripCount;
  const isOneOff = inputs.tripPattern === 'single-round-trip' || inputs.tripPattern === 'one-way';
  const periodLabel = isOneOff ? 'هذه الرحلة' : 'الشهر';
  const monthlyCost = Math.max(0, inputs.actualMonthlyCostEgp ?? COST_BAND_MIDPOINT[inputs.monthlySpending] ?? 0);
  const commuteTime = Math.max(0, inputs.dailyCommuteMinutes ?? 0);
  const monthlyHours = (commuteTime * tripCount) / 60;

  return {
    version: MOBILITY_FACTS_VERSION,
    reviewRequired: !hasDistance || inputs.actualMonthlyCostEgp === undefined,
    distanceSource: hasDistance ? 'user-distance' : 'assumed-speed-20-kmh',
    costSource: inputs.actualMonthlyCostEgp !== undefined ? 'user-cost' : 'spending-band-midpoint',
    oneWayDistanceKm: round(outboundDistance, 2),
    monthlyDistanceKm: round(totalDistanceKm, 2),
    metrics: {
      monthly_carbon_kg: round(carbonForPeriod, 2),
      annual_carbon_kg: isOneOff ? round(carbonForPeriod, 2) : round(carbonForPeriod * 12, 2),
      monthly_cost_egp: round(monthlyCost, 0),
      monthly_hours_lost: round(monthlyHours, 2),
      annual_time_lost: isOneOff ? round(monthlyHours, 2) : round(monthlyHours * 12, 2),
    },
    trip_context: {
      pattern: inputs.tripPattern ?? 'routine',
      purpose: inputs.tripPurpose ?? 'Work',
      trips_per_month: tripCount,
      total_distance_km: round(totalDistanceKm),
      distance_source: inputs.distanceConfidence === 'estimated' ? 'تقدير المستخدم' : 'مسافة معروفة من المستخدم',
      outbound_mode: outboundMode,
      return_mode: oneWay ? 'لا توجد رحلة عودة' : returnMode,
      calculation_note: `النتائج محسوبة على ${periodLabel}. عوامل الانبعاثات افتراضات تخطيطية معلنة (${MOBILITY_FACTS_VERSION}) وتحتاج معايرة محلية قبل استخدامها كتقرير مؤسسي.`,
    },
  };
}

export function getMobilityFactor(mode: string): number {
  return KG_CO2E_PER_PASSENGER_KM[mode] ?? 0.14;
}
