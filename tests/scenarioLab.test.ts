import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateScenarioOutcomes } from '../services/ScenarioLab';
import type { ScenarioBaseline, ScenarioLevers } from '../types';

const baseline: ScenarioBaseline = {
  waterWasteLitersMonth: 1_000,
  waterCostLossEgpMonth: 300,
  energyConsumptionKwhMonth: 500,
  energyCostLossEgpMonth: 800,
  energyCarbonKgMonth: 250,
  foodCostLossEgpMonth: 400,
  foodCarbonKgMonth: 100,
  mobilityCostEgpMonth: 600,
  mobilityCarbonKgMonth: 200,
  ewasteAvoidableKg: 10,
  connectedModules: 5,
};

const levers: ScenarioLevers = {
  waterReductionPct: 20,
  energyReductionPct: 10,
  foodWasteReductionPct: 25,
  mobilityShiftPct: 50,
  circularityPct: 40,
  investmentEgp: 1_320,
};

test('scenario outcomes are derived from the supplied baseline and horizon', () => {
  const result = calculateScenarioOutcomes(baseline, levers, 12);

  assert.equal(result.waterSavedLiters, 2_400);
  assert.equal(result.energySavedKwh, 600);
  assert.equal(result.ewasteAvoidedKg, 4);
  assert.equal(result.financialSavingsEgp, 5_220);
  assert.equal(result.paybackMonths, 3);
  assert.equal(result.carbonAvoidedKg, 1_448.4);
  assert.equal(result.impactScore, 27);
});

test('scenario percentages and horizon are bounded before calculation', () => {
  const result = calculateScenarioOutcomes(
    baseline,
    {
      ...levers,
      waterReductionPct: 300,
      energyReductionPct: -20,
      investmentEgp: 0,
    },
    100,
  );

  assert.equal(result.waterSavedLiters, 60_000);
  assert.equal(result.energySavedKwh, 0);
  assert.equal(result.paybackMonths, 0);
  assert.ok(result.impactScore <= 100);
});
