import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  CheckCircle2,
  CircleGauge,
  Droplet,
  Leaf,
  LocateFixed,
  Route,
  ShieldCheck,
  Sparkles,
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

export const ForesightSection = ({
  isAr,
  dir,
  currentLanguage,
  earlyWarningData,
  reveal,
}: {
  isAr: boolean;
  dir: string;
  currentLanguage: 'ar' | 'en';
  earlyWarningData: EarlyWarningSnapshot | null;
  reveal: DashboardReveal;
}) => (
  <MotionDiv
    {...reveal}
    className="relative mt-6 overflow-hidden rounded-[2rem] border border-emerald-400/20 bg-[radial-gradient(circle_at_top_right,rgba(43,212,167,0.18),transparent_40%),linear-gradient(135deg,#09231c,#07110f)] p-6 text-white shadow-[0_28px_80px_rgba(0,0,0,.2)] sm:p-8 lg:p-10"
  >
    <div className="pointer-events-none absolute -end-20 -top-28 h-80 w-80 rounded-full border border-emerald-400/15" />
    <div className="relative grid gap-9 xl:grid-cols-[1.05fr_.95fr]">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-2 text-[10px] font-black uppercase tracking-[.15em] text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" />
            {isAr ? 'خاصية مدمجة في المتابعة' : 'Integrated dashboard capability'}
          </span>
          <span className="rounded-full border border-white/10 px-3 py-2 text-[10px] font-bold text-slate-300">
            {isAr ? 'بيانات حية + مؤشرات مفسّرة' : 'Live data + explainable indicators'}
          </span>
        </div>
        <h2 className="mt-6 text-3xl font-black tracking-[-0.035em] sm:text-5xl">
          {isAr ? 'الاستباق البيئي' : 'Environmental foresight'}
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
          {isAr
            ? 'خاصية متعددة الأهداف تتابع تدهور جودة الهواء المتوقع، وترتب أولوية فحص مؤشرات شبكة المياه، وتربط النتيجة بالموقع ومستوى الثقة قبل اتخاذ الإجراء.'
            : 'A multi-purpose capability that anticipates air-quality deterioration, prioritizes water-network screening, and connects results to location and confidence before action.'}
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
            <p className="text-[10px] font-black uppercase tracking-[.14em] text-emerald-300">
              {isAr ? 'الغرض' : 'Purpose'}
            </p>
            <p className="mt-2 text-sm leading-6 text-white">
              {isAr
                ? 'منح وقت مبكر للوقاية، الفحص الميداني، حماية الفئات الحساسة، وتوجيه الموارد.'
                : 'Create time for prevention, field screening, protection of sensitive groups, and resource allocation.'}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
            <p className="text-[10px] font-black uppercase tracking-[.14em] text-emerald-300">
              {isAr ? 'ما الذي ستراه؟' : 'What you will see'}
            </p>
            <p className="mt-2 text-sm leading-6 text-white">
              {isAr
                ? 'توقع هواء 24 ساعة، مؤشر مياه، دقة الموقع، حداثة البيانات، والعوامل المؤثرة.'
                : 'A 24-hour air forecast, water index, location accuracy, data freshness, and result drivers.'}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-3 text-[10px] font-black uppercase tracking-[.14em] text-slate-400">
            {isAr ? 'الفئات المستهدفة' : 'Target audiences'}
          </p>
          <div className="flex flex-wrap gap-2">
            {audienceProfiles.map((profile) => (
              <span
                key={profile.id}
                className="rounded-full border border-white/10 bg-black/15 px-3 py-1.5 text-[10px] font-bold text-slate-200"
              >
                {localize(profile.shortLabel, currentLanguage)}
              </span>
            ))}
          </div>
        </div>

        <Link
          to="/monitor"
          className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-kairo-green px-6 text-sm font-extrabold text-[#052019]"
        >
          {isAr ? 'افتح التحليل التفصيلي' : 'Open detailed analysis'}
          <ArrowUpRight className={`h-4 w-4 ${dir === 'rtl' ? '-scale-x-100' : ''}`} />
        </Link>
      </div>

      <div className="grid content-start gap-3 sm:grid-cols-2">
        {[
          {
            Icon: Wind,
            label: isAr ? 'توقع الهواء' : 'Air outlook',
            value: earlyWarningData?.air?.peakAqi
              ? `${Math.round(earlyWarningData.air.peakAqi)} AQI`
              : isAr
                ? 'يحتاج تحديثًا'
                : 'Needs refresh',
            detail: isAr ? 'أعلى قيمة متوقعة خلال 24 ساعة' : 'Expected 24-hour peak',
          },
          {
            Icon: Droplet,
            label: isAr ? 'مؤشر المياه' : 'Water indicator',
            value:
              earlyWarningData?.water?.score !== undefined
                ? `${Math.round(earlyWarningData.water.score)}/100`
                : isAr
                  ? 'يحتاج مدخلات'
                  : 'Needs input',
            detail: isAr ? 'ترتيب أولوية الفحص' : 'Inspection-priority index',
          },
          {
            Icon: LocateFixed,
            label: isAr ? 'سياق الموقع' : 'Location context',
            value: earlyWarningData?.coordinates
              ? isAr
                ? 'متاح'
                : 'Available'
              : isAr
                ? 'اختياري'
                : 'Optional',
            detail: isAr ? 'يعمل بإذن المستخدم' : 'Runs with user consent',
          },
          {
            Icon: ShieldCheck,
            label: isAr ? 'اكتمال الأدلة' : 'Evidence confidence',
            value:
              earlyWarningData?.water?.confidence !== undefined
                ? `${Math.round(earlyWarningData.water.confidence)}%`
                : '—',
            detail: isAr ? 'يعرض حدود النتيجة بوضوح' : 'Makes result limits visible',
          },
        ].map(({ Icon, label, value, detail }) => (
          <div key={label} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
            <Icon className="h-5 w-5 text-emerald-300" />
            <p className="mt-5 text-xs font-bold text-slate-400">{label}</p>
            <p className="mt-2 text-xl font-black text-white">{value}</p>
            <p className="mt-2 text-[11px] leading-5 text-slate-500">{detail}</p>
          </div>
        ))}
      </div>
    </div>
  </MotionDiv>
);

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
