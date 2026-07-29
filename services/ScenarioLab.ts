import { AIClient, DEFAULT_AI_MODEL } from './aiClient';
import type {
  EnergyAnalysisReport,
  EwasteAnalysisReport,
  FoodWasteAnalysisReport,
  MobilityIntelligenceReport,
  Scenario,
  ScenarioBaseline,
  ScenarioComparisonAnalysis,
  ScenarioLevers,
  ScenarioOutcomes,
  WaterAnalysisReport,
} from '../types';
import type { AudienceId } from '../config/kairoCapabilities';
import {
  deleteCloudScenario,
  listCloudScenarios,
  saveCloudScenario,
} from './kairoDatabase';

const LOCAL_SCENARIOS_KEY = 'kairo_scenarios';

const COMPARISON_SCHEMA = {
  type: 'OBJECT',
  properties: {
    optimal_scenario_id: { type: 'STRING' },
    analysis_summary: { type: 'STRING' },
    key_differentiators: { type: 'ARRAY', items: { type: 'STRING' } },
    trade_offs: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          scenario_id: { type: 'STRING' },
          pro: { type: 'STRING' },
          con: { type: 'STRING' },
        },
      },
    },
    high_leverage_actions: { type: 'ARRAY', items: { type: 'STRING' } },
  },
};

const safeNumber = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const readStored = <T>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

export const buildCurrentScenarioBaseline = (): ScenarioBaseline => {
  const water = readStored<WaterAnalysisReport>('kairo_report_water');
  const food = readStored<FoodWasteAnalysisReport>('kairo_report_food');
  const energy = readStored<EnergyAnalysisReport>('kairo_report_energy');
  const mobility = readStored<MobilityIntelligenceReport>('kairo_report_transport');
  const ewaste = readStored<EwasteAnalysisReport>('kairo_report_ewaste');

  return {
    waterWasteLitersMonth: safeNumber(water?.metrics?.annual_water_waste_liters) / 12,
    waterCostLossEgpMonth: safeNumber(water?.metrics?.financial_loss_estimate_egp) / 12,
    energyConsumptionKwhMonth: safeNumber(energy?.metrics?.estimated_consumption_kwh),
    energyCostLossEgpMonth: safeNumber(energy?.metrics?.financial_loss_estimate_egp),
    energyCarbonKgMonth: safeNumber(energy?.metrics?.carbon_footprint_kg),
    foodCostLossEgpMonth: safeNumber(food?.metrics?.monthly_waste_cost),
    foodCarbonKgMonth: safeNumber(food?.metrics?.carbon_footprint_kg) / 12,
    mobilityCostEgpMonth: safeNumber(mobility?.metrics?.monthly_cost_egp),
    mobilityCarbonKgMonth: safeNumber(mobility?.metrics?.monthly_carbon_kg),
    ewasteAvoidableKg: safeNumber(ewaste?.environmental_impact?.ewaste_prevented_kg),
    connectedModules: [water, food, energy, mobility, ewaste].filter(Boolean).length,
  };
};

