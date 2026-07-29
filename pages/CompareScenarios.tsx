import React, { useEffect, useMemo, useState } from 'react';
import { Button, Chip, Meter } from '@heroui/react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Cloud,
  CloudOff,
  Coins,
  Droplet,
  FlaskConical,
  Gauge,
  GitCompare,
  Leaf,
  Loader2,
  Plus,
  Recycle,
  RefreshCw,
  Save,
  Trash2,
  Truck,
  Utensils,
  Wind,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type {
  Scenario,
  ScenarioComparisonAnalysis,
  ScenarioLevers,
} from '../types';
import {
  buildCurrentScenarioBaseline,
  calculateScenarioOutcomes,
  compareScenariosAgent,
  createScenario,
  deleteScenario,
  getScenarios,
  saveScenario,
} from '../services/ScenarioLab';
import { useApp } from '../contexts/AppContext';
import CapabilityContext from '../components/CapabilityContext';
import ModuleToolbar from '../components/ModuleToolbar';
import { audienceProfiles, localize, type AudienceId } from '../config/kairoCapabilities';
import { getSupabaseConnectionState } from '../utils/supabase';

const MotionDiv = motion.div as any;

const DEFAULT_LEVERS: ScenarioLevers = {
  waterReductionPct: 15,
  energyReductionPct: 12,
  foodWasteReductionPct: 20,
  mobilityShiftPct: 10,
  circularityPct: 25,
  investmentEgp: 0,
};

const leverDefinitions: Array<{
  key: Exclude<keyof ScenarioLevers, 'investmentEgp'>;
  icon: React.ReactNode;
  ar: string;
  en: string;
  color: string;
}> = [
  {
    key: 'waterReductionPct',
    icon: <Droplet />,
    ar: 'خفض فاقد المياه',
    en: 'Water-loss reduction',
    color: 'text-blue-500',
  },
  {
    key: 'energyReductionPct',
    icon: <Zap />,
    ar: 'رفع كفاءة الطاقة',
    en: 'Energy-efficiency gain',
    color: 'text-amber-500',
  },
  {
    key: 'foodWasteReductionPct',
    icon: <Utensils />,
    ar: 'خفض هدر الغذاء',
    en: 'Food-waste reduction',
    color: 'text-emerald-500',
  },
  {
    key: 'mobilityShiftPct',
    icon: <Truck />,
    ar: 'تحول التنقل',
    en: 'Mobility shift',
    color: 'text-violet-500',
  },
  {
    key: 'circularityPct',
    icon: <Recycle />,
    ar: 'زيادة الاستخدام الدائري',
    en: 'Circular-use gain',
    color: 'text-cyan-500',
  },
];

