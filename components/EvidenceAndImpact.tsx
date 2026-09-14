import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  CircleGauge,
  Clock3,
  Database,
  FileCheck2,
  Fingerprint,
  History,
  LineChart,
  Save,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { formatOptionalValue } from '../utils/displayLabels';
import { usePersistentState} from '../utils/storage';

// Snapshot ids are generated only from the click handler; keeping the
// generator at module scope makes that explicit to the compiler rules.
const buildSnapshotId = (): string =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`;

export type EvidenceKind =
  | 'live'
  | 'forecast'
  | 'user-derived'
  | 'contextual-estimate'
  | 'device-estimate';

export interface EvidencePassportItem {
  id: string;
  title: string;
  value: string;
  ready: boolean;
  score?: number;
  kind: EvidenceKind;
  source: string;
  method: string;
  freshness: string;
  limitation: string;
  confidence?: number;
}

interface EvidenceAndImpactProps {
  items: EvidencePassportItem[];
  isArabic: boolean;
  isLight: boolean;
}

interface ImpactSnapshot {
  id: string;
  capturedAt: string;
  type: 'baseline' | 'follow-up';
  completed: number;
  averageScore: number | null;
  metrics: Array<{
    id: string;
    title: string;
    value: string;
    score?: number;
  }>;
}

const kindLabels: Record<EvidenceKind, { ar: string; en: string }> = {
  live: { ar: 'بيانات حية', en: 'Live data' },
  forecast: { ar: 'توقع من مصدر خارجي', en: 'External-source forecast' },
  'user-derived': { ar: 'حساب مشتق من مدخلاتك', en: 'Derived from your inputs' },
  'contextual-estimate': { ar: 'تقدير سياقي', en: 'Contextual estimate' },
  'device-estimate': { ar: 'تقدير حالة جهاز', en: 'Device-condition estimate' },
};

const kindStyles: Record<EvidenceKind, string> = {
  live: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-500',
  forecast: 'border-cyan-400/25 bg-cyan-400/10 text-cyan-500',
  'user-derived': 'border-blue-400/25 bg-blue-400/10 text-blue-500',
  'contextual-estimate': 'border-amber-400/25 bg-amber-400/10 text-amber-500',
  'device-estimate': 'border-violet-400/25 bg-violet-400/10 text-violet-500',
};

const formatDate = (value: string, isArabic: boolean) =>
  new Intl.DateTimeFormat(isArabic ? 'ar-EG' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

const EvidenceAndImpact: React.FC<EvidenceAndImpactProps> = ({
  items,
  isArabic,
  isLight,
}) => {
  const [history, setHistory] = usePersistentState<ImpactSnapshot[]>(
    'kairo_impact_evidence_history_v1',
    [],
  );

  const readyItems = useMemo(() => items.filter((item) => item.ready), [items]);
  const scoredItems = readyItems.filter((item) => Number.isFinite(item.score));
  const currentAverage =
    scoredItems.length > 0
      ? Math.round(
          scoredItems.reduce((sum, item) => sum + Number(item.score), 0) /
            scoredItems.length,
        )
      : null;

  const latest = history[0] ?? null;
  const baseline = [...history].reverse().find((entry) => entry.type === 'baseline') ?? null;
  const scoreChange =
    currentAverage !== null && baseline?.averageScore !== null && baseline?.averageScore !== undefined
      ? currentAverage - baseline.averageScore
      : null;

  const border = isLight ? 'border-slate-900/[0.09]' : 'border-white/[0.09]';
  const surface = isLight ? 'bg-white/85' : 'bg-white/[0.035]';
  const nested = isLight ? 'bg-[#f5f8f6]' : 'bg-black/20';
  const textMain = isLight ? 'text-slate-950' : 'text-white';
  const textSub = isLight ? 'text-slate-600' : 'text-slate-400';
  const textSoft = isLight ? 'text-slate-500' : 'text-slate-500';

  const saveSnapshot = () => {
    if (readyItems.length === 0) return;

    const snapshot: ImpactSnapshot = {
      id: buildSnapshotId(),
      capturedAt: new Date().toISOString(),
      type: history.length === 0 ? 'baseline' : 'follow-up',
      completed: readyItems.length,
      averageScore: currentAverage,
      metrics: readyItems.map(({ id, title, value, score }) => ({
        id,
        title,
        value,
        score,
      })),
    };

    setHistory((current) => [snapshot, ...current].slice(0, 12));
  };

  return (
    <section className="mt-10" aria-labelledby="evidence-impact-title">
      <div className="grid gap-6 xl:grid-cols-[1.18fr_.82fr]">
        <div className={`kairo-analysis-panel overflow-hidden rounded-[2rem] border ${border} ${surface}`}>
          <div className={`border-b p-6 sm:p-8 ${border}`}>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-2xl">
                <span className="kairo-eyebrow">
                  <Fingerprint className="h-3.5 w-3.5" />
                  {isArabic ? 'بصمة الدليل' : 'Evidence passport'}
                </span>
                <h2
                  id="evidence-impact-title"
                  className={`mt-5 text-3xl font-semibold tracking-[-0.035em] ${textMain}`}
                >
                  {isArabic ? 'اعرف كل رقم جاي منين' : 'Know where every result comes from'}
                </h2>
                <p className={`mt-3 text-sm leading-7 ${textSub}`}>
                  {isArabic
                    ? 'طبقة توضيح مستقلة لا تغيّر نتائج الخواص؛ تفرّق بين القياس والتوقع والحساب والتقدير، وتعرض حدود الاستخدام قبل اتخاذ القرار.'
                    : 'An independent explanation layer that does not change feature results. It separates measurements, forecasts, calculations, and estimates before a decision is made.'}
                </p>
              </div>
              <div
                className={`shrink-0 rounded-2xl border px-4 py-3 text-center ${border} ${nested}`}
              >
                <p className={`text-2xl font-black ${textMain}`}>
                  {readyItems.length}/{items.length}
                </p>
                <p className={`mt-1 text-[10px] font-bold ${textSoft}`}>
                  {isArabic ? 'بصمات متاحة' : 'passports available'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 p-4 sm:p-6 lg:grid-cols-2">
            {items.map((item) => {
              const kind = kindLabels[item.kind];
              return (
                <article
                  key={item.id}
                  className={`kairo-metric-card rounded-[1.5rem] border p-5 ${border} ${
                    item.ready ? nested : 'bg-transparent opacity-65'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className={`truncate text-sm font-extrabold ${textMain}`}>
                        {item.title}
                      </p>
                      <p className={`kairo-metric-value mt-2 text-xl font-black ${textMain}`}>
                        {item.ready ? item.value : isArabic ? 'لا توجد نتيجة بعد' : 'No result yet'}
                      </p>
                    </div>
                    {item.ready ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                    ) : (
                      <CircleGauge className={`h-5 w-5 shrink-0 ${textSoft}`} />
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[9px] font-black ${
                        kindStyles[item.kind]
                      }`}
                    >
                      {isArabic ? kind.ar : kind.en}
                    </span>
                    {item.confidence !== undefined && (
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[9px] font-black ${border} ${textSub}`}
                      >
                        {isArabic ? 'اكتمال الدليل' : 'Evidence confidence'}{' '}
                        {Math.round(item.confidence)}%
                      </span>
                    )}
                  </div>

                  <dl className="mt-5 grid gap-3 text-[11px] leading-5">
                    {[
                      {
                        Icon: Database,
                        label: isArabic ? 'المصدر' : 'Source',
                        value: item.source,
                      },
                      {
                        Icon: LineChart,
                        label: isArabic ? 'الطريقة' : 'Method',
                        value: item.method,
                      },
                      {
                        Icon: Clock3,
                        label: isArabic ? 'الحداثة' : 'Freshness',
                        value: item.freshness,
                      },
                      {
                        Icon: ShieldCheck,
                        label: isArabic ? 'حد الاستخدام' : 'Usage limit',
                        value: item.limitation,
                      },
                    ].map(({ Icon, label, value }) => (
                      <div key={label} className="grid grid-cols-[18px_68px_1fr] gap-2">
                        <Icon className="mt-0.5 h-3.5 w-3.5 text-kairo-green" />
                        <dt className={`font-black ${textSoft}`}>{label}</dt>
                        <dd className={textSub}>{value}</dd>
                      </div>
                    ))}
                  </dl>
                </article>
              );
            })}
          </div>
        </div>

        <div className="grid content-start gap-6">
          <div className={`kairo-analysis-panel rounded-[2rem] border p-6 sm:p-8 ${border} ${surface}`}>
            <span className="kairo-eyebrow">
              <History className="h-3.5 w-3.5" />
              {isArabic ? 'متابعة الأثر' : 'Impact tracking'}
            </span>
            <h2 className={`mt-5 text-3xl font-semibold tracking-[-0.035em] ${textMain}`}>
              {isArabic ? 'احفظ قبل وبعد' : 'Capture before and after'}
            </h2>
            <p className={`mt-3 text-sm leading-7 ${textSub}`}>
              {isArabic
                ? 'احفظ لقطة خط أساس، وبعد تنفيذ الإجراء سجّل متابعة جديدة. Kairo يحتفظ بالمقارنة على جهازك من غير استدعاء AI.'
                : 'Save a baseline, then capture a follow-up after acting. Kairo keeps the comparison on your device without an AI request.'}
            </p>

            <div className="mt-6 grid grid-cols-3 gap-2">
              {[
                {
                  label: isArabic ? 'النتائج' : 'Results',
                  value: `${readyItems.length}/${items.length}`,
                },
                {
                  label: isArabic ? 'متوسط الدرجات' : 'Average score',
                  value: formatOptionalValue(currentAverage, (average) => `${average}/100`, isArabic ? 'ar' : 'en'),
                },
                {
                  label: isArabic ? 'من خط الأساس' : 'From baseline',
                  value: formatOptionalValue(
                    scoreChange,
                    (change) => `${change > 0 ? '+' : ''}${change}`,
                    isArabic ? 'ar' : 'en',
                  ),
                },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className={`kairo-metric-card kairo-metric-compact rounded-2xl border px-3 py-4 text-center ${border} ${nested}`}
                >
                  <p className={`text-lg font-black ${textMain}`}>{metric.value}</p>
                  <p className={`mt-1 text-[9px] font-bold leading-4 ${textSoft}`}>
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={saveSnapshot}
              disabled={readyItems.length === 0}
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-kairo-green px-5 text-sm font-black text-[#052019] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Save className="h-4 w-4" />
              {history.length === 0
                ? isArabic
                  ? 'احفظ خط الأساس'
                  : 'Save baseline'
                : isArabic
                  ? 'سجّل متابعة جديدة'
                  : 'Capture follow-up'}
            </button>

            <Link
              to="/proof"
              className="kairo-secondary-button mt-3 w-full justify-center"
            >
              <ArrowUpRight className="h-4 w-4" />
              {isArabic ? 'افتح مساحة إثبات الأثر' : 'Open proof-of-impact workspace'}
            </Link>

            <div className="mt-6 space-y-3">
              {history.length > 0 ? (
                history.slice(0, 3).map((snapshot, index) => (
                  <div key={snapshot.id} className="grid grid-cols-[30px_1fr] gap-3">
                    <div className="relative flex justify-center">
                      <span className="z-10 mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-kairo-green/15 text-kairo-green">
                        {index === 0 ? (
                          <Sparkles className="h-3.5 w-3.5" />
                        ) : (
                          <FileCheck2 className="h-3.5 w-3.5" />
                        )}
                      </span>
                      {index < Math.min(history.length, 3) - 1 && (
                        <span className={`absolute top-8 h-[calc(100%+6px)] w-px ${isLight ? 'bg-slate-200' : 'bg-white/10'}`} />
                      )}
                    </div>
                    <div className={`rounded-2xl border p-4 ${border} ${nested}`}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className={`text-xs font-black ${textMain}`}>
                          {snapshot.type === 'baseline'
                            ? isArabic
                              ? 'خط الأساس'
                              : 'Baseline'
                            : isArabic
                              ? 'متابعة'
                              : 'Follow-up'}
                        </p>
                        <time className={`text-[9px] font-bold ${textSoft}`}>
                          {formatDate(snapshot.capturedAt, isArabic)}
                        </time>
                      </div>
                      <p className={`mt-2 text-[10px] ${textSub}`}>
                        {snapshot.completed} {isArabic ? 'نتائج محفوظة' : 'saved results'}
                        {snapshot.averageScore !== null
                          ? ` · ${isArabic ? 'متوسط' : 'average'} ${snapshot.averageScore}/100`
                          : ''}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`rounded-2xl border border-dashed p-5 text-center ${border}`}>
                  <p className={`text-xs leading-6 ${textSoft}`}>
                    {readyItems.length > 0
                      ? isArabic
                        ? 'جاهز لحفظ أول خط أساس قابل للمقارنة.'
                        : 'Ready to save the first comparable baseline.'
                      : isArabic
                        ? 'أكمل تحليلًا واحدًا على الأقل لبدء المتابعة.'
                        : 'Complete at least one analysis to begin tracking.'}
                  </p>
                </div>
              )}
            </div>

            {latest && (
              <p className={`mt-5 text-[10px] leading-5 ${textSoft}`}>
                {isArabic
                  ? 'اللقطات تثبت تغير المؤشرات، لكنها لا تثبت السببية وحدها؛ وثّق الإجراء والظروف المحيطة عند العرض.'
                  : 'Snapshots show indicator change, but not causality on their own; document the action and surrounding conditions when presenting.'}
              </p>
            )}
          </div>

          <div className={`rounded-[2rem] border p-6 sm:p-8 ${border} ${surface}`}>
            <span className="kairo-eyebrow">
              <ShieldCheck className="h-3.5 w-3.5" />
              {isArabic ? 'مسار قرار قابل للمراجعة' : 'Auditable decision path'}
            </span>
            <div className="mt-6 space-y-2">
              {[
                {
                  title: isArabic ? '1. استشعر السياق' : '1. Sense the context',
                  text: isArabic ? 'موقع بإذن المستخدم ومدخلات أو توقعات موثقة.' : 'Consent-led location, inputs, or sourced forecasts.',
                },
                {
                  title: isArabic ? '2. افهم الدليل' : '2. Understand the evidence',
                  text: isArabic ? 'نوع الرقم ومصدره وحدوده ظاهرين قبل القرار.' : 'Value type, source, and limits are visible before acting.',
                },
                {
                  title: isArabic ? '3. خُد إجراء' : '3. Take action',
                  text: isArabic ? 'اختَر خطوة واقعية وسجّل خط الأساس.' : 'Choose a realistic step and capture a baseline.',
                },
                {
                  title: isArabic ? '4. قارن وصدّر' : '4. Compare and export',
                  text: isArabic ? 'سجّل المتابعة وصدّر الداشبورد كدليل.' : 'Capture a follow-up and export the dashboard as evidence.',
                },
              ].map((step, index, steps) => (
                <React.Fragment key={step.title}>
                  <div className={`rounded-2xl border p-4 ${border} ${nested}`}>
                    <p className={`text-xs font-black ${textMain}`}>{step.title}</p>
                    <p className={`mt-1.5 text-[11px] leading-5 ${textSub}`}>{step.text}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight
                      className={`mx-auto h-3.5 w-3.5 text-kairo-green ${
                        isArabic ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EvidenceAndImpact;