export const calculateScenarioOutcomes = (
  baseline: ScenarioBaseline,
  levers: ScenarioLevers,
  horizonMonths: number,
): ScenarioOutcomes => {
  const horizon = Math.max(1, Math.min(60, Math.round(horizonMonths)));
  const waterRatio = Math.max(0, Math.min(1, levers.waterReductionPct / 100));
  const energyRatio = Math.max(0, Math.min(1, levers.energyReductionPct / 100));
  const foodRatio = Math.max(0, Math.min(1, levers.foodWasteReductionPct / 100));
  const mobilityRatio = Math.max(0, Math.min(1, levers.mobilityShiftPct / 100));
  const circularityRatio = Math.max(0, Math.min(1, levers.circularityPct / 100));

  const waterSavedLiters = baseline.waterWasteLitersMonth * waterRatio * horizon;
  const energySavedKwh = baseline.energyConsumptionKwhMonth * energyRatio * horizon;
  const ewasteAvoidedKg = baseline.ewasteAvoidableKg * circularityRatio;

  const monthlyFinancialSavings =
    baseline.waterCostLossEgpMonth * waterRatio +
    baseline.energyCostLossEgpMonth * energyRatio +
    baseline.foodCostLossEgpMonth * foodRatio +
    baseline.mobilityCostEgpMonth * mobilityRatio * 0.65;

  const carbonAvoidedKg =
    (baseline.energyCarbonKgMonth * energyRatio +
      baseline.foodCarbonKgMonth * foodRatio +
      baseline.mobilityCarbonKgMonth * mobilityRatio * 0.7) *
      horizon +
    ewasteAvoidedKg * 2.1;

  const financialSavingsEgp = monthlyFinancialSavings * horizon;
  const paybackMonths =
    levers.investmentEgp > 0 && monthlyFinancialSavings > 0
      ? levers.investmentEgp / monthlyFinancialSavings
      : levers.investmentEgp > 0
        ? null
        : 0;

  const impactScore = Math.round(
    Math.min(
      100,
      levers.waterReductionPct * 0.24 +
        levers.energyReductionPct * 0.24 +
        levers.foodWasteReductionPct * 0.2 +
        levers.mobilityShiftPct * 0.2 +
        levers.circularityPct * 0.12,
    ),
  );

  return {
    waterSavedLiters: Math.round(waterSavedLiters),
    energySavedKwh: Math.round(energySavedKwh),
    financialSavingsEgp: Math.round(financialSavingsEgp),
    carbonAvoidedKg: Number(carbonAvoidedKg.toFixed(1)),
    ewasteAvoidedKg: Number(ewasteAvoidedKg.toFixed(2)),
    paybackMonths: paybackMonths === null ? null : Number(paybackMonths.toFixed(1)),
    impactScore,
  };
};

export const createScenario = ({
  name,
  audience,
  horizonMonths,
  levers,
}: {
  name: string;
  audience: AudienceId;
  horizonMonths: number;
  levers: ScenarioLevers;
}): Scenario => {
  const baseline = buildCurrentScenarioBaseline();
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    timestamp: Date.now(),
    audience,
    horizonMonths,
    baseline,
    levers,
    outcomes: calculateScenarioOutcomes(baseline, levers, horizonMonths),
    synced: false,
  };
};

const readLocalScenarios = (): Scenario[] =>
  readStored<Scenario[]>(LOCAL_SCENARIOS_KEY) ?? [];

const writeLocalScenarios = (scenarios: Scenario[]) => {
  localStorage.setItem(LOCAL_SCENARIOS_KEY, JSON.stringify(scenarios));
};

export const getScenarios = async (): Promise<Scenario[]> => {
  const local = readLocalScenarios();
  try {
    const cloud = await listCloudScenarios();
    const merged = [...cloud];
    local
      .filter((scenario) => !cloud.some((cloudScenario) => cloudScenario.id === scenario.id))
      .forEach((scenario) => merged.push(scenario));
    writeLocalScenarios(merged);
    return merged;
  } catch {
    return local;
  }
};

export const saveScenario = async (scenario: Scenario): Promise<Scenario> => {
  const local = readLocalScenarios().filter((item) => item.id !== scenario.id);
  writeLocalScenarios([scenario, ...local]);

  try {
    const syncedScenario = await saveCloudScenario(scenario);
    const updated = [syncedScenario, ...local];
    writeLocalScenarios(updated);
    return syncedScenario;
  } catch {
    return scenario;
  }
};

export const deleteScenario = async (id: string): Promise<Scenario[]> => {
  const updated = readLocalScenarios().filter((scenario) => scenario.id !== id);
  writeLocalScenarios(updated);
  try {
    await deleteCloudScenario(id);
  } catch {
    // The local deletion remains valid and will not block the user's workflow.
  }
  return updated;
};

