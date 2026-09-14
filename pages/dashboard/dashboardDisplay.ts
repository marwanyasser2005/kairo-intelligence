import type {
  EnergyAnalysisReport,
  EwasteAnalysisReport,
  ExposureAnalysis,
  FoodWasteAnalysisReport,
  MobilityIntelligenceReport,
  WaterAnalysisReport,
} from '../../types';
import type { EvidencePassportItem } from '../../components/EvidenceAndImpact';
import {
  kairoCapabilities,
  localize,
  type CapabilityId,
} from '../../config/kairoCapabilities';
import {
  kairoCapabilityIcons,
  kairoAudienceIcons,
  kairoAccents,
  KAIRO_CHART_COLORS,
} from '../../config/kairoVisuals';

// Re-exported so existing imports keep working; the canonical maps now live
// in config/kairoVisuals.ts and are shared with the home page.
export const capabilityIcons = kairoCapabilityIcons;
export const audienceIcons = kairoAudienceIcons;
export const accentClasses = kairoAccents;
export const CHART_COLORS = KAIRO_CHART_COLORS;

export interface EarlyWarningSnapshot {
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

export interface CapabilityState {
  ready: boolean;
  value: string;
  label: string;
  score?: number;
  evidence: string;
}

export interface DashboardReveal {
  initial: Record<string, unknown>;
  whileInView: Record<string, unknown>;
  viewport: { once: boolean; margin: string };
  transition: { duration: number; ease: number[] };
}

export interface DashboardTheme {
  isAr: boolean;
  isLight: boolean;
  dir: string;
  border: string;
  surface: string;
  textMain: string;
  textSub: string;
  textSoft: string;
}

export interface CapabilityInputs {
  earlyWarningData: EarlyWarningSnapshot | null;
  water: WaterAnalysisReport | null;
  food: FoodWasteAnalysisReport | null;
  energy: EnergyAnalysisReport | null;
  transport: MobilityIntelligenceReport | null;
  exposure: ExposureAnalysis | null;
  ewaste: EwasteAnalysisReport | null;
  isAr: boolean;
}

export const buildCapabilityStates = ({
  earlyWarningData,
  water,
  food,
  energy,
  transport,
  exposure,
  ewaste,
  isAr,
}: CapabilityInputs): Record<CapabilityId, CapabilityState> => ({
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
});

const CAPABILITY_LABELS_AR: Record<CapabilityId, string> = {
  foresight: 'الاستباق البيئي',
  water: 'المياه',
  food: 'الغذاء',
  energy: 'الطاقة',
  mobility: 'التنقل',
  exposure: 'جودة الهواء',
  ewaste: 'الاقتصاد الدائري',
  scenarios: 'السيناريوهات',
};

const CAPABILITY_LABELS_EN: Record<CapabilityId, string> = {
  foresight: 'Foresight',
  water: 'Water',
  food: 'Food',
  energy: 'Energy',
  mobility: 'Mobility',
  exposure: 'Air quality',
  ewaste: 'Circularity',
  scenarios: 'Scenarios',
};

export interface ScoreChartDatum {
  id: CapabilityId;
  name: string;
  value: number;
  ready: boolean;
}

export const buildScoreChartData = (
  capabilityStates: Record<CapabilityId, CapabilityState>,
  isAr: boolean,
): ScoreChartDatum[] =>
  kairoCapabilities
    .map((capability) => ({
      id: capability.id,
      name: isAr
        ? CAPABILITY_LABELS_AR[capability.id]
        : CAPABILITY_LABELS_EN[capability.id],
      value: Math.max(
        0,
        Math.min(100, Number(capabilityStates[capability.id].score || 0)),
      ),
      ready: capabilityStates[capability.id].ready,
    }))
    .filter((item) => item.ready && item.value > 0);

export interface CostChartDatum {
  name: string;
  value: number;
  color: string;
}

export const buildCostChartData = ({
  water,
  food,
  energy,
  transport,
  isAr,
}: {
  water: WaterAnalysisReport | null;
  food: FoodWasteAnalysisReport | null;
  energy: EnergyAnalysisReport | null;
  transport: MobilityIntelligenceReport | null;
  isAr: boolean;
}): CostChartDatum[] =>
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
  ].filter((item) => item.value > 0);

export const buildEvidencePassportItems = ({
  capabilityStates,
  earlyWarningData,
  currentLanguage,
  isAr,
}: {
  capabilityStates: Record<CapabilityId, CapabilityState>;
  earlyWarningData: EarlyWarningSnapshot | null;
  currentLanguage: 'ar' | 'en';
  isAr: boolean;
}): EvidencePassportItem[] => {
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
};
