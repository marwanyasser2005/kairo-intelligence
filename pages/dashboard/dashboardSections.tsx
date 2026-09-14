import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  CheckCircle2,
  CircleGauge,
  Droplet,
  Leaf,
  LocateFixed,
  Radio,
  Route,
  ShieldCheck,
  Target,
  Wind,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { localize, audienceProfiles, getAudienceProfile, TIER_LABELS, type AudienceProfile, type KairoCapability, type AudienceId } from '../../config/kairoCapabilities';
import {
  accentClasses,
  audienceIcons,
  capabilityIcons,
  type CapabilityState,
  type CostChartDatum,
  type DashboardReveal,
  type DashboardTheme,
  type EarlyWarningSnapshot,
  type ScoreChartDatum,
} from './dashboardDisplay';

// Matches the project-wide escape hatch for framer-motion's generic component.
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const MotionDiv = motion.div as any;

export const EmptyChartState = ({
  isAr,
  text,
  onOpen,
}: {
  isAr: boolean;
  text: string;
  onOpen: () => void;
}) => (
  <div className="flex h-full flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-400/20 bg-slate-500/[0.035] px-6 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-kairo-green/10 text-kairo-green">
      <CircleGauge className="h-5 w-5" />
    </div>
    <p className="mt-4 max-w-xs text-xs font-bold leading-6 text-slate-500">{text}</p>
    <button
      type="button"
      onClick={onOpen}
      className="mt-4 rounded-full bg-kairo-green px-4 py-2 text-[11px] font-black text-[#052019]"
    >
      {isAr ? 'ابدأ تحليلًا' : 'Start an analysis'}
    </button>
  </div>
);

export const ScoreChartPanel = ({
  isAr,
  isLight,
  border,
  surface,
  textMain,
  textSub,
  scores,
  onStartWater,
}: {
  isAr: boolean;
  isLight: boolean;
  border: string;
  surface: string;
  textMain: string;
  textSub: string;
  scores: ScoreChartDatum[];
  onStartWater: () => void;
}) => (
  <section className={`kairo-analysis-panel overflow-hidden rounded-[2rem] border ${border} ${surface}`}>
    <div className={`flex flex-col gap-3 border-b p-6 sm:flex-row sm:items-end sm:justify-between ${border}`}>
      <div>
        <span className="kairo-eyebrow">
          <CircleGauge className="h-3.5 w-3.5" />
          {isAr ? 'صورة الأداء' : 'Performance view'}
        </span>
        <h2 className={`mt-4 text-2xl font-black ${textMain}`}>
          {isAr ? 'مؤشرات الكفاءة المتاحة' : 'Available efficiency indicators'}
        </h2>
        <p className={`mt-2 text-xs leading-6 ${textSub}`}>
          {isAr
            ? 'يعرض فقط الدرجات الناتجة من تحليلاتك الحالية، من غير أي بيانات تجريبية.'
            : 'Shows only scores from your current analyses, with no demo values.'}
        </p>
      </div>
      <span className={`rounded-full border px-3 py-1.5 text-[10px] font-black ${border} ${textSub}`}>
        {scores.length} {isAr ? 'مؤشرات جاهزة' : 'scores ready'}
      </span>
    </div>
    <div className="kairo-chart kairo-chart-dashboard m-4 h-[350px] min-w-0 p-4 sm:m-6 sm:p-5" dir="ltr" role="img" aria-label={isAr ? 'مقارنة درجات الكفاءة المتاحة من صفر إلى مئة' : 'Comparison of available efficiency scores from zero to one hundred'}>
      {scores.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={scores}
            layout="vertical"
            accessibilityLayer
            margin={{ top: 8, right: 54, left: 18, bottom: 8 }}
          >
            <CartesianGrid
              strokeDasharray="3 6"
              horizontal={false}
              stroke={isLight ? '#dbe6e1' : 'rgba(255,255,255,.08)'}
            />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: isLight ? '#64748b' : '#718078', fontSize: 10 }}
            />
            <YAxis
              dataKey="name"
              type="category"
              width={isAr ? 118 : 104}
              tickLine={false}
              axisLine={false}
              tick={{
                fill: isLight ? '#334155' : '#cbd5e1',
                fontSize: 11,
                fontWeight: 700,
                textAnchor: 'end',
              }}
            />
            <ChartTooltip
              cursor={{ fill: 'rgba(43,212,167,.055)' }}
              contentStyle={{
                borderRadius: 14,
                border: `1px solid ${isLight ? '#dbe6e1' : 'rgba(255,255,255,.1)'}`,
                background: isLight ? '#ffffff' : '#0d1916',
                color: isLight ? '#0f172a' : '#f8fafc',
                fontSize: 12,
              }}
              formatter={(value) => [`${Number(value).toFixed(0)}/100`, isAr ? 'الدرجة' : 'Score']}
            />
            <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={16}>
              {scores.map((entry, index) => (
                <Cell
                  key={entry.id}
                  fill={['#2bd4a7', '#38bdf8', '#facc15', '#a78bfa', '#22d3ee'][index % 5]}
                />
              ))}
              <LabelList
                dataKey="value"
                position="right"
                formatter={(value: number) => `${Math.round(value)}`}
                fill={isLight ? '#36574c' : '#d3e7df'}
                fontSize={10}
                fontWeight={800}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <EmptyChartState
          isAr={isAr}
          text={isAr ? 'شغّل أي تحليل علشان تظهر درجات الكفاءة هنا.' : 'Run an analysis to show efficiency scores here.'}
          onOpen={onStartWater}
        />
      )}
    </div>
  </section>
);