const CompareScenarios: React.FC = () => {
  const { theme, dir, language } = useApp();
  const isLight = theme === 'light';
  const isAr = language === 'ar';
  const currentLanguage = isAr ? 'ar' : 'en';
  const reduceMotion = useReducedMotion();

  const [baseline, setBaseline] = useState(() => buildCurrentScenarioBaseline());
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [name, setName] = useState('');
  const [audience, setAudience] = useState<AudienceId>('individual');
  const [horizonMonths, setHorizonMonths] = useState(12);
  const [levers, setLevers] = useState<ScenarioLevers>(DEFAULT_LEVERS);
  const [loadingScenarios, setLoadingScenarios] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ScenarioComparisonAnalysis | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [cloudConnected, setCloudConnected] = useState(false);

  const pageBg = isLight ? 'bg-[#f5f8f6]' : 'bg-[#07110f]';
  const textMain = isLight ? 'text-slate-950' : 'text-white';
  const textSub = isLight ? 'text-slate-600' : 'text-slate-400';
  const textSoft = isLight ? 'text-slate-500' : 'text-slate-500';
  const border = isLight ? 'border-slate-900/[0.09]' : 'border-white/[0.09]';
  const surface = isLight ? 'bg-white/82' : 'bg-white/[0.035]';

  useEffect(() => {
    let active = true;
    void Promise.all([getScenarios(), getSupabaseConnectionState()])
      .then(([savedScenarios, connection]) => {
        if (!active) return;
        setScenarios(savedScenarios);
        setCloudConnected(connection.connected);
      })
      .finally(() => {
        if (active) setLoadingScenarios(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const preview = useMemo(
    () => calculateScenarioOutcomes(baseline, levers, horizonMonths),
    [baseline, horizonMonths, levers],
  );

  const evidencePercent = Math.round((baseline.connectedModules / 5) * 100);
  const canSave = name.trim().length > 0 && baseline.connectedModules > 0 && !saving;

  const refreshBaseline = () => {
    setBaseline(buildCurrentScenarioBaseline());
    setMessage(isAr ? 'تم تحديث خط الأساس من أحدث تقاريرك.' : 'Baseline refreshed from your latest reports.');
  };

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setMessage(null);
    try {
      const scenario = createScenario({
        name,
        audience,
        horizonMonths,
        levers,
      });
      const saved = await saveScenario(scenario);
      setScenarios((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
      setName('');
      setMessage(
        saved.synced
          ? isAr
            ? 'تم حفظ السيناريو ومزامنته مع Supabase.'
            : 'Scenario saved and synced with Supabase.'
          : isAr
            ? 'تم الحفظ على الجهاز، وستُعاد محاولة المزامنة عند توفر قاعدة البيانات.'
            : 'Saved on this device; cloud sync will retry when the database is available.',
      );
      setCloudConnected(Boolean(saved.synced));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (scenario: Scenario) => {
    const confirmed = window.confirm(
      isAr ? `حذف سيناريو «${scenario.name}»؟` : `Delete “${scenario.name}”?`,
    );
    if (!confirmed) return;
    setScenarios(await deleteScenario(scenario.id));
    setAnalysis(null);
  };

  const handleCompare = async () => {
    if (scenarios.length < 2) return;
    setAnalyzing(true);
    setAnalysis(null);
    try {
      setAnalysis(await compareScenariosAgent(scenarios.slice(0, 6), currentLanguage));
    } finally {
      setAnalyzing(false);
    }
  };

  const reveal = {
    initial: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-50px' },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  };

  return (
    <main className={`min-h-screen pb-24 pt-28 transition-colors lg:pt-32 ${pageBg}`} dir={dir}>
      <div id="scenario-lab-report" className="kairo-shell">
        <CapabilityContext capabilityId="scenarios" />
        <ModuleToolbar
          hasData={baseline.connectedModules > 0 || scenarios.length > 0}
          exportTargetId="scenario-lab-report"
          exportFilename="Kairo_Environmental_Scenario_Lab"
          reportTitle={isAr ? 'مختبر السيناريوهات البيئية' : 'Environmental scenario lab'}
          reportSubtitle={
            isAr
              ? 'مقارنة قرارات المياه والطاقة والغذاء والتنقل والاستخدام الدائري قبل التنفيذ.'
              : 'Compare water, energy, food, mobility, and circular-use decisions before implementation.'
          }
          sdgs={[2, 6, 7, 11, 12, 13]}
        />

        <header className="grid items-end gap-6 lg:grid-cols-[1fr_auto]">
          <div className="max-w-4xl">
            <Chip color="accent" size="sm" variant="soft">
              <Chip.Label className="flex items-center gap-2">
                <FlaskConical className="h-3.5 w-3.5" />
                {isAr ? 'قرار قبل التنفيذ' : 'Decide before implementation'}
              </Chip.Label>
            </Chip>
            <h1 className={`mt-5 text-4xl font-semibold tracking-[-0.045em] sm:text-6xl ${textMain}`}>
              {isAr ? 'مختبر السيناريوهات البيئية' : 'Environmental scenario lab'}
            </h1>
            <p className={`mt-5 max-w-3xl text-base leading-8 sm:text-lg ${textSub}`}>
              {isAr
                ? 'اختبر كيف يؤثر خفض المياه والطاقة والغذاء وتغيير التنقل وزيادة الاستخدام الدائري على التكلفة والكربون والموارد، باستخدام نتائج Kairo المحفوظة كخط أساس.'
                : 'Test how water, energy, food, mobility, and circular-use changes affect cost, carbon, and resources using your saved Kairo results as the baseline.'}
            </p>
          </div>
          <div
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${border} ${surface}`}
            aria-live="polite"
          >
            {cloudConnected ? (
              <Cloud className="h-5 w-5 text-emerald-500" />
            ) : (
              <CloudOff className="h-5 w-5 text-amber-500" />
            )}
            <div>
              <p className={`text-xs font-black ${textMain}`}>
                {cloudConnected
                  ? isAr
                    ? 'Supabase متصل'
                    : 'Supabase connected'
                  : isAr
                    ? 'حفظ محلي احتياطي'
                    : 'Local fallback active'}
              </p>
              <p className={`mt-0.5 text-[10px] ${textSoft}`}>
                {isAr ? 'بيانات كل مستخدم معزولة' : 'User-owned data isolation'}
              </p>
            </div>
          </div>
        </header>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            {
              Icon: Droplet,
              label: isAr ? 'فاقد المياه الشهري' : 'Monthly water loss',
              value: `${Math.round(baseline.waterWasteLitersMonth).toLocaleString()} L`,
            },
            {
              Icon: Zap,
              label: isAr ? 'استهلاك الطاقة' : 'Energy consumption',
              value: `${Math.round(baseline.energyConsumptionKwhMonth).toLocaleString()} kWh`,
            },
            {
              Icon: Utensils,
              label: isAr ? 'هدر الغذاء المالي' : 'Food-waste cost',
              value: `${Math.round(baseline.foodCostLossEgpMonth).toLocaleString()} EGP`,
            },
            {
              Icon: Truck,
              label: isAr ? 'كربون التنقل' : 'Mobility carbon',
              value: `${baseline.mobilityCarbonKgMonth.toFixed(1)} kg`,
            },
            {
              Icon: Gauge,
              label: isAr ? 'اكتمال خط الأساس' : 'Baseline completeness',
              value: `${baseline.connectedModules}/5`,
            },
          ].map(({ Icon, label, value }) => (
            <div key={label} className={`rounded-[1.5rem] border p-5 ${border} ${surface}`}>
              <Icon className="h-5 w-5 text-kairo-green" />
              <p className={`mt-5 text-[11px] font-bold ${textSub}`}>{label}</p>
              <p className={`mt-2 text-xl font-black ${textMain}`}>{value}</p>
            </div>
          ))}
        </section>

        {baseline.connectedModules === 0 && (
          <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-amber-400/25 bg-amber-500/10 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div>
                <p className={`font-extrabold ${textMain}`}>
                  {isAr ? 'المختبر يحتاج خط أساس حقيقي' : 'The lab needs a real baseline'}
                </p>
                <p className={`mt-1 text-sm ${textSub}`}>
                  {isAr
                    ? 'شغّل خاصية واحدة على الأقل من الداشبورد، ثم ارجع لإنشاء سيناريو قابل للمقارنة.'
                    : 'Run at least one dashboard capability, then return to create a meaningful scenario.'}
                </p>
              </div>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-amber-500 px-5 text-xs font-black text-[#241500]"
            >
              {isAr ? 'افتح الداشبورد' : 'Open dashboard'}
              <ArrowUpRight className={`h-4 w-4 ${dir === 'rtl' ? '-scale-x-100' : ''}`} />
            </Link>
          </div>
        )}

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.08fr_.92fr]">
          <MotionDiv {...reveal} className={`rounded-[2rem] border p-5 sm:p-7 ${border} ${surface}`}>
            <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.14em] text-kairo-green">
                  {isAr ? '01 · اضبط الفرضيات' : '01 · Set assumptions'}
                </p>
                <h2 className={`mt-2 text-2xl font-black ${textMain}`}>
                  {isAr ? 'رافعات التغيير' : 'Change levers'}
                </h2>
              </div>
              <button
                type="button"
                onClick={refreshBaseline}
                className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-[11px] font-extrabold ${border} ${textMain}`}
              >
                <RefreshCw className="h-3.5 w-3.5 text-kairo-green" />
                {isAr ? 'تحديث خط الأساس' : 'Refresh baseline'}
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={`mb-2 block text-xs font-extrabold ${textMain}`}>
                  {isAr ? 'اسم السيناريو' : 'Scenario name'}
                </span>
                <input
                  value={name}
                  maxLength={80}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={isAr ? 'مثال: خطة توفير 12 شهرًا' : 'Example: 12-month efficiency plan'}
                  className={`min-h-12 w-full rounded-xl border px-4 text-sm outline-none transition focus:border-kairo-green ${border} ${
                    isLight ? 'bg-slate-50 text-slate-950' : 'bg-black/20 text-white'
                  }`}
                />
              </label>
              <label className="block">
                <span className={`mb-2 block text-xs font-extrabold ${textMain}`}>
                  {isAr ? 'الاستثمار المبدئي' : 'Upfront investment'}
                </span>
                <div className="relative">
                  <Coins className="absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-kairo-green" />
                  <input
                    type="number"
                    min={0}
                    max={10000000}
                    value={levers.investmentEgp}
                    onChange={(event) =>
                      setLevers((current) => ({
                        ...current,
                        investmentEgp: Math.max(0, Number(event.target.value) || 0),
                      }))
                    }
                    className={`min-h-12 w-full rounded-xl border pe-4 ps-11 text-sm outline-none transition focus:border-kairo-green ${border} ${
                      isLight ? 'bg-slate-50 text-slate-950' : 'bg-black/20 text-white'
                    }`}
                  />
                </div>
              </label>
            </div>

            <div className="mt-6">
              <p className={`mb-3 text-xs font-extrabold ${textMain}`}>
                {isAr ? 'الفئة التي سيخدمها السيناريو' : 'Audience served by this scenario'}
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
                {audienceProfiles.map((profile) => (
                  <button
                    key={profile.id}
                    type="button"
                    role="tab"
                    aria-selected={audience === profile.id}
                    onClick={() => setAudience(profile.id)}
                    className={`min-h-10 shrink-0 rounded-full px-4 text-[11px] font-extrabold transition ${
                      audience === profile.id
                        ? 'bg-kairo-green text-[#052019]'
                        : `border ${border} ${textSub}`
                    }`}
                  >
                    {localize(profile.shortLabel, currentLanguage)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className={`mb-3 text-xs font-extrabold ${textMain}`}>
                {isAr ? 'أفق القياس' : 'Measurement horizon'}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {[3, 6, 12, 24].map((months) => (
                  <button
                    key={months}
                    type="button"
                    onClick={() => setHorizonMonths(months)}
                    className={`min-h-11 rounded-xl text-xs font-black transition ${
                      horizonMonths === months
                        ? 'bg-violet-500 text-white'
                        : `border ${border} ${textSub}`
                    }`}
                  >
                    {months} {isAr ? 'شهر' : 'mo'}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-7 space-y-5">
              {leverDefinitions.map((definition) => (
                <label key={definition.key} className="block">
                  <div className="mb-2.5 flex items-center justify-between gap-4">
                    <span className={`flex items-center gap-2 text-xs font-extrabold ${textMain}`}>
                      <span className={`[&>svg]:h-4 [&>svg]:w-4 ${definition.color}`}>
                        {definition.icon}
                      </span>
                      {isAr ? definition.ar : definition.en}
                    </span>
                    <span className={`min-w-12 text-end font-mono text-sm font-black ${definition.color}`}>
                      {levers[definition.key]}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={60}
                    step={1}
                    value={levers[definition.key]}
                    onChange={(event) =>
                      setLevers((current) => ({
                        ...current,
                        [definition.key]: Number(event.target.value),
                      }))
                    }
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-300 accent-emerald-500 dark:bg-white/10"
                  />
                </label>
              ))}
            </div>
          </MotionDiv>

          <MotionDiv
            {...reveal}
            className="relative overflow-hidden rounded-[2rem] border border-emerald-400/20 bg-[radial-gradient(circle_at_top_right,rgba(43,212,167,.17),transparent_42%),linear-gradient(145deg,#0b291f,#07110f)] p-5 text-white sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.14em] text-emerald-300">
                  {isAr ? '02 · النتيجة المتوقعة' : '02 · Expected outcome'}
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  {isAr ? `أثر خلال ${horizonMonths} شهرًا` : `Impact over ${horizonMonths} months`}
                </h2>
              </div>
              <Leaf className="h-8 w-8 text-emerald-300" />
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3">
              {[
                {
                  Icon: Droplet,
                  label: isAr ? 'مياه محفوظة' : 'Water saved',
                  value: `${preview.waterSavedLiters.toLocaleString()} L`,
                },
                {
                  Icon: Zap,
                  label: isAr ? 'طاقة محفوظة' : 'Energy saved',
                  value: `${preview.energySavedKwh.toLocaleString()} kWh`,
                },
                {
                  Icon: Coins,
                  label: isAr ? 'توفير مالي' : 'Financial saving',
                  value: `${preview.financialSavingsEgp.toLocaleString()} EGP`,
                },
                {
                  Icon: Wind,
                  label: isAr ? 'كربون متجنب' : 'Carbon avoided',
                  value: `${preview.carbonAvoidedKg.toLocaleString()} kg`,
                },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <Icon className="h-4 w-4 text-emerald-300" />
                  <p className="mt-4 text-[10px] font-bold text-slate-400">{label}</p>
                  <p className="mt-1.5 text-base font-black text-white">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.055] p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  {isAr ? 'درجة الأثر' : 'Impact score'}
                </span>
                <span className="text-xl font-black text-emerald-300">{preview.impactScore}/100</span>
              </div>
              <Meter
                aria-label={isAr ? 'درجة الأثر المتوقعة' : 'Expected impact score'}
                value={preview.impactScore}
                minValue={0}
                maxValue={100}
                color="success"
                className="mt-3"
              />
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-xs">
                <span className="text-slate-400">{isAr ? 'فترة الاسترداد' : 'Payback'}</span>
                <strong className="text-white">
                  {preview.paybackMonths === null
                    ? isAr
                      ? 'تحتاج بيانات أكثر'
                      : 'Needs more data'
                    : preview.paybackMonths === 0
                      ? isAr
                        ? 'دون استثمار'
                        : 'No upfront cost'
                      : `${preview.paybackMonths} ${isAr ? 'شهر' : 'months'}`}
                </strong>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-[10px] font-bold">
                <span className="text-slate-400">{isAr ? 'اكتمال الأدلة' : 'Evidence completeness'}</span>
                <span className="text-white">{evidencePercent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-emerald-400" style={{ width: `${evidencePercent}%` }} />
              </div>
              <p className="mt-2 text-[10px] leading-5 text-slate-500">
                {isAr
                  ? 'النتائج تُحسب من التقارير المحفوظة فقط؛ لا نضيف خط أساس مصطنعًا.'
                  : 'Outcomes use saved reports only; no fabricated baseline is added.'}
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              isPending={saving}
              isDisabled={!canSave}
              onPress={handleSave}
              className="mt-6 w-full font-extrabold"
            >
              <Save className="h-4 w-4" />
              {isAr ? 'حفظ السيناريو' : 'Save scenario'}
            </Button>
          </MotionDiv>
        </section>

        {message && (
          <div
            role="status"
            className={`mt-5 rounded-xl border px-4 py-3 text-sm ${border} ${
              isLight ? 'bg-white text-slate-700' : 'bg-white/[0.035] text-slate-300'
            }`}
          >
            {message}
          </div>
        )}

        <section className="mt-14">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.14em] text-kairo-green">
                {isAr ? '03 · قارن البدائل' : '03 · Compare alternatives'}
              </p>
              <h2 className={`mt-2 text-3xl font-black ${textMain}`}>
                {isAr ? 'السيناريوهات المحفوظة' : 'Saved scenarios'}
              </h2>
              <p className={`mt-2 text-sm ${textSub}`}>
                {isAr
                  ? 'المقارنة تستخدم أحدث ستة سيناريوهات لتبقى واضحة وقابلة للقراءة.'
                  : 'Comparison uses the latest six scenarios to remain clear and readable.'}
              </p>
            </div>
            <Button
              variant="secondary"
              size="lg"
              isPending={analyzing}
              isDisabled={scenarios.length < 2}
              onPress={handleCompare}
              className="font-extrabold"
            >
              <GitCompare className="h-4 w-4" />
              {isAr ? 'قارن السيناريوهات' : 'Compare scenarios'}
            </Button>
          </div>

          {loadingScenarios ? (
            <div className={`mt-6 flex min-h-48 items-center justify-center rounded-2xl border ${border} ${surface}`}>
              <Loader2 className="h-6 w-6 animate-spin text-kairo-green" />
            </div>
          ) : scenarios.length === 0 ? (
            <div className={`mt-6 flex min-h-52 flex-col items-center justify-center rounded-[1.7rem] border p-8 text-center ${border} ${surface}`}>
              <Plus className="h-7 w-7 text-kairo-green" />
              <h3 className={`mt-4 font-extrabold ${textMain}`}>
                {isAr ? 'أنشئ أول سيناريو' : 'Create your first scenario'}
              </h3>
              <p className={`mt-2 max-w-md text-sm ${textSub}`}>
                {isAr
                  ? 'اضبط الرافعات بالأعلى، راجع الأثر المتوقع، ثم احفظ النتيجة.'
                  : 'Adjust the levers above, review the expected impact, then save the result.'}
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {scenarios.slice(0, 6).map((scenario, index) => (
                <MotionDiv
                  key={scenario.id}
                  {...reveal}
                  transition={{ ...reveal.transition, delay: (index % 3) * 0.05 }}
                  className={`rounded-[1.7rem] border p-5 ${border} ${surface}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[9px] font-black ${
                            scenario.synced
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-amber-500/10 text-amber-500'
                          }`}
                        >
                          {scenario.synced
                            ? isAr
                              ? 'سحابي'
                              : 'Cloud'
                            : isAr
                              ? 'محلي'
                              : 'Local'}
                        </span>
                        <span className={`text-[9px] font-bold ${textSoft}`}>
                          {scenario.horizonMonths} {isAr ? 'شهر' : 'months'}
                        </span>
                      </div>
                      <h3 className={`mt-3 text-lg font-black ${textMain}`}>{scenario.name}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(scenario)}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-500"
                      aria-label={isAr ? `حذف ${scenario.name}` : `Delete ${scenario.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    {[
                      [isAr ? 'الأثر' : 'Impact', `${scenario.outcomes.impactScore}/100`],
                      [
                        isAr ? 'التوفير' : 'Savings',
                        `${scenario.outcomes.financialSavingsEgp.toLocaleString()} EGP`,
                      ],
                      [
                        isAr ? 'المياه' : 'Water',
                        `${scenario.outcomes.waterSavedLiters.toLocaleString()} L`,
                      ],
                      [
                        isAr ? 'الكربون' : 'Carbon',
                        `${scenario.outcomes.carbonAvoidedKg.toLocaleString()} kg`,
                      ],
                    ].map(([label, value]) => (
                      <div key={label} className={`rounded-xl p-3 ${isLight ? 'bg-slate-50' : 'bg-black/20'}`}>
                        <p className={`text-[9px] font-bold ${textSoft}`}>{label}</p>
                        <p className={`mt-1 text-xs font-black ${textMain}`}>{value}</p>
                      </div>
                    ))}
                  </div>
                </MotionDiv>
              ))}
            </div>
          )}
        </section>

        <AnimatePresence>
          {analysis && (
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`mt-8 overflow-hidden rounded-[2rem] border ${border} ${surface}`}
            >
              <div className={`border-b p-6 sm:p-8 ${border} ${isLight ? 'bg-violet-50/70' : 'bg-violet-500/[0.07]'}`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-500">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[.14em] text-violet-500">
                      {isAr ? 'المسار الأكثر توازنًا' : 'Most balanced pathway'}
                    </p>
                    <h2 className={`mt-1 text-2xl font-black ${textMain}`}>
                      {scenarios.find((scenario) => scenario.id === analysis.optimal_scenario_id)?.name ??
                        (isAr ? 'المسار المقترح' : 'Recommended pathway')}
                    </h2>
                  </div>
                </div>
                <p className={`mt-5 max-w-4xl text-base leading-8 ${textSub}`}>{analysis.analysis_summary}</p>
              </div>

              <div className="grid gap-7 p-6 sm:p-8 lg:grid-cols-2">
                <div>
                  <h3 className={`font-extrabold ${textMain}`}>
                    {isAr ? 'الفروق الرئيسية' : 'Key differentiators'}
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {analysis.key_differentiators.map((item) => (
                      <li key={item} className={`flex gap-3 text-sm leading-6 ${textSub}`}>
                        <ArrowUpRight className={`mt-1 h-4 w-4 shrink-0 text-violet-500 ${dir === 'rtl' ? '-scale-x-100' : ''}`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className={`font-extrabold ${textMain}`}>
                    {isAr ? 'إجراءات عالية الأثر' : 'High-leverage actions'}
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {analysis.high_leverage_actions.map((action) => (
                      <span
                        key={action}
                        className={`rounded-full border px-3 py-2 text-xs font-bold ${border} ${textSub}`}
                      >
                        {action}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </MotionDiv>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};

export default CompareScenarios;
