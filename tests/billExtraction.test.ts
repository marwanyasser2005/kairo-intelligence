import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  applyExtractionEdits,
  reviewBillExtraction,
  consumptionFromReadings,
  describeExtractionFields,
  extractionQuality,
  normalizeDigits,
  normalizeElectricityExtraction,
  normalizeFoodExtraction,
  normalizeWaterExtraction,
  toConfidence,
  toNumber,
} from '../services/billExtraction.js';
import { fitWithin } from '../utils/billImage.js';

test('Arabic-Indic and Extended digits are normalized before parsing', () => {
  assert.equal(normalizeDigits('١٢٣٤'), '1234');
  assert.equal(normalizeDigits('۱۲۳'), '123');
  assert.equal(normalizeDigits('فاتورة ٤٥٠ جنيه'), 'فاتورة 450 جنيه');
  assert.equal(toNumber('١٢٣٤'), 1234);
});

test('numeric parsing tolerates separators, currency words, and junk', () => {
  assert.equal(toNumber('1,234.5'), 1234.5);
  assert.equal(toNumber('EGP 250'), 250);
  assert.equal(toNumber('—'), 0);
  assert.equal(toNumber(undefined), 0);
  assert.equal(toNumber(null, 7), 7);
});

test('confidence accepts both fractions and percentages', () => {
  assert.equal(toConfidence(0.85), 0.85);
  assert.equal(toConfidence(85), 0.85);
  assert.equal(toConfidence('٩٠'), 0.9);
  assert.equal(toConfidence(120), 1);
  assert.equal(toConfidence(-4), 0);
});

test('quality buckets follow the confidence thresholds', () => {
  assert.equal(extractionQuality(0.9), 'high');
  assert.equal(extractionQuality(0.75), 'high');
  assert.equal(extractionQuality(0.6), 'medium');
  assert.equal(extractionQuality(0.45), 'medium');
  assert.equal(extractionQuality(0.2), 'low');
});

test('meter readings derive consumption when the printed figure is missing', () => {
  assert.equal(consumptionFromReadings(1000, 1250), 250);
  assert.equal(consumptionFromReadings('١٠٠٠', '١٢٥٠'), 250);
  assert.equal(consumptionFromReadings(1250, 1000), 0);
  assert.equal(consumptionFromReadings(undefined, 100), 0);
});

test('electricity extraction is normalized and completed from readings', () => {
  const fromReadings = normalizeElectricityExtraction({
    previous_reading: '١٠٠٠',
    current_reading: 1250,
    total_amount: '430.5',
    confidence: 82,
    distribution_company: 'شركة شمال القاهرة',
  });

  assert.equal(fromReadings.consumption_kwh, 250);
  assert.equal(fromReadings.total_amount, 430.5);
  assert.equal(fromReadings.confidence, 0.82);
  assert.equal(fromReadings.isStub, false);
  assert.equal(fromReadings.property_type, 'residential');

  const printed = normalizeElectricityExtraction({ consumption_kwh: 357.1, total_amount: 500, confidence: 0.9 });
  assert.equal(printed.consumption_kwh, 357.1);
});

test('an unreadable electricity bill is flagged as a stub with guidance', () => {
  const stub = normalizeElectricityExtraction({ consumption_kwh: 0, total_amount: 0, confidence: 0.1 });
  assert.equal(stub.isStub, true);
  assert.ok((stub.message ?? '').length > 0);
});

test('water extraction derives volume, defaults currency, and sanitizes tiers', () => {
  const water = normalizeWaterExtraction({
    previous_reading: 1200,
    current_reading: 1218,
    total_amount: '150',
    pricing_tiers: [
      { tier_name: 'الشريحة الأولى', volume: '١٠', rate: 2.5 },
      'junk-entry',
    ],
    confidence: '0.7',
  });

  assert.equal(water.total_consumption_m3, 18);
  assert.equal(water.currency, 'EGP');
  assert.equal(water.confidence, 0.7);
  assert.equal(water.pricing_tiers.length, 2);
  assert.equal(water.pricing_tiers[0].volume, 10);
  assert.equal(water.pricing_tiers[1].volume, 0);
  assert.equal(water.isStub, false);
});

