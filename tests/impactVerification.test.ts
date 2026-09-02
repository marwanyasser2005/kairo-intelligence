import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateImpactMetric,
  calculateImpactPortfolio,
  type ImpactAction,
  type ImpactMeasurement,
} from '../services/impactVerification';

const action: ImpactAction = {
  title: 'Optimise cooling schedule',
  owner: 'Facility manager',
  startedAt: '2026-08-01',
  scope: 'Building A',
  notes: 'Equivalent occupancy',
};

const measurement: ImpactMeasurement = {
  id: 'energy-1',
  metric: 'energy',
  baselineValue: 1200,
  baselineDays: 30,
  followUpValue: 900,
  followUpDays: 30,
  unitCost: 2,
  baselineEvidence: 'invoice-baseline-001',
  followUpEvidence: 'invoice-followup-002',
  sameScope: true,
};

test('normalises periods and calculates transparent savings', () => {
  const result = calculateImpactMetric(measurement, action);
  assert.ok(result);
  assert.equal(result.baselineDaily, 40);
  assert.equal(result.followUpDaily, 30);
  assert.equal(result.savedDuringFollowUp, 300);
  assert.equal(result.annualizedSaving, 3650);
  assert.equal(result.percentChange, 25);
  assert.equal(result.financialSaving, 600);
  assert.equal(result.evidenceScore, 100);
  assert.equal(result.status, 'documented');
});

test('compares unequal periods using daily intensity', () => {
  const result = calculateImpactMetric(
    { ...measurement, baselineValue: 1400, baselineDays: 28, followUpValue: 700, followUpDays: 20 },
    action,
  );
  assert.ok(result);
  assert.equal(result.baselineDaily, 50);
  assert.equal(result.followUpDaily, 35);
  assert.equal(result.savedDuringFollowUp, 300);
  assert.equal(result.percentChange, 30);
});

test('rejects invalid baselines instead of fabricating a result', () => {
  assert.equal(calculateImpactMetric({ ...measurement, baselineValue: 0 }, action), null);
  assert.equal(calculateImpactMetric({ ...measurement, followUpValue: -1 }, action), null);
});

test('marks a portfolio repeatable only with positive, complete evidence', () => {
  const complete = calculateImpactPortfolio([measurement], action);
  assert.equal(complete.repeatable, true);

  const incomplete = calculateImpactPortfolio(
    [{ ...measurement, followUpEvidence: '', sameScope: false }],
    action,
  );
  assert.equal(incomplete.repeatable, false);
  assert.ok(incomplete.averageEvidence < 85);
});