export const CostChartPanel = ({
  isAr,
  isLight,
  border,
  surface,
  textMain,
  textSub,
  costs,
  onStartEnergy,
}: {
  isAr: boolean;
  isLight: boolean;
  border: string;
  surface: string;
  textMain: string;
  textSub: string;
  costs: CostChartDatum[];
  onStartEnergy: () => void;
}) => (
  <section className={`kairo-analysis-panel overflow-hidden rounded-[2rem] border ${border} ${surface}`}>
    <div className={`border-b p-6 ${border}`}>
      <span className="kairo-eyebrow">
        <Leaf className="h-3.5 w-3.5" />
        {isAr ? 'السياق المالي' : 'Financial context'}
      </span>
      <h2 className={`mt-4 text-2xl font-black ${textMain}`}>
        {isAr ? 'التكلفة الشهرية حسب القطاع' : 'Monthly cost by sector'}
      </h2>
      <p className={`mt-2 text-xs leading-6 ${textSub}`}>
        {isAr
          ? 'مياه وغذاء وطاقة: فاقد تقديري. التنقل: تكلفة شهرية حالية.'
          : 'Water, food, and energy show estimated loss; mobility shows current monthly cost.'}
      </p>
    </div>
    <div className="kairo-chart kairo-chart-dashboard m-4 h-[350px] min-w-0 p-4 sm:m-6 sm:p-5" dir="ltr" role="img" aria-label={isAr ? 'مقارنة التكلفة الشهرية حسب القطاع بالجنيه المصري' : 'Monthly cost comparison by sector in Egyptian pounds'}>
      {costs.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={costs} accessibilityLayer margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
            <CartesianGrid
              strokeDasharray="3 6"
              vertical={false}
              stroke={isLight ? '#dbe6e1' : 'rgba(255,255,255,.08)'}
            />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fill: isLight ? '#475569' : '#94a3b8', fontSize: 10, fontWeight: 700 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: isLight ? '#64748b' : '#718078', fontSize: 10 }}
            />
            <ChartTooltip
              cursor={{ fill: 'rgba(43,212,167,.055)' }}
              contentStyle={{
                borderRadius: 14,
                border: `1px solid ${isLight ? '#dbe6e1' : 'rgba(255,255,255,.1)'}`,
                background: isLight ? '#ffffff' : '#0d1916',
                color: isLight ? '#0f172a' : '#f8fafc',
                fontSize: 12,
              }}
              formatter={(value) => [
                `${Number(value).toLocaleString(isAr ? 'ar-EG' : 'en-GB')} ${isAr ? 'جنيه' : 'EGP'}`,
                isAr ? 'شهريًا' : 'Monthly',
              ]}
            />
            <Bar dataKey="value" radius={[10, 10, 3, 3]} maxBarSize={46}>
              {costs.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
              <LabelList
                dataKey="value"
                position="top"
                formatter={(value: number) => Number(value).toLocaleString(isAr ? 'ar-EG' : 'en-GB')}
                fill={isLight ? '#36574c' : '#d3e7df'}
                fontSize={10}
                fontWeight={800}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <EmptyChartState
          isAr={isAr}
          text={isAr ? 'أكمل تحليلًا فيه تكلفة علشان تظهر المقارنة.' : 'Complete a cost-based analysis to see the comparison.'}
          onOpen={onStartEnergy}
        />
      )}
    </div>
  </section>
);

const SCORE_RING_COLORS: Record<string, string> = {
  emerald: '#2bd4a7',
  blue: '#38bdf8',
  amber: '#f5b942',
  violet: '#a78bfa',
  cyan: '#22d3ee',
};

