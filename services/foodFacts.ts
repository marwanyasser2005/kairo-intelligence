/**
 * Deterministic food-waste facts.
 *
 * The food module used to let the model invent the waste rate and every derived
 * quantity. This engine derives the physical facts from declared behaviour
 * signals so the numbers are stable, explainable, and reviewable, and so the
 * model only interprets them.
 *
 * The waste-rate model is a KAIRO estimate, not a measurement: it starts from a
 * national starting point and moves with the signals the user reports. Every
 * constant is declared here so it can be reviewed and tuned as real data
 * arrives through `kairo_analysis_runs`.
 */
export type Language = 'ar' | 'en';

export interface FoodFactsInput {
  familySize?: number;
  adults?: number;
  children?: number;
  monthlyBudgetEgp?: number;
  restaurantPercent?: number;
  homeMealsPerDay?: number;
  deliveryPerWeek?: number;
  shoppingTripsPerWeek?: number;
  throwAwayFreq?: number;
  expiredFound?: number;
  hasMealPlan?: boolean;
  shelfLifeDays?: number;
  reductionTargetPercent?: number;
  receiptTotalEgp?: number;
}

export interface FoodFacts {
  source: 'behaviour-estimate' | 'receipt-assisted';
  sourceLabel: { ar: string; en: string };
  methodology: { ar: string; en: string };
  reviewRequired: boolean;
  warnings: Array<{ ar: string; en: string }>;

  householdMealsPerMonth: number;
  mealsInHomePerMonth: number;
  costPerMealEgp: number;
  monthlyFoodSpendEgp: number;
  wasteRatePercent: number;
  wastedMealsPerMonth: number;
  wastedKgPerMonth: number;
  monthlyLossEgp: number;
  annualLossEgp: number;
  carbonKgPerMonth: number;
  methaneKgPerMonth: number;
  waterLitersPerMonth: number;
  reductionTargetEgpMonthly: number;
}

/** Declared KAIRO constants. Review them as real telemetry accumulates. */
export const FOOD_FACTS_CONSTANTS = {
  /** Starting household waste rate before behaviour signals (Egypt estimate). */
  baseWasteRatePercent: 11,
  minWasteRatePercent: 3,
  maxWasteRatePercent: 35,
  /** Average edible weight of one meal in kg. */
  mealWeightKg: 0.5,
  /** kg CO2e per kg of wasted food (production + landfill). */
  carbonPerKgFood: 2.5,
  /** kg CH4 released per kg of food waste in landfill (estimate). */
  methanePerKgFood: 0.05,
  /** Litres of water embedded per kg of blended food (estimate). */
  waterLitersPerKgFood: 1200,
  /** Plausible cost per home meal in Egypt (EGP). */
  minCostPerMealEgp: 5,
  maxCostPerMealEgp: 200,
} as const;

