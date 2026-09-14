export type Language = 'ar' | 'en';

/**
 * Risk wording shared by the water and energy modules. Both modules previously
 * mapped Arabic labels separately, which made "مرتفع" (high) fall through to the
 * safe/green branch, so a high risk could be rendered as if it were healthy.
 */
const RISK_LABELS: Record<string, { ar: string; en: string }> = {
  // Water levels
  Excellent: { ar: 'ممتاز', en: 'Excellent' },
  'Very Good': { ar: 'جيد جدًا', en: 'Very Good' },
  Good: { ar: 'جيد', en: 'Good' },
  'Needs Improvement': { ar: 'يحتاج تحسين', en: 'Needs Improvement' },
  'High Risk': { ar: 'مخاطرة مرتفعة', en: 'High Risk' },
  // Shared severities
  Low: { ar: 'منخفض', en: 'Low' },
  Medium: { ar: 'متوسط', en: 'Medium' },
  Moderate: { ar: 'متوسط', en: 'Moderate' },
  High: { ar: 'مرتفع', en: 'High' },
  Severe: { ar: 'شديد', en: 'Severe' },
  Critical: { ar: 'حرج', en: 'Critical' },
  // Recommendation attributes
  Zero: { ar: 'بدون تكلفة', en: 'Zero' },
  Fast: { ar: 'سريع', en: 'Fast' },
  Slow: { ar: 'يحتاج وقتًا', en: 'Slow' },
};

export const localizeDisplayValue = (value: string, language: Language): string => {
  if (!value) return value;
  const entry = RISK_LABELS[value];
  if (!entry) return value;
  return language === 'ar' ? entry.ar : entry.en;
};

type RiskTone = 'safe' | 'watch' | 'warn' | 'danger' | 'neutral';

const TONE_CLASSES: Record<RiskTone, string> = {
  safe: 'text-green-500',
  watch: 'text-yellow-500',
  warn: 'text-orange-500',
  danger: 'text-red-500',
  neutral: 'text-gray-500',
};

/**
 * Classify a risk value in either language. Matching runs on the normalized
 * value so both the raw API strings and the localized Arabic labels work.
 */
export const riskTone = (value: string): RiskTone => {
  const raw = (value ?? '').trim();
  if (!raw) return 'neutral';
  const normalized = raw.toLowerCase();

  const isAny = (needles: string[]) => needles.some((needle) => normalized.includes(needle));

  if (isAny(['high risk', 'severe', 'critical', 'شديد', 'حرج', 'مخاطرة مرتفعة'])) return 'danger';
  if (isAny(['high', 'مرتفع', 'عالي', 'عالية'])) return 'danger';
  if (isAny(['needs improvement', 'poor', 'يحتاج تحسين', 'ضعيف'])) return 'warn';
  if (isAny(['medium', 'moderate', 'متوسط'])) return 'watch';
  if (isAny(['very good', 'جيد جدا', 'جيد جدًا'])) return 'safe';
  if (isAny(['excellent', 'good', 'low', 'ممتاز', 'جيد', 'منخفض'])) return 'safe';
  return 'neutral';
};

export const riskToneClass = (value: string): string => TONE_CLASSES[riskTone(value)];

export const riskToneEmoji = (value: string): string =>
  ({ safe: '🟢', watch: '🟡', warn: '🟠', danger: '🔴', neutral: '⚪' })[riskTone(value)];

/**
 * Placeholder for a metric that has no value yet. Arabic shows a clear word
 * instead of a Latin dash, which reads like a broken glyph in RTL layouts.
 */
export const formatOptionalValue = (
  value: number | string | null | undefined,
  format: (value: number) => string,
  language: Language,
): string => {
  if (value === null || value === undefined || value === '' || (typeof value === 'number' && !Number.isFinite(value))) {
    return language === 'ar' ? 'غير متاح بعد' : 'Not available yet';
  }
  if (typeof value === 'number') return format(value);
  const numeric = Number(value);
  return Number.isFinite(numeric) ? format(numeric) : value;
};