test('a grocery receipt without a total is a stub', () => {
  assert.equal(normalizeFoodExtraction({ items_count: 4 }).isStub, true);
  assert.equal(normalizeFoodExtraction({ total_cost_egp: 320, items_count: 6 }).isStub, false);
});

test('field descriptors expose the effective unit price and editability', () => {
  const fields = describeExtractionFields('electricity', {
    consumption_kwh: 200,
    total_amount: 166,
    previous_reading: 0,
    current_reading: 0,
    additional_fees: 0,
  } as never);

  const unitPrice = fields.find((field) => field.key === '_unit_price');
  const consumption = fields.find((field) => field.key === 'consumption_kwh');
  assert.ok(unitPrice);
  assert.equal(unitPrice.value, '0.83');
  assert.equal(unitPrice.editable, false);
  assert.ok(consumption?.emphasis);
  assert.ok(consumption?.editable);
});

test('user corrections override values and re-derive consumption from readings', () => {
  const base = normalizeElectricityExtraction({ consumption_kwh: 200, total_amount: 166, confidence: 0.9 });

  const correctedAmount = applyExtractionEdits(base, { total_amount: 180 });
  assert.equal(correctedAmount.total_amount, 180);
  assert.equal(correctedAmount.consumption_kwh, 200);

  const correctedReadings = applyExtractionEdits(base, { previous_reading: 1000, current_reading: 1300 });
  assert.equal(correctedReadings.consumption_kwh, 300);

  const explicitConsumptionWins = applyExtractionEdits(base, {
    consumption_kwh: 250,
    previous_reading: 1000,
    current_reading: 1300,
  });
  assert.equal(explicitConsumptionWins.consumption_kwh, 250);
});

test('correcting a stub clears the warning once real values exist', () => {
  const stub = normalizeElectricityExtraction({ consumption_kwh: 0, total_amount: 0, confidence: 0.2 });
  assert.equal(stub.isStub, true);
  const fixed = applyExtractionEdits(stub, { total_amount: 300 });
  assert.equal(fixed.isStub, false);
});

test('image fitting only downscales when the longest edge exceeds the limit', () => {
  const large = fitWithin(4000, 3000, 1600);
  assert.equal(large.width, 1600);
  assert.equal(large.height, 1200);
  assert.equal(large.resized, true);

  const tall = fitWithin(1000, 4000, 1600);
  assert.equal(tall.height, 1600);
  assert.equal(tall.width, 400);
  assert.equal(tall.resized, true);

  const small = fitWithin(800, 600, 1600);
  assert.deepEqual(small, { width: 800, height: 600, scale: 1, resized: false });

  const invalid = fitWithin(0, Number.NaN, 1600);
  assert.equal(invalid.resized, false);
  assert.ok(invalid.width >= 1 && invalid.height >= 1);
});

test('regression: the misread bill that produced 0.05 EGP/kWh is flagged', () => {
  // Real production case: a household bill was read as 335,453 kWh against
  // ~16,773 EGP, implying an impossible 0.05 EGP/kWh effective price.
  const misread = normalizeElectricityExtraction({
    consumption_kwh: 335453,
    total_amount: 16773,
    confidence: 0.8,
    property_type: 'residential',
  });
  const review = reviewBillExtraction('electricity', misread);

  assert.equal(review.needsReview, true);
  assert.ok(review.warnings.some((warning) => warning.en.includes('implied price')));
  assert.ok(review.warnings.some((warning) => warning.en.includes('far above a household')));
});

test('a plausible household bill passes the review without warnings', () => {
  const normal = normalizeElectricityExtraction({
    consumption_kwh: 450,
    total_amount: 400,
    confidence: 0.9,
    property_type: 'residential',
    billing_period_days: 30,
  });
  const review = reviewBillExtraction('electricity', normal);
  assert.equal(review.needsReview, false);
  assert.equal(review.warnings.length, 0);
});

test('a partial billing period is called out even when the numbers agree', () => {
  const partial = normalizeElectricityExtraction({
    consumption_kwh: 60,
    total_amount: 40,
    confidence: 0.9,
    billing_period_days: 10,
  });
  const review = reviewBillExtraction('electricity', partial);
  assert.equal(review.needsReview, true);
  assert.ok(review.warnings.some((warning) => warning.en.includes('partial reading')));
});

