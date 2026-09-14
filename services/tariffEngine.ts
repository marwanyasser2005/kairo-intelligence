import {
  DEFAULT_COMMERCIAL_KWH_PRICE_EGP,
  EGYPT_RESIDENTIAL_ELECTRICITY_SLABS,
  ELECTRICITY_GRID_CARBON_KG_PER_KWH,
  WATER_BLENDED_RATE_EGP_PER_M3,
  WATER_CARBON_KG_PER_M3,
  calculateEgyptianElectricBill,
  type EgyptianElectricitySlab,
} from '../utils/calculations';
import type { EnergyAnalysisInputs, WaterAnalysisInputs } from '../types';

export type Language = 'ar' | 'en';

export interface AnalysisFacts {
  /** Where the consumption figure came from, so the UI can be honest about certainty. */
  source: 'ocr' | 'meter' | 'bill-inversion' | 'assumption';
  sourceLabel: { ar: string; en: string };
  methodology: { ar: string; en: string };
}

export interface ElectricityFacts extends AnalysisFacts {
  consumptionKwh: number;
  tier: number | null;
  averagePriceEgpPerKwh: number;
  monthlyCostEgp: number;
  carbonKg: number;
}

export interface WaterFacts extends AnalysisFacts {
  consumptionM3: number;
  blendedRateEgpPerM3: number;
  monthlyCostEgp: number;
  carbonKg: number;
}

const SOURCE_LABELS: Record<AnalysisFacts['source'], { ar: string; en: string }> = {
  ocr: { ar: 'قراءة الفاتورة (OCR)', en: 'Bill OCR reading' },
  meter: { ar: 'قراءة العدّاد', en: 'Meter reading' },
  'bill-inversion': { ar: 'محسوب من الفاتورة', en: 'Derived from bill' },
  assumption: { ar: 'افتراض معلن', en: 'Stated assumption' },
};

