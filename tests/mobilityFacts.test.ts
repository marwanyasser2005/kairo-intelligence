import assert from 'node:assert/strict';
import test from 'node:test';
import { computeMobilityFacts } from '../services/mobilityFacts';
import type { MobilityInputs } from '../types';

const base: MobilityInputs = {
  occupationType: 'Employee',
  weeklyCommuteDays: 5,
  governorate: 'Cairo',
  primaryTransport: 'Private Car',
  returnTransport: 'Private Car',
  transfers: 'Direct',
  commuteTime: '60-90',
  monthlySpending: '1000-2000',
  trafficExposure: 'High',
  isCar: true,
  fuelType: 'Gasoline',
  vehicleYear: '2016-2020',
  passengers: '2',
  acUsage: 'Frequently',
  oneWayDistanceKm: 10,
  dailyCommuteMinutes: 60,
  actualMonthlyCostEgp: 1200,
};

test('mobility facts are deterministic', () => {
  assert.deepEqual(computeMobilityFacts(base), computeMobilityFacts({ ...base }));
});

test('mobility facts use declared user figures', () => {
  const facts = computeMobilityFacts(base);
  assert.equal(facts.distanceSource, 'user-distance');
  assert.equal(facts.costSource, 'user-cost');
  assert.equal(facts.reviewRequired, false);
  assert.equal(facts.metrics.monthly_cost_egp, 1200);
  assert.equal(facts.metrics.monthly_hours_lost, 21.67);
  assert.equal(facts.metrics.monthly_carbon_kg, 41.17);
});

test('mobility facts disclose fallback assumptions', () => {
  const input = { ...base };
  delete input.oneWayDistanceKm;
  delete input.actualMonthlyCostEgp;
  const facts = computeMobilityFacts(input);
  assert.equal(facts.distanceSource, 'assumed-speed-20-kmh');
  assert.equal(facts.costSource, 'spending-band-midpoint');
  assert.equal(facts.reviewRequired, true);
  assert.equal(facts.metrics.monthly_cost_egp, 1500);
});

test('a long one-off round trip is not annualized', () => {
  const facts = computeMobilityFacts({ ...base, tripPattern: 'single-round-trip', tripPurpose: 'Intercity', oneWayDistanceKm: 700, returnDistanceKm: 700, primaryTransport: 'Intercity Train', returnTransport: 'Intercity Train', actualMonthlyCostEgp: 950 });
  assert.equal(facts.trip_context.total_distance_km, 1400);
  assert.equal(facts.metrics.monthly_carbon_kg, 49);
  assert.equal(facts.metrics.annual_carbon_kg, 49);
});

test('one-way trips omit the return leg', () => {
  const facts = computeMobilityFacts({ ...base, tripPattern: 'one-way', oneWayDistanceKm: 100, returnDistanceKm: 900, primaryTransport: 'Intercity Bus' });
  assert.equal(facts.trip_context.total_distance_km, 100);
  assert.equal(facts.trip_context.return_mode, 'لا توجد رحلة عودة');
});