const round = (value: number, digits = 1) => {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const toNumber = (value: unknown, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

/** Behaviour-driven waste-rate model, isolated so it can be tested directly. */
export const estimateWasteRatePercent = (input: FoodFactsInput): number => {
  const c = FOOD_FACTS_CONSTANTS;
  let rate = c.baseWasteRatePercent;

  const throwAway = toNumber(input.throwAwayFreq);
  if (throwAway >= 4) rate += 9;
  else if (throwAway >= 3) rate += 7;
  else if (throwAway >= 2) rate += 4;
  else if (throwAway >= 1) rate += 1;

  const expired = toNumber(input.expiredFound);
  if (expired >= 3) rate += 5;
  else if (expired >= 2) rate += 3;
  else if (expired >= 1) rate += 1;

  const delivery = toNumber(input.deliveryPerWeek);
  if (delivery >= 5) rate += 3;
  else if (delivery >= 3) rate += 2;

  const shelfLife = toNumber(input.shelfLifeDays);
  if (shelfLife > 0 && shelfLife <= 2) rate += 4;
  else if (shelfLife > 0 && shelfLife <= 3) rate += 3;

  if (input.hasMealPlan) rate -= 4;

  const family = toNumber(input.familySize, toNumber(input.adults) + toNumber(input.children));
  if (family <= 1) rate -= 2;

  return round(clamp(rate, c.minWasteRatePercent, c.maxWasteRatePercent));
};

export const computeFoodFacts = (input: FoodFactsInput, language: Language = 'en'): FoodFacts => {
  const c = FOOD_FACTS_CONSTANTS;
  const isAr = language === 'ar';

  const familySize = Math.max(1, toNumber(input.familySize, toNumber(input.adults) + toNumber(input.children, 1)));
  const mealsPerDay = Math.max(1, toNumber(input.homeMealsPerDay, 3));
  const budget = Math.max(0, toNumber(input.monthlyBudgetEgp));
  const restaurantPercent = clamp(toNumber(input.restaurantPercent), 0, 90);

  const householdMealsPerMonth = round(mealsPerDay * 30);
  const inHomeBudget = budget * (1 - restaurantPercent / 100);
  const mealsInHomePerMonth = householdMealsPerMonth;

  let source: FoodFacts['source'] = 'behaviour-estimate';
  let monthlySpend = inHomeBudget;

  const receiptTotal = Math.max(0, toNumber(input.receiptTotalEgp));
  const tripsPerWeek = Math.max(1, toNumber(input.shoppingTripsPerWeek, 2));
  if (receiptTotal > 0 && budget > 0) {
    // A real receipt anchors the spend level: scale one trip to a month, then
    // keep the result inside a sane band around the declared budget.
    const anchored = receiptTotal * tripsPerWeek * 4.3;
    monthlySpend = clamp(anchored, inHomeBudget * 0.6, inHomeBudget * 1.5);
    source = 'receipt-assisted';
  }

  const costPerMeal = mealsInHomePerMonth > 0 && monthlySpend > 0
    ? monthlySpend / mealsInHomePerMonth
    : 0;

  const wasteRatePercent = estimateWasteRatePercent({ ...input, familySize });
  const wastedMeals = round(householdMealsPerMonth * (wasteRatePercent / 100));
  const wastedKg = round(wastedMeals * c.mealWeightKg);
  const monthlyLoss = round(wastedMeals * costPerMeal, 0);

  const warnings: Array<{ ar: string; en: string }> = [];
  if (costPerMeal > 0 && costPerMeal < c.minCostPerMealEgp) {
    warnings.push({
      ar: `تكلفة الوجبة المحسوبة ${round(costPerMeal)} جنيه، وهي أقل من النطاق المعقول. راجع الميزانية الشهرية أو عدد الوجبات.`,
      en: `The computed cost per meal is ${round(costPerMeal)} EGP, below the plausible range. Check the monthly budget or the meal count.`,
    });
  }
  if (costPerMeal > c.maxCostPerMealEgp) {
    warnings.push({
      ar: `تكلفة الوجبة المحسوبة ${round(costPerMeal)} جنيه، وهي أعلى من النطاق المعقول. راجع الميزانية أو نسبة تناول الطعام خارج المنزل.`,
      en: `The computed cost per meal is ${round(costPerMeal)} EGP, above the plausible range. Check the budget or the share of meals eaten out.`,
    });
  }
  if (receiptTotal > 0 && budget > 0 && receiptTotal > budget) {
    warnings.push({
      ar: 'إجمالي الإيصال المرفوع أكبر من الميزانية الشهرية المدخلة؛ تأكد من القيمتين.',
      en: 'The uploaded receipt total exceeds the declared monthly budget; verify both values.',
    });
  }

  const reductionTargetPercent = clamp(toNumber(input.reductionTargetPercent), 0, 60);

  const methodology = isAr
    ? `حُسب الهدر من سلوكك المعلن: معدل أساسي ${c.baseWasteRatePercent}% ثم تعديل حسب عدد مرات رمي الطعام (${toNumber(input.throwAwayFreq)}) والمنتجات منتهية الصلاحية (${toNumber(input.expiredFound)}) والتخطيط للوجبات${input.hasMealPlan ? ' (يوجد تخطيط)' : ' (لا يوجد تخطيط)'}، فخرج معدل ${wasteRatePercent}%.${source === 'receipt-assisted' ? ' واستُخدم الإيصال المرفوع لمعايرة مستوى الإنفاق.' : ''}`
    : `Waste was derived from your declared behaviour: a ${c.baseWasteRatePercent}% base rate adjusted for how often food is thrown away (${toNumber(input.throwAwayFreq)}), expired items found (${toNumber(input.expiredFound)}), and meal planning${input.hasMealPlan ? ' (present)' : ' (absent)'}, giving ${wasteRatePercent}%.${source === 'receipt-assisted' ? ' The uploaded receipt calibrated the spend level.' : ''}`;

  return {
    source,
    sourceLabel:
      source === 'receipt-assisted'
        ? { ar: 'تقدير سلوكي معاير بإيصال', en: 'Behaviour estimate calibrated by receipt' }
        : { ar: 'تقدير سلوكي معلن', en: 'Declared behaviour estimate' },
    methodology: { ar: methodology, en: methodology },
    reviewRequired: warnings.length > 0,
    warnings,
    householdMealsPerMonth,
    mealsInHomePerMonth,
    costPerMealEgp: round(costPerMeal, 2),
    monthlyFoodSpendEgp: round(monthlySpend, 0),
    wasteRatePercent,
    wastedMealsPerMonth: wastedMeals,
    wastedKgPerMonth: wastedKg,
    monthlyLossEgp: monthlyLoss,
    annualLossEgp: round(monthlyLoss * 12, 0),
    carbonKgPerMonth: round(wastedKg * c.carbonPerKgFood),
    methaneKgPerMonth: round(wastedKg * c.methanePerKgFood, 2),
    waterLitersPerMonth: round(wastedKg * c.waterLitersPerKgFood, 0),
    reductionTargetEgpMonthly: round((monthlyLoss * reductionTargetPercent) / 100, 0),
  };
};

/** Prompt block that makes the computed food facts authoritative for the model. */
export const foodFactsPromptBlock = (facts: FoodFacts, language: Language): string => [
  'COMPUTED FACTS (authoritative, already calculated by the KAIRO food engine):',
  `- source: ${facts.sourceLabel[language]}`,
  `- methodology: ${facts.methodology[language]}`,
  `- household_meals_per_month: ${facts.householdMealsPerMonth}`,
  `- cost_per_meal_egp: ${facts.costPerMealEgp}`,
  `- monthly_food_spend_egp: ${facts.monthlyFoodSpendEgp}`,
  `- waste_rate_percent: ${facts.wasteRatePercent}`,
  `- wasted_meals_per_month: ${facts.wastedMealsPerMonth}`,
  `- wasted_kg_per_month: ${facts.wastedKgPerMonth}`,
  `- monthly_loss_egp: ${facts.monthlyLossEgp}`,
  `- annual_loss_egp: ${facts.annualLossEgp}`,
  `- carbon_kg_per_month: ${facts.carbonKgPerMonth}`,
  `- methane_kg_per_month: ${facts.methaneKgPerMonth}`,
  `- water_liters_per_month: ${facts.waterLitersPerMonth}`,
  'Use these values verbatim for waste rate, weight, cost, carbon, methane, and water. Do not recompute them.',
  'All monetary values you return must be monthly EGP unless the field name says annual.',
  facts.reviewRequired
    ? `PLAUSIBILITY WARNING: ${facts.warnings.map((warning) => warning[language]).join(' ')} State the uncertainty and recommend verifying the values instead of presenting precise savings.`
    : '',
].filter(Boolean).join('\n');
