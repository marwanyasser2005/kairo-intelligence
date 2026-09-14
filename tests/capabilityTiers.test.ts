import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import {
  CAPABILITY_SCORES,
  PRIORITY_CRITERIA,
  TOTAL_PRIORITY_WEIGHT,
  capabilityPriorityScore,
  rankedCapabilities,
  topRankedCapabilities,
} from '../config/capabilityPriority.js';
import {
  coreCapabilities,
  groupCapabilitiesByTier,
  kairoCapabilities,
  supportCapabilities,
  TIER_LABELS,
  type CapabilityId,
} from '../config/kairoCapabilities.js';

const EXPECTED_CORE: CapabilityId[] = ['water', 'energy', 'food'];
const EXPECTED_SUPPORT: CapabilityId[] = ['foresight', 'mobility', 'exposure', 'ewaste'];

test('the product split is exactly three core and four support capabilities', () => {
  assert.deepEqual(
    coreCapabilities.map((capability) => capability.id),
    EXPECTED_CORE,
  );
  assert.deepEqual(
    supportCapabilities.map((capability) => capability.id),
    EXPECTED_SUPPORT,
  );
  assert.equal(coreCapabilities.length, 3);
  assert.equal(supportCapabilities.length, 4);
});

test('scenarios is a decision tool, never counted as a core result', () => {
  const groups = groupCapabilitiesByTier(kairoCapabilities);
  assert.deepEqual(groups.tool.map((capability) => capability.id), ['scenarios']);
  const resultCapabilities = [...groups.core, ...groups.support];
  assert.equal(resultCapabilities.length, 7);
  assert.equal(resultCapabilities.some((capability) => capability.id === 'scenarios'), false);
});

test('core capabilities come first in config order so every surface lists them first', () => {
  const tiers = kairoCapabilities.map((capability) => capability.tier);
  const firstSupport = tiers.indexOf('support');
  const lastCore = tiers.lastIndexOf('core');
  assert.ok(lastCore < firstSupport, 'core capabilities must precede support capabilities');
  assert.equal(tiers[tiers.length - 1], 'tool', 'the decision tool is listed last');
});

test('the weighted priority model selects exactly the declared core tier', () => {
  const resultIds = kairoCapabilities
    .filter((capability) => capability.tier !== 'tool')
    .map((capability) => capability.id);

  // The model ranks resource owners first, which matches the declared core
  // tier in order: water, energy, then food.
  assert.deepEqual(topRankedCapabilities(resultIds, 3), EXPECTED_CORE);
  const ranking = rankedCapabilities(resultIds);
  assert.equal(ranking[3].id, 'foresight', 'the live signal layer leads the support tier');

  // The split must stay defensible: every core score beats every support score.
  const coreScores = coreCapabilities.map((capability) => capabilityPriorityScore(capability.id));
  const supportScores = supportCapabilities.map((capability) => capabilityPriorityScore(capability.id));
  assert.ok(
    Math.min(...coreScores) > Math.max(...supportScores),
    `core floor ${Math.min(...coreScores)} must exceed support ceiling ${Math.max(...supportScores)}`,
  );
});

test('the priority model is complete and weighted to one', () => {
  assert.equal(Math.round(TOTAL_PRIORITY_WEIGHT * 100) / 100, 1);
  for (const [id, scores] of Object.entries(CAPABILITY_SCORES)) {
    for (const criterion of PRIORITY_CRITERIA) {
      const value = scores[criterion.id];
      assert.ok(Number.isInteger(value) && value >= 1 && value <= 5, `${id}.${criterion.id} is out of range`);
    }
  }
  for (const criterion of PRIORITY_CRITERIA) {
    assert.ok(criterion.weight > 0 && criterion.weight <= 0.5);
    assert.ok(criterion.label.ar.length > 0 && criterion.label.en.length > 0);
  }
});

test('declared audience lists match the audience reach used by the model', () => {
  const reach = Object.fromEntries(
    kairoCapabilities.map((capability) => [capability.id, capability.audiences.length]),
  ) as Record<CapabilityId, number>;

  for (const [id, declared] of Object.entries(reach)) {
    assert.equal(
      CAPABILITY_SCORES[id as CapabilityId].audienceReach,
      declared,
      `${id} declares ${declared} audiences but the model scores ${CAPABILITY_SCORES[id as CapabilityId].audienceReach}`,
    );
  }
  assert.ok(rankedCapabilities(EXPECTED_CORE).every((entry) => entry.score >= 4.2));
});

test('each tier carries a localized label and a stated reason in both languages', () => {
  for (const capability of kairoCapabilities) {
    assert.ok(TIER_LABELS[capability.tier].ar.length > 0);
    assert.ok(TIER_LABELS[capability.tier].en.length > 0);
    assert.ok(capability.tierReason.ar.length > 0, `${capability.id} lacks an Arabic tier reason`);
    assert.ok(capability.tierReason.en.length > 0, `${capability.id} lacks an English tier reason`);
  }
});

test('the dashboard and home surfaces label the core group explicitly', async () => {
  const sections = await readFile(new URL('../pages/dashboard/dashboardSections.tsx', import.meta.url), 'utf8');
  const home = await readFile(new URL('../pages/Home.tsx', import.meta.url), 'utf8');
  const dashboard = await readFile(new URL('../pages/Dashboard.tsx', import.meta.url), 'utf8');

  assert.match(sections, /CoreResourcesSection/);
  assert.match(sections, /SignalsBand/);
  assert.match(sections, /ToolsSection/);
  assert.match(sections, /الخواص الأساسية: المياه والطاقة والغذاء/);
  assert.match(sections, /خواص مساندة/);
  assert.match(dashboard, /coreCapabilities/);
  assert.match(dashboard, /supportCapabilities/);
  assert.match(home, /TIER_LABELS/);
  assert.match(home, /ثلاث خواص أساسية/);
});

test('the phone app shell ships the same core information architecture', async () => {
  const tabBar = await readFile(new URL('../components/MobileTabBar.tsx', import.meta.url), 'utf8');
  const app = await readFile(new URL('../App.tsx', import.meta.url), 'utf8');
  const manifest = JSON.parse(
    await readFile(new URL('../public/site.webmanifest', import.meta.url), 'utf8'),
  ) as { display: string; shortcuts?: Array<{ url: string }> };

  assert.match(app, /MobileTabBar/);
  for (const path of ['/dashboard', '/systems/water-scarcity', '/energy', '/systems/food-security', '/monitor']) {
    assert.ok(tabBar.includes(path), `tab bar is missing ${path}`);
  }
  assert.equal(manifest.display, 'standalone');
  const shortcutUrls = (manifest.shortcuts ?? []).map((shortcut) => shortcut.url);
  for (const path of ['/systems/water-scarcity', '/energy', '/systems/food-security', '/monitor']) {
    assert.ok(shortcutUrls.includes(path), `manifest shortcut is missing ${path}`);
  }
});

test('the app shell respects phone safe areas', async () => {
  const css = await readFile(new URL('../index.css', import.meta.url), 'utf8');
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

  assert.match(css, /\.kairo-app-tabbar/);
  assert.match(css, /env\(safe-area-inset-bottom/);
  assert.match(html, /viewport-fit=cover/);
  assert.match(html, /apple-mobile-web-app-title/);
});
