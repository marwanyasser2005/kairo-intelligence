import assert from 'node:assert/strict';
import test from 'node:test';
import {
  computeAirEarlyWarning,
  computeWaterLeakRisk,
  type EnvironmentalSnapshot,
  type WaterNetworkProfile,
} from '../services/earlyWarningEngine';

const buildSnapshot = (aqiValues: number[]): EnvironmentalSnapshot => ({
  coordinates: { latitude: 30.0444, longitude: 31.2357 },
  timezone: 'Africa/Cairo',
  fetchedAt: '2026-07-29T08:00:00.000Z',
  air: {
    observedAt: '2026-07-29T10:00',
    current: {
      aqi: aqiValues[0],
      pm25: 22,
      pm10: 38,
      nitrogenDioxide: 14,
      ozone: 44,
    },
    hourly: aqiValues.map((aqi, index) => ({
      time: `2026-07-29T${String(10 + index).padStart(2, '0')}:00`,
      aqi,
      pm25: 22 + index,
      pm10: 38,
      nitrogenDioxide: 14,
      ozone: 44,
    })),
  },
  weather: {
    observedAt: '2026-07-29T10:00',
    current: {
      temperatureC: 31,
      relativeHumidity: 44,
      surfacePressureHpa: 1007,
    },
    hourly: aqiValues.map((_, index) => ({
      time: `2026-07-29T${String(10 + index).padStart(2, '0')}:00`,
      temperatureC: 30 + index * 0.5,
      relativeHumidity: 44,
      precipitationProbability: 0,
      surfacePressureHpa: 1007,
    })),
  },
});

test('air early warning exposes a future AQI threshold crossing', () => {
  const warning = computeAirEarlyWarning(buildSnapshot([55, 64, 82, 108, 126]));

  assert.equal(warning.currentAqi, 55);
  assert.equal(warning.peakAqi, 126);
  assert.equal(warning.thresholdCrossingAt, '2026-07-29T13:00');
  assert.equal(warning.level, 'high');
  assert.ok(warning.warningIndex > 55);
});

test('water risk rises with aging material, unstable pressure, and operational evidence', () => {
  const baseline: WaterNetworkProfile = {
    pipeAgeYears: 5,
    material: 'pvc',
    pressureStability: 'stable',
    previousLeaks: 0,
    nightFlowAnomaly: 0,
    acousticScore: null,
  };
  const stressed: WaterNetworkProfile = {
    pipeAgeYears: 42,
    material: 'cast-iron',
    pressureStability: 'unstable',
    previousLeaks: 3,
    nightFlowAnomaly: 75,
    acousticScore: 72,
  };

  const lowRisk = computeWaterLeakRisk(baseline, buildSnapshot([30, 31, 32]));
  const highRisk = computeWaterLeakRisk(stressed, buildSnapshot([30, 31, 32]));

  assert.ok(highRisk.score > lowRisk.score);
  assert.ok(highRisk.confidence > lowRisk.confidence);
  assert.ok(['high', 'critical'].includes(highRisk.level));
  assert.ok(highRisk.factors.some((factor) => factor.key === 'acoustic'));
});

test('water risk never treats GPS or weather alone as leak proof', () => {
  const unknownProfile: WaterNetworkProfile = {
    pipeAgeYears: 0,
    material: 'unknown',
    pressureStability: 'unknown',
    previousLeaks: 0,
    nightFlowAnomaly: 0,
    acousticScore: null,
  };

  const risk = computeWaterLeakRisk(unknownProfile, buildSnapshot([40, 41, 42]));

  assert.ok(risk.score < 31);
  assert.equal(risk.level, 'low');
  assert.ok(risk.confidence < 70);
});