const deterministicComparison = (
  scenarios: Scenario[],
  language: 'ar' | 'en',
): ScenarioComparisonAnalysis => {
  const scored = scenarios
    .map((scenario) => {
      const paybackPenalty =
        scenario.outcomes.paybackMonths === null
          ? 18
          : Math.min(18, scenario.outcomes.paybackMonths || 0);
      return {
        scenario,
        score:
          scenario.outcomes.impactScore * 1.8 +
          Math.min(45, scenario.outcomes.financialSavingsEgp / 500) +
          Math.min(35, scenario.outcomes.carbonAvoidedKg / 10) -
          paybackPenalty,
      };
    })
    .sort((a, b) => b.score - a.score);
  const optimal = scored[0].scenario;

  return {
    optimal_scenario_id: optimal.id,
    analysis_summary:
      language === 'ar'
        ? `يحقق سيناريو «${optimal.name}» أفضل توازن حالي بين خفض الموارد، العائد المالي، والأثر الكربوني خلال ${optimal.horizonMonths} شهرًا.`
        : `“${optimal.name}” currently provides the strongest balance of resource reduction, financial return, and carbon impact across ${optimal.horizonMonths} months.`,
    key_differentiators: scenarios.map((scenario) =>
      language === 'ar'
        ? `${scenario.name}: أثر ${scenario.outcomes.impactScore}/100، توفير ${scenario.outcomes.financialSavingsEgp.toLocaleString()} جنيه، وخفض ${scenario.outcomes.carbonAvoidedKg.toLocaleString()} كجم CO₂e.`
        : `${scenario.name}: impact ${scenario.outcomes.impactScore}/100, EGP ${scenario.outcomes.financialSavingsEgp.toLocaleString()} saved, and ${scenario.outcomes.carbonAvoidedKg.toLocaleString()} kg CO₂e avoided.`,
    ),
    trade_offs: scenarios.map((scenario) => ({
      scenario_id: scenario.id,
      pro:
        language === 'ar'
          ? `يوفر ${scenario.outcomes.waterSavedLiters.toLocaleString()} لتر مياه خلال الأفق المحدد.`
          : `Saves ${scenario.outcomes.waterSavedLiters.toLocaleString()} liters over the selected horizon.`,
      con:
        scenario.outcomes.paybackMonths === null
          ? language === 'ar'
            ? 'البيانات الحالية لا تكفي لحساب فترة استرداد الاستثمار.'
            : 'Current evidence is insufficient to calculate investment payback.'
          : language === 'ar'
            ? `فترة الاسترداد المقدرة ${scenario.outcomes.paybackMonths} شهر.`
            : `Estimated payback is ${scenario.outcomes.paybackMonths} months.`,
    })),
    high_leverage_actions:
      language === 'ar'
        ? ['ابدأ بأعلى مصدر هدر موثق.', 'نفّذ إجراءً واحدًا قابلًا للقياس.', 'حدّث السيناريو بعد ظهور نتيجة فعلية.']
        : ['Start with the highest evidenced loss.', 'Implement one measurable action.', 'Refresh the scenario after a real outcome is observed.'],
  };
};

export const compareScenariosAgent = async (
  scenarios: Scenario[],
  language: 'ar' | 'en' = 'en',
): Promise<ScenarioComparisonAnalysis> => {
  if (scenarios.length < 2) {
    throw new Error('At least two scenarios are required for comparison.');
  }

  const contextData = scenarios.map((scenario) => ({
    id: scenario.id,
    name: scenario.name,
    audience: scenario.audience,
    horizonMonths: scenario.horizonMonths,
    connectedModules: scenario.baseline.connectedModules,
    levers: scenario.levers,
    outcomes: scenario.outcomes,
  }));

  const prompt = `
ROLE: KAIRO environmental decision analyst.
TASK: Compare the supplied scenarios without inventing measurements.
LANGUAGE: ${language === 'ar' ? 'Professional, clear Arabic' : 'Clear professional English'}.
DATA: ${JSON.stringify(contextData)}

RULES:
- Prefer evidence-backed impact, feasibility, and transparent payback.
- A scenario with fewer connected modules has lower evidence completeness.
- Explain trade-offs in simple language for the selected audience.
- Do not claim a statistical probability or field validation.
- Return strict JSON matching the supplied schema.
`;

  try {
    const ai = new AIClient();
    const response = await ai.models.generateContent({
      model: DEFAULT_AI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: COMPARISON_SCHEMA,
      },
    });
    return JSON.parse(response.text || '{}');
  } catch {
    return deterministicComparison(scenarios, language);
  }
};
