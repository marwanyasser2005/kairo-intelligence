import React from 'react';
import { Link } from 'react-router-dom';
import { Chip } from '@heroui/react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Activity,
  ArrowUpRight,
  Building2,
  Check,
  CircleDollarSign,
  Database,
  Droplets,
  FlaskConical,
  Gauge,
  GraduationCap,
  HeartHandshake,
  Leaf,
  LockKeyhole,
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
import { useApp } from '../contexts/AppContext';
import { KairoBrandSymbol } from '../components/KairoBrand';
import {
  audienceProfiles,
  getAudienceProfile,
  kairoCapabilities,
  TIER_LABELS,
  localize,
  type AudienceId,
  type CapabilityId,
} from '../config/kairoCapabilities';

const MotionDiv = motion.div as any;

const capabilityIcons: Record<CapabilityId, LucideIcon> = {
  foresight: Activity,
  water: Droplets,
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

const capabilityAccentClasses = {
  emerald: {
    icon: 'bg-emerald-500/10 text-emerald-500',
    glow: 'from-emerald-400/70 via-emerald-300/35',
    chip: 'border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-500',
  },
  blue: {
    icon: 'bg-sky-500/10 text-sky-500',
    glow: 'from-sky-400/70 via-sky-300/35',
    chip: 'border-sky-500/20 bg-sky-500/[0.07] text-sky-500',
  },
  amber: {
    icon: 'bg-amber-500/10 text-amber-500',
    glow: 'from-amber-400/70 via-amber-300/35',
    chip: 'border-amber-500/20 bg-amber-500/[0.07] text-amber-500',
  },
  violet: {
    icon: 'bg-violet-500/10 text-violet-500',
    glow: 'from-violet-400/70 via-violet-300/35',
    chip: 'border-violet-500/20 bg-violet-500/[0.07] text-violet-500',
  },
  cyan: {
    icon: 'bg-cyan-500/10 text-cyan-500',
    glow: 'from-cyan-400/70 via-cyan-300/35',
    chip: 'border-cyan-500/20 bg-cyan-500/[0.07] text-cyan-500',
  },
} as const;

const Home: React.FC = () => {
  const { theme, dir, language } = useApp();
  const reduceMotion = useReducedMotion();
  const isLight = theme === 'light';
  const isAr = language === 'ar';
  const currentLanguage = isAr ? 'ar' : 'en';
  const [selectedAudience, setSelectedAudience] = React.useState<AudienceId>('individual');

  const textMain = isLight ? 'text-slate-950' : 'text-white';
  const textSub = isLight ? 'text-slate-600' : 'text-slate-400';
  const textSoft = isLight ? 'text-slate-500' : 'text-slate-500';
  const border = isLight ? 'border-slate-900/[0.09]' : 'border-white/[0.09]';
  const surface = isLight ? 'bg-white/78' : 'bg-white/[0.035]';

  const reveal = {
    initial: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-70px' },
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  };

  const proofPoints = isAr
    ? [
        'ثمانية مسارات بيئية مترابطة',
        'نتائج قابلة للتفسير وليست أرقامًا مبهمة',
        'تجربة مناسبة للأفراد والمؤسسات والمدن',
        'فصل واضح بين البيانات الحية والتقديرات',
      ]
    : [
        'Eight connected environmental pathways',
        'Explainable outcomes, not opaque scores',
        'Designed for people, institutions, and cities',
        'A clear line between live data and estimates',
      ];

  const loop = [
    {
      Icon: Database,
      title: isAr ? 'اجمع السياق' : 'Collect context',
      text: isAr
        ? 'بيانات يضيفها المستخدم، إشارات جهاز اختيارية، ومصادر بيئية موثقة.'
        : 'User inputs, optional device signals, and documented environmental sources.',
    },
    {
      Icon: Gauge,
      title: isAr ? 'افهم ما يحدث' : 'Understand what is happening',
      text: isAr
        ? 'تحليل يوضح المؤشر والعوامل المؤثرة ومستوى الثقة وحدود النتيجة.'
        : 'Analysis that exposes the indicator, its drivers, confidence, and limitations.',
    },
    {
      Icon: Target,
      title: isAr ? 'اختر الإجراء' : 'Choose the action',
      text: isAr
        ? 'خطوات مرتبة حسب الأولوية والتكلفة والجمهور المسؤول عن التنفيذ.'
        : 'Steps prioritized by urgency, cost, and the audience responsible for action.',
    },
    {
      Icon: Route,
      title: isAr ? 'تابع وتحقق' : 'Track and verify',
      text: isAr
        ? 'مقارنة التقدم والسيناريوهات وتحديث القرار عندما تتغير البيانات.'
        : 'Compare progress and scenarios, then update the decision as evidence changes.',
    },
  ];

  const trust = [
    {
      Icon: ShieldCheck,
      title: isAr ? 'نتيجة قابلة للتفسير' : 'Explainable outcomes',
      text: isAr
        ? 'كل مؤشر يوضح لماذا ظهر وما الذي يمكن فعله بعده.'
        : 'Every indicator explains why it appeared and what can be done next.',
    },
    {
      Icon: LockKeyhole,
      title: isAr ? 'خصوصية باختيار المستخدم' : 'Consent-led privacy',
      text: isAr
        ? 'الموقع لا يعمل إلا بإذن واضح؛ الكاميرا والميكروفون خصائص قادمة وغير مستخدمة حاليًا.'
        : 'Location is consent-based; camera and microphone are upcoming and not currently used.',
    },
    {
      Icon: Check,
      title: isAr ? 'حدود معلنة' : 'Visible limitations',
      text: isAr
        ? 'نفرق بين القياس والتقدير وما يحتاج تحققًا ميدانيًا.'
        : 'Measured, estimated, and field-validation needs are clearly separated.',
    },
  ];

  const activeAudience = getAudienceProfile(selectedAudience) ?? audienceProfiles[0];
  const recommendedCapabilities = kairoCapabilities
    .filter((capability) => capability.audiences.includes(selectedAudience))
    .slice(0, 3);

  return (
    <main
      className={`min-h-screen overflow-hidden transition-colors duration-500 ${
        isLight ? 'bg-[#f5f8f6]' : 'bg-kairo-ink'
      }`}
      dir={dir}
    >
      <section className={`relative min-h-[92svh] border-b ${border}`}>
        <div className="kairo-grid absolute inset-0 opacity-75" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="kairo-ambient-orb absolute -top-28 start-[4%] h-[34rem] w-[34rem] rounded-full bg-kairo-green/[0.12] blur-[115px]" />
          <div className="absolute -bottom-48 end-[-4rem] h-[32rem] w-[32rem] rounded-full bg-cyan-400/[0.07] blur-[125px]" />
        </div>

        <div className="kairo-shell relative z-10 flex min-h-[92svh] items-center pb-16 pt-28 sm:pt-32 lg:pb-24 lg:pt-36">
          <div className="grid w-full items-center gap-14 lg:grid-cols-[1.08fr_.92fr] lg:gap-20">
            <MotionDiv
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-4xl lg:order-2"
            >
              <div className="mb-7 flex flex-wrap items-center gap-3">
                <Chip color="success" size="sm" variant="soft">
                  <Chip.Label className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    {isAr ? 'منصة ذكاء بيئي متكاملة' : 'Integrated environmental intelligence'}
                  </Chip.Label>
                </Chip>
                <span className={`text-xs font-semibold ${textSub}`}>KAIRO · 2026</span>
              </div>

              <h1
                className={`max-w-4xl text-[clamp(3rem,7vw,7rem)] font-semibold ${
                  isAr
                    ? 'leading-[1.16] tracking-normal'
                    : 'leading-[0.97] tracking-[-0.055em]'
                } ${textMain}`}
              >
                <span className="kairo-gradient-text">
                  {isAr
                    ? 'افهم أثرك البيئي. اتخذ قرارًا أفضل.'
                    : 'Understand your impact. Make a better decision.'}
                </span>
              </h1>

              <p className={`mt-8 max-w-3xl text-lg leading-8 sm:text-xl ${textSub}`}>
                {isAr
                  ? 'Kairo يجمع المياه والغذاء والطاقة والتنقل وجودة الهواء والتعرض الحضري والمخلفات الإلكترونية في تجربة واحدة، ثم يحول البيانات إلى تفسير واضح وإجراء يناسب كل فئة من المجتمع.'
                  : 'Kairo brings water, food, energy, mobility, air quality, urban exposure, and e-waste into one experience—turning data into clear explanations and actions for every part of society.'}
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/dashboard"
                  className="btn-tactile group inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-kairo-green px-7 text-sm font-extrabold text-[#052019] shadow-glow-green hover:bg-[#42e4ba]"
                >
                  {isAr ? 'ابدأ من المتابعة' : 'Start with the dashboard'}
                  <ArrowUpRight
                    className={`h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 ${
                      dir === 'rtl' ? '-scale-x-100' : ''
                    }`}
                  />
                </Link>
                <a
                  href="#capabilities"
                  className={`btn-tactile inline-flex min-h-14 items-center justify-center gap-3 rounded-full border px-7 text-sm font-bold backdrop-blur-xl ${border} ${textMain} ${
                    isLight ? 'bg-white/65 hover:bg-white' : 'bg-white/[0.045] hover:bg-white/[0.08]'
                  }`}
                >
                  <Leaf className="h-4 w-4 text-kairo-green" />
                  {isAr ? 'استكشف كل الخواص' : 'Explore every capability'}
                </a>
              </div>

              <div className={`mt-12 grid max-w-3xl grid-cols-3 border-t pt-7 ${border}`}>
                {[
                  ['08', isAr ? 'خواص مترابطة' : 'Connected capabilities'],
                  ['05', isAr ? 'فئات مستهدفة' : 'Audience groups'],
                  ['01', isAr ? 'متابعة موحدة' : 'Unified dashboard'],
                ].map(([value, label]) => (
                  <div key={label} className="pe-3">
                    <div className={`text-2xl font-extrabold ${textMain}`}>{value}</div>
                    <div className={`mt-1 text-[10px] font-bold uppercase tracking-[0.11em] sm:text-xs ${textSub}`}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </MotionDiv>

            <MotionDiv
              initial={reduceMotion ? false : { opacity: 0, scale: 0.95, y: 22 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto w-full max-w-[580px] lg:order-1"
            >
              <div className="absolute -inset-10 rounded-full bg-kairo-green/[0.07] blur-3xl" />
              <div className="kairo-glass relative overflow-hidden rounded-[2.2rem] p-5 shadow-glow sm:p-7">
                <div className={`flex items-center justify-between gap-4 border-b pb-5 ${border}`}>
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-kairo-green/10 p-1 text-kairo-green">
                      <KairoBrandSymbol className="h-full aspect-square" decorative />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-[13px] font-black leading-6 sm:text-sm ${textMain}`}>
                        {isAr ? 'خريطة Kairo البيئية' : 'Kairo environmental map'}
                      </p>
                      <p className={`text-[11px] leading-5 ${textSub}`}>
                        {isAr ? 'من القياس إلى الإجراء' : 'From context to action'}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-kairo-green/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-kairo-green">
                    {isAr ? 'متكامل' : 'Unified'}
                  </span>
                </div>

                <div className="my-6 grid grid-cols-[minmax(0,1fr)_4.5rem_minmax(0,1fr)] grid-rows-3 gap-2.5 sm:grid-cols-[minmax(0,1fr)_5.5rem_minmax(0,1fr)] sm:gap-3">
                  {kairoCapabilities.slice(0, 6).map((capability, index) => {
                    const Icon = capabilityIcons[capability.id];
                    return (
                      <div
                        key={capability.id}
                        style={{
                          gridColumn: index % 2 === 0 ? 1 : 3,
                          gridRow: Math.floor(index / 2) + 1,
                        }}
                        className={`flex min-h-[76px] min-w-0 flex-col justify-center rounded-2xl border p-3 sm:min-h-[82px] sm:p-4 ${border} ${
                          isLight ? 'bg-white/70' : 'bg-black/20'
                        }`}
                      >
                        <Icon className="h-4 w-4 text-kairo-green" />
                        <p className={`mt-2 text-[10px] font-extrabold leading-4 sm:text-xs sm:leading-5 ${textMain}`}>
                          {localize(capability.title, currentLanguage)}
                        </p>
                      </div>
                    );
                  })}
                  <div className="col-start-2 row-span-3 row-start-1 flex items-center justify-center">
                    <div
                      className={`flex h-[4.1rem] w-[4.1rem] items-center justify-center rounded-[1.35rem] border p-2 backdrop-blur-xl sm:h-[4.75rem] sm:w-[4.75rem] sm:rounded-[1.55rem] ${border} ${
                        isLight
                          ? 'bg-white/95 shadow-[0_18px_50px_rgba(10,60,45,.14)]'
                          : 'bg-[#0a1713]/95 shadow-[0_18px_60px_rgba(0,0,0,.34)]'
                      }`}
                    >
                      <KairoBrandSymbol className="h-full aspect-square" decorative />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    [isAr ? 'البيانات' : 'Data', isAr ? 'موثقة' : 'Sourced'],
                    [isAr ? 'المنطق' : 'Logic', isAr ? 'مفسّر' : 'Explainable'],
                    [isAr ? 'الإجراء' : 'Action', isAr ? 'موجّه' : 'Targeted'],
                  ].map(([label, value]) => (
                    <div key={label} className={`rounded-2xl border p-3 ${border} ${surface}`}>
                      <div className={`text-[9px] font-bold uppercase tracking-widest ${textSoft}`}>{label}</div>
                      <div className={`mt-2 text-xs font-extrabold ${textMain}`}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </MotionDiv>
          </div>
        </div>
      </section>

      <section className={`border-b py-6 ${border} ${isLight ? 'bg-white/60' : 'bg-black/20'}`}>
        <div className="kairo-shell grid grid-cols-2 gap-4 sm:grid-cols-4">
          {proofPoints.map((point) => (
            <div key={point} className="flex items-start gap-2.5 py-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-kairo-green" />
              <span className={`text-xs font-semibold leading-5 ${textSub}`}>{point}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="capabilities" className={`relative border-b py-24 sm:py-32 ${border}`}>
        <div className="pointer-events-none absolute inset-0 kairo-grid opacity-30" />
        <div className="kairo-shell relative">
          <MotionDiv {...reveal} className="grid items-end gap-7 lg:grid-cols-[1fr_.7fr]">
            <div className="max-w-4xl">
              <span className="kairo-eyebrow">
                <Leaf className="h-3.5 w-3.5" />
                {isAr ? 'منظومة بيئية واحدة' : 'One environmental ecosystem'}
              </span>
              <h2 className={`mt-6 text-4xl font-semibold tracking-[-0.045em] sm:text-6xl ${textMain}`}>
                {isAr
                ? 'كل خاصية لها جمهور، غرض، ونتيجة مفهومة. ابدأ بثلاث خواص أساسية تغطي الوقاية والفاتورتين الأثقل، ثم وسّع الصورة بخواص مساندة.'
                : 'Every capability has an audience, purpose, and clear outcome. Start with three core capabilities covering prevention and the two heaviest bills, then extend with support capabilities.'}
              </h2>
            </div>
            <p className={`text-base leading-8 lg:pb-2 ${textSub}`}>
              {isAr
                ? 'يمكن استخدام كل مسار منفردًا، بينما تجمع المتابعة النتائج في صورة واحدة تساعد المستخدم على معرفة أين يبدأ ولماذا.'
                : 'Each pathway works independently, while the dashboard brings outcomes together so users know where to start and why.'}
            </p>
          </MotionDiv>

          <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {kairoCapabilities.map((capability, index) => {
              const Icon = capabilityIcons[capability.id];
              const accent = capabilityAccentClasses[capability.accent];
              return (
                <MotionDiv
                  key={capability.id}
                  {...reveal}
                  transition={{ ...reveal.transition, delay: (index % 4) * 0.055 }}
                  className={`kairo-feature-card group flex min-h-[390px] flex-col rounded-[1.8rem] border p-6 ${border} ${surface}`}
                >
                  <span className={`kairo-feature-accent bg-gradient-to-r ${accent.glow} to-transparent`} aria-hidden="true" />
                  <div className="flex items-center justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent.icon}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        title={localize(capability.tierReason, currentLanguage)}
                        className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${
                          capability.tier === 'core'
                            ? 'bg-kairo-green/15 text-kairo-green'
                            : capability.tier === 'support'
                              ? isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/5 text-slate-400'
                              : 'bg-violet-500/10 text-violet-400'
                        }`}
                      >
                        {localize(TIER_LABELS[capability.tier], currentLanguage)}
                      </span>
                      <span className={`font-mono text-[10px] ${textSoft}`}>0{index + 1}</span>
                    </div>
                  </div>

                  <h3 className={`mt-7 text-xl font-extrabold ${textMain}`}>
                    {localize(capability.title, currentLanguage)}
                  </h3>
                  <p className={`mt-3 text-sm leading-6 ${textSub}`}>
                    {localize(capability.shortDescription, currentLanguage)}
                  </p>

                  <div className={`mt-5 rounded-2xl border p-4 ${border} ${isLight ? 'bg-slate-50/80' : 'bg-black/20'}`}>
                    <p className={`w-fit rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[.14em] ${accent.chip}`}>
                      {isAr ? 'الغرض' : 'Purpose'}
                    </p>
                    <p className={`mt-2 text-xs leading-5 ${textSub}`}>
                      {localize(capability.purpose, currentLanguage)}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {capability.audiences.slice(0, 3).map((audienceId) => {
                      const audience = getAudienceProfile(audienceId);
                      return audience ? (
                        <span
                          key={audienceId}
                          className={`rounded-full border px-2.5 py-1 text-[9px] font-bold ${border} ${textSub}`}
                        >
                          {localize(audience.shortLabel, currentLanguage)}
                        </span>
                      ) : null;
                    })}
                    {capability.audiences.length > 3 && (
                      <span className="rounded-full bg-kairo-green/10 px-2.5 py-1 text-[9px] font-black text-kairo-green">
                        +{capability.audiences.length - 3}
                      </span>
                    )}
                  </div>

                  <Link
                    to={capability.path}
                    className={`mt-auto inline-flex min-h-11 items-center gap-2 pt-6 text-xs font-black ${textMain}`}
                  >
                    {isAr ? 'افهم الخاصية واستخدمها' : 'Understand and use it'}
                    <ArrowUpRight className={`h-3.5 w-3.5 text-kairo-green ${dir === 'rtl' ? '-scale-x-100' : ''}`} />
                  </Link>
                </MotionDiv>
              );
            })}
          </div>
        </div>
      </section>

      <section className={`border-b py-24 sm:py-32 ${border} ${isLight ? 'bg-white/55' : 'bg-white/[0.018]'}`}>
        <div className="kairo-shell">
          <MotionDiv {...reveal} className="mx-auto max-w-4xl text-center">
            <span className="kairo-eyebrow">
              <Users className="h-3.5 w-3.5" />
              {isAr ? 'قيمة لكل فئة' : 'Value for every audience'}
            </span>
            <h2 className={`mt-6 text-4xl font-semibold tracking-[-0.045em] sm:text-6xl ${textMain}`}>
              {isAr ? 'نفس البيانات، قرار يناسب دور كل مستخدم.' : 'The same evidence, shaped for each user’s role.'}
            </h2>
            <p className={`mx-auto mt-6 max-w-3xl text-lg leading-8 ${textSub}`}>
              {isAr
                ? 'Kairo لا يفترض أن كل الناس تحتاج نفس الشاشة أو نفس الإجراء؛ لذلك يوضح لمن صُممت كل خاصية وما القيمة التي تقدمها.'
                : 'Kairo does not assume everyone needs the same screen or action. Every capability states who it serves and the value it creates.'}
            </p>
          </MotionDiv>

          <div className="mt-10 flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center" role="tablist" aria-label={isAr ? 'اختر الفئة المستهدفة' : 'Choose an audience'}>
            {audienceProfiles.map((audience) => {
              const Icon = audienceIcons[audience.id];
              const active = audience.id === selectedAudience;
              return (
                <button
                  key={audience.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedAudience(audience.id)}
                  className={`inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full border px-4 text-xs font-extrabold transition duration-200 ${
                    active
                      ? 'border-kairo-green bg-kairo-green text-[#052019] shadow-[0_12px_28px_rgba(43,212,167,.18)]'
                      : `${border} ${surface} ${textSub} hover:border-kairo-green/35 hover:text-kairo-green`
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {localize(audience.shortLabel, currentLanguage)}
                </button>
              );
            })}
          </div>

          <MotionDiv
            key={selectedAudience}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24 }}
            className={`kairo-audience-spotlight mt-6 grid gap-6 rounded-[2rem] border p-6 sm:p-8 lg:grid-cols-[.85fr_1.15fr] ${border} ${surface}`}
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.16em] text-kairo-green">
                {isAr ? 'القيمة المناسبة لدورك' : 'Value matched to your role'}
              </p>
              <h3 className={`mt-3 text-2xl font-black sm:text-3xl ${textMain}`}>
                {localize(activeAudience.label, currentLanguage)}
              </h3>
              <p className={`mt-4 text-sm leading-7 ${textSub}`}>
                {localize(activeAudience.description, currentLanguage)}
              </p>
              <p className={`mt-5 border-s-2 border-kairo-green ps-4 text-sm font-semibold leading-7 ${textMain}`}>
                {localize(activeAudience.value, currentLanguage)}
              </p>
            </div>
            <div className="grid gap-3">
              {recommendedCapabilities.map((capability) => {
                const Icon = capabilityIcons[capability.id];
                const accent = capabilityAccentClasses[capability.accent];
                return (
                  <Link
                    key={capability.id}
                    to={capability.path}
                    className={`group flex min-h-[5.5rem] items-center gap-4 rounded-2xl border p-4 transition duration-200 hover:border-kairo-green/35 ${border} ${isLight ? 'bg-white/75' : 'bg-black/20'}`}
                  >
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent.icon}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong className={`block text-sm ${textMain}`}>{localize(capability.title, currentLanguage)}</strong>
                      <span className={`mt-1 block text-xs leading-5 ${textSub}`}>{localize(capability.outcome, currentLanguage)}</span>
                    </span>
                    <ArrowUpRight className={`h-4 w-4 shrink-0 text-kairo-green transition-transform group-hover:-translate-y-0.5 ${dir === 'rtl' ? '-scale-x-100' : ''}`} />
                  </Link>
                );
              })}
            </div>
          </MotionDiv>

          <details className={`kairo-audience-details mt-5 rounded-2xl border ${border} ${surface}`}>
            <summary className={`cursor-pointer px-5 py-4 text-sm font-extrabold ${textMain}`}>
              {isAr ? 'عرض مقارنة كل الفئات' : 'Compare every audience'}
            </summary>
          <div className={`grid gap-4 border-t p-4 md:grid-cols-2 xl:grid-cols-5 ${border}`}>
            {audienceProfiles.map((audience, index) => {
              const Icon = audienceIcons[audience.id];
              return (
                <MotionDiv
                  key={audience.id}
                  {...reveal}
                  transition={{ ...reveal.transition, delay: index * 0.055 }}
                  className={`rounded-[1.5rem] border p-5 ${border} ${isLight ? 'bg-white/65' : 'bg-black/15'}`}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-kairo-green/10 text-kairo-green">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className={`mt-6 text-base font-extrabold ${textMain}`}>
                    {localize(audience.label, currentLanguage)}
                  </h3>
                  <p className={`mt-3 text-sm leading-6 ${textSub}`}>
                    {localize(audience.description, currentLanguage)}
                  </p>
                  <p className={`mt-5 border-s-2 border-kairo-green ps-3 text-xs font-semibold leading-5 ${textMain}`}>
                    {localize(audience.value, currentLanguage)}
                  </p>
                </MotionDiv>
              );
            })}
          </div>
          </details>
        </div>
      </section>

      <section className="py-24 sm:py-32">
        <div className="kairo-shell">
          <MotionDiv {...reveal} className="grid items-end gap-8 lg:grid-cols-[.75fr_1.25fr]">
            <div>
              <span className="kairo-eyebrow">{isAr ? 'طريقة العمل' : 'How Kairo works'}</span>
              <h2 className={`mt-6 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl ${textMain}`}>
                {isAr ? 'رحلة بسيطة من السياق إلى أثر يمكن متابعته.' : 'A simple journey from context to trackable impact.'}
              </h2>
              <p className={`mt-6 text-base leading-8 ${textSub}`}>
                {isAr
                  ? 'ابدأ من لوحة المتابعة، اختر الفئة الأقرب لك، ثم افتح المسار الذي يجيب عن سؤالك الحالي.'
                  : 'Start in the dashboard, choose the audience closest to you, then open the pathway that answers your current question.'}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {loop.map(({ Icon, title, text }, index) => (
                <div key={title} className={`rounded-[1.7rem] border p-6 ${border} ${surface}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-kairo-green/10 text-kairo-green">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`font-mono text-[10px] ${textSoft}`}>0{index + 1}</span>
                  </div>
                  <h3 className={`mt-6 text-lg font-extrabold ${textMain}`}>{title}</h3>
                  <p className={`mt-3 text-sm leading-6 ${textSub}`}>{text}</p>
                </div>
              ))}
            </div>
          </MotionDiv>

          <MotionDiv
            {...reveal}
            className={`relative mt-20 overflow-hidden rounded-[2.2rem] border p-7 sm:p-12 ${border} ${
              isLight ? 'bg-[#09241d]' : 'bg-[#0b1c17]'
            }`}
          >
            <div className="absolute -end-20 -top-28 h-80 w-80 rounded-full bg-kairo-green/20 blur-[100px]" />
            <div className="relative grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
              <div>
                <span className="kairo-eyebrow">{isAr ? 'ثقة ومسؤولية' : 'Trust by design'}</span>
                <h2 className="mt-6 text-4xl font-semibold tracking-[-0.045em] text-white sm:text-5xl">
                  {isAr ? 'ذكاء يساعد القرار ولا يخفي حدوده.' : 'Intelligence that supports decisions without hiding its limits.'}
                </h2>
                <p className="mt-5 text-base leading-8 text-slate-300">
                  {isAr
                    ? 'نوضح مصدر كل نتيجة، والغرض من كل إذن، وما يمكن اعتباره إشارة وما يحتاج إثباتًا ميدانيًا.'
                    : 'We expose the source of each outcome, the purpose of each permission, and what remains a signal versus field evidence.'}
                </p>
              </div>
              <div className="grid gap-3">
                {trust.map(({ Icon, title, text }) => (
                  <div key={title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.055] p-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-kairo-green text-[#062219]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white">{title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-400">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </MotionDiv>
        </div>
      </section>

      <section className={`border-t py-24 ${border}`}>
        <div className="kairo-shell">
          <MotionDiv {...reveal} className="mx-auto max-w-4xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-kairo-green/10 text-kairo-green">
              <CircleDollarSign className="h-6 w-6" />
            </div>
            <h2 className={`mt-7 text-4xl font-semibold tracking-[-0.045em] sm:text-6xl ${textMain}`}>
              {isAr ? 'ابدأ بالسؤال الأهم: أين يمكنني تحسين الأثر الآن؟' : 'Start with the question that matters: where can I improve now?'}
            </h2>
            <p className={`mx-auto mt-6 max-w-2xl text-lg leading-8 ${textSub}`}>
              {isAr
                ? 'لوحة المتابعة تجمع الصورة، وتشرح كل خاصية، ثم تنقلك إلى التحليل المناسب دون افتراض خبرة تقنية.'
                : 'The dashboard brings the picture together, explains each capability, and guides you to the right analysis without assuming technical expertise.'}
            </p>
            <Link
              to="/dashboard"
              className="btn-tactile mt-10 inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-kairo-green px-8 text-sm font-extrabold text-[#052019]"
            >
              {isAr ? 'افتح المتابعة البيئية' : 'Open environmental dashboard'}
              <ArrowUpRight className={`h-4 w-4 ${dir === 'rtl' ? '-scale-x-100' : ''}`} />
            </Link>
          </MotionDiv>
        </div>
      </section>
    </main>
  );
};

export default Home;
