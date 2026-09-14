import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  calculateEgyptianElectricBill,
  WATER_BLENDED_RATE_EGP_PER_M3,
} from '../utils/calculations.js';
import {
  clampRange,
  clampScore,
  computeElectricityFacts,
  computeWaterFacts,
  electricityKwhFromBill,
  factsPromptBlock,
  waterM3FromBill,
} from '../services/tariffEngine.js';
import type { EnergyAnalysisInputs, WaterAnalysisInputs } from '../types.js';

const energyInputs = (overrides: Partial<EnergyAnalysisInputs> = {}): EnergyAnalysisInputs => ({
  type: 'residential',
  monthly_bill: 500,
  ...overrides,
});

const waterInputs = (overrides: Partial<WaterAnalysisInputs> = {}): WaterAnalysisInputs => ({
  type: 'residential',
  monthly_bill: 150,
  bill_increased: 'unknown',
  constant_water_sound: 'no',
  damp_stains: 'no',
  toilet_refills: 'no',
  washing_machine_weekly: 3,
  ...overrides,
});

test('bill inversion round-trips through the official residential slabs', () => {
  for (const kwh of [12, 50, 75, 137, 200, 340, 650, 1000, 1400]) {
    const { bill } = calculateEgyptianElectricBill(kwh);
    const inverted = electricityKwhFromBill(bill);
    assert.ok(
      Math.abs(inverted.kwh - kwh) <= 0.2,
      `expected ~${kwh} kWh from ${bill} EGP, received ${inverted.kwh}`,
    );
  }
});

test('bill inversion reports the correct tier at every boundary', () => {
  assert.equal(electricityKwhFromBill(29).tier, 1);
  assert.equal(electricityKwhFromBill(68).tier, 2);
  assert.equal(electricityKwhFromBill(166).tier, 3);
  assert.equal(electricityKwhFromBill(437.5).tier, 4);
  assert.equal(electricityKwhFromBill(910).tier, 5);
  assert.equal(electricityKwhFromBill(1500).tier, 6);
  assert.equal(electricityKwhFromBill(1651.65).tier, 7);
});

test('a zero or invalid bill never produces a negative reading', () => {
  assert.equal(electricityKwhFromBill(0).kwh, 0);
  assert.equal(electricityKwhFromBill(-40).kwh, 0);
  assert.equal(waterM3FromBill(0), 0);
  assert.equal(waterM3FromBill(120, 0), 0);
});

test('water volume uses the declared blended rate', () => {
  assert.equal(waterM3FromBill(150, 12.5), 12);
  assert.equal(waterM3FromBill(150, 10), 15);
  assert.equal(waterM3FromBill(125), 10);
});

test('electricity facts invert a residential bill deterministically', () => {
  const facts = computeElectricityFacts(energyInputs({ monthly_bill: 500 }));

  assert.equal(facts.source, 'bill-inversion');
  assert.equal(facts.tier, 5);
  assert.equal(facts.averagePriceEgpPerKwh, 1.4);
  assert.equal(facts.consumptionKwh, 357.1);
  assert.equal(facts.monthlyCostEgp, 500);
  assert.equal(facts.carbonKg, 160.7);
});

test('an OCR reading outranks the stored bill figure', () => {
  const facts = computeElectricityFacts(
    energyInputs({
      monthly_bill: 400,
      ocrData: { consumption_kwh: 200, total_amount: 166 } as never,
    }),
  );

  assert.equal(facts.source, 'ocr');
  assert.equal(facts.consumptionKwh, 200);
  assert.equal(facts.tier, 3);
  assert.equal(facts.averagePriceEgpPerKwh, 0.83);
  assert.equal(facts.monthlyCostEgp, 166);
  assert.equal(facts.carbonKg, 90);
});

test('a meter reading outranks bill inversion and derives the effective price', () => {
  const facts = computeElectricityFacts(
    energyInputs({ monthly_bill: 500, monthly_kwh: 300 }),
  );

  assert.equal(facts.source, 'meter');
  assert.equal(facts.consumptionKwh, 300);
  assert.equal(facts.averagePriceEgpPerKwh, 1.67);
});

test('commercial bills without a reading state the assumed price', () => {
  const defaultFacts = computeElectricityFacts(
    energyInputs({ type: 'corporate', monthly_bill: 500 }),
  );
  assert.equal(defaultFacts.consumptionKwh, 250);
  assert.equal(defaultFacts.averagePriceEgpPerKwh, 2);
  assert.match(defaultFacts.methodology.en, /assumed commercial price/i);

  const customFacts = computeElectricityFacts(
    energyInputs({ type: 'corporate', monthly_bill: 500, assumed_kwh_price_egp: 2.5 }),
  );
  assert.equal(customFacts.consumptionKwh, 200);
});

test('water facts prefer OCR, then the meter, then the blended rate', () => {
  const fromOcr = computeWaterFacts(
    waterInputs({ monthly_water_use_m3: 20, ocrData: { total_consumption_m3: 18, total_amount: 150 } as never }),
  );
  assert.equal(fromOcr.source, 'ocr');
  assert.equal(fromOcr.consumptionM3, 18);
  assert.equal(fromOcr.blendedRateEgpPerM3, 8.33);

  const fromMeter = computeWaterFacts(waterInputs({ monthly_water_use_m3: 20 }));
  assert.equal(fromMeter.source, 'meter');
  assert.equal(fromMeter.consumptionM3, 20);
  assert.equal(fromMeter.blendedRateEgpPerM3, 7.5);

  const fromBill = computeWaterFacts(waterInputs());
  assert.equal(fromBill.source, 'bill-inversion');
  assert.equal(fromBill.consumptionM3, 12);
  assert.equal(fromBill.blendedRateEgpPerM3, WATER_BLENDED_RATE_EGP_PER_M3);
});

test('the declared water rate is honoured when provided', () => {
  const facts = computeWaterFacts(waterInputs({ assumed_rate_egp_per_m3: 10 }));
  assert.equal(facts.consumptionM3, 15);
  assert.equal(facts.blendedRateEgpPerM3, 10);
});

test('the prompt block carries the deterministic facts and the monthly unit rule', () => {
  const block = factsPromptBlock(computeElectricityFacts(energyInputs()), 'en');
  assert.match(block, /COMPUTED FACTS/);
  assert.match(block, /consumption_kwh: 357\.1/);
  assert.match(block, /tariff_tier: 5/);
  assert.match(block, /monthly EGP/);
});

test('score and range guards keep estimates inside sane bounds', () => {
  assert.equal(clampScore(-12), 0);
  assert.equal(clampScore(140), 100);
  assert.equal(clampScore('not a number'), 0);
  assert.equal(clampRange(900, 0, 500), 500);
  assert.equal(clampRange(-5, 0, 500), 0);
  assert.equal(clampRange(Number.NaN, 10, 500), 10);
});
