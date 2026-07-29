import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Building2,
  CalendarRange,
  CheckCircle2,
  Cloud,
  Coins,
  Cpu,
  Database,
  FileCheck2,
  Gauge,
  Globe2,
  KeyRound,
  Layers3,
  LockKeyhole,
  Network,
  PlugZap,
  Rocket,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  WalletCards,
  Workflow,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { KairoBrandLockup } from '../components/KairoBrand';

const MotionDiv = motion.div as any;

const SaasRoadmap: React.FC = () => {
  const { theme, dir, language } = useApp();
  const reduceMotion = useReducedMotion();
  const isLight = theme === 'light';
  const isAr = language === 'ar';

  const textMain = isLight ? 'text-slate-950' : 'text-white';
  const textSub = isLight ? 'text-slate-600' : 'text-slate-400';
  const border = isLight ? 'border-slate-900/[0.09]' : 'border-white/[0.09]';
  const surface = isLight ? 'bg-white/80' : 'bg-white/[0.035]';

  const reveal = {
    initial: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-70px' },
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  };

  const audiences = [
    {
      Icon: Users,
      code: 'B2C',
      title: isAr ? 'الأفراد · Freemium' : 'Individuals · Freemium',
      value: isAr ? 'تحويل الاستهلاك الشخصي إلى توفير شهري واضح.' : 'Turn personal consumption into visible monthly savings.',
      free: isAr ? 'حاسبات أساسية، تتبع شهري، ونصائح عامة.' : 'Core calculators, monthly tracking and general guidance.',
      paid: isAr ? 'OCR للفواتير، خطة شخصية، تنبيهات واستشراف.' : 'Bill OCR, personalized plans, alerts and forecasting.',
      color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    },
    {
      Icon: Building2,
      code: 'B2B',
      title: isAr ? 'الشركات · Corporate / CSR' : 'Companies · Corporate / CSR',
      value: isAr ? 'قياس أداء المؤسسة وتحويله إلى قرارات وتقارير.' : 'Measure organizational performance and turn it into decisions and reports.',
      free: isAr ? 'تجربة Workspace محدودة ومؤشرات تشغيلية.' : 'A limited workspace trial with operational indicators.',
      paid: isAr ? 'موظفون وصلاحيات، أهداف، ESG وتصدير تقارير.' : 'Seats and roles, targets, ESG workflows and report exports.',
      color: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
    },
    {
      Icon: Globe2,
      code: 'B2G / NGO',
      title: isAr ? 'حكومات ومنظمات · Enterprise' : 'Government & NGOs · Enterprise',
      value: isAr ? 'إشارات مجمعة تساعد على توجيه السياسات والدعم.' : 'Aggregated signals that help direct policy and support.',
      free: isAr ? 'Pilot محدد النطاق والمدة بمؤشرات معلنة.' : 'A time-boxed, clearly scoped pilot.',
      paid: isAr ? 'تحليلات مناطق، تكامل بيانات، API ودعم مؤسسي.' : 'Regional analytics, data integrations, APIs and enterprise support.',
      color: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    },
  ];

  const phases = [
    {
      window: isAr ? 'الآن' : 'Now',
      stage: 'MVP',
      Icon: ScanLine,
      title: isAr ? 'إثبات القيمة' : 'Prove the value',
      status: isAr ? 'مُنجز وقابل للعرض' : 'Built and demonstrable',
      summary: isAr
        ? 'منصة ثنائية اللغة تحول بيانات المياه والطاقة والغذاء والنقل والمخلفات إلى أثر مالي وبيئي قابل للفهم.'
        : 'A bilingual platform turning water, energy, food, mobility and waste data into understandable financial and environmental impact.',
      deliverables: isAr
        ? ['واجهة متجاوبة ووحدات قرار مترابطة', 'Gemini وOCR وتقارير PDF/PNG', 'بوابة AI خادمية آمنة', 'حفظ الجلسة حاليًا عبر Local Storage']
        : ['Responsive UI and connected decision modules', 'Gemini, OCR and PDF/PNG reports', 'Secure server-side AI gateway', 'Session persistence currently via local storage'],
      gate: isAr ? 'اختبار قابلية الاستخدام وإثبات أن التوفير مفهوم للمستخدم.' : 'Usability validation and proof that users understand the savings value.',
    },
    {
      window: isAr ? 'شهر 1–3' : 'Months 1–3',
      stage: 'Cloud',
      Icon: Cloud,
      title: isAr ? 'الأساس السحابي' : 'Cloud foundation',
      status: isAr ? 'أولوية التنفيذ التالية' : 'Next implementation priority',
      summary: isAr
        ? 'نقل الهوية والبيانات والتقارير من الجهاز إلى منصة موثوقة قابلة للاسترجاع والتدقيق.'
        : 'Move identity, data and reports from the device into a reliable, recoverable and auditable platform.',
      deliverables: isAr
        ? ['PostgreSQL مُدار مع نسخ احتياطي', 'تسجيل Email وGoogle ثم SSO لاحقًا', 'تشفير وصلاحيات وسياسات احتفاظ', 'ترحيل من Local Storage وحسابات قابلة للاستعادة']
        : ['Managed PostgreSQL with backups', 'Email and Google sign-in, then SSO', 'Encryption, authorization and retention rules', 'Local-storage migration and recoverable accounts'],
      gate: isAr ? 'لا إطلاق عام قبل اختبار العزل، الاسترجاع، وحذف الحساب.' : 'No public launch before isolation, recovery and account-deletion tests pass.',
    },
    {
      window: isAr ? 'شهر 3–6' : 'Months 3–6',
      stage: 'Revenue',
      Icon: WalletCards,
      title: isAr ? 'هيكلة SaaS والدفع' : 'SaaS and monetization',
      status: isAr ? 'إطلاق تجاري مُراقَب' : 'Controlled commercial launch',
      summary: isAr
        ? 'تحويل المنتج إلى Workspaces متعددة المستأجرين مع اشتراكات وصلاحيات وفوترة واضحة.'
        : 'Turn the product into multi-tenant workspaces with subscriptions, roles and transparent billing.',
      deliverables: isAr
        ? ['عزل Tenant وWorkspace لكل مؤسسة', 'أدوار مالك ومدير ومحلل وموظف', 'Stripe أو Paymob حسب السوق والكيان القانوني', 'قياس تكلفة كل تقرير وتوجيه النماذج حسب السعر والسرعة']
        : ['Tenant and workspace isolation', 'Owner, admin, analyst and employee roles', 'Stripe or Paymob based on market and legal entity', 'Per-report AI cost metering and cost/latency routing'],
      gate: isAr ? 'إثبات استعداد الدفع وهامش إجمالي مستهدف قابل للحفاظ.' : 'Validate willingness to pay and a defensible target gross margin.',
    },
    {
      window: isAr ? 'شهر 6–9' : 'Months 6–9',
      stage: 'Integrate',
      Icon: PlugZap,
      title: isAr ? 'التكامل والاحتفاظ' : 'Integrate and retain',
      status: isAr ? 'زيادة عمق الاستخدام' : 'Increase product depth',
      summary: isAr
        ? 'تقليل الإدخال اليدوي وجعل كايرو جزءًا من دورة العمل اليومية للمستخدم والمؤسسة.'
        : 'Reduce manual entry and make KAIRO part of the user’s and organization’s daily workflow.',
      deliverables: isAr
        ? ['ربط تجريبي بالعدادات الذكية وIoT', 'Open API مع مفاتيح ونسب استخدام', 'تكامل ERP/CSV أولًا ثم موصلات أعمق', 'نقاط وتحديات ومكافآت بشركاء بيئيين']
        : ['Pilot smart-meter and IoT connections', 'Open API with keys and rate limits', 'ERP/CSV integration first, deeper connectors later', 'Points, challenges and partner rewards'],
      gate: isAr ? 'قياس انخفاض الإدخال اليدوي وتحسن الاحتفاظ قبل إضافة تكاملات أخرى.' : 'Measure lower manual entry and improved retention before adding more integrations.',
    },
    {
      window: isAr ? 'شهر 9–12' : 'Months 9–12',
      stage: 'Scale',
      Icon: Rocket,
      title: isAr ? 'التوسع والامتثال' : 'Scale and compliance',
      status: isAr ? 'جاهزية مؤسسية وإقليمية' : 'Enterprise and regional readiness',
      summary: isAr
        ? 'تحسين الاعتمادية والخصوصية وتجربة الهاتف قبل التوسع من مصر إلى أسواق الندرة في المنطقة.'
        : 'Strengthen reliability, privacy and mobile experience before expanding from Egypt into regional scarcity markets.',
      deliverables: isAr
        ? ['PWA أولًا ثم React Native عند ثبوت الحاجة', 'إشعارات وتصوير فواتير بالكاميرا', 'GDPR وخصوصية محلية وسجلات تدقيق', 'MRV مستقل قبل أي ادعاء أو تداول لشهادات الكربون']
        : ['PWA first, then React Native when justified', 'Push notifications and camera bill capture', 'GDPR, local privacy and audit logs', 'Independent MRV before any carbon-credit claim or trading'],
      gate: isAr ? 'مراجعة أمان وخصوصية واتفاقيات مستوى خدمة قبل عقود Enterprise.' : 'Security, privacy and SLA review before enterprise contracts.',
    },
  ];

  const architecture = [
    { Icon: Smartphone, label: isAr ? 'Web / PWA / Mobile' : 'Web / PWA / Mobile' },
    { Icon: KeyRound, label: isAr ? 'الهوية والصلاحيات' : 'Identity & access' },
    { Icon: Layers3, label: isAr ? 'Workspaces متعددة' : 'Multi-tenant workspaces' },
    { Icon: Database, label: isAr ? 'PostgreSQL + سجل تدقيق' : 'PostgreSQL + audit log' },
    { Icon: Cpu, label: isAr ? 'محرك KAIRO وتوجيه AI' : 'KAIRO engine & AI routing' },
    { Icon: Network, label: isAr ? 'API / IoT / ERP' : 'API / IoT / ERP' },
  ];

  const businessModel = [
    {
      name: isAr ? 'مجاني' : 'Free',
      buyer: isAr ? 'فرد يريد فهم بصمته' : 'An individual learning their footprint',
      model: isAr ? 'اكتساب وثقة' : 'Acquisition and trust',
      includes: isAr ? ['حاسبات أساسية', 'سجل شهري محدود', 'توصيات عامة'] : ['Core calculators', 'Limited monthly history', 'General recommendations'],
    },
    {
      name: isAr ? 'Premium' : 'Premium',
      buyer: isAr ? 'فرد يريد توفيرًا مخصصًا' : 'An individual seeking personalized savings',
      model: isAr ? 'اشتراك شهري أو سنوي' : 'Monthly or annual subscription',
      includes: isAr ? ['OCR للفواتير', 'خطة شخصية', 'تنبيهات وتوقعات'] : ['Bill OCR', 'Personal plan', 'Alerts and forecasts'],
    },
    {
      name: isAr ? 'Corporate' : 'Corporate',
      buyer: isAr ? 'شركة أو مدرسة أو منشأة' : 'A company, school or facility',
      model: isAr ? 'Workspace + مستخدمون + حجم تقارير' : 'Workspace + seats + report volume',
      includes: isAr ? ['صلاحيات وفرق', 'أهداف وحملات', 'تقارير ESG قابلة للمراجعة'] : ['Roles and teams', 'Targets and campaigns', 'Reviewable ESG reporting'],
    },
    {
      name: isAr ? 'Enterprise' : 'Enterprise',
      buyer: isAr ? 'حكومة أو NGO أو مجموعة كبيرة' : 'Government, NGO or large group',
      model: isAr ? 'عقد سنوي + تنفيذ ودعم' : 'Annual contract + implementation and support',
      includes: isAr ? ['تحليلات مجمعة', 'SSO وAPI', 'SLA وتكاملات مخصصة'] : ['Aggregated analytics', 'SSO and API', 'SLA and custom integrations'],
    },
  ];

  const scorecard = [
    { Icon: BadgeCheck, value: '≥ 35%', label: isAr ? 'هدف تفعيل أولي بعد التسجيل' : 'Early activation target after sign-up' },
    { Icon: Gauge, value: '≥ 70%', label: isAr ? 'هامش إجمالي مستهدف بعد ضبط تكلفة AI' : 'Target gross margin after AI-cost control' },
    { Icon: BarChart3, value: '30 / 90', label: isAr ? 'قياس احتفاظ 30 و90 يومًا' : '30- and 90-day retention cohorts' },
    { Icon: ShieldCheck, value: '0', label: isAr ? 'أسرار أو مفاتيح في المتصفح' : 'Secrets or provider keys in the browser' },
  ];

  return (
    <main className={`min-h-screen overflow-hidden ${isLight ? 'bg-[#f5f8f6]' : 'bg-kairo-ink'}`} dir={dir}>
      <section className={`relative border-b ${border}`}>
        <div className="kairo-grid absolute inset-0 opacity-75" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-kairo-green/[0.11] blur-[130px]" />
        <div className="kairo-shell relative grid min-h-[92svh] items-center gap-12 pb-20 pt-32 lg:grid-cols-[1fr_.72fr] lg:pt-36">
          <MotionDiv
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="kairo-eyebrow">
              <Sparkles className="h-3.5 w-3.5" />
              {isAr ? 'خارطة التحول إلى SaaS · 12 شهرًا' : 'SaaS transformation roadmap · 12 months'}
            </span>
            <h1 className={`mt-7 max-w-4xl text-[clamp(2.8rem,6.4vw,6.8rem)] font-semibold leading-[.98] tracking-[-.055em] ${textMain}`}>
              {isAr ? 'كايرو تترجم الاستدامة إلى ' : 'KAIRO turns sustainability into '}
              <span className="kairo-gradient-text">{isAr ? 'توفير قابل للقياس.' : 'measurable savings.'}</span>
            </h1>
            <p className={`mt-7 max-w-2xl text-lg leading-8 sm:text-xl ${textSub}`}>
              {isAr
                ? 'الخطة الواقعية لتحويل النموذج البحثي الحالي إلى منصة اشتراكات تخدم الأفراد والشركات والحكومات—ببنية سحابية آمنة، اقتصاديات واضحة، وتحقق ميداني قبل التوسع.'
                : 'A realistic plan to turn today’s research prototype into a subscription platform for people, companies and governments—with secure cloud foundations, clear economics and field validation before scale.'}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#roadmap" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-kairo-green px-7 text-sm font-extrabold text-[#052019]">
                <CalendarRange className="h-4 w-4" />
                {isAr ? 'استكشف مراحل التنفيذ' : 'Explore execution phases'}
              </a>
              <Link to="/dashboard" className={`inline-flex min-h-14 items-center justify-center gap-2 rounded-full border px-7 text-sm font-bold ${border} ${textMain}`}>
                {isAr ? 'شاهد الـ MVP الحالي' : 'View the current MVP'}
                <ArrowUpRight className={`h-4 w-4 ${dir === 'rtl' ? '-scale-x-100' : ''}`} />
              </Link>
            </div>
          </MotionDiv>

          <MotionDiv
            initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-md"
          >
            <div className="absolute -inset-8 rounded-full bg-kairo-green/[0.08] blur-3xl" />
            <div className={`relative rounded-[2rem] border p-5 ${border} ${surface}`}>
              <KairoBrandLockup className="mx-auto h-32 aspect-[822/938] sm:h-40 lg:h-[10.5rem]" />
              <div className={`mt-5 grid grid-cols-3 gap-2 border-t pt-5 ${border}`}>
                {[
                  ['MVP', isAr ? 'الآن' : 'Now'],
                  ['SaaS', isAr ? '6 أشهر' : '6 months'],
                  ['Scale', isAr ? '12 شهرًا' : '12 months'],
                ].map(([value, label]) => (
                  <div key={value} className="text-center">
                    <div className={`text-sm font-black ${textMain}`}>{value}</div>
                    <div className={`mt-1 text-[10px] font-bold uppercase ${textSub}`}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </MotionDiv>
        </div>
      </section>

      <section className="py-24 sm:py-32">
        <div className="kairo-shell">
          <MotionDiv {...reveal} className="max-w-3xl">
            <span className="kairo-eyebrow">{isAr ? 'المنتج التجاري' : 'Commercial product'}</span>
            <h2 className={`mt-6 text-4xl font-semibold tracking-[-.04em] sm:text-6xl ${textMain}`}>
              {isAr ? 'منتج واحد، ثلاث طرق لخلق القيمة.' : 'One product, three value motions.'}
            </h2>
            <p className={`mt-5 text-lg leading-8 ${textSub}`}>
              {isAr
                ? 'لا نبيع “حساب بصمة” فقط؛ نبيع قرارًا موثوقًا يوضح أين يذهب المورد، كم يكلف، وما الخطوة التي يمكن التحقق من أثرها.'
                : 'We are not selling another footprint calculator; we are selling a trusted decision that shows where a resource goes, what it costs and which action can be verified.'}
            </p>
          </MotionDiv>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {audiences.map(({ Icon, code, title, value, free, paid, color }, index) => (
              <MotionDiv key={code} {...reveal} transition={{ ...reveal.transition, delay: index * 0.08 }} className={`rounded-[1.8rem] border p-6 sm:p-8 ${border} ${surface}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`font-mono text-xs font-black ${textSub}`}>{code}</span>
                </div>
                <h3 className={`mt-8 text-xl font-extrabold ${textMain}`}>{title}</h3>
                <p className={`mt-3 min-h-[4rem] text-sm leading-7 ${textSub}`}>{value}</p>
                <div className={`mt-6 space-y-4 border-t pt-5 ${border}`}>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-kairo-green">{isAr ? 'الدخول / التجربة' : 'Entry / trial'}</p>
                    <p className={`mt-2 text-sm leading-6 ${textMain}`}>{free}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-kairo-green">{isAr ? 'القيمة المدفوعة' : 'Paid value'}</p>
                    <p className={`mt-2 text-sm leading-6 ${textMain}`}>{paid}</p>
                  </div>
                </div>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      <section id="roadmap" className={`border-y py-24 sm:py-32 ${border} ${isLight ? 'bg-white/55' : 'bg-white/[0.018]'}`}>
        <div className="kairo-shell">
          <MotionDiv {...reveal} className="mx-auto max-w-3xl text-center">
            <span className="kairo-eyebrow"><Workflow className="h-3.5 w-3.5" /> {isAr ? 'خطة التنفيذ' : 'Execution plan'}</span>
            <h2 className={`mt-6 text-4xl font-semibold tracking-[-.04em] sm:text-6xl ${textMain}`}>
              {isAr ? 'كل مرحلة لها مخرجات وبوابة قرار.' : 'Every phase has outputs and a decision gate.'}
            </h2>
            <p className={`mt-5 text-lg leading-8 ${textSub}`}>
              {isAr ? 'التواريخ تقديرات تنفيذ، وليست وعودًا؛ الانتقال للمرحلة التالية يعتمد على اجتياز التحقق التقني والتجاري.' : 'Timings are execution estimates, not promises; each next phase depends on technical and commercial validation.'}
            </p>
          </MotionDiv>

          <div className="relative mx-auto mt-16 max-w-5xl">
            <div className="absolute bottom-0 start-[1.45rem] top-0 hidden w-px bg-gradient-to-b from-kairo-green via-kairo-green/40 to-transparent sm:block" />
            <div className="space-y-5">
              {phases.map(({ window, stage, Icon, title, status, summary, deliverables, gate }, index) => (
                <MotionDiv key={stage} {...reveal} transition={{ ...reveal.transition, delay: index * 0.06 }} className="relative sm:ps-20">
                  <div className="absolute start-0 top-7 hidden h-12 w-12 items-center justify-center rounded-2xl border border-kairo-green/30 bg-kairo-ink text-kairo-green shadow-glow-green sm:flex">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className={`rounded-[1.8rem] border p-6 sm:p-8 ${border} ${surface}`}>
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-kairo-green/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-kairo-green">{window}</span>
                          <span className={`font-mono text-[10px] font-bold uppercase tracking-widest ${textSub}`}>{stage}</span>
                        </div>
                        <h3 className={`mt-4 text-2xl font-black ${textMain}`}>{title}</h3>
                      </div>
                      <span className={`w-fit rounded-full border px-3 py-1.5 text-[10px] font-bold ${border} ${textSub}`}>{status}</span>
                    </div>
                    <p className={`mt-5 max-w-3xl text-sm leading-7 sm:text-base ${textSub}`}>{summary}</p>
                    <div className="mt-6 grid gap-3 md:grid-cols-2">
                      {deliverables.map((item) => (
                        <div key={item} className={`flex items-start gap-3 rounded-2xl border p-4 ${border}`}>
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-kairo-green" />
                          <span className={`text-sm leading-6 ${textMain}`}>{item}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 flex items-start gap-3 rounded-2xl bg-kairo-green/[0.07] p-4">
                      <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-kairo-green" />
                      <p className={`text-sm font-semibold leading-6 ${textMain}`}>
                        <span className="text-kairo-green">{isAr ? 'بوابة القرار: ' : 'Decision gate: '}</span>{gate}
                      </p>
                    </div>
                  </div>
                </MotionDiv>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-32">
        <div className="kairo-shell">
          <MotionDiv {...reveal} className={`relative overflow-hidden rounded-[2.2rem] border p-7 sm:p-12 ${border} ${isLight ? 'bg-[#09241d]' : 'bg-[#0b1c17]'}`}>
            <div className="pointer-events-none absolute -end-24 -top-24 h-80 w-80 rounded-full bg-kairo-green/20 blur-[100px]" />
            <div className="relative">
              <span className="kairo-eyebrow">{isAr ? 'معمار SaaS المستهدف' : 'Target SaaS architecture'}</span>
              <h2 className="mt-6 max-w-3xl text-4xl font-semibold tracking-[-.04em] text-white sm:text-6xl">
                {isAr ? 'طبقات مستقلة، بيانات معزولة، وذكاء محسوب التكلفة.' : 'Decoupled layers, isolated data and cost-aware intelligence.'}
              </h2>
              <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                {architecture.map(({ Icon, label }, index) => (
                  <div key={label} className="relative rounded-2xl border border-white/10 bg-white/[0.055] p-5">
                    <Icon className="h-5 w-5 text-kairo-green" />
                    <p className="mt-5 text-sm font-bold leading-6 text-white">{label}</p>
                    <span className="absolute end-3 top-3 font-mono text-[9px] text-slate-600">0{index + 1}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[
                  { Icon: ShieldCheck, title: isAr ? 'الأمان افتراضيًا' : 'Secure by default', text: isAr ? 'مفاتيح مزودي AI على الخادم، تشفير، RBAC وسجل تدقيق.' : 'Server-side provider keys, encryption, RBAC and audit logs.' },
                  { Icon: Coins, title: isAr ? 'تكلفة قابلة للضبط' : 'Controlled unit cost', text: isAr ? 'قياس tokens والتخزين لكل Tenant وتوجيه النموذج حسب المهمة.' : 'Meter tokens and storage per tenant; route models by task.' },
                  { Icon: FileCheck2, title: isAr ? 'نتائج قابلة للمراجعة' : 'Reviewable outputs', text: isAr ? 'مصادر وافتراضات وإصدارات للمعاملات بدل أرقام سوداء الصندوق.' : 'Sources, assumptions and versioned factors instead of black-box numbers.' },
                ].map(({ Icon, title, text }) => (
                  <div key={title} className="flex gap-4 rounded-2xl border border-white/10 p-5">
                    <Icon className="mt-1 h-5 w-5 shrink-0 text-kairo-green" />
                    <div>
                      <h3 className="font-bold text-white">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </MotionDiv>
        </div>
      </section>

      <section className={`border-y py-24 sm:py-32 ${border} ${isLight ? 'bg-white/55' : 'bg-white/[0.018]'}`}>
        <div className="kairo-shell">
          <MotionDiv {...reveal} className="grid gap-10 lg:grid-cols-[.78fr_1.22fr]">
            <div>
              <span className="kairo-eyebrow">{isAr ? 'نموذج الإيراد' : 'Revenue design'}</span>
              <h2 className={`mt-6 text-4xl font-semibold tracking-[-.04em] sm:text-5xl ${textMain}`}>
                {isAr ? 'نسعّر القيمة، لا عدد الشاشات.' : 'Price the value, not the screen count.'}
              </h2>
              <p className={`mt-5 text-lg leading-8 ${textSub}`}>
                {isAr
                  ? 'الأسعار النهائية لا تُفترض الآن؛ تُحدد بعد مقابلات استعداد الدفع وتجارب Pilot وقياس تكلفة الخدمة الفعلية.'
                  : 'Final prices should not be guessed now; they follow willingness-to-pay interviews, pilots and measured service cost.'}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {businessModel.map(({ name, buyer, model, includes }) => (
                <div key={name} className={`rounded-[1.65rem] border p-6 ${border} ${surface}`}>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className={`text-xl font-black ${textMain}`}>{name}</h3>
                    <Coins className="h-5 w-5 text-kairo-green" />
                  </div>
                  <p className={`mt-3 text-sm leading-6 ${textSub}`}>{buyer}</p>
                  <p className="mt-4 text-xs font-black uppercase tracking-wider text-kairo-green">{model}</p>
                  <ul className="mt-5 space-y-2.5">
                    {includes.map((item) => (
                      <li key={item} className={`flex items-start gap-2 text-sm ${textMain}`}>
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-kairo-green" />{item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </MotionDiv>
        </div>
      </section>

      <section className="py-24 sm:py-32">
        <div className="kairo-shell">
          <MotionDiv {...reveal} className="mx-auto max-w-3xl text-center">
            <span className="kairo-eyebrow">{isAr ? 'لوحة تحقق الخطة' : 'Roadmap scorecard'}</span>
            <h2 className={`mt-6 text-4xl font-semibold tracking-[-.04em] sm:text-6xl ${textMain}`}>
              {isAr ? 'ننقل المرحلة بالدليل، لا بالحماس.' : 'Advance by evidence, not enthusiasm.'}
            </h2>
          </MotionDiv>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {scorecard.map(({ Icon, value, label }) => (
              <MotionDiv key={label} {...reveal} className={`rounded-[1.7rem] border p-6 ${border} ${surface}`}>
                <Icon className="h-5 w-5 text-kairo-green" />
                <div className={`mt-8 text-3xl font-black ${textMain}`}>{value}</div>
                <p className={`mt-2 text-sm leading-6 ${textSub}`}>{label}</p>
              </MotionDiv>
            ))}
          </div>
          <div className={`mt-6 rounded-[1.8rem] border p-6 sm:p-8 ${border} ${surface}`}>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { title: isAr ? 'مخاطر تقنية' : 'Technical risk', text: isAr ? 'دقة OCR، تفاوت الفواتير، تكامل العدادات، وتوفر نماذج AI.' : 'OCR accuracy, bill variance, meter integration and AI-model availability.' },
                { title: isAr ? 'مخاطر تجارية' : 'Commercial risk', text: isAr ? 'استعداد الدفع، طول دورة مبيعات B2B، وتكلفة اكتساب المستخدم.' : 'Willingness to pay, B2B sales cycle and acquisition cost.' },
                { title: isAr ? 'مخاطر ثقة وامتثال' : 'Trust and compliance risk', text: isAr ? 'خصوصية الفواتير والموقع، جودة معاملات الانبعاث، وادعاءات الكربون.' : 'Bill and location privacy, emission-factor quality and carbon claims.' },
              ].map(({ title, text }) => (
                <div key={title}>
                  <h3 className={`font-black ${textMain}`}>{title}</h3>
                  <p className={`mt-3 text-sm leading-7 ${textSub}`}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={`border-t py-24 ${border}`}>
        <div className="kairo-shell">
          <MotionDiv {...reveal} className="mx-auto max-w-4xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-kairo-green/10 text-kairo-green">
              <Rocket className="h-6 w-6" />
            </div>
            <h2 className={`mt-7 text-4xl font-semibold tracking-[-.04em] sm:text-6xl ${textMain}`}>
              {isAr ? 'الخطوة التالية: Cloud Foundation.' : 'Next move: Cloud Foundation.'}
            </h2>
            <p className={`mx-auto mt-6 max-w-2xl text-lg leading-8 ${textSub}`}>
              {isAr
                ? 'ابدأ بقاعدة البيانات والهوية وعزل البيانات، ثم اختبر الاستخدام والدفع قبل بناء التكاملات المكلفة. بهذه الأولويات يتحول كايرو من Demo قوي إلى شركة SaaS قابلة للنمو.'
                : 'Start with database, identity and data isolation; then validate usage and payment before expensive integrations. That sequence turns KAIRO from a strong demo into a scalable SaaS company.'}
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/about" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-kairo-green px-8 text-sm font-extrabold text-[#052019]">
                {isAr ? 'عن الفريق والرؤية' : 'Team and vision'}
                <ArrowUpRight className={`h-4 w-4 ${dir === 'rtl' ? '-scale-x-100' : ''}`} />
              </Link>
              <Link to="/architecture" className={`inline-flex min-h-14 items-center justify-center gap-2 rounded-full border px-8 text-sm font-bold ${border} ${textMain}`}>
                {isAr ? 'المعمار التقني الحالي' : 'Current technical architecture'}
              </Link>
            </div>
          </MotionDiv>
        </div>
      </section>
    </main>
  );
};

export default SaasRoadmap;