export const ScoreRing = ({
  score,
  accent,
  label,
}: {
  score?: number;
  accent: string;
  label: string;
}) => {
  if (score === undefined) return null;
  const value = Math.max(0, Math.min(100, Math.round(score)));
  return (
    <div
      className="kairo-score-ring"
      role="img"
      aria-label={`${label}: ${value}/100`}
      style={
        {
          '--kairo-score': value,
          '--decision-accent': SCORE_RING_COLORS[accent] ?? SCORE_RING_COLORS.emerald,
        } as React.CSSProperties
      }
    >
      <span className="kairo-score-ring-core">
        <strong>{value}</strong>
        <span>/100</span>
      </span>
    </div>
  );
};

/**
 * The core tier: water, energy, and food. These three own the resource systems a
 * user consumes and pays for, so they get the largest, most decision-oriented
 * presentation on the dashboard.
 */
export const CoreResourcesSection = ({
  theme,
  currentLanguage,
  capabilities,
  capabilityStates,
  onNavigate,
}: {
  theme: DashboardTheme;
  currentLanguage: 'ar' | 'en';
  capabilities: KairoCapability[];
  capabilityStates: Record<string, CapabilityState>;
  onNavigate: (path: string) => void;
}) => {
  const { isAr, isLight, border, surface, textMain, textSub, textSoft } = theme;
  if (capabilities.length === 0) return null;

  return (
    <section className="mt-8">
      <div className={`mb-4 flex flex-wrap items-end justify-between gap-3 border-b pb-4 ${border}`}>
        <div>
          <span className="kairo-eyebrow">
            <Target className="h-3.5 w-3.5" />
            {isAr ? 'نظام الموارد المتكامل' : 'Integrated resource system'}
          </span>
          <h2 className={`mt-3 text-2xl font-black sm:text-3xl ${textMain}`}>
            {isAr ? 'الخواص الأساسية: المياه والطاقة والغذاء' : 'Core capabilities: water, energy, food'}
          </h2>
          <p className={`mt-2 max-w-3xl text-xs leading-6 sm:text-sm ${textSub}`}>
            {isAr
              ? 'ثلاثة أنظمة موارد تستهلكها وتدفع ثمنها مباشرة، ولكل واحد قرار واضح ونتيجة قابلة للقياس. ابدأ من هنا.'
              : 'Three resource systems you consume and pay for directly, each with a clear decision and a measurable result. Start here.'}
          </p>
        </div>
        <span className={`rounded-full border px-3 py-1.5 text-[10px] font-black ${border} ${textSub}`}>
          {isAr ? '3 خواص أساسية' : '3 core capabilities'}
        </span>
      </div>

      <div className="kairo-metric-grid grid gap-4 lg:grid-cols-3">
        {capabilities.map((capability) => {
          const state = capabilityStates[capability.id];
          const Icon = capabilityIcons[capability.id];
          const accent = accentClasses[capability.accent];
          return (
            <article
              key={capability.id}
              className={`kairo-analysis-panel group flex flex-col rounded-[2rem] border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(0,0,0,.16)] ${border} ${surface}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${accent.soft} ${accent.icon}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span
                  title={localize(capability.tierReason, currentLanguage)}
                  className="rounded-full bg-kairo-green/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-kairo-green"
                >
                  {localize(TIER_LABELS[capability.tier], currentLanguage)}
                </span>
              </div>

              <h3 className={`mt-5 text-xl font-black ${textMain}`}>
                {localize(capability.title, currentLanguage)}
              </h3>
              <p className={`mt-2 text-sm leading-6 ${textSub}`}>
                {localize(capability.purpose, currentLanguage)}
              </p>

              <div className="mt-6 flex items-center gap-5">
                <ScoreRing score={state.score} accent={capability.accent} label={localize(capability.title, currentLanguage)} />
                <div className="min-w-0">
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${textSoft}`}>{state.label}</p>
                  <p className={`mt-1 text-2xl font-black ${textMain}`}>{state.value}</p>
                  <p className={`mt-2 text-[11px] leading-5 ${textSoft}`}>{state.evidence}</p>
                </div>
              </div>

              <div className={`mt-6 rounded-2xl border p-4 ${border} ${isLight ? 'bg-slate-50/70' : 'bg-black/20'}`}>
                <p className={`text-[9px] font-black uppercase tracking-wider ${textSoft}`}>
                  {isAr ? 'النتيجة التي ستحصل عليها' : 'What you will get'}
                </p>
                <p className={`mt-1.5 text-[11px] leading-5 ${textSub}`}>
                  {localize(capability.outcome, currentLanguage)}
                </p>
              </div>

              <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
                <button
                  type="button"
                  onClick={() => onNavigate(capability.path)}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-kairo-green px-5 text-xs font-black text-[#052019] transition hover:bg-[#42e4ba]"
                >
                  {state.ready
                    ? isAr ? 'راجع النتيجة' : 'Review result'
                    : isAr ? 'ابدأ التحليل' : 'Start analysis'}
                  <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" />
                </button>
                <span className={`rounded-full border px-2.5 py-1 text-[9px] font-black ${border} ${
                  state.ready ? 'text-emerald-500' : textSoft
                }`}>
                  {state.ready ? (isAr ? 'جاهزة' : 'Ready') : (isAr ? 'لم تبدأ' : 'Not started')}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

/**
 * The signal layer sits directly after the core three: it owns no resource, but
 * it is the live prevention layer that supports all of them.
 */
export const SignalsBand = ({
  theme,
  isAr,
  earlyWarningData,
  state,
  onNavigate,
}: {
  theme: DashboardTheme;
  isAr: boolean;
  earlyWarningData: EarlyWarningSnapshot | null;
  state: CapabilityState;
  onNavigate: (path: string) => void;
}) => {
  const { border, textMain, textSub, textSoft, isLight } = theme;

  const stats = [
    {
      Icon: Wind,
      label: isAr ? 'ذروة الهواء المتوقعة' : 'Expected air peak',
      value: earlyWarningData?.air?.peakAqi ? `${Math.round(earlyWarningData.air.peakAqi)} AQI` : '—',
      detail: isAr ? 'نافذة 24 ساعة' : '24-hour window',
    },
    {
      Icon: Droplet,
      label: isAr ? 'أولوية فحص المياه' : 'Water inspection priority',
      value: earlyWarningData?.water?.score !== undefined ? `${Math.round(earlyWarningData.water.score)}/100` : '—',
      detail: isAr ? 'مؤشر وليس احتمالًا مؤكدًا' : 'An index, not a confirmed probability',
    },
    {
      Icon: LocateFixed,
      label: isAr ? 'سياق الموقع' : 'Location context',
      value: earlyWarningData?.coordinates ? (isAr ? 'متاح' : 'Available') : (isAr ? 'اختياري' : 'Optional'),
      detail: isAr ? 'يعمل بإذن المستخدم' : 'Runs with user consent',
    },
    {
      Icon: ShieldCheck,
      label: isAr ? 'اكتمال الأدلة' : 'Evidence confidence',
      value: earlyWarningData?.water?.confidence !== undefined ? `${Math.round(earlyWarningData.water.confidence)}%` : '—',
      detail: isAr ? 'يعرض حدود النتيجة' : 'Makes limits visible',
    },
  ];

  return (
    <section
      className={`mt-6 overflow-hidden rounded-[2rem] border p-6 sm:p-7 ${
        isLight
          ? 'border-emerald-500/20 bg-[linear-gradient(135deg,rgba(43,212,167,0.10),rgba(255,255,255,0.6))]'
          : 'border-emerald-400/20 bg-[linear-gradient(135deg,rgba(43,212,167,0.10),rgba(7,17,15,0.9))]'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <span className="kairo-eyebrow">
            <Radio className="h-3.5 w-3.5" />
            {isAr ? 'طبقة الإشارات الحية · مساندة' : 'Live signal layer · support'}
          </span>
          <h2 className={`mt-3 text-xl font-black sm:text-2xl ${textMain}`}>
            {isAr ? 'إشارات تسبق الأثر وتخدم الأنظمة الثلاثة' : 'Signals that precede impact and serve all three systems'}
          </h2>
          <p className={`mt-2 text-xs leading-6 sm:text-sm ${textSub}`}>
            {isAr
              ? 'لا تدير موردًا بمفردها، لكنها تمنح وقتًا للوقاية: توقع هواء، أولوية فحص شبكة المياه، ومستوى ثقة معلن قبل اتخاذ القرار.'
              : 'It does not own a resource on its own, but it buys prevention time: an air outlook, water-network inspection priority, and stated confidence before you decide.'}
          </p>
          <p className={`mt-2 text-[11px] font-bold ${textSoft}`}>
            {state.label}: {state.value}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('/monitor')}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-kairo-green px-5 text-xs font-black text-[#052019] transition hover:bg-[#42e4ba]"
        >
          {isAr ? 'افتح الاستباق البيئي' : 'Open environmental foresight'}
          <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" />
        </button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ Icon, label, value, detail }) => (
          <div key={label} className={`rounded-2xl border p-4 ${border} ${isLight ? 'bg-white/70' : 'bg-black/20'}`}>
            <Icon className="h-4 w-4 text-emerald-500" />
            <p className={`mt-3 text-[10px] font-bold ${textSoft}`}>{label}</p>
            <p className={`mt-1 text-lg font-black ${textMain}`}>{value}</p>
            <p className={`mt-1 text-[10px] leading-5 ${textSoft}`}>{detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

/** Comparison and proof tools layered on top of the results. */
export const ToolsSection = ({
  theme,
  isAr,
  currentLanguage,
  capabilities,
  onNavigate,
}: {
  theme: DashboardTheme;
  isAr: boolean;
  currentLanguage: 'ar' | 'en';
  capabilities: KairoCapability[];
  onNavigate: (path: string) => void;
}) => {
  const { border, surface, textMain, textSub, textSoft } = theme;
  return (
    <section className="mt-8 grid gap-4 md:grid-cols-2">
      {capabilities.map((capability) => {
        const Icon = capabilityIcons[capability.id];
        return (
          <article key={capability.id} className={`kairo-analysis-panel rounded-[1.8rem] border p-6 ${border} ${surface}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
                <Icon className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-violet-400">
                {localize(TIER_LABELS[capability.tier], currentLanguage)}
              </span>
            </div>
            <h3 className={`mt-4 text-lg font-black ${textMain}`}>{localize(capability.title, currentLanguage)}</h3>
            <p className={`mt-2 text-xs leading-6 ${textSub}`}>{localize(capability.purpose, currentLanguage)}</p>
            <button
              type="button"
              onClick={() => onNavigate(capability.path)}
              className={`mt-5 inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-[11px] font-black ${border} ${textMain}`}
            >
              {isAr ? 'افتح الأداة' : 'Open tool'}
              <ArrowUpRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
            </button>
          </article>
        );
      })}

      <article className={`kairo-analysis-panel rounded-[1.8rem] border p-6 ${border} ${surface}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-500">
            {isAr ? 'إثبات الأثر' : 'Proof of impact'}
          </span>
        </div>
        <h3 className={`mt-4 text-lg font-black ${textMain}`}>
          {isAr ? 'أثبت النتيجة قبل/بعد' : 'Prove the before/after result'}
        </h3>
        <p className={`mt-2 text-xs leading-6 ${textSub}`}>
          {isAr
            ? 'سجّل خط الأساس ثم القياس اللاحق، ودع KAIRO يفصل بين القياس والتقدير وحدود الاستدلال.'
            : 'Record a baseline and a follow-up measurement, and let KAIRO separate measurement, estimation, and inference limits.'}
        </p>
        <button
          type="button"
          onClick={() => onNavigate('/proof')}
          className={`mt-5 inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-[11px] font-black ${border} ${textMain}`}
        >
          {isAr ? 'افتح إثبات الأثر' : 'Open proof of impact'}
          <ArrowUpRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
        </button>
        <p className={`mt-4 text-[10px] ${textSoft}`}>
          {isAr ? 'يفتح لك مقارنة صريحة بين القياس والتقدير.' : 'An explicit comparison between measurement and estimation.'}
        </p>
      </article>
    </section>
  );
};

export const AudienceLedgerSection = ({
  theme,
  currentLanguage,
  audience,
  onAudienceChange,
  selectedAudience,
  filteredCapabilities,
  capabilityStates,
  onNavigate,
}: {
  theme: DashboardTheme;
  currentLanguage: 'ar' | 'en';
  audience: AudienceId;
  onAudienceChange: (id: AudienceId) => void;
  selectedAudience: AudienceProfile;
  filteredCapabilities: KairoCapability[];
  capabilityStates: Record<string, CapabilityState>;
  onNavigate: (path: string) => void;
}) => {
  const { isAr, isLight, border, textMain, textSub, textSoft } = theme;
  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
        <div>
          <span className="kairo-eyebrow">
            <Target className="h-3.5 w-3.5" />
            {isAr ? 'اختر طريقة العرض' : 'Choose your view'}
          </span>
          <h2 className={`mt-5 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl ${textMain}`}>
            {localize(selectedAudience.label, currentLanguage)}
          </h2>
          <p className={`mt-3 max-w-xl text-sm leading-7 ${textSub}`}>
            {localize(selectedAudience.description, currentLanguage)}
          </p>
        </div>

        <div
          className={`flex gap-2 overflow-x-auto rounded-2xl border p-2 ${border} ${
            isLight ? 'bg-white/70' : 'bg-black/20'
          }`}
          role="tablist"
          aria-label={isAr ? 'اختيار الفئة المستهدفة' : 'Select target audience'}
        >
          {audienceProfiles.map((profile) => {
            const Icon = audienceIcons[profile.id];
            const active = audience === profile.id;
            return (
              <button
                key={profile.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onAudienceChange(profile.id)}
                className={`flex min-h-12 shrink-0 items-center gap-2 rounded-xl px-3.5 text-xs font-extrabold transition sm:px-4 ${
                  active
                    ? 'bg-kairo-green text-[#052019] shadow-sm'
                    : `${textSub} ${isLight ? 'hover:bg-slate-100' : 'hover:bg-white/[0.055]'}`
                }`}
              >
                <Icon className="h-4 w-4" />
                {localize(profile.shortLabel, currentLanguage)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="kairo-data-table-shell mt-6" role="region" aria-label={isAr ? 'سجل نتائج خصائص كايرو' : 'Kairo capability results ledger'} tabIndex={0}>
        <table className="kairo-data-table">
          <thead>
            <tr>
              <th>{isAr ? 'الخاصية' : 'Capability'}</th>
              <th>{isAr ? 'الحالة' : 'Status'}</th>
              <th>{isAr ? 'النتيجة الحالية' : 'Current result'}</th>
              <th>{isAr ? 'التقييم' : 'Score'}</th>
              <th>{isAr ? 'أساس النتيجة' : 'Evidence basis'}</th>
              <th><span className="sr-only">{isAr ? 'الإجراء' : 'Action'}</span></th>
            </tr>
          </thead>
          <tbody>
            {filteredCapabilities.map((capability) => {
              const state = capabilityStates[capability.id];
              const Icon = capabilityIcons[capability.id];
              return (
                <tr key={`ledger-${capability.id}`}>
                  <td>
                    <div className="flex min-w-48 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-kairo-green/10 text-kairo-green">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-extrabold">{localize(capability.title, currentLanguage)}</p>
                          <span
                            title={localize(capability.tierReason, currentLanguage)}
                            className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                              capability.tier === 'core'
                                ? 'bg-kairo-green/15 text-kairo-green'
                                : capability.tier === 'support'
                                  ? isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/5 text-slate-400'
                                  : 'bg-violet-500/10 text-violet-400'
                            }`}
                          >
                            {localize(TIER_LABELS[capability.tier], currentLanguage)}
                          </span>
                        </div>
                        <p className={`mt-1 max-w-56 text-[10px] ${textSoft}`}>{localize(capability.purpose, currentLanguage)}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`kairo-status-pill ${state.ready ? 'text-emerald-500' : textSoft}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${state.ready ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {state.ready ? (isAr ? 'جاهزة' : 'Ready') : (isAr ? 'لم تبدأ' : 'Not started')}
                    </span>
                  </td>
                  <td className="font-extrabold">{state.value}</td>
                  <td>
                    {state.score !== undefined ? (
                      <div className="min-w-32">
                        <div className="mb-2 flex items-center justify-between gap-3 text-[11px] font-black">
                          <span>{Math.round(state.score)}/100</span>
                          <span className={textSoft}>{Math.round(state.score)}%</span>
                        </div>
                        <div className="kairo-score-track">
                          <div className="kairo-score-fill" style={{ width: `${Math.max(0, Math.min(100, state.score))}%` }} />
                        </div>
                      </div>
                    ) : (
                      <span className={textSoft}>—</span>
                    )}
                  </td>
                  <td><p className={`max-w-64 text-[11px] leading-5 ${textSub}`}>{state.evidence}</p></td>
                  <td>
                    <button
                      type="button"
                      onClick={() => onNavigate(capability.path)}
                      className="inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-full border border-kairo-green/20 bg-kairo-green/[0.07] px-4 text-[11px] font-black text-kairo-green transition hover:bg-kairo-green/15"
                    >
                      {state.ready ? (isAr ? 'عرض النتيجة' : 'View result') : (isAr ? 'ابدأ' : 'Start')}
                      <ArrowUpRight className={`h-3.5 w-3.5 ${theme.dir === 'rtl' ? '-scale-x-100' : ''}`} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export const CapabilityCardsSection = ({
  theme,
  currentLanguage,
  reveal,
  filteredCapabilities,
  capabilityStates,
  onNavigate,
}: {
  theme: DashboardTheme;
  currentLanguage: 'ar' | 'en';
  reveal: DashboardReveal;
  filteredCapabilities: KairoCapability[];
  capabilityStates: Record<string, CapabilityState>;
  onNavigate: (path: string) => void;
}) => {
  const { isAr, isLight, border, surface, textMain, textSub, textSoft } = theme;
  const coreGroup = filteredCapabilities.filter((capability) => capability.tier === 'core');
  const supportGroup = filteredCapabilities.filter((capability) => capability.tier === 'support');
  const toolGroup = filteredCapabilities.filter((capability) => capability.tier === 'tool');
  const groups: Array<{ id: string; title: string; note: string; items: KairoCapability[] }> = [
    {
      id: 'core',
      title: isAr ? 'الخواص الأساسية' : 'Core capabilities',
      note: isAr ? 'ابدأ من هنا: وقاية حية، ثم المياه والطاقة.' : 'Start here: live prevention, then water and energy.',
      items: coreGroup,
    },
    {
      id: 'support',
      title: isAr ? 'خواص مساندة' : 'Support capabilities',
      note: isAr ? 'توسّع الصورة حسب احتياجك ونمط حياتك.' : 'Extend the picture to match your needs and daily pattern.',
      items: supportGroup,
    },
    {
      id: 'tool',
      title: isAr ? 'أدوات القرار' : 'Decision tools',
      note: isAr ? 'تقارن الخيارات فوق نتائجك الحالية.' : 'Compare options on top of your current results.',
      items: toolGroup,
    },
  ].filter((group) => group.items.length > 0);

  return (
    <div className="mt-6 space-y-8">
      {groups.map((group) => (
        <div key={group.id}>
          <div className={`mb-3 flex flex-wrap items-center gap-3 border-b pb-3 ${border}`}>
            <h3 className={`text-lg font-black ${textMain}`}>{group.title}</h3>
            <span className={`text-[11px] font-bold ${textSub}`}>{group.note}</span>
            <span className={`ms-auto rounded-full border px-2.5 py-1 text-[10px] font-black ${border} ${textSub}`}>
              {group.items.length}
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {group.items.map((capability, index) => {
        const Icon = capabilityIcons[capability.id];
        const state = capabilityStates[capability.id];
        const accent = accentClasses[capability.accent];
        return (
          <MotionDiv
            key={capability.id}
            {...reveal}
            transition={{ ...reveal.transition, delay: (index % 3) * 0.055 }}
            className={`kairo-analysis-panel group relative flex min-h-[410px] flex-col overflow-hidden rounded-[1.9rem] border p-5 sm:p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(0,0,0,.16)] ${border} ${surface} ${accent.border}`}
          >
            <div className={`absolute inset-x-0 top-0 h-1 ${accent.soft}`} />
            <span className={`pointer-events-none absolute end-5 top-14 text-6xl font-black opacity-[0.035] ${textMain}`}>
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="flex items-start justify-between gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent.soft} ${accent.icon}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span
                title={localize(capability.tierReason, currentLanguage)}
                className={`me-auto rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${
                  capability.tier === 'core'
                    ? 'bg-kairo-green/15 text-kairo-green'
                    : capability.tier === 'support'
                      ? isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/5 text-slate-400'
                      : 'bg-violet-500/10 text-violet-400'
                }`}
              >
                {localize(TIER_LABELS[capability.tier], currentLanguage)}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${
                  state.ready
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : isLight
                      ? 'bg-slate-100 text-slate-500'
                      : 'bg-white/5 text-slate-500'
                }`}
              >
                {state.ready
                  ? isAr
                    ? 'نتيجة متاحة'
                    : 'Ready'
                  : isAr
                    ? 'لم يبدأ'
                    : 'Start'}
              </span>
            </div>

            <h3 className={`mt-6 text-xl font-extrabold ${textMain}`}>
              {localize(capability.title, currentLanguage)}
            </h3>
            <p className={`mt-3 text-sm leading-6 ${textSub}`}>
              {localize(capability.shortDescription, currentLanguage)}
            </p>

            <div className={`mt-5 rounded-2xl border p-4 ${border} ${isLight ? 'bg-slate-50/80' : 'bg-black/20'}`}>
              <p className={`text-[10px] font-black uppercase tracking-[.14em] ${accent.icon}`}>
                {isAr ? 'الفائدة العملية' : 'Practical value'}
              </p>
              <p className={`mt-2 text-xs leading-5 ${textSub}`}>
                {localize(capability.purpose, currentLanguage)}
              </p>
            </div>

            <div className={`mt-4 rounded-2xl border p-4 ${border} ${state.ready ? accent.soft : isLight ? 'bg-white' : 'bg-white/[0.02]'}`}>
              <div className="flex items-end justify-between gap-4">
                <div>
                <p className={`text-[10px] font-bold ${textSoft}`}>{state.label}</p>
                  <p className={`mt-1 text-lg font-black ${textMain}`}>{state.value}</p>
                </div>
                {state.ready ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <CircleGauge className={`h-5 w-5 ${textSoft}`} />
                )}
              </div>
              {state.score !== undefined && (
                <div className={`kairo-score-track mt-3 h-1.5 overflow-hidden rounded-full ${isLight ? 'bg-slate-200' : 'bg-white/10'}`}>
                  <div
                    className="kairo-score-fill h-full rounded-full bg-kairo-green transition-[width] duration-700"
                    style={{ width: `${Math.max(4, Math.min(100, state.score))}%` }}
                  />
                </div>
              )}
              <p className={`mt-3 text-[10px] leading-5 ${textSoft}`}>{state.evidence}</p>
            </div>

            <div className="mt-4">
              <p className={`text-[9px] font-black uppercase tracking-wider ${textSoft}`}>
                {isAr ? 'النتيجة التي ستحصل عليها' : 'What you will get'}
              </p>
              <p className={`mt-1.5 line-clamp-2 text-[11px] leading-5 ${textSub}`}>
                {localize(capability.outcome, currentLanguage)}
              </p>
            </div>

            <div className="mt-auto flex items-end justify-between gap-4 pt-6">
              <div>
                <p className={`mb-2 text-[9px] font-black uppercase tracking-wider ${textSoft}`}>
                  {isAr ? 'يخدم أيضًا' : 'Also serves'}
                </p>
                <div className="flex -space-x-1 rtl:space-x-reverse">
                  {capability.audiences.slice(0, 5).map((audienceId) => {
                    const profile = getAudienceProfile(audienceId);
                    const AudienceIcon = audienceIcons[audienceId];
                    return profile ? (
                      <span
                        key={audienceId}
                        title={localize(profile.label, currentLanguage)}
                        className={`flex h-7 w-7 items-center justify-center rounded-full border ${border} ${
                          isLight ? 'bg-white' : 'bg-[#10201b]'
                        }`}
                      >
                        <AudienceIcon className={`h-3 w-3 ${textSub}`} />
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate(capability.path)}
                className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-[11px] font-extrabold transition ${border} ${textMain} ${
                  isLight ? 'hover:bg-slate-50' : 'hover:bg-white/[0.055]'
                }`}
                aria-label={`${isAr ? 'فتح' : 'Open'} ${localize(capability.title, currentLanguage)}`}
              >
                {state.ready
                  ? isAr
                    ? 'راجع النتيجة'
                    : 'Review result'
                  : isAr
                    ? 'ابدأ الآن'
                    : 'Start now'}
                <ArrowUpRight className={`h-3.5 w-3.5 ${accent.icon} ${theme.dir === 'rtl' ? '-scale-x-100' : ''}`} />
              </button>
            </div>
          </MotionDiv>
        );
      })}
          </div>
        </div>
      ))}
    </div>
  );
};

export const PathSection = ({
  theme,
  currentLanguage,
  selectedAudience,
  reveal,
}: {
  theme: DashboardTheme;
  currentLanguage: 'ar' | 'en';
  selectedAudience: AudienceProfile;
  reveal: DashboardReveal;
}) => {
  const { isAr, isLight, border, surface, textMain, textSub } = theme;
  return (
    <MotionDiv
      {...reveal}
      className={`mt-10 grid gap-8 rounded-[2rem] border p-6 sm:p-8 lg:grid-cols-[.8fr_1.2fr] ${border} ${surface}`}
    >
      <div>
        <span className="kairo-eyebrow">{isAr ? 'مسارك داخل Kairo' : 'Your path through Kairo'}</span>
        <h2 className={`mt-5 text-3xl font-semibold tracking-[-0.035em] ${textMain}`}>
          {localize(selectedAudience.label, currentLanguage)}
        </h2>
        <p className={`mt-4 text-sm leading-7 ${textSub}`}>
          {localize(selectedAudience.value, currentLanguage)}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            Icon: Target,
            title: isAr ? '1. ابدأ من سؤالك' : '1. Start with your question',
            text: isAr ? 'اختار الموضوع اللي يهمك: مياه، غذاء، طاقة، تنقل، هواء أو مخلفات.' : 'Choose what matters now: water, food, energy, mobility, air, or waste.',
          },
          {
            Icon: CircleGauge,
            title: isAr ? '2. أدخل الأساسيات' : '2. Add the essentials',
            text: isAr ? 'دخل أقل قدر من البيانات، وKairo هيشرح لك الافتراضات ونوع كل رقم.' : 'Provide the minimum data; Kairo explains assumptions and every value type.',
          },
          {
            Icon: Route,
            title: isAr ? '3. خُد خطوة وتابعها' : '3. Act and track',
            text: isAr ? 'اختار إجراءً واقعيًا، احفظ التقرير، وارجع قارن أثر القرار بعد التنفيذ.' : 'Choose a realistic action, save the report, and compare impact after implementation.',
          },
        ].map(({ Icon, title, text }) => (
          <div key={title} className={`rounded-2xl border p-5 ${border} ${isLight ? 'bg-slate-50/70' : 'bg-black/20'}`}>
            <Icon className="h-4 w-4 text-kairo-green" />
            <h3 className={`mt-4 text-sm font-extrabold ${textMain}`}>{title}</h3>
            <p className={`mt-2 text-xs leading-5 ${textSub}`}>{text}</p>
          </div>
        ))}
      </div>
    </MotionDiv>
  );
};
