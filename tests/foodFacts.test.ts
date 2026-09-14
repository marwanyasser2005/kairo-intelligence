import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  FOOD_FACTS_CONSTANTS,
  computeFoodFacts,
  estimateWasteRatePercent,
  foodFactsPromptBlock,
} from '../services/foodFacts.js';
import {
  buildAnalysisRunRow,
  scrubTelemetryValue,
} from '../services/analysisTelemetry.js';

test('the waste-rate model moves with declared behaviour', () => {
  const calm = estimateWasteRatePercent({ throwAwayFreq: 0, expiredFound: 0, hasMealPlan: true, familySize: 4 });
  const careless = estimateWasteRatePercent({ throwAwayFreq: 4, expiredFound: 3, deliveryPerWeek: 5, shelfLifeDays: 2, familySize: 4 });

  assert.ok(calm < careless, `expected ${calm} < ${careless}`);
  assert.ok(calm >= FOOD_FACTS_CONSTANTS.minWasteRatePercent);
  assert.ok(careless <= FOOD_FACTS_CONSTANTS.maxWasteRatePercent);
});

test('meal planning and a single-person household reduce the estimate', () => {
  const withoutPlan = estimateWasteRatePercent({ throwAwayFreq: 2, expiredFound: 1, hasMealPlan: false, familySize: 4 });
  const withPlan = estimateWasteRatePercent({ throwAwayFreq: 2, expiredFound: 1, hasMealPlan: true, familySize: 4 });
  assert.ok(withPlan < withoutPlan);

  const single = estimateWasteRatePercent({ throwAwayFreq: 2, expiredFound: 1, familySize: 1 });
  const family = estimateWasteRatePercent({ throwAwayFreq: 2, expiredFound: 1, familySize: 5 });
  assert.ok(single < family);
});

test('food facts derive cost, weight, and environmental loads deterministically', () => {
  const facts = computeFoodFacts(
    {
      familySize: 4,
      homeMealsPerDay: 3,
      monthlyBudgetEgp: 4000,
      restaurantPercent: 20,
      throwAwayFreq: 2,
      expiredFound: 1,
      shelfLifeDays: 5,
      hasMealPlan: false,
      reductionTargetPercent: 25,
    },
    'en',
  );

  // 3 meals x 30 days, 80% of the budget spent at home.
  assert.equal(facts.householdMealsPerMonth, 90);
  assert.equal(facts.monthlyFoodSpendEgp, 3200);
  assert.equal(facts.costPerMealEgp, 35.56);
  assert.ok(facts.wasteRatePercent > 11 && facts.wasteRatePercent < 35);
  assert.ok(facts.wastedMealsPerMonth > 0);
  assert.equal(facts.wastedKgPerMonth, facts.wastedMealsPerMonth * FOOD_FACTS_CONSTANTS.mealWeightKg);
  assert.equal(facts.carbonKgPerMonth, Math.round(facts.wastedKgPerMonth * 2.5 * 10) / 10);
  assert.equal(facts.annualLossEgp, facts.monthlyLossEgp * 12);
  assert.ok(facts.reductionTargetEgpMonthly > 0 && facts.reductionTargetEgpMonthly < facts.monthlyLossEgp);
});

test('a real receipt calibrates the spend level and is labelled as such', () => {
  const facts = computeFoodFacts(
    {
      familySize: 4,
      homeMealsPerDay: 3,
      monthlyBudgetEgp: 4000,
      restaurantPercent: 20,
      shoppingTripsPerWeek: 2,
      receiptTotalEgp: 900,
      throwAwayFreq: 1,
    },
    'en',
  );

  assert.equal(facts.source, 'receipt-assisted');
  assert.notEqual(facts.monthlyFoodSpendEgp, 3200);
  assert.ok(facts.monthlyFoodSpendEgp >= 3200 * 0.6 && facts.monthlyFoodSpendEgp <= 3200 * 1.5);
  assert.match(facts.methodology.en, /receipt calibrated/i);
});

test('implausible cost per meal is flagged for review', () => {
  const tooCheap = computeFoodFacts({ familySize: 6, homeMealsPerDay: 9, monthlyBudgetEgp: 100, throwAwayFreq: 1 }, 'en');
  assert.equal(tooCheap.reviewRequired, true);
  assert.ok(tooCheap.warnings.some((warning) => warning.en.includes('below the plausible range')));

  const tooExpensive = computeFoodFacts({ familySize: 1, homeMealsPerDay: 1, monthlyBudgetEgp: 60000, throwAwayFreq: 1 }, 'en');
  assert.equal(tooExpensive.reviewRequired, true);
  assert.ok(tooExpensive.warnings.some((warning) => warning.en.includes('above the plausible range')));
});

test('the prompt block carries the deterministic food facts', () => {
  const facts = computeFoodFacts({ familySize: 4, homeMealsPerDay: 3, monthlyBudgetEgp: 4000, throwAwayFreq: 2 }, 'en');
  const block = foodFactsPromptBlock(facts, 'en');

  assert.match(block, /COMPUTED FACTS/);
  assert.match(block, /waste_rate_percent/);
  assert.match(block, /monthly_loss_egp/);
  assert.match(block, /monthly EGP/);
});

test('telemetry scrubbing removes identifiers and caps payload size', () => {
  const scrubbed = scrubTelemetryValue({
    monthly_bill: 800,
    meter_number: '96393242',
    customer_name: 'أحمد',
    evidence_note: 'قرأت الرقم من الفاتورة',
    ocr: { consumption_kwh: 200, imageBase64: 'AAAA', model: 'XYZ' },
    nested: { deep: { deeper: { deepest: { hidden: true } } } },
    coordinates: { lat: 30.04, lon: 31.23 },
  }) as Record<string, unknown>;

  assert.equal(scrubbed.monthly_bill, 800);
  assert.equal('meter_number' in scrubbed, false);
  assert.equal('customer_name' in scrubbed, false);
  assert.equal('evidence_note' in scrubbed, false);
  assert.equal('coordinates' in scrubbed, false);
  assert.deepEqual(scrubbed.ocr, { consumption_kwh: 200 });
  assert.equal('nested' in scrubbed, false);
});

test('the stored row keeps only anonymous, shaped data', () => {
  const row = buildAnalysisRunRow({
    module: 'water',
    language: 'ar',
    audience: 'individual',
    inputs: { type: 'residential', monthly_bill_egp: 150, customer_name: 'secret' },
    facts: { consumption_m3: 12, methodology: 'text that should be dropped' },
    metrics: { water_efficiency_score: 62 },
    reviewRequired: true,
  });

  assert.equal(row.module, 'water');
  assert.equal(row.review_required, true);
  assert.equal(row.app_version, 'kairo-web');
  assert.deepEqual(row.inputs, { type: 'residential', monthly_bill_egp: 150 });
  assert.deepEqual(row.facts, { consumption_m3: 12 });
  assert.deepEqual(row.metrics, { water_efficiency_score: 62 });
  assert.equal('user_id' in row, false);
});
