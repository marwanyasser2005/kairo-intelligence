import type { CapabilityId, LocalizedText } from './kairoCapabilities';

/**
 * Why three capabilities are core.
 *
 * The split is a product decision, so the decision model lives in code and is
 * enforced by tests instead of being an implicit opinion. Each capability is
 * scored 1-5 on six weighted criteria; the three highest scores form the core
 * tier, the next four are support, and the scenario lab is a tool.
 *
 * Scores are about how the capability behaves today, with the platform's real
 * data sources: a capability that only works with live input scores lower on
 * readiness than one with a deterministic engine.
 */
export interface PriorityCriterion {
  id: keyof CapabilityScore;
  weight: number;
  label: LocalizedText;
  question: LocalizedText;
}

export interface CapabilityScore {
  /** How many of the five audience profiles the capability serves. */
  audienceReach: number;
  /** Works with zero or minimal input and rests on a deterministic calculation. */
  readiness: number;
  /** Produces a directly measurable financial outcome for the user. */
  financialImpact: number;
  /** How often the underlying decision repeats for a typical user. */
  frequency: number;
  /** The result can be checked against a later real measurement. */
  verifiability: number;
  /** Weight of the underlying national priority for the Egyptian context. */
  nationalUrgency: number;
}

export const PRIORITY_CRITERIA: PriorityCriterion[] = [
  {
    id: 'audienceReach',
    weight: 0.2,
    label: { ar: 'تغطية الجماهير', en: 'Audience reach' },
    question: { ar: 'كم فئة مستهدفة تخدمها الخاصية فعليًا؟', en: 'How many target audiences does it actually serve?' },
  },
  {
    id: 'readiness',
    weight: 0.2,
    label: { ar: 'جاهزية التشغيل', en: 'Operational readiness' },
    question: { ar: 'هل تعمل بأقل إدخال وبحساب حتمي؟', en: 'Does it work with minimal input and deterministic math?' },
  },
  {
    id: 'financialImpact',
    weight: 0.2,
    label: { ar: 'الأثر المالي المباشر', en: 'Direct financial impact' },
    question: { ar: 'هل توفر مبلغًا قابلًا للقياس؟', en: 'Does it save a measurable amount of money?' },
  },
  {
    id: 'frequency',
    weight: 0.15,
    label: { ar: 'تكرار القرار', en: 'Decision frequency' },
    question: { ar: 'كم مرة يتخذ المستخدم هذا القرار؟', en: 'How often does the user make this decision?' },
  },
  {
    id: 'verifiability',
    weight: 0.15,
    label: { ar: 'قابلية التحقق', en: 'Verifiability' },
    question: { ar: 'هل يمكن تأكيد النتيجة بقياس لاحق؟', en: 'Can the outcome be confirmed by a later measurement?' },
  },
  {
    id: 'nationalUrgency',
    weight: 0.1,
    label: { ar: 'الأولوية الوطنية', en: 'National urgency' },
    question: { ar: 'ما وزنها في السياق المصري؟', en: 'How urgent is it in the Egyptian context?' },
  },
];

export const CAPABILITY_SCORES: Record<CapabilityId, CapabilityScore> = {
  foresight: {
    audienceReach: 5,
    readiness: 5,
    financialImpact: 2,
    frequency: 5,
    verifiability: 4,
    nationalUrgency: 5,
  },
  water: {
    audienceReach: 5,
    readiness: 5,
    financialImpact: 5,
    frequency: 4,
    verifiability: 5,
    nationalUrgency: 5,
  },
  energy: {
    audienceReach: 4,
    readiness: 5,
    financialImpact: 5,
    frequency: 4,
    verifiability: 5,
    nationalUrgency: 4,
  },
  food: {
    audienceReach: 4,
    readiness: 3,
    financialImpact: 5,
    frequency: 4,
    verifiability: 4,
    nationalUrgency: 4,
  },
  mobility: {
    audienceReach: 4,
    readiness: 3,
    financialImpact: 4,
    frequency: 4,
    verifiability: 3,
    nationalUrgency: 3,
  },
  exposure: {
    audienceReach: 5,
    readiness: 4,
    financialImpact: 1,
    frequency: 5,
    verifiability: 2,
    nationalUrgency: 5,
  },
  ewaste: {
    audienceReach: 4,
    readiness: 3,
    financialImpact: 4,
    frequency: 2,
    verifiability: 3,
    nationalUrgency: 3,
  },
  scenarios: {
    audienceReach: 3,
    readiness: 3,
    financialImpact: 3,
    frequency: 2,
    verifiability: 3,
    nationalUrgency: 2,
  },
};

export const TOTAL_PRIORITY_WEIGHT = PRIORITY_CRITERIA.reduce(
  (total, criterion) => total + criterion.weight,
  0,
);

/** Weighted 1-5 priority score for one capability. */
export const capabilityPriorityScore = (id: CapabilityId): number => {
  const scores = CAPABILITY_SCORES[id];
  const weighted = PRIORITY_CRITERIA.reduce(
    (total, criterion) => total + scores[criterion.id] * criterion.weight,
    0,
  );
  return Math.round(weighted * 100) / 100;
};

export interface CapabilityRanking {
  id: CapabilityId;
  score: number;
}

export const rankedCapabilities = (ids: CapabilityId[]): CapabilityRanking[] =>
  ids
    .map((id) => ({ id, score: capabilityPriorityScore(id) }))
    .sort((a, b) => b.score - a.score);

/** The three capabilities the model selects as core. */
export const topRankedCapabilities = (ids: CapabilityId[], count = 3): CapabilityId[] =>
  rankedCapabilities(ids)
    .slice(0, count)
    .map((entry) => entry.id);