test('commercial readings above household range are accepted', () => {
  const industrial = normalizeElectricityExtraction({
    consumption_kwh: 40000,
    total_amount: 60000,
    confidence: 0.9,
    property_type: 'commercial',
  });
  const review = reviewBillExtraction('electricity', industrial);
  assert.equal(review.needsReview, false);
});

test('water review catches impossible rates and per-person outliers', () => {
  const misread = normalizeWaterExtraction({ total_consumption_m3: 4, total_amount: 900, confidence: 0.9 });
  assert.equal(reviewBillExtraction('water', misread).needsReview, true);

  const heavy = normalizeWaterExtraction({ total_consumption_m3: 120, total_amount: 900, confidence: 0.9 });
  const review = reviewBillExtraction('water', heavy, { peopleCount: 4 });
  assert.equal(review.needsReview, true);
  assert.ok(review.warnings.some((warning) => warning.en.includes('per person per day')));

  const normal = normalizeWaterExtraction({ total_consumption_m3: 18, total_amount: 150, confidence: 0.9 });
  assert.equal(reviewBillExtraction('water', normal, { peopleCount: 4 }).needsReview, false);
});

test('printed consumption disagreeing with the readings delta is flagged', () => {
  const misread = normalizeElectricityExtraction({
    consumption_kwh: 450,
    previous_reading: 1000,
    current_reading: 1300,
    total_amount: 400,
    confidence: 0.9,
  });
  const review = reviewBillExtraction('electricity', misread);
  assert.equal(review.needsReview, true);
  assert.ok(review.warnings.some((warning) => warning.en.includes('readings delta')));

  const waterMisread = normalizeWaterExtraction({
    total_consumption_m3: 30,
    previous_reading: 500,
    current_reading: 515,
    total_amount: 300,
    confidence: 0.9,
  });
  assert.ok(
    reviewBillExtraction('water', waterMisread).warnings.some((warning) =>
      warning.en.includes('readings delta'),
    ),
  );

  // A small rounding gap (< 10%) stays silent.
  const rounding = normalizeElectricityExtraction({
    consumption_kwh: 252,
    previous_reading: 1000,
    current_reading: 1250,
    total_amount: 230,
    confidence: 0.9,
  });
  assert.equal(reviewBillExtraction('electricity', rounding).needsReview, false);
});

test('field descriptors group into sections and expose derived averages', () => {
  const fields = describeExtractionFields('electricity', {
    consumption_kwh: 300,
    total_amount: 270,
    previous_reading: 1000,
    current_reading: 1300,
    additional_fees: 0,
    billing_period_days: 30,
  } as never);

  const daily = fields.find((field) => field.key === '_daily_average');
  assert.ok(daily);
  assert.equal(daily.value, '10');
  assert.equal(daily.group, 'usage');
  assert.equal(daily.editable, false);
  assert.ok(fields.every((field) => ['usage', 'financial', 'context'].includes(field.group)));

  const waterFields = describeExtractionFields('water', {
    total_consumption_m3: 15,
    total_amount: 180,
    currency: 'EGP',
  } as never);
  const waterDaily = waterFields.find((field) => field.key === '_daily_average');
  assert.ok(waterDaily);
  assert.equal(waterDaily.value, '500');

  const foodFields = describeExtractionFields('food', { total_cost_egp: 600, items_count: 12 } as never);
  const avgItem = foodFields.find((field) => field.key === '_avg_item_price');
  assert.ok(avgItem);
  assert.equal(avgItem.value, '50');
});

test('implausible grocery receipts are flagged for review', () => {
  const absurdTotal = normalizeFoodExtraction({ total_cost_egp: 900000, items_count: 40 });
  assert.ok(
    reviewBillExtraction('food', absurdTotal).warnings.some((warning) =>
      warning.en.includes('very high'),
    ),
  );

  const absurdAverage = normalizeFoodExtraction({ total_cost_egp: 90000, items_count: 3 });
  assert.ok(
    reviewBillExtraction('food', absurdAverage).warnings.some((warning) =>
      warning.en.includes('implausible'),
    ),
  );

  const normal = normalizeFoodExtraction({ total_cost_egp: 850, items_count: 25 });
  assert.equal(reviewBillExtraction('food', normal).needsReview, false);
});
