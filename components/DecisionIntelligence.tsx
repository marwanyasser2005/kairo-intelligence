import React, { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  GraduationCap,
  HeartHandshake,
  Landmark,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import type { AudienceId, LocalizedText } from '../config/kairoCapabilities';

export type DecisionModule =
  | 'water'
  | 'food'
  | 'energy'
  | 'mobility'
  | 'exposure'
  | 'ewaste';

interface DecisionReference {
  source: string;
  url: string;
  insight: LocalizedText;
}

interface ModuleDecisionProfile {
  target: number;
  targetLabel: LocalizedText;
  reference: DecisionReference;
  actions: Record<AudienceId, LocalizedText>;
}

const profiles: Record<DecisionModule, ModuleDecisionProfile> = {
  water: {
    target: 80,
    targetLabel: { ar: 'هدف كفاءة إرشادي', en: 'Indicative efficiency target' },
    reference: {
      source: 'World Bank · Water Utility Performance',
      url: 'https://www.worldbank.org/en/topic/water/publication/performance-of-water-utilities-in-africa',
      insight: {
        ar: 'أفضل قرارات المياه تجمع القياس والصيانة ومؤشرات الفاقد، ولا تعتمد على قيمة الفاتورة وحدها.',
        en: 'Better water decisions combine metering, maintenance, and loss indicators—not the bill alone.',
      },
    },
    actions: {
      individual: { ar: 'ابدأ باختبار التسربات الخفيّة ومقارنة الاستهلاك أسبوعيًا.', en: 'Start with a hidden-leak check and compare weekly use.' },
      community: { ar: 'اجمع البلاغات المتكررة وحدد الشوارع ذات أولوية الفحص.', en: 'Cluster recurring reports and prioritize streets for inspection.' },
      education: { ar: 'حوّل القراءة إلى تجربة: خط أساس، تدخل، ثم قياس بعدي.', en: 'Turn the reading into a baseline–intervention–follow-up experiment.' },
      business: { ar: 'رتّب الإصلاحات حسب حجم الفاقد ومدة الاسترداد التشغيلي.', en: 'Rank repairs by loss volume and operational payback.' },
      government: { ar: 'اربط مناطق الضغط والكسور والفاقد غير المحاسب في قائمة تدخل واحدة.', en: 'Combine pressure, breaks, and non-revenue water into one intervention queue.' },
    },
  },
  food: {
    target: 80,
    targetLabel: { ar: 'هدف كفاءة الغذاء', en: 'Food efficiency target' },
    reference: {
      source: 'UNEP · Food Waste Index 2024',
      url: 'https://www.unep.org/resources/publication/food-waste-index-report-2024',
      insight: {
        ar: 'القياس ووضع خط أساس هما نقطة البداية لتقليل هدر الغذاء وتتبع هدف التنمية 12.3.',
        en: 'Measurement and a baseline are the starting point for reducing food waste and tracking SDG 12.3.',
      },
    },
    actions: {
      individual: { ar: 'سجّل ما يُرمى لأسبوع واضبط الشراء على أكثر صنف متكرر.', en: 'Log discarded food for one week and adjust the most repeated item.' },
      community: { ar: 'أنشئ مسارًا آمنًا لإعادة توزيع الفائض القابل للاستهلاك.', en: 'Create a safe redistribution path for edible surplus.' },
      education: { ar: 'نفّذ تدقيق مقصف أسبوعي وقارن الفاقد لكل وجبة.', en: 'Run a weekly canteen audit and compare waste per meal.' },
      business: { ar: 'افصل فاقد الشراء والتخزين والتحضير لتحديد مالك الإجراء.', en: 'Separate purchasing, storage, and preparation waste to assign action owners.' },
      government: { ar: 'ثبّت منهج قياس موحدًا للمنشآت قبل تحديد هدف التخفيض.', en: 'Standardize facility measurement before setting reduction targets.' },
    },
  },
  energy: {
    target: 80,
    targetLabel: { ar: 'هدف كفاءة تشغيلي', en: 'Operational efficiency target' },
    reference: {
      source: 'IEA · Energy Efficiency 2024',
      url: 'https://www.iea.org/reports/energy-efficiency-2024/executive-summary',
      insight: {
        ar: 'تحسين الكفاءة يحتاج مؤشرات شدة الطلب والاستهلاك وخطة تنفيذ قابلة للقياس.',
        en: 'Efficiency improvement needs demand-intensity indicators and a measurable implementation plan.',
      },
    },
    actions: {
      individual: { ar: 'اختبر إجراءً منخفض التكلفة أولًا ثم راقب فرق الكيلووات/ساعة.', en: 'Test one low-cost action first, then track the kWh difference.' },
      community: { ar: 'حدد المباني الأعلى كثافة وابدأ بحملة ضبط الأحمال وقت الذروة.', en: 'Identify high-intensity buildings and start peak-load management.' },
      education: { ar: 'اعرض خط الأساس والفترة الزمنية والافتراضات مع كل تجربة.', en: 'Show baseline, time window, and assumptions with every experiment.' },
      business: { ar: 'رتّب الفرص حسب التوفير والمخاطر وفترة الاسترداد.', en: 'Prioritize opportunities by savings, risk, and payback.' },
      government: { ar: 'قارن كثافة الطاقة بين المباني المتشابهة قبل توجيه الاستثمار.', en: 'Benchmark similar public buildings before allocating investment.' },
    },
  },
  mobility: {
    target: 75,
    targetLabel: { ar: 'هدف تنقل متوازن', en: 'Balanced mobility target' },
    reference: {
      source: 'WHO · HEAT for walking and cycling 2024',
      url: 'https://www.who.int/spain/publications/i/item/9789289058377',
      insight: {
        ar: 'تقييم التنقل الأفضل يجمع الوقت والتكلفة والكربون والمنافع الصحية بدل مؤشر واحد.',
        en: 'Better mobility appraisal combines time, cost, carbon, and health benefits—not one metric.',
      },
    },
    actions: {
      individual: { ar: 'جرّب بديلًا ليوم واحد أسبوعيًا وقِس الوقت والتكلفة الفعلية.', en: 'Trial one alternative day weekly and measure actual time and cost.' },
      community: { ar: 'حدد نقاط تعطل الرحلة ومخاطر المشاة على خريطة مشتركة.', en: 'Map trip bottlenecks and pedestrian risks collaboratively.' },
      education: { ar: 'قارن سيناريوهات التنقل مع توثيق المسافة ونسبة الإشغال.', en: 'Compare mobility scenarios while documenting distance and occupancy.' },
      business: { ar: 'صمّم حوافز مشاركة الرحلات حول الورديات الأعلى أثرًا.', en: 'Target ride-share incentives at the highest-impact shifts.' },
      government: { ar: 'قارن البدائل بمؤشرات الوصول والسلامة والصحة والكربون.', en: 'Compare options across access, safety, health, and carbon.' },
    },
  },
  exposure: {
    target: 80,
    targetLabel: { ar: 'هدف خفض التعرض', en: 'Exposure reduction target' },
    reference: {
      source: 'WHO · Global Air Quality Guidelines 2021',
      url: 'https://www.who.int/publications/i/item/9789240034228',
      insight: {
        ar: 'مرجع PM2.5 لمنظمة الصحة العالمية هو 5 µg/m³ سنويًا و15 µg/m³ خلال 24 ساعة؛ وهو مرجع صحي لا حد قانوني محلي.',
        en: 'WHO PM2.5 references are 5 µg/m³ annual and 15 µg/m³ over 24 hours; these are health guidance, not local law.',
      },
    },
    actions: {
      individual: { ar: 'غيّر توقيت أو مسار النشاط الخارجي عند ذروة التعرض.', en: 'Shift outdoor activity timing or route during exposure peaks.' },
      community: { ar: 'وجّه التنبيه للفئات الحساسة مع مكان ووقت وإجراء واضح.', en: 'Target sensitive groups with a clear place, time, and action.' },
      education: { ar: 'افصل القياس المباشر عن التقدير المكاني في أي تقرير.', en: 'Separate direct measurement from spatial estimation in every report.' },
      business: { ar: 'راجع جداول العمالة الخارجية والتهوية وفق نافذة الخطر.', en: 'Adjust outdoor shifts and ventilation around the risk window.' },
      government: { ar: 'اربط الإنذار بالفئات الحساسة والتواصل والاستجابة الميدانية.', en: 'Link warnings to vulnerable groups, communication, and field response.' },
    },
  },
  ewaste: {
    target: 80,
    targetLabel: { ar: 'هدف الدائرية', en: 'Circularity target' },
    reference: {
      source: 'UNITAR/ITU · Global E-waste Monitor 2024',
      url: 'https://unitar.org/about/news-stories/press/global-e-waste-monitor-2024-electronic-waste-rising-five-times-faster-documented-e-waste-recycling',
      insight: {
        ar: 'وُثّق جمع وإعادة تدوير 22.3% فقط من المخلفات الإلكترونية عالميًا في 2022، لذلك يسبق الإصلاح وإعادة الاستخدام التدوير متى كانا آمنين.',
        en: 'Only 22.3% of e-waste was documented as collected and recycled in 2022, so safe repair and reuse matter before recycling.',
      },
    },
    actions: {
      individual: { ar: 'انسخ بياناتك ثم نفّذ محوًا موثقًا قبل البيع أو التدوير.', en: 'Back up data, then perform a documented wipe before resale or recycling.' },
      community: { ar: 'اجمع الأجهزة حسب مسار: إعادة استخدام، إصلاح، أو تدوير معتمد.', en: 'Sort devices into reuse, repair, or certified recycling pathways.' },
      education: { ar: 'وثّق كتلة الأجهزة ومسارها النهائي بدل عدّ القطع فقط.', en: 'Track device mass and final pathway, not device count alone.' },
      business: { ar: 'أضف أمن البيانات والعائد المتبقي إلى قرار نهاية العمر.', en: 'Include data security and residual value in end-of-life decisions.' },
      government: { ar: 'قِس الجمع الرسمي والاسترداد المادي مع قابلية تتبع الوجهة.', en: 'Measure formal collection and material recovery with destination traceability.' },
    },
  },
};

const audiences: Array<{ id: AudienceId; icon: React.ElementType; label: LocalizedText }> = [
  { id: 'individual', icon: Users, label: { ar: 'الأفراد', en: 'People' } },
  { id: 'community', icon: HeartHandshake, label: { ar: 'المجتمع', en: 'Community' } },
  { id: 'education', icon: GraduationCap, label: { ar: 'التعليم', en: 'Education' } },
  { id: 'business', icon: Building2, label: { ar: 'الأعمال', en: 'Business' } },
  { id: 'government', icon: Landmark, label: { ar: 'الجهات', en: 'Public sector' } },
];

interface DecisionIntelligenceProps {
  module: DecisionModule;
  score: number;
  status?: string;
  confidence?: 'high' | 'medium' | 'estimated';
  className?: string;
}

const DecisionIntelligence: React.FC<DecisionIntelligenceProps> = ({
  module,
  score,
  status,
  confidence = 'estimated',
  className = '',
}) => {
  const { language } = useApp();
  const isAr = language === 'ar';
  const profile = profiles[module];
  const [audience, setAudience] = useState<AudienceId>('individual');
  const normalizedScore = Math.max(0, Math.min(100, Number.isFinite(score) ? score : 0));
  const gap = Math.max(0, profile.target - normalizedScore);
  const confidenceLabel = useMemo(
    () => ({
      high: isAr ? 'ثقة مرتفعة' : 'High confidence',
      medium: isAr ? 'ثقة متوسطة' : 'Medium confidence',
      estimated: isAr ? 'تقدير إرشادي' : 'Indicative estimate',
    })[confidence],
    [confidence, isAr],
  );

  return (
    <section
      className={`kairo-decision-layer kairo-decision--${module} ${className}`}
      data-decision-module={module}
      aria-label={isAr ? 'عدسة القرار' : 'Decision lens'}
    >
      <div className="kairo-decision-heading">
        <div>
          <span className="kairo-decision-kicker"><Sparkles aria-hidden="true" /> KAIRO DECISION LENS</span>
          <h2>{isAr ? 'من النتيجة إلى قرار قابل للتنفيذ' : 'From result to an actionable decision'}</h2>
        </div>
        <span className="kairo-confidence-chip"><ShieldCheck aria-hidden="true" />{confidenceLabel}</span>
      </div>

      <div className="kairo-decision-grid">
        <div className="kairo-score-zone">
          <div
            className="kairo-score-ring"
            style={{ '--kairo-score': normalizedScore } as React.CSSProperties}
            role="img"
            aria-label={`${isAr ? 'درجة القرار' : 'Decision score'} ${Math.round(normalizedScore)} / 100`}
          >
            <div className="kairo-score-ring-core">
              <strong>{Math.round(normalizedScore)}</strong>
              <span>/100</span>
            </div>
          </div>
          <div className="kairo-score-copy">
            <span>{isAr ? 'مؤشر Kairo الحالي' : 'Current Kairo index'}</span>
            <strong>{status || (gap === 0 ? (isAr ? 'ضمن الهدف' : 'On target') : (isAr ? 'قابل للتحسين' : 'Room to improve'))}</strong>
            <p>{gap === 0 ? (isAr ? 'النتيجة عند الهدف الإرشادي أو أعلى.' : 'The result is at or above the indicative target.') : (isAr ? `فجوة ${Math.round(gap)} نقطة للوصول إلى الهدف الإرشادي.` : `${Math.round(gap)} points to the indicative target.`)}</p>
          </div>
        </div>

        <div className="kairo-benchmark-zone">
          <div className="kairo-benchmark-row">
            <span>{isAr ? 'النتيجة الحالية' : 'Current result'}</span>
            <strong>{Math.round(normalizedScore)}%</strong>
            <div className="kairo-benchmark-track"><i style={{ width: `${normalizedScore}%` }} /></div>
          </div>
          <div className="kairo-benchmark-row is-target">
            <span>{isAr ? profile.targetLabel.ar : profile.targetLabel.en}</span>
            <strong>{profile.target}%</strong>
            <div className="kairo-benchmark-track"><i style={{ width: `${profile.target}%` }} /></div>
          </div>
          <div className="kairo-reference-note">
            <CheckCircle2 aria-hidden="true" />
            <div>
              <p>{isAr ? profile.reference.insight.ar : profile.reference.insight.en}</p>
              <a href={profile.reference.url} target="_blank" rel="noreferrer" data-allow-copy="true">
                {profile.reference.source}<ArrowUpRight aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="kairo-audience-actions">
        <div className="kairo-audience-tabs" role="tablist" aria-label={isAr ? 'الإجراء حسب الفئة' : 'Action by audience'}>
          {audiences.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={audience === id}
              onClick={() => setAudience(id)}
              className={audience === id ? 'is-active' : ''}
            >
              <Icon aria-hidden="true" />{isAr ? label.ar : label.en}
            </button>
          ))}
        </div>
        <div className="kairo-audience-recommendation" role="tabpanel">
          <span>{isAr ? 'الإجراء الأدق لهذه الفئة' : 'Best next action for this audience'}</span>
          <p>{isAr ? profile.actions[audience].ar : profile.actions[audience].en}</p>
        </div>
      </div>
    </section>
  );
};

export default DecisionIntelligence;
