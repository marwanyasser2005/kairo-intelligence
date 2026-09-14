import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  localizeDisplayValue,
  riskTone,
  riskToneClass,
} from '../utils/displayLabels.js';

test('high risk stays dangerous in both languages', () => {
  // Regression: Arabic "مرتفع" previously fell through to the safe/green branch.
  assert.equal(riskTone('مرتفع'), 'danger');
  assert.equal(riskTone('عالية'), 'danger');
  assert.equal(riskTone('عالي'), 'danger');
  assert.equal(riskTone('High'), 'danger');
  assert.equal(riskToneClass('مرتفع'), 'text-red-500');
  assert.equal(riskToneClass('High'), 'text-red-500');
});

test('severe and critical water states are dangerous too', () => {
  assert.equal(riskTone('Severe'), 'danger');
  assert.equal(riskTone('Critical'), 'danger');
  assert.equal(riskTone('حرج'), 'danger');
  assert.equal(riskTone('مخاطرة مرتفعة'), 'danger');
  assert.equal(riskToneClass('شديد'), 'text-red-500');
});

test('moderate, improvement, and safe levels map to distinct tones', () => {
  assert.equal(riskTone('Medium'), 'watch');
  assert.equal(riskTone('متوسط'), 'watch');
  assert.equal(riskTone('Needs Improvement'), 'warn');
  assert.equal(riskTone('يحتاج تحسين'), 'warn');
  assert.equal(riskTone('Low'), 'safe');
  assert.equal(riskTone('منخفض'), 'safe');
  assert.equal(riskTone('Excellent'), 'safe');
  assert.equal(riskTone('Very Good'), 'safe');
  assert.equal(riskTone(''), 'neutral');
  assert.equal(riskTone('something else'), 'neutral');
});

test('display values localize without losing unknown strings', () => {
  assert.equal(localizeDisplayValue('High', 'ar'), 'مرتفع');
  assert.equal(localizeDisplayValue('Excellent', 'ar'), 'ممتاز');
  assert.equal(localizeDisplayValue('Needs Improvement', 'ar'), 'يحتاج تحسين');
  assert.equal(localizeDisplayValue('High', 'en'), 'High');
  assert.equal(localizeDisplayValue('Custom wording', 'ar'), 'Custom wording');
  assert.equal(localizeDisplayValue('', 'ar'), '');
});
