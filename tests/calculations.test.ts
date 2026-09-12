import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  calculateEgyptianElectricBill,
  calculateImpact,
} from '../utils/calculations.js';
import type { EnergyData, FoodData, WaterData } from '../types.js';

const waterInput = (overrides: Partial<WaterData> = {}): WaterData => ({
  leakingTaps: 2,
  leakingToilets: 1,
  leakageHoursPerDay: 2,
  monthlyBillLE: 200,
  ...overrides,
});

const foodInput = (overrides: Partial<FoodData> = {}): FoodData => ({
  mealsPerDay: 10,
  wastePercentage: 20,
  costPerMealLE: 25,
  ...overrides,
});

const energyInput = (overrides: Partial<EnergyData> = {}): EnergyData => ({
  monthlyKwh: 650,
  billEgp: 910,
  acCount: 1,
  acHoursPerDay: 8,
  acSetTemperature: 24,
  acType: 'inverter',
  majorAppliances: 3,
  ...overrides,
});

test('Egyptian tariff applies the first slab at exactly 50 kWh', () => {
  const result = calculateEgyptianElectricBill(50);
  assert.equal(result.tier, 1);
  assert.equal(result.nextTier, 0);
  assert.equal(result.bill, 29);
});

test('Egyptian tariff crosses to the second slab above 50 kWh', () => {
  const result = calculateEgyptianElectricBill(51);
  assert.equal(result.tier, 2);
  assert.equal(result.nextTier, 49);
  assert.equal(result.bill, 34.68);
});

test('Egyptian tariff covers every published slab boundary', () => {
  assert.deepEqual(calculateEgyptianElectricBill(100), {
    bill: 68,
    tier: 2,
    nextTier: 0,
  });
  assert.deepEqual(calculateEgyptianElectricBill(200), {
    bill: 166,
    tier: 3,
    nextTier: 0,
  });
  assert.deepEqual(calculateEgyptianElectricBill(350), {
    bill: 437.5,
    tier: 4,
    nextTier: 0,
  });
  assert.deepEqual(calculateEgyptianElectricBill(650), {
    bill: 910,
    tier: 5,
    nextTier: 0,
  });
  assert.deepEqual(calculateEgyptianElectricBill(1000), {
    bill: 1500,
    tier: 6,
    nextTier: 0,
  });
});

test('Egyptian tariff uses the fixed premium rate above 1000 kWh', () => {
  const result = calculateEgyptianElectricBill(1001);
  assert.equal(result.tier, 7);
  assert.equal(result.nextTier, 0);
  assert.equal(result.bill, 1651.65);
});

test('impact calculator derives water waste, cost, and social equivalents', () => {
  const result = calculateImpact(waterInput(), foodInput(), energyInput());

  // 2 taps x 3 L/h + 1 toilet x 20 L/h, over 2 h/day, for 30 days.
  assert.equal(result.water.monthlyWastedLiters, 1560);
  assert.equal(result.water.monthlyCostLE, 19.5);
  assert.equal(result.water.peopleSupported, 17);
  assert.equal(result.water.irrigationPotential, 13);
  assert.equal(result.water.co2FootprintKg, 0.4);
});

test('impact calculator converts food waste into money, families, and methane', () => {
  const result = calculateImpact(waterInput(), foodInput(), energyInput());

  assert.equal(result.food.monthlyWastedMeals, 60);
  assert.equal(result.food.monthlyFinancialLossLE, 1500);
  assert.equal(result.food.familiesSupported, 14);
  assert.equal(result.food.co2EquivalentKg, 75);
});

test('impact calculator treats an efficient inverter AC at 24C as zero waste', () => {
  const result = calculateImpact(waterInput(), foodInput(), energyInput());

  assert.equal(result.energy.monthlyCostEGP, 910);
  assert.equal(result.energy.tariffTier, 5);
  assert.equal(result.energy.wastedKwh, 0);
  assert.equal(result.energy.wastedEGP, 0);
  assert.equal(result.energy.efficiencyScore, 100);
  assert.equal(result.energy.co2FootprintKg, 292.5);
});

test('impact calculator charges colder set-points and older AC units', () => {
  const result = calculateImpact(
    waterInput(),
    foodInput(),
    energyInput({ monthlyKwh: 100, acSetTemperature: 20, acType: 'old' }),
  );

  // 4 degrees below 24C costs 24% more, an old unit 35% more, on 60% of the bill.
  assert.equal(result.energy.wastedKwh, 35);
  assert.equal(result.energy.wastedEGP, 24.07);
  assert.equal(result.energy.efficiencyScore, 41);
});

test('impact calculator aggregates financial leakage and carbon totals', () => {
  const result = calculateImpact(waterInput(), foodInput(), energyInput());

  assert.equal(result.totalFinancialLeakageEGP, 1519.5);
  assert.equal(result.totalCo2Kg, 367.9);
});

test('impact calculator never produces negative efficiency scores', () => {
  const result = calculateImpact(
    waterInput(),
    foodInput(),
    energyInput({ monthlyKwh: 100, acSetTemperature: 16, acType: 'old' }),
  );

  assert.ok(result.energy.efficiencyScore >= 0);
});
