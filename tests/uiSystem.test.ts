import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { buildKairoKnowledgeBase } from '../config/kairoKnowledge';

const read = (path: string) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('every Recharts frame opts into a responsive Kairo chart size', async () => {
  const chartPages = [
    'pages/Dashboard.tsx',
    'pages/CsrDashboard.tsx',
    'pages/LiveMonitor.tsx',
    'pages/EnergyIntelligence.tsx',
    'pages/systems/WaterScarcity.tsx',
    'pages/systems/FoodSecurityIntelligence.tsx',
  ];

  for (const path of chartPages) {
    const source = await read(path);
    const classNames = [...source.matchAll(/className="([^"]*kairo-chart[^"]*)"/g)].map(
      (match) => match[1],
    );
    assert.ok(classNames.length > 0, `${path} must contain a Kairo chart frame`);
    for (const className of classNames) {
      assert.match(
        className,
        /kairo-chart-(?:responsive|dashboard)/,
        `${path} has a fixed-size chart frame`,
      );
    }
  }
});

test('core result surfaces use the shared metric and analysis system', async () => {
  const resultPages = [
    'pages/Dashboard.tsx',
    'pages/AirQuality.tsx',
    'pages/ExposureReport.tsx',
    'pages/EnergyIntelligence.tsx',
    'pages/TransportImpact.tsx',
    'pages/CompareScenarios.tsx',
    'pages/systems/WaterScarcity.tsx',
    'pages/systems/FoodSecurityIntelligence.tsx',
    'pages/systems/EwasteRecycler.tsx',
    'pages/systems/UrbanExposure.tsx',
  ];

  for (const path of resultPages) {
    const source = await read(path);
    assert.match(source, /kairo-analysis-panel|kairo-metric-card/, `${path} is not themed`);
  }
});

test('dashboard exposes an accessible semantic results ledger', async () => {
  const dashboard = await read('pages/Dashboard.tsx');
  assert.match(dashboard, /role="region"/);
  assert.match(dashboard, /<table className="kairo-data-table">/);
  assert.match(dashboard, /<thead>/);
  assert.match(dashboard, /<tbody>/);
  assert.match(dashboard, /tabIndex=\{0\}/);
});

test('responsive design tokens cover mobile charts, tables, and coarse pointers', async () => {
  const css = await read('index.css');
  assert.match(css, /\.kairo-chart-responsive/);
  assert.match(css, /\.kairo-data-table-shell/);
  assert.match(css, /@media \(max-width: 767px\)/);
  assert.match(css, /@media \(pointer: coarse\)/);
  assert.match(css, /min-height: 44px/);
  assert.match(css, /\.kairo-score-ring/);
  assert.match(css, /\.kairo-audience-tabs/);
  assert.match(css, /--glass-surface:/);
  assert.match(css, /\.kairo-page > :first-child/);
  assert.match(css, /\.kairo-ai-status/);
  assert.match(css, /100dvh/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
});

test('every claimed AI interaction uses the server gateway without demo data', async () => {
  const transport = await read('pages/TransportImpact.tsx');
  const services = await read('services/tokenRouterService.ts');
  const client = await read('services/aiClient.ts');
  const app = await read('App.tsx');

  assert.match(client, /fetch\('\/api\/ai\/generate'/);
  assert.match(transport, /analyzeTransportReceiptOCR/);
  assert.match(transport, /handleRouteAnalysis/);
  assert.equal(/simulateOCR|simulateRoute/.test(transport), false);
  assert.equal(services.includes("receipt_date: '2024-01-01'"), false);
  assert.equal(services.includes("brand: 'Unknown'"), false);
  assert.match(app, /AIServiceStatus/);
});

test('decision intelligence is available across every core environmental result', async () => {
  const resultPages = [
    'pages/AirQuality.tsx',
    'pages/ExposureReport.tsx',
    'pages/EnergyIntelligence.tsx',
    'pages/TransportImpact.tsx',
    'pages/systems/WaterScarcity.tsx',
    'pages/systems/FoodSecurityIntelligence.tsx',
    'pages/systems/EwasteRecycler.tsx',
    'pages/systems/UrbanExposure.tsx',
  ];
  for (const path of resultPages) {
    assert.match(await read(path), /DecisionIntelligence/, `${path} lacks a decision lens`);
  }

  const component = await read('components/DecisionIntelligence.tsx');
  assert.match(component, /role="tablist"/);
  assert.match(component, /aria-selected=/);
  assert.match(component, /WHO/);
  assert.match(component, /UNEP/);
  assert.match(component, /IEA/);
  assert.match(component, /UNITAR\/ITU/);
  assert.equal(component.includes('dangerouslySetInnerHTML'), false);
});

test('rendered result surfaces do not use raw HTML injection', async () => {
  const files = [
    'pages/Dashboard.tsx',
    'pages/CsrDashboard.tsx',
    'pages/ExposureReport.tsx',
    'pages/EnergyIntelligence.tsx',
    'pages/TransportImpact.tsx',
    'pages/systems/WaterScarcity.tsx',
    'pages/systems/FoodSecurityIntelligence.tsx',
    'pages/systems/EwasteRecycler.tsx',
  ];
  const sources = await Promise.all(files.map(read));
  assert.equal(sources.some((source) => source.includes('dangerouslySetInnerHTML')), false);
});

test('proof-of-impact workspace is responsive, evidence-led, and AI reviewed', async () => {
  const page = await read('pages/ImpactVerification.tsx');
  const service = await read('services/impactVerification.ts');
  const css = await read('index.css');

  assert.match(page, /calculateImpactPortfolio/);
  assert.match(page, /baselineEvidence/);
  assert.match(page, /followUpEvidence/);
  assert.match(page, /sameScope/);
  assert.match(page, /generateFromAPI/);
  assert.match(page, /reviewSchema/);
  assert.match(page, /disabled=\{loading/);
  assert.match(service, /baselineValue \/ measurement\.baselineDays/);
  assert.match(service, /followUpValue \/ measurement\.followUpDays/);
  assert.match(css, /\.kairo-glass-panel/);
  assert.match(css, /backdrop-filter: blur/);
  assert.match(css, /@supports not/);
  assert.match(css, /@media \(forced-colors: active\)/);
});

test('assistant knowledge identifies the project without exposing private founder data', () => {
  const arabic = buildKairoKnowledgeBase('ar');
  const english = buildKairoKnowledgeBase('en');

  assert.match(arabic, /مروان ياسر حسن عبد الغفار/);
  assert.match(english, /Marwan Yasser Hassan Abdel Ghafar/);
  assert.match(arabic, /المباني المستدامة والمدن الذكية/);
  assert.match(english, /Sustainable buildings and smart cities/);

  for (const privatePattern of [
    /01006/,
    /1201405097/,
    /26\s+March/i,
    /رقم قومي/,
  ]) {
    assert.equal(privatePattern.test(`${arabic}\n${english}`), false);
  }
});