const round = (value: number, digits = 2) => {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

/**
 * Invert the residential tariff: given a bill in EGP, recover the kWh that
 * produced it. Egypt charges one rate for the whole reading, so the search is
 * exact per slab rather than marginal.
 */
export const electricityKwhFromBill = (
  billEgp: number,
  slabs: readonly EgyptianElectricitySlab[] = EGYPT_RESIDENTIAL_ELECTRICITY_SLABS,
): { kwh: number; tier: number; ratePerKwh: number } => {
  if (!Number.isFinite(billEgp) || billEgp <= 0) {
    return { kwh: 0, tier: 1, ratePerKwh: slabs[0].ratePerKwh };
  }

  for (const slab of slabs) {
    const candidate = billEgp / slab.ratePerKwh;
    if (candidate <= slab.maxKwh) {
      return { kwh: round(candidate, 1), tier: slab.tier, ratePerKwh: slab.ratePerKwh };
    }
  }

  const last = slabs[slabs.length - 1];
  return { kwh: round(billEgp / last.ratePerKwh, 1), tier: last.tier, ratePerKwh: last.ratePerKwh };
};

export const waterM3FromBill = (
  billEgp: number,
  rateEgpPerM3: number = WATER_BLENDED_RATE_EGP_PER_M3,
): number => {
  if (!Number.isFinite(billEgp) || billEgp <= 0 || !Number.isFinite(rateEgpPerM3) || rateEgpPerM3 <= 0) {
    return 0;
  }
  return round(billEgp / rateEgpPerM3, 1);
};

const tierLabel = (tier: number, language: Language) =>
  language === 'ar' ? `الشريحة ${tier}` : `Tier ${tier}`;

/**
 * Deterministic electricity facts: consumption, tier, blended price, carbon.
 * Precedence: OCR reading > user-entered meter reading > bill inversion.
 */
export const computeElectricityFacts = (
  inputs: EnergyAnalysisInputs,
): ElectricityFacts => {
  const ocrKwh = Number(inputs.ocrData?.consumption_kwh) || 0;
  const meterKwh = Number(inputs.monthly_kwh) || 0;
  const ocrAmount = Number((inputs.ocrData as { total_amount?: number } | null | undefined)?.total_amount) || 0;
  const billEgp = ocrAmount || Number(inputs.monthly_bill) || 0;
  const isResidential = inputs.type === 'residential';

  let consumptionKwh = 0;
  let tier: number | null = null;
  let averagePriceEgpPerKwh = 0;
  let source: AnalysisFacts['source'] = 'assumption';
  let methodology: { ar: string; en: string };

  if (ocrKwh > 0) {
    consumptionKwh = round(ocrKwh, 1);
    source = 'ocr';
    const pricing = isResidential ? calculateEgyptianElectricBill(consumptionKwh) : null;
    tier = pricing?.tier ?? null;
    if (ocrAmount > 0) {
      averagePriceEgpPerKwh = round(ocrAmount / consumptionKwh, 2);
    } else if (billEgp > 0) {
      averagePriceEgpPerKwh = round(billEgp / consumptionKwh, 2);
    } else if (pricing) {
      averagePriceEgpPerKwh = round(pricing.bill / consumptionKwh, 2);
    }
    methodology = {
      ar: 'الاستهلاك مأخوذ من قراءة الفاتورة المرفوعة (OCR)، والسعر الفعلي محسوب من إجمالي الفاتورة.',
      en: 'Consumption comes from the uploaded bill reading (OCR); the effective price is derived from the bill total.',
    };
  } else if (meterKwh > 0) {
    consumptionKwh = round(meterKwh, 1);
    source = 'meter';
    const pricing = calculateEgyptianElectricBill(consumptionKwh);
    tier = isResidential ? pricing.tier : null;
    averagePriceEgpPerKwh = billEgp > 0
      ? round(billEgp / consumptionKwh, 2)
      : round(pricing.bill / consumptionKwh, 2);
    methodology = {
      ar: 'الاستهلاك مُدخل مباشرة من العدّاد، والتكلفة محسوبة بالشرائح الرسمية للسكني أو بمتوسط الفاتورة.',
      en: 'Consumption is entered from the meter; cost uses the official residential slabs or the bill average.',
    };
  } else if (billEgp > 0) {
    if (isResidential) {
      const inverted = electricityKwhFromBill(billEgp);
      consumptionKwh = inverted.kwh;
      tier = inverted.tier;
      averagePriceEgpPerKwh = round(inverted.ratePerKwh, 2);
      source = 'bill-inversion';
      methodology = {
        ar: `عكسنا الفاتورة إلى استهلاك باستخدام شرائح الكهرباء السكنية الرسمية (${tierLabel(inverted.tier, 'ar')} بسعر ${inverted.ratePerKwh} ج.م/ك.و.س).`,
        en: `The bill was inverted through the official residential slabs (${tierLabel(inverted.tier, 'en')} at ${inverted.ratePerKwh} EGP/kWh).`,
      };
    } else {
      const assumedPrice = Number(inputs.assumed_kwh_price_egp) > 0
        ? Number(inputs.assumed_kwh_price_egp)
        : DEFAULT_COMMERCIAL_KWH_PRICE_EGP;
      consumptionKwh = round(billEgp / assumedPrice, 1);
      averagePriceEgpPerKwh = round(assumedPrice, 2);
      source = 'assumption';
      methodology = {
        ar: `لا تتوفر قراءة كيلوواط ساعة، فحُسب الاستهلاك بسعر تجاري مفترض ${assumedPrice} ج.م/ك.و.س. أدخل القراءة من الفاتورة لدقة أعلى.`,
        en: `No kWh reading was available, so consumption uses an assumed commercial price of ${assumedPrice} EGP/kWh. Enter the meter reading for higher accuracy.`,
      };
    }
  } else {
    methodology = {
      ar: 'لا توجد فاتورة أو قراءة كافية لحساب الاستهلاك، والنتائج تقديرية بالكامل.',
      en: 'No bill or reading was provided, so consumption remains a pure estimate.',
    };
  }

  if (source !== 'assumption' && billEgp > 0 && consumptionKwh > 0 && averagePriceEgpPerKwh === 0) {
    averagePriceEgpPerKwh = round(billEgp / consumptionKwh, 2);
  }

  return {
    source,
    sourceLabel: SOURCE_LABELS[source],
    methodology,
    consumptionKwh,
    tier,
    averagePriceEgpPerKwh,
    monthlyCostEgp: billEgp > 0 ? round(billEgp, 2) : round(consumptionKwh * averagePriceEgpPerKwh, 2),
    carbonKg: round(consumptionKwh * ELECTRICITY_GRID_CARBON_KG_PER_KWH, 1),
  };
};

/**
 * Deterministic water facts. Precedence: OCR volume > entered volume > bill
 * inversion through the declared blended rate (editable assumption).
 */
export const computeWaterFacts = (
  inputs: WaterAnalysisInputs,
): WaterFacts => {
  const ocrM3 = Number(inputs.ocrData?.total_consumption_m3) || 0;
  const enteredM3 = Number(inputs.monthly_water_use_m3) || 0;
  const ocrAmount = Number(inputs.ocrData?.total_amount) || 0;
  const billEgp = ocrAmount || Number(inputs.monthly_bill) || 0;
  const requestedRate = Number(inputs.assumed_rate_egp_per_m3);
  const rate = requestedRate > 0 ? requestedRate : WATER_BLENDED_RATE_EGP_PER_M3;

  let consumptionM3 = 0;
  let source: AnalysisFacts['source'] = 'assumption';

  if (ocrM3 > 0) {
    consumptionM3 = round(ocrM3, 1);
    source = 'ocr';
  } else if (enteredM3 > 0) {
    consumptionM3 = round(enteredM3, 1);
    source = 'meter';
  } else if (billEgp > 0) {
    consumptionM3 = waterM3FromBill(billEgp, rate);
    source = 'bill-inversion';
  }

  const effectiveRate = consumptionM3 > 0 && billEgp > 0
    ? round(billEgp / consumptionM3, 2)
    : round(rate, 2);

  const sourceNote: Record<AnalysisFacts['source'], { ar: string; en: string }> = {
    ocr: {
      ar: 'الحجم مأخوذ من قراءة الفاتورة المرفوعة (OCR).',
      en: 'Volume comes from the uploaded bill reading (OCR).',
    },
    meter: {
      ar: 'الحجم مُدخل مباشرة من العدّاد.',
      en: 'Volume is entered directly from the meter.',
    },
    'bill-inversion': {
      ar: `حُسب الحجم بقسمة الفاتورة على سعر مدمج ${effectiveRate} ج.م/م³ شامل الرسوم.`,
      en: `Volume is the bill divided by a blended rate of ${effectiveRate} EGP/m³ including fees.`,
    },
    assumption: {
      ar: `لا توجد قراءة كافية؛ النتائج تقديرية بسعر مفترض ${effectiveRate} ج.م/م³.`,
      en: `No sufficient reading was provided; results assume ${effectiveRate} EGP/m³.`,
    },
  };

  return {
    source,
    sourceLabel: SOURCE_LABELS[source],
    methodology: sourceNote[source],
    consumptionM3,
    blendedRateEgpPerM3: effectiveRate,
    monthlyCostEgp: billEgp > 0 ? round(billEgp, 2) : round(consumptionM3 * effectiveRate, 2),
    carbonKg: round(consumptionM3 * WATER_CARBON_KG_PER_M3, 1),
  };
};

/** Prompt block that makes the deterministic numbers authoritative for the model. */
export const factsPromptBlock = (
  facts: ElectricityFacts | WaterFacts,
  language: Language,
): string => {
  const method = facts.methodology[language];
  const source = facts.sourceLabel[language];
  return [
    'COMPUTED FACTS (authoritative, already calculated by the KAIRO tariff engine):',
    `- source: ${source}`,
    `- methodology: ${method}`,
    'consumptionKwh' in facts
      ? `- consumption_kwh: ${facts.consumptionKwh}`
      : `- consumption_m3: ${facts.consumptionM3}`,
    'consumptionKwh' in facts
      ? `- average_price_egp_per_kwh: ${facts.averagePriceEgpPerKwh}`
      : `- blended_rate_egp_per_m3: ${facts.blendedRateEgpPerM3}`,
    `- monthly_cost_egp: ${facts.monthlyCostEgp}`,
    `- carbon_kg_per_month: ${facts.carbonKg}`,
    'tier' in facts && facts.tier ? `- tariff_tier: ${facts.tier}` : '',
    'Use these values verbatim for consumption, price, tier, and carbon. Do not recompute or replace them.',
    'All monetary values you return must be monthly EGP unless the field name says annual.',
  ].filter(Boolean).join('\n');
};

export const clampScore = (value: unknown): number => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.round(Math.min(100, Math.max(0, numeric)));
};

export const clampRange = (value: unknown, min: number, max: number): number => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  return round(Math.min(max, Math.max(min, numeric)), 2);
};
