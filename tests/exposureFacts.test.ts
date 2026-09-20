import assert from 'node:assert/strict';
import test from 'node:test';
import { computeExposureFacts } from '../services/exposureFacts';

test('exposure profile separates indoor, commute and outdoor shares', () => {
  const facts = computeExposureFacts({ locationName: 'Cairo', hoursOutdoors: 2, transportMode: 'Public Bus', commuteMinutes: 90, indoorHours: 18, indoorEnvironment: 'home', ventilation: 'filtered', cookingExposure: 'none', nearbyTraffic: 'high', sensitiveGroup: 'asthma-cardio', activityLevel: 'moderate', forecastAqi: 140, forecastPm25: 52, forecastObservedAt: '2026-09-20T12:00', forecastBestHour: '2026-09-20T18:00', forecastBestAqi: 84 });
  const total = facts.exposure_profile!.indoor_share_percent + facts.exposure_profile!.commute_share_percent + facts.exposure_profile!.outdoor_share_percent;
  assert.ok(total > 99 && total < 101);
  assert.equal(facts.exposure_profile!.vulnerability_modifier, 1.3);
  assert.equal(facts.action_window!.expected_reduction_percent, 40);
  assert.equal(facts.evidence!.confidence, 'live-context');
});
