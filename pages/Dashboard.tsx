import React, { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Chip, Meter } from '@heroui/react';
import { motion, useReducedMotion } from 'framer-motion';
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
import {
  Activity,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  CircleGauge,
  Droplet,
  FlaskConical,
  GraduationCap,
  HeartHandshake,
  Leaf,
  LocateFixed,
  MapPinned,
  Recycle,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  Truck,
  Users,
  Utensils,
  Wind,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type {
  CarbonAnalysisReport,
  EnergyAnalysisReport,
  EwasteAnalysisReport,
  ExposureAnalysis,
  FoodWasteAnalysisReport,
  MobilityIntelligenceReport,
  WaterAnalysisReport,
} from '../types';
import { useApp } from '../contexts/AppContext';
import ModuleToolbar from '../components/ModuleToolbar';
import EvidenceAndImpact, {
  type EvidencePassportItem,
} from '../components/EvidenceAndImpact';
import { usePersistentState } from '../utils/storage';
import {
  audienceProfiles,
  getAudienceProfile,
  kairoCapabilities,
  localize,
  type AudienceId,
  type CapabilityId,
} from '../config/kairoCapabilities';
import { upsertKairoProfile } from '../services/kairoDatabase';

const MotionDiv = motion.div as any;

interface DashboardProps {
  carbon: CarbonAnalysisReport | null;
  water: WaterAnalysisReport | null;
  food: FoodWasteAnalysisReport | null;
  exposure: ExposureAnalysis | null;
  ewaste: EwasteAnalysisReport | null;
  energy: EnergyAnalysisReport | null;
  transport: MobilityIntelligenceReport | null;
  onSystemReset: () => void;
}

interface EarlyWarningSnapshot {
  updatedAt?: string;
  coordinates?: { latitude: number; longitude: number } | null;
  air?: {
    currentAqi?: number;
    peakAqi?: number;
    level?: string;
  } | null;
  water?: {
    score?: number;
    level?: string;
    confidence?: number;
  } | null;
}

interface CapabilityState {
  ready: boolean;
  value: string;
  label: string;
  score?: number;
  evidence: string;
}

const capabilityIcons: Record<CapabilityId, LucideIcon> = {
  foresight: Activity,
  water: Droplet,
  food: Utensils,
  energy: Zap,
  mobility: Truck,
  exposure: Wind,
  ewaste: Recycle,
  scenarios: FlaskConical,
};

const audienceIcons: Record<AudienceId, LucideIcon> = {
  individual: Users,
  community: HeartHandshake,
  education: GraduationCap,
  business: Building2,
  government: MapPinned,
};

const accentClasses: Record<
  'emerald' | 'blue' | 'amber' | 'violet' | 'cyan',
  { icon: string; soft: string; border: string }
> = {
  emerald: {
    icon: 'text-emerald-500',
    soft: 'bg-emerald-500/10',
    border: 'group-hover:border-emerald-500/30',
  },
  blue: {
    icon: 'text-blue-500',
    soft: 'bg-blue-500/10',
    border: 'group-hover:border-blue-500/30',
  },
  amber: {
    icon: 'text-amber-500',
    soft: 'bg-amber-500/10',
    border: 'group-hover:border-amber-500/30',
  },
  violet: {
    icon: 'text-violet-500',
    soft: 'bg-violet-500/10',
    border: 'group-hover:border-violet-500/30',
  },
  cyan: {
    icon: 'text-cyan-500',
    soft: 'bg-cyan-500/10',
    border: 'group-hover:border-cyan-500/30',
  },
};

const Dashboard: React.FC<DashboardProps> = ({
  carbon,
  water,
  food,
  exposure,
  ewaste,
  energy,
  transport,
  onSystemReset,
}) => {
  const { theme, dir, language } = useApp();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [earlyWarningData] = usePersistentState<EarlyWarningSnapshot | null>(
    'kairo_early_warning',
    null,
  );
  const [audience, setAudience] = usePersistentState<AudienceId>(
    'kairo_audience',
    'individual',
  );

  const isLight = theme === 'light';
  const isAr = language === 'ar';
  const currentLanguage = isAr ? 'ar' : 'en';
  const pageBg = isLight ? 'bg-[#f5f8f6]' : 'bg-[#07110f]';
  const textMain = isLight ? 'text-slate-950' : 'text-white';
  const textSub = isLight ? 'text-slate-600' : 'text-slate-400';
  const textSoft = isLight ? 'text-slate-500' : 'text-slate-500';
  const border = isLight ? 'border-slate-900/[0.09]' : 'border-white/[0.09]';
  const surface = isLight ? 'bg-white/82' : 'bg-white/[0.035]';

  const totalCarbon =
    (carbon?.baseline?.monthly_total_kg_co2 || 0) +
    (energy?.metrics?.carbon_footprint_kg || 0) +
    (transport?.metrics?.monthly_carbon_kg || 0) +
    (food?.metrics?.methane_emissions_kg ? food.metrics.methane_emissions_kg / 12 : 0);

  const capabilityStates = useMemo<Record<CapabilityId, CapabilityState>>(
    () => ({
      foresight: earlyWarningData
        ? {
            ready: true,
            value: earlyWarningData.air?.peakAqi
              ? `${Math.round(earlyWarningData.air.peakAqi)} AQI`
              : `${Math.round(earlyWarningData.water?.score ?? 0)}/100`,
            label: isAr ? 'آخر قراءة استباقية' : 'Latest foresight reading',
            score: earlyWarningData.water?.confidence,
            evidence: isAr ? 'توقع ومؤشر حسب الموقع' : 'Location-aware forecast and indicator',
          }
        : {
            ready: false,
            value: isAr ? 'ابدأ تحديد الموقع' : 'Start location context',
            label: isAr ? 'لم تُنشأ قراءة بعد' : 'No reading created yet',
            evidence: isAr ? 'يحتاج إذن الموقع أو النطاق' : 'Needs location or scope',
          },
      water: water
        ? {
            ready: true,
            value: `${Math.round(water.metrics?.water_efficiency_score || 0)}/100`,
            label: isAr ? 'كفاءة المياه' : 'Water efficiency',
            score: water.metrics?.water_efficiency_score,
            evidence: isAr ? 'من بيانات الاستهلاك والشبكة' : 'From usage and network inputs',
          }
        : {
            ready: false,
            value: isAr ? 'ابدأ التحليل' : 'Start analysis',
            label: isAr ? 'لا توجد نتيجة محفوظة' : 'No saved result',
            evidence: isAr ? 'يحتاج بيانات الاستهلاك' : 'Needs consumption inputs',
          },
      food: food
        ? {
            ready: true,
            value: `${Number(food.metrics?.methane_emissions_kg || 0).toFixed(1)} kg CH₄`,
            label: isAr ? 'أثر الميثان' : 'Methane impact',
            score: food.metrics?.food_efficiency_score,
            evidence: isAr ? 'تقدير من سلوك الشراء والهدر' : 'Estimate from purchase and waste behavior',
          }
        : {
            ready: false,
            value: isAr ? 'ابدأ التحليل' : 'Start analysis',
            label: isAr ? 'لا توجد نتيجة محفوظة' : 'No saved result',
            evidence: isAr ? 'يحتاج نمط الشراء والهدر' : 'Needs purchase and waste pattern',
          },
      energy: energy
        ? {
            ready: true,
            value: `${Math.round(energy.metrics?.energy_efficiency_score || 0)}/100`,
            label: isAr ? 'كفاءة الطاقة' : 'Energy efficiency',
            score: energy.metrics?.energy_efficiency_score,
            evidence: isAr ? 'من الفاتورة والأجهزة والتشغيل' : 'From bill, devices, and operation',
          }
        : {
            ready: false,
            value: isAr ? 'ابدأ التحليل' : 'Start analysis',
            label: isAr ? 'لا توجد نتيجة محفوظة' : 'No saved result',
            evidence: isAr ? 'يحتاج فاتورة أو استهلاكًا' : 'Needs a bill or consumption',
          },
      mobility: transport
        ? {
            ready: true,
            value: `${Number(transport.metrics?.monthly_carbon_kg || 0).toFixed(1)} kg CO₂`,
            label: isAr ? 'أثر التنقل الشهري' : 'Monthly mobility impact',
            score: transport.scores?.mobility_efficiency,
            evidence: isAr ? 'تقدير من الرحلات والتكلفة والزمن' : 'Estimate from trips, cost, and time',
          }
        : {
            ready: false,
            value: isAr ? 'ابدأ التحليل' : 'Start analysis',
            label: isAr ? 'لا توجد نتيجة محفوظة' : 'No saved result',
            evidence: isAr ? 'يحتاج نمط الرحلات' : 'Needs commute pattern',
          },
      exposure: exposure
        ? {
            ready: true,
            value: `${Math.round(exposure.estimated_aqi || 0)} AQI`,
            label: isAr ? 'التعرض المقدّر' : 'Estimated exposure',
            evidence: isAr ? 'تقدير سياقي وليس قياس حساس محلي' : 'Contextual estimate, not a local sensor reading',
          }
        : {
            ready: false,
            value: isAr ? 'ابدأ التحليل' : 'Start analysis',
            label: isAr ? 'لا توجد نتيجة محفوظة' : 'No saved result',
            evidence: isAr ? 'يحتاج الموقع ونمط التعرض' : 'Needs location and exposure pattern',
          },
      ewaste: ewaste
        ? {
            ready: true,
            value: `${Math.round(
              ewaste.environmental_impact?.circular_economy_impact_score || 0,
            )}/100`,
            label: isAr ? 'أثر الاقتصاد الدائري' : 'Circular impact',
            score: ewaste.environmental_impact?.circular_economy_impact_score,
            evidence: isAr ? 'من حالة الجهاز وعمره' : 'From device condition and age',
          }
        : {
            ready: false,
            value: isAr ? 'قيّم جهازًا' : 'Assess a device',
            label: isAr ? 'لا توجد نتيجة محفوظة' : 'No saved result',
            evidence: isAr ? 'يحتاج بيانات الجهاز' : 'Needs device details',
          },
      scenarios: {
        ready: true,
        value: isAr ? 'جاهز للمقارنة' : 'Ready to compare',
        label: isAr ? 'لا يحتاج بيانات محفوظة' : 'No saved result required',
        evidence: isAr ? 'يستخدم النتائج المتاحة كخط أساس' : 'Uses available results as a baseline',
      },
    }),
    [earlyWarningData, energy, ewaste, exposure, food, isAr, transport, water],
  );

  const completedAnalyses = Object.entries(capabilityStates).filter(
    ([id, state]) => id !== 'scenarios' && state.ready,
  ).length;
  const filteredCapabilities = kairoCapabilities.filter((capability) =>
    capability.audiences.includes(audience),
  );
  const selectedAudience = getAudienceProfile(audience) ?? audienceProfiles[0];
  const scoreChartData = useMemo(
    () =>
      kairoCapabilities
        .map((capability) => ({
          id: capability.id,
          name: isAr
            ? {
                foresight: 'الاستباق البيئي',
                water: 'المياه',
                food: 'الغذاء',
                energy: 'الطاقة',
                mobility: 'التنقل',
                exposure: 'جودة الهواء',
                ewaste: 'الاقتصاد الدائري',
                scenarios: 'السيناريوهات',
              }[capability.id]
            : {
                foresight: 'Foresight',
                water: 'Water',
                food: 'Food',
                energy: 'Energy',
                mobility: 'Mobility',
                exposure: 'Air quality',
                ewaste: 'Circularity',
                scenarios: 'Scenarios',
              }[capability.id],
          value: Math.max(
            0,
            Math.min(100, Number(capabilityStates[capability.id].score || 0)),
          ),
          ready: capabilityStates[capability.id].ready,
        }))
        .filter((item) => item.ready && item.value > 0),
    [capabilityStates, isAr],
  );
  const costChartData = useMemo(
    () =>
      [
        {
          name: isAr ? 'المياه' : 'Water',
          value: Number(water?.metrics?.financial_loss_estimate_egp || 0),
          color: '#38bdf8',
        },
        {
          name: isAr ? 'الغذاء' : 'Food',
          value: Number(food?.metrics?.monthly_waste_cost || 0),
          color: '#fb923c',
        },
        {
          name: isAr ? 'الطاقة' : 'Energy',
          value: Number(energy?.metrics?.financial_loss_estimate_egp || 0),
          color: '#facc15',
        },
        {
          name: isAr ? 'التنقل' : 'Mobility',
          value: Number(transport?.metrics?.monthly_cost_egp || 0),
          color: '#a78bfa',
        },
      ].filter((item) => item.value > 0),
    [energy, food, isAr, transport, water],
  );

  const evidencePassportItems = useMemo<EvidencePassportItem[]>(() => {
    const sessionFreshness = isAr ? 'نتيجة الجلسة المحفوظة' : 'Saved session result';
    const waitingFreshness = isAr ? 'غير متاح حتى تشغيل التحليل' : 'Unavailable until analysis';
    const foresightFreshness = earlyWarningData?.updatedAt
      ? new Intl.DateTimeFormat(isAr ? 'ar-EG' : 'en-GB', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(new Date(earlyWarningData.updatedAt))
      : sessionFreshness;

    const metadata: Record<
      Exclude<CapabilityId, 'scenarios'>,
      Omit<EvidencePassportItem, 'title' | 'value' | 'ready' | 'score' | 'freshness'>
    > = {
      foresight: {
        id: 'foresight',
        kind: 'forecast',
        source: isAr
          ? 'توقعات الهواء العامة + بيانات الموقع بإذن المستخدم + ملف شبكة المياه'
          : 'Public air forecast + consent-led location + water-network profile',
        method: isAr
          ? 'توقع 24 ساعة وترتيب أولوية الفحص بعوامل معلنة'
          : '24-hour outlook and factor-based inspection prioritization',
        limitation: isAr
          ? 'توقع الهواء ليس حساسًا محليًا، ومؤشر المياه ليس احتمال عطل مؤكدًا'
          : 'Air is not a local sensor reading; water is not a confirmed failure probability',
        confidence: earlyWarningData?.water?.confidence,
      },
      water: {
        id: 'water',
        kind: 'user-derived',
        source: isAr
          ? 'بيانات الاستهلاك والفاتورة وحالة الشبكة التي أدخلها المستخدم'
          : 'User-provided usage, bill, and network-condition inputs',
        method: isAr
          ? 'حساب كفاءة وفاقد وأولوية فحص من المدخلات'
          : 'Efficiency, loss, and inspection-priority calculations from inputs',
        limitation: isAr
          ? 'يحتاج فحصًا ميدانيًا أو بيانات تدفق وضغط لتأكيد التسريب'
          : 'A field inspection or flow/pressure data is required to confirm a leak',
      },
      food: {
        id: 'food',
        kind: 'user-derived',
        source: isAr
          ? 'نمط الشراء والتخزين والاستهلاك والهدر المدخل'
          : 'Provided purchasing, storage, consumption, and waste pattern',
        method: isAr
          ? 'تحويل السلوك إلى تكلفة وأثر مياه وكربون وميثان تقديري'
          : 'Behavior-to-cost, water, carbon, and methane estimation',
        limitation: isAr
          ? 'يتحسن بوزن فعلي للهدر وفواتير شراء عبر فترة زمنية'
          : 'Improves with measured waste weight and purchase receipts over time',
      },
      energy: {
        id: 'energy',
        kind: 'user-derived',
        source: isAr
          ? 'الفاتورة واستهلاك الكهرباء والأجهزة وساعات التشغيل'
          : 'Bill, electricity use, devices, and operating hours',
        method: isAr
          ? 'حساب الكفاءة وفرص التوفير والانبعاثات من خط الأساس'
          : 'Baseline-based efficiency, savings, and emissions calculation',
        limitation: isAr
          ? 'التوفير المتوقع يحتاج فاتورة متابعة بعد تنفيذ الإجراء'
          : 'Expected savings require a follow-up bill after action',
      },
      mobility: {
        id: 'mobility',
        kind: 'user-derived',
        source: isAr
          ? 'نوع الرحلة والمسافة والتكرار والتكلفة والزمن'
          : 'Trip type, distance, frequency, cost, and time',
        method: isAr
          ? 'مقارنة شهرية للتكلفة والزمن وأثر الكربون'
          : 'Monthly cost, time, and carbon comparison',
        limitation: isAr
          ? 'النتيجة تعتمد على انتظام نمط الرحلات ومعاملات الانبعاث'
          : 'Result depends on commute regularity and emission factors',
      },
      exposure: {
        id: 'exposure',
        kind: 'contextual-estimate',
        source: isAr
          ? 'الموقع ونمط التعرض والبيانات البيئية السياقية'
          : 'Location, exposure pattern, and contextual environmental data',
        method: isAr
          ? 'تقدير التعرض حسب المكان والمدة وحساسية الفئة'
          : 'Place, duration, and audience-sensitivity exposure estimate',
        limitation: isAr
          ? 'ليس قياسًا طبيًا ولا قراءة حساس شخصي'
          : 'Not a medical measurement or personal sensor reading',
      },
      ewaste: {
        id: 'ewaste',
        kind: 'device-estimate',
        source: isAr
          ? 'هوية الجهاز وعمره وحالته ووصف الأعطال'
          : 'Device identity, age, condition, and fault description',
        method: isAr
          ? 'تقدير العمر المتبقي وأفضل مسار دائري وقيمة محتملة'
          : 'Remaining-life, circular-path, and potential-value estimate',
        limitation: isAr
          ? 'السعر ليس عرض سوق حيًا ويحتاج فحصًا فعليًا للجهاز'
          : 'Price is not a live market quote and requires physical inspection',
      },
    };

    return kairoCapabilities
      .filter((capability) => capability.id !== 'scenarios')
      .map((capability) => {
        const id = capability.id as Exclude<CapabilityId, 'scenarios'>;
        const state = capabilityStates[id];
        return {
          ...metadata[id],
          title: localize(capability.title, currentLanguage),
          value: state.value,
          ready: state.ready,
          score: state.score,
          freshness:
            id === 'foresight' && state.ready
              ? foresightFreshness
              : state.ready
                ? sessionFreshness
                : waitingFreshness,
        };
      });
  }, [capabilityStates, currentLanguage, earlyWarningData, isAr]);

  useEffect(() => {
    const syncTimer = window.setTimeout(() => {
      void upsertKairoProfile(audience, currentLanguage).catch(() => {
        // Local preferences remain available when cloud sync is unavailable.
      });
    }, 600);

    return () => window.clearTimeout(syncTimer);
  }, [audience, currentLanguage]);

  const reveal = {
    initial: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-55px' },
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  };

  return (
    <main
      id="environmental-dashboard"
      className={`min-h-screen pb-24 pt-28 transition-colors lg:pt-32 ${pageBg}`}
      dir={dir}
    >
      <div className="kairo-shell">
        <ModuleToolbar
          hasData={completedAnalyses > 0}
          onReset={onSystemReset}
          exportTargetId="environmental-dashboard"
          exportFilename="kairo_environmental_dashboard"
          reportTitle={isAr ? 'المتابعة البيئية الموحدة' : 'Unified environmental dashboard'}
          reportSubtitle={
            isAr
              ? 'ملخص مترابط لحالة الموارد والمخاطر والإجراءات داخل Kairo.'
              : 'A connected summary of resource, risk, and action signals across Kairo.'
          }
          sdgs={[2, 3, 6, 7, 11, 12, 13]}
        />

        <header className="mt-5 grid items-end gap-7 lg:grid-cols-[1fr_auto]">
          <div className="max-w-4xl">
            <Chip color="success" size="sm" variant="soft">
              <Chip.Label className="flex items-center gap-2">
                <Leaf className="h-3.5 w-3.5" />
                {isAr ? 'نقطة البداية في Kairo' : 'Your starting point in Kairo'}
              </Chip.Label>
            </Chip>
            <h1 className={`mt-5 text-4xl font-semibold tracking-[-0.045em] sm:text-6xl ${textMain}`}>
              {isAr ? 'المتابعة البيئية الموحدة' : 'Unified environmental dashboard'}
            </h1>
            <p className={`mt-5 max-w-3xl text-base leading-8 sm:text-lg ${textSub}`}>
              {isAr
                ? 'اختر الفئة الأقرب لدورك، افهم الغرض من كل خاصية، ثم انتقل إلى التحليل الذي يساعدك على اتخاذ قرار الآن.'
                : 'Choose the audience closest to your role, understand each capability’s purpose, then open the analysis that supports your next decision.'}
            </p>
          </div>
          <div className={`rounded-2xl border px-5 py-4 ${border} ${surface}`}>
            <p className={`text-[10px] font-black uppercase tracking-[.14em] ${textSoft}`}>
              {isAr ? 'تقدم جلستك' : 'Session progress'}
            </p>
            <div className="mt-2 flex items-end gap-2">
              <span className={`text-3xl font-black ${textMain}`}>{completedAnalyses}</span>
              <span className={`pb-1 text-xs font-bold ${textSub}`}>
                {isAr ? 'نتائج محفوظة من 7' : 'saved results of 7'}
              </span>
            </div>
          </div>
        </header>

        <section className="kairo-metric-grid mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              Icon: CircleGauge,
              label: isAr ? 'المسارات المكتملة' : 'Completed pathways',
              value: `${completedAnalyses}/7`,
              detail: isAr ? 'تتحدث مع كل تحليل جديد' : 'Updates after every analysis',
            },
            {
              Icon: Wind,
              label: isAr ? 'ذروة الهواء المتوقعة' : 'Expected air peak',
              value: earlyWarningData?.air?.peakAqi
                ? `${Math.round(earlyWarningData.air.peakAqi)} AQI`
                : '—',
              detail: earlyWarningData?.air
                ? isAr
                  ? 'ضمن نافذة 24 ساعة'
                  : 'Within a 24-hour window'
                : isAr
                  ? 'افتح الاستباق البيئي'
                  : 'Open environmental foresight',
            },
            {
              Icon: Droplet,
              label: isAr ? 'أولوية فحص المياه' : 'Water inspection priority',
              value:
                earlyWarningData?.water?.score !== undefined
                  ? `${Math.round(earlyWarningData.water.score)}/100`
                  : water
                    ? `${Math.round(water.metrics?.leak_probability_score || 0)}/100`
                    : '—',
              detail: isAr ? 'مؤشر أولوية وليس احتمالًا مؤكدًا' : 'Priority index, not confirmed probability',
            },
            {
              Icon: Leaf,
              label: isAr ? 'الأثر الكربوني المجمع' : 'Combined carbon context',
              value: totalCarbon > 0 ? `${totalCarbon.toFixed(1)} kg` : '—',
              detail: isAr ? 'من نتائج الجلسة المحفوظة' : 'From saved session results',
            },
          ].map(({ Icon, label, value, detail }) => (
            <div key={label} className={`kairo-metric-card rounded-[1.6rem] border p-5 ${border} ${surface}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={`text-xs font-bold ${textSub}`}>{label}</p>
                  <p className={`kairo-metric-value mt-3 text-3xl font-black tracking-tight ${textMain}`}>{value}</p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-kairo-green/10 text-kairo-green">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className={`mt-5 border-t pt-3 text-[11px] leading-5 ${border} ${textSoft}`}>{detail}</p>
            </div>
          ))}
        </section>

        <MotionDiv
          {...reveal}
          className="mt-6 grid gap-5 xl:grid-cols-[1.08fr_.92fr]"
        >
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
                {scoreChartData.length} {isAr ? 'مؤشرات جاهزة' : 'scores ready'}
              </span>
            </div>
            <div className="kairo-chart kairo-chart-dashboard m-4 h-[350px] min-w-0 p-4 sm:m-6 sm:p-5" dir="ltr" role="img" aria-label={isAr ? 'مقارنة درجات الكفاءة المتاحة من صفر إلى مئة' : 'Comparison of available efficiency scores from zero to one hundred'}>
              {scoreChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={scoreChartData}
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
                      {scoreChartData.map((entry, index) => (
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
                  onOpen={() => navigate('/systems/water-scarcity')}
                />
              )}
            </div>
          </section>

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
              {costChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costChartData} accessibilityLayer margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
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
                      {costChartData.map((entry) => (
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
                  onOpen={() => navigate('/energy')}
                />
              )}
            </div>
          </section>
        </MotionDiv>

        <EvidenceAndImpact
          items={evidencePassportItems}
          isArabic={isAr}
          isLight={isLight}
        />

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

        <section className="mt-10">
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
                    onClick={() => setAudience(profile.id)}
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
                            <p className="font-extrabold">{localize(capability.title, currentLanguage)}</p>
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
                          onClick={() => navigate(capability.path)}
                          className="inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-full border border-kairo-green/20 bg-kairo-green/[0.07] px-4 text-[11px] font-black text-kairo-green transition hover:bg-kairo-green/15"
                        >
                          {state.ready ? (isAr ? 'عرض النتيجة' : 'View result') : (isAr ? 'ابدأ' : 'Start')}
                          <ArrowUpRight className={`h-3.5 w-3.5 ${dir === 'rtl' ? '-scale-x-100' : ''}`} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredCapabilities.map((capability, index) => {
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
                      onClick={() => navigate(capability.path)}
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
                      <ArrowUpRight className={`h-3.5 w-3.5 ${accent.icon} ${dir === 'rtl' ? '-scale-x-100' : ''}`} />
                    </button>
                  </div>
                </MotionDiv>
              );
            })}
          </div>
        </section>

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
      </div>
    </main>
  );
};

const EmptyChartState = ({
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

export default Dashboard;
