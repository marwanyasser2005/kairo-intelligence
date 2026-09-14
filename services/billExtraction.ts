import type {
  ElectricityBillExtraction,
  FoodReceiptExtraction,
  WaterBillExtraction,
} from '../types';

export type BillType = 'electricity' | 'water' | 'food';
export type BillLanguage = 'ar' | 'en';

/** Egyptian bills often print Arabic-Indic digits; normalize before parsing. */
export const normalizeDigits = (value: string): string =>
  value
    .replace(/[\u0660-\u0669]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[\u06f0-\u06f9]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0));

export const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  if (typeof value === 'string') {
    const cleaned = normalizeDigits(value).replace(/[^\d.-]/g, '');
    if (!cleaned) return fallback;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

export const toPositive = (value: unknown): number => Math.max(0, toNumber(value, 0));

export const toConfidence = (value: unknown): number => {
  const numeric = toNumber(value, 0);
  const normalized = numeric > 1 ? numeric / 100 : numeric;
  return Math.min(1, Math.max(0, Math.round(normalized * 100) / 100));
};

export const toText = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

export type ExtractionQuality = 'high' | 'medium' | 'low';

export const extractionQuality = (confidence: number): ExtractionQuality => {
  if (confidence >= 0.75) return 'high';
  if (confidence >= 0.45) return 'medium';
  return 'low';
};

/** Derive consumption from meter readings when the printed figure is missing. */
export const consumptionFromReadings = (previous: unknown, current: unknown): number => {
  const from = toPositive(previous);
  const to = toPositive(current);
  // Both readings must exist; a single reading must not fabricate consumption.
  if (from <= 0 || to <= 0) return 0;
  const delta = to - from;
  return delta > 0 ? Math.round(delta * 100) / 100 : 0;
};

export const normalizeElectricityExtraction = (raw: unknown): ElectricityBillExtraction => {
  const record = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const previous = toPositive(record.previous_reading);
  const current = toPositive(record.current_reading);
  const printed = toPositive(record.consumption_kwh);
  const consumption = printed > 0 ? printed : consumptionFromReadings(previous, current);
  const totalAmount = toPositive(record.total_amount);
  const confidence = toConfidence(record.confidence);
  const isStub = record.isStub === true || (consumption <= 0 && totalAmount <= 0);

  return {
    meter_number: toText(record.meter_number),
    subscription_type: toText(record.subscription_type),
    property_type: record.property_type === 'commercial' ? 'commercial' : 'residential',
    previous_reading: previous,
    current_reading: current,
    consumption_kwh: consumption,
    total_amount: totalAmount,
    additional_fees: toPositive(record.additional_fees),
    consumption_tier: toText(record.consumption_tier),
    distribution_company: toText(record.distribution_company),
    confidence,
    bill_date: toText(record.bill_date),
    reading_date: toText(record.reading_date),
    billing_period_days: toPositive(record.billing_period_days),
    evidence_note: toText(record.evidence_note),
    isStub,
    message: isStub
      ? toText(record.message) ||
        'لم نتمكن من قراءة قيم الفاتورة بوضوح. ارفع صورة أوضح أو أدخل القيم يدويًا.'
      : toText(record.message),
  };
};

export const normalizeWaterExtraction = (raw: unknown): WaterBillExtraction => {
  const record = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const previous = toPositive(record.previous_reading);
  const current = toPositive(record.current_reading);
  const printed = toPositive(record.total_consumption_m3);
  const consumption = printed > 0 ? printed : consumptionFromReadings(previous, current);
  const totalAmount = toPositive(record.total_amount);
  const confidence = toConfidence(record.confidence);
  const isStub = record.isStub === true || (consumption <= 0 && totalAmount <= 0);

  const tiers = Array.isArray(record.pricing_tiers)
    ? record.pricing_tiers.slice(0, 8).map((tier) => {
        const item = (tier && typeof tier === 'object' ? tier : {}) as Record<string, unknown>;
        return {
          tier_name: toText(item.tier_name),
          volume: toPositive(item.volume),
          rate: toPositive(item.rate),
        };
      })
    : [];

  return {
    meter_number: toText(record.meter_number),
    bill_date: toText(record.bill_date),
    current_reading: current,
    previous_reading: previous,
    total_consumption_m3: consumption,
    total_amount: totalAmount,
    pricing_tiers: tiers,
    additional_fees: toPositive(record.additional_fees),
    currency: toText(record.currency) || 'EGP',
    confidence,
    reading_date: toText(record.reading_date),
    billing_period_days: toPositive(record.billing_period_days),
    evidence_note: toText(record.evidence_note),
    isStub,
    message: isStub
      ? toText(record.message) ||
        'لم نتمكن من قراءة قيم الفاتورة بوضوح. ارفع صورة أوضح أو أدخل القيم يدويًا.'
      : toText(record.message),
  };
};

export const normalizeFoodExtraction = (raw: unknown): FoodReceiptExtraction => {
  const record = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const total = toPositive(record.total_cost_egp);
  return {
    total_cost_egp: total,
    items_count: toPositive(record.items_count),
    receipt_date: toText(record.receipt_date),
    isStub: record.isStub === true || total <= 0,
  };
};

export const normalizeExtraction = (type: BillType, raw: unknown) => {
  if (type === 'electricity') return normalizeElectricityExtraction(raw);
  if (type === 'water') return normalizeWaterExtraction(raw);
  return normalizeFoodExtraction(raw);
};

export interface ExtractionField {
  key: string;
  label: { ar: string; en: string };
  value: string;
  raw: number | string;
  editable: boolean;
  emphasis?: boolean;
  suffix?: string;
}

const formatNumber = (value: number, digits = 2): string => {
  if (!Number.isFinite(value) || value === 0) return '—';
  return value.toLocaleString('en-GB', { maximumFractionDigits: digits });
};

const textField = (
  key: string,
  label: { ar: string; en: string },
  value: string,
): ExtractionField => ({
  key,
  label,
  value: value || '—',
  raw: value,
  editable: false,
});

const numberField = (
  key: string,
  label: { ar: string; en: string },
  value: number,
  options: { editable?: boolean; emphasis?: boolean; suffix?: string; digits?: number } = {},
): ExtractionField => ({
  key,
  label,
  value: formatNumber(value, options.digits ?? 2),
  raw: value,
  editable: options.editable ?? true,
  emphasis: options.emphasis,
  suffix: options.suffix,
});

export const describeExtractionFields = (
  type: BillType,
  data: ElectricityBillExtraction | WaterBillExtraction | FoodReceiptExtraction,
): ExtractionField[] => {
  if (type === 'electricity') {
    const item = data as ElectricityBillExtraction;
    const unitPrice =
      item.consumption_kwh > 0 && item.total_amount > 0
        ? Math.round((item.total_amount / item.consumption_kwh) * 100) / 100
        : 0;
    return [
      numberField('consumption_kwh', { ar: 'الاستهلاك', en: 'Consumption' }, item.consumption_kwh, { emphasis: true, suffix: 'kWh', digits: 1 }),
      numberField('total_amount', { ar: 'إجمالي الفاتورة', en: 'Total amount' }, item.total_amount, { emphasis: true, suffix: 'EGP' }),
      numberField('previous_reading', { ar: 'القراءة السابقة', en: 'Previous reading' }, item.previous_reading, { digits: 0 }),
      numberField('current_reading', { ar: 'القراءة الحالية', en: 'Current reading' }, item.current_reading, { digits: 0 }),
      numberField('additional_fees', { ar: 'رسوم إضافية', en: 'Additional fees' }, item.additional_fees),
      numberField('_unit_price', { ar: 'سعر الكيلوواط الفعلي', en: 'Effective price' }, unitPrice, { editable: false, suffix: 'EGP/kWh' }),
      textField('consumption_tier', { ar: 'الشريحة المطبوعة', en: 'Printed tier' }, item.consumption_tier ?? ''),
      textField('meter_number', { ar: 'رقم العدّاد', en: 'Meter number' }, item.meter_number ?? ''),
      textField('bill_date', { ar: 'تاريخ الفاتورة', en: 'Bill date' }, item.bill_date ?? ''),
      textField('reading_date', { ar: 'تاريخ القراءة', en: 'Reading date' }, item.reading_date ?? ''),
      textField('distribution_company', { ar: 'شركة التوزيع', en: 'Distribution company' }, item.distribution_company ?? ''),
      textField('subscription_type', { ar: 'نوع الاشتراك', en: 'Subscription type' }, item.subscription_type ?? ''),
    ];
  }

  if (type === 'water') {
    const item = data as WaterBillExtraction;
    const unitPrice =
      item.total_consumption_m3 > 0 && item.total_amount > 0
        ? Math.round((item.total_amount / item.total_consumption_m3) * 100) / 100
        : 0;
    return [
      numberField('total_consumption_m3', { ar: 'الاستهلاك', en: 'Consumption' }, item.total_consumption_m3, { emphasis: true, suffix: 'm³', digits: 1 }),
      numberField('total_amount', { ar: 'إجمالي الفاتورة', en: 'Total amount' }, item.total_amount, { emphasis: true, suffix: item.currency || 'EGP' }),
      numberField('previous_reading', { ar: 'القراءة السابقة', en: 'Previous reading' }, item.previous_reading, { digits: 0 }),
      numberField('current_reading', { ar: 'القراءة الحالية', en: 'Current reading' }, item.current_reading, { digits: 0 }),
      numberField('additional_fees', { ar: 'رسوم إضافية', en: 'Additional fees' }, item.additional_fees),
      numberField('_unit_price', { ar: 'سعر المتر الفعلي', en: 'Effective price' }, unitPrice, { editable: false, suffix: `${item.currency || 'EGP'}/m³` }),
      textField('meter_number', { ar: 'رقم العدّاد', en: 'Meter number' }, item.meter_number ?? ''),
      textField('bill_date', { ar: 'تاريخ الفاتورة', en: 'Bill date' }, item.bill_date ?? ''),
      textField('reading_date', { ar: 'تاريخ القراءة', en: 'Reading date' }, item.reading_date ?? ''),
    ];
  }

  const item = data as FoodReceiptExtraction;
  return [
    numberField('total_cost_egp', { ar: 'إجمالي الإيصال', en: 'Receipt total' }, item.total_cost_egp, { emphasis: true, suffix: 'EGP' }),
    numberField('items_count', { ar: 'عدد العناصر', en: 'Items' }, item.items_count, { digits: 0 }),
    textField('receipt_date', { ar: 'تاريخ الإيصال', en: 'Receipt date' }, item.receipt_date ?? ''),
  ];
};

/** Apply user corrections on top of an extracted bill (pure, testable). */
export const applyExtractionEdits = <T extends object>(
  data: T,
  edits: Record<string, number>,
): T => {
  const next = { ...(data as Record<string, unknown>) };
  for (const [key, value] of Object.entries(edits)) {
    if (key.startsWith('_')) continue;
    if (!Number.isFinite(value)) continue;
    next[key] = value;
  }
  const record = next as Record<string, unknown>;
  if (
    record.previous_reading !== undefined ||
    record.current_reading !== undefined
  ) {
    const derived = consumptionFromReadings(record.previous_reading, record.current_reading);
    const consumptionKey =
      'consumption_kwh' in record ? 'consumption_kwh' : 'total_consumption_m3' in record ? 'total_consumption_m3' : null;
    if (consumptionKey && edits[consumptionKey] === undefined && derived > 0) {
      record[consumptionKey] = derived;
    }
  }
  if (record.isStub === true) {
    const hasSignal =
      toPositive(record.consumption_kwh) > 0 ||
      toPositive(record.total_consumption_m3) > 0 ||
      toPositive(record.total_amount) > 0;
    if (hasSignal) {
      record.isStub = false;
      record.message = '';
    }
  }
  return next as T;
};
