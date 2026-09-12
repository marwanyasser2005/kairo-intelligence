import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  buildCapabilityStates,
  buildCostChartData,
  buildEvidencePassportItems,
  buildScoreChartData,
} from '../pages/dashboard/dashboardDisplay.js';

const waterReport = {
  metrics: {
    water_efficiency_score: 62,
    financial_loss_estimate_egp: 320,
    leak_probability_score: 48,
  },
} as never;

const energyReport = {
  metrics: {
    energy_efficiency_score: 84,
    financial_loss_estimate_egp: 150,
    carbon_footprint_kg: 210,
  },
} as never;

test('an empty session marks every capability not ready except scenarios', () => {
  const states = buildCapabilityStates({
    earlyWarningData: null,
    water: null,
    food: null,
    energy: null,
    transport: null,
    exposure: null,
    ewaste: null,
    isAr: false,
  });

  assert.equal(states.scenarios.ready, true);
  for (const id of ['foresight', 'water', 'food', 'energy', 'mobility', 'exposure', 'ewaste']) {
    assert.equal(states[id].ready, false, `${id} should not be ready`);
    assert.ok(states[id].evidence.length > 0, `${id} should explain its evidence basis`);
  }
});

test('saved session results flip capabilities to ready with formatted values', () => {
  const states = buildCapabilityStates({
    earlyWarningData: { air: { peakAqi: 87.4 }, water: { score: 41, confidence: 72 } },
    water: waterReport,
    food: null,
    energy: energyReport,
    transport: null,
    exposure: null,
    ewaste: null,
    isAr: false,
  });

  assert.equal(states.foresight.ready, true);
  assert.equal(states.foresight.value, '87 AQI');
  assert.equal(states.foresight.score, 72);
  assert.equal(states.water.ready, true);
  assert.equal(states.water.value, '62/100');
  assert.equal(states.energy.ready, true);
  assert.equal(states.energy.value, '84/100');
});

test('score chart data only includes ready capabilities with positive scores', () => {
  const states = buildCapabilityStates({
    earlyWarningData: null,
    water: waterReport,
    food: null,
    energy: energyReport,
    transport: null,
    exposure: null,
    ewaste: null,
    isAr: true,
  });

  const data = buildScoreChartData(states, true);
  assert.deepEqual(
    data.map((item) => item.name),
    ['المياه', 'الطاقة'],
  );
  assert.ok(data.every((item) => item.value >= 0 && item.value <= 100));
});

test('cost chart data drops sectors without measurable values', () => {
  const costs = buildCostChartData({
    water: waterReport,
    food: null,
    energy: energyReport,
    transport: null,
    isAr: false,
  });

  assert.deepEqual(
    costs.map((item) => item.name),
    ['Water', 'Energy'],
  );
  assert.equal(costs[0].value, 320);
  assert.equal(costs[1].value, 150);
});

test('evidence passport excludes scenarios and documents limits for every result', () => {
  const states = buildCapabilityStates({
    earlyWarningData: { updatedAt: '2026-09-01T10:00:00.000Z', air: { peakAqi: 90 } },
    water: waterReport,
    food: null,
    energy: null,
    transport: null,
    exposure: null,
    ewaste: null,
    isAr: false,
  });
  const items = buildEvidencePassportItems({
    capabilityStates: states,
    earlyWarningData: { updatedAt: '2026-09-01T10:00:00.000Z', air: { peakAqi: 90 } },
    currentLanguage: 'en',
    isAr: false,
  });

  assert.equal(items.length, 7);
  assert.ok(items.every((item) => item.id !== 'scenarios'));
  assert.ok(items.every((item) => item.source.length > 0 && item.limitation.length > 0));
  const foresight = items.find((item) => item.id === 'foresight');
  assert.ok(foresight);
  assert.equal(foresight.ready, true);
  assert.notEqual(foresight.freshness, 'Saved session result');
});
