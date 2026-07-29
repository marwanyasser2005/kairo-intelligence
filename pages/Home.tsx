import React from 'react';
import { Link } from 'react-router-dom';
import { Chip } from '@heroui/react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Activity,
  ArrowUpRight,
  Check,
  Cpu,
  Database,
  Droplets,
  Gauge,
  Globe2,
  Microscope,
  LockKeyhole,
  Orbit,
  Route,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  WalletCards,
  Zap,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { KairoBrandMark } from '../components/KairoBrand';

const MotionDiv = motion.div as any;

const Home: React.FC = () => {
  const { t, theme, dir, language } = useApp();
  const reduceMotion = useReducedMotion();
  const isLight = theme === 'light';
  const isAr = language === 'ar';

  const textMain = isLight ? 'text-slate-950' : 'text-white';
  const textSub = isLight ? 'text-slate-600' : 'text-slate-400';
  const border = isLight ? 'border-slate-900/[0.08]' : 'border-white/[0.08]';
  const surface = isLight ? 'bg-white/75' : 'bg-white/[0.035]';

  const reveal = {
    initial: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 26 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  };

  const loopIcons = [Database, Cpu, Activity, Globe2];
  const metrics = [
    { value: '24h', label: isAr ? 'نافذة توقع الهواء' : 'Air forecast window' },
    { value: '0–100', label: isAr ? 'مؤشر مخاطر واضح' : 'Explainable risk index' },
    { value: 'Local', label: isAr ? 'معالجة الصوت' : 'Audio processing' },
  ];

  const judgingBrief = [
    {
      Icon: Microscope,
      index: '01',
      title: isAr ? 'مشكلة مدينة قابلة للقياس' : 'A measurable city problem',
      text: isAr
        ? 'كيف نمنح فرق المدينة وقتًا للتصرف قبل تدهور الهواء أو تحول مؤشرات ضعف شبكة المياه إلى عطل مكلف؟'
        : 'How can city teams gain decision time before air quality deteriorates or water-network weakness becomes a costly failure?',
    },
    {
      Icon: Cpu,
      index: '02',
      title: isAr ? 'ابتكار رقمي قابل للتشغيل' : 'Deployable digital innovation',
      text: isAr
        ? 'تطبيق ويب يعمل على الهاتف واللابتوب، يستفيد من GPS والميكروفون اختياريًا ويجمعهما مع توقعات بيئية حية دون أجهزة خاصة في النسخة الأولى.'
        : 'A web app for phones and laptops that optionally uses GPS and microphone signals with live environmental forecasts—without dedicated hardware in v1.',
    },
    {
      Icon: WalletCards,
      index: '03',
      title: isAr ? 'قرار واضح بدل لوحة مزدحمة' : 'Decisions, not dashboard noise',
      text: isAr
        ? 'كل إشارة مرتبطة بهدف: وقت ذروة الهواء، أولوية فحص شبكة المياه، درجة ثقة، وعوامل تشرح لماذا ارتفع التنبيه.'
        : 'Every signal has a purpose: expected air peak, water-inspection priority, evidence confidence, and factors explaining the alert.',
    },
    {
      Icon: Route,
      index: '04',
      title: isAr ? 'طريق واضح للإنتاج والتحقق' : 'A clear production-validation path',
      text: isAr
        ? 'تجربة ميدانية على قطاعات محددة، معايرة المؤشر بسجل الأعطال وقراءات الضغط والتدفق، ثم تكامل بلدي وواجهات إنذار.'
        : 'Pilot selected sectors, calibrate against failure history and pressure/flow readings, then add municipal workflows and alert APIs.',
    },
  ];

  const researchStats = [
    ['02', isAr ? 'محركا إنذار' : 'Warning engines'],
    ['24h', isAr ? 'نافذة توقع' : 'Forecast window'],
    ['05', isAr ? 'إشارات جهاز هادفة' : 'Purposeful device signals'],
    ['03', isAr ? 'طبقات شفافية' : 'Transparency layers'],
  ];

  return (
    <main
      className={`min-h-screen overflow-hidden transition-colors duration-500 ${
        isLight ? 'bg-[#f5f8f6]' : 'bg-kairo-ink'
      }`}
      dir={dir}
    >
      <section className={`relative min-h-[100svh] border-b ${border}`}>
        <div className="kairo-grid absolute inset-0 opacity-80" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="kairo-ambient-orb absolute -top-32 left-[8%] h-[32rem] w-[32rem] rounded-full bg-kairo-green/[0.11] blur-[110px]" />
          <div className="absolute bottom-[-12rem] right-[-6rem] h-[30rem] w-[30rem] rounded-full bg-cyan-400/[0.07] blur-[120px]" />
        </div>

        <div className="kairo-shell relative z-10 flex min-h-[100svh] items-center pb-16 pt-32 lg:pb-24 lg:pt-36">
          <div className="grid w-full items-center gap-14 lg:grid-cols-[1.08fr_.92fr] lg:gap-20">
            <MotionDiv
              initial={reduceMotion ? false : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-3xl"
            >
              <div className="mb-7 flex flex-wrap items-center gap-3">
                <Chip color="success" size="sm" variant="soft">
                  <Chip.Label className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    {isAr ? 'تحدي الابتكار الرقمي · إنذار مبكر' : 'Digital Innovation Challenge · Early warning'}
                  </Chip.Label>
                </Chip>
                <span className={`text-xs font-semibold ${textSub}`}>
                  KAIRO · 2026
                </span>
              </div>

              <h1
                className={`max-w-4xl text-[clamp(3.1rem,7.4vw,7.3rem)] font-semibold leading-[0.96] tracking-[-0.055em] ${textMain}`}
              >
                <span className="kairo-gradient-text">
                  {isAr ? 'اعرف الخطر قبل أن تشعر به المدينة.' : 'Know the risk before the city feels it.'}
                </span>
              </h1>

              <p className={`mt-8 max-w-2xl text-lg leading-8 sm:text-xl ${textSub}`}>
                {isAr
                  ? 'KAIRO يحوّل توقعات جودة الهواء، موقع الجهاز، وسياق شبكة المياه إلى إنذارات مبكرة قابلة للتفسير وإجراءات واضحة للمدينة.'
                  : 'KAIRO turns air-quality forecasts, device location, and water-network context into explainable early warnings and clear city actions.'}
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/monitor"
                  className="btn-tactile group inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-kairo-green px-7 text-sm font-extrabold text-[#052019] shadow-glow-green hover:bg-[#42e4ba]"
                >
                  {isAr ? 'افتح غرفة الإنذار المبكر' : 'Open the early-warning room'}
                  <ArrowUpRight
                    className={`h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 ${
                      dir === 'rtl' ? '-scale-x-100' : ''
                    }`}
                  />
                </Link>
                <Link
                  to="/architecture"
                  className={`btn-tactile inline-flex min-h-14 items-center justify-center gap-3 rounded-full border px-7 text-sm font-bold backdrop-blur-xl ${border} ${textMain} ${
                    isLight ? 'bg-white/65 hover:bg-white' : 'bg-white/[0.045] hover:bg-white/[0.08]'
                  }`}
                >
                  <Orbit className="h-4 w-4 text-kairo-green" />
                  {isAr ? 'راجع منهج القرار' : 'Review the decision method'}
                </Link>
              </div>

              <div className={`mt-12 grid max-w-2xl grid-cols-3 border-t pt-7 ${border}`}>
                {metrics.map((metric) => (
                  <div key={metric.label} className="pe-3">
                    <div className={`text-xl font-extrabold sm:text-2xl ${textMain}`}>
                      {metric.value}
                    </div>
                    <div className={`mt-1 text-[10px] font-bold uppercase tracking-[0.12em] sm:text-xs ${textSub}`}>
                      {metric.label}
                    </div>
                  </div>
                ))}
              </div>
            </MotionDiv>

            <MotionDiv
              initial={reduceMotion ? false : { opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto w-full max-w-[570px]"
            >
              <div className="absolute -inset-8 rounded-full bg-kairo-green/[0.07] blur-3xl" />
              <div className={`kairo-glass relative overflow-hidden rounded-[2rem] p-4 shadow-glow sm:p-6`}>
                <div className={`flex items-center justify-between border-b pb-4 ${border}`}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-kairo-green/10 text-kairo-green">
                      <Gauge className="h-5 w-5" />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${textMain}`}>
                        {isAr ? 'مركز إشارات المدينة' : 'City signal center'}
                      </p>
                      <p className={`text-[11px] ${textSub}`}>
                        {isAr ? 'هواء · مياه · موقع · قرار' : 'Air · water · location · action'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-kairo-green/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-kairo-green">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-kairo-green" />
                    {isAr ? 'نشط' : 'Live'}
                  </div>
                </div>

                <div className="relative my-7 flex min-h-[285px] items-center justify-center overflow-hidden rounded-[1.6rem] bg-black/[0.16]">
                  <div className="absolute inset-0 kairo-grid opacity-70" />
                  <div className="absolute h-64 w-64 rounded-full border border-kairo-green/10" />
                  <div className="absolute h-48 w-48 animate-spin-slow rounded-full border border-dashed border-kairo-green/25" />
                  <div className="absolute h-32 w-32 rounded-full border border-kairo-green/30 bg-kairo-green/[0.04]" />
                  <KairoBrandMark className="relative h-28 aspect-[822/938] sm:h-32 lg:h-40" />

                  {[
                    { Icon: Droplets, position: 'left-[10%] top-[18%]', label: isAr ? 'مخاطر المياه' : 'Water risk' },
                    { Icon: Activity, position: 'right-[10%] top-[22%]', label: isAr ? 'هواء 24h' : 'Air 24h' },
                    { Icon: Globe2, position: 'bottom-[14%] left-[16%]', label: isAr ? 'GPS' : 'GPS' },
                    { Icon: TrendingUp, position: 'bottom-[12%] right-[12%]', label: isAr ? 'إنذار' : 'Warning' },
                  ].map(({ Icon, position, label }, index) => (
                    <MotionDiv
                      key={label}
                      animate={reduceMotion ? undefined : { y: [0, index % 2 ? -7 : 7, 0] }}
                      transition={{ duration: 4 + index * 0.4, repeat: Infinity, ease: 'easeInOut' }}
                      className={`absolute ${position} flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-2 text-[10px] font-bold text-white backdrop-blur-xl`}
                    >
                      <Icon className="h-3.5 w-3.5 text-kairo-green" />
                      {label}
                    </MotionDiv>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    [isAr ? 'البيانات' : 'Signal', isAr ? 'حية' : 'Live'],
                    [isAr ? 'المنطق' : 'Reasoning', isAr ? 'مفسّر' : 'Explainable'],
                    [isAr ? 'القرار' : 'Action', isAr ? 'جاهز' : 'Ready'],
                  ].map(([label, value]) => (
                    <div key={label} className={`rounded-2xl border p-3 ${border} ${surface}`}>
                      <div className={`text-[9px] font-bold uppercase tracking-widest ${textSub}`}>{label}</div>
                      <div className={`mt-2 truncate text-xs font-extrabold ${textMain}`}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </MotionDiv>
          </div>
        </div>
      </section>

      <section className={`border-b py-6 ${border} ${isLight ? 'bg-white/60' : 'bg-black/20'}`}>
        <div className="kairo-shell">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {t.home.proof.map((point: string) => (
              <div key={point} className="flex items-center gap-2.5 py-2">
                <Check className="h-4 w-4 shrink-0 text-kairo-green" />
                <span className={`text-xs font-semibold leading-5 ${textSub}`}>{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`relative border-b py-24 sm:py-32 ${border}`}>
        <div className="pointer-events-none absolute inset-0 kairo-grid opacity-35" />
        <div className="kairo-shell relative">
          <MotionDiv {...reveal} className="grid items-end gap-8 lg:grid-cols-[1fr_.72fr]">
            <div className="max-w-3xl">
              <span className="kairo-eyebrow">
                <ShieldCheck className="h-3.5 w-3.5" />
                {isAr ? 'ملخص لجنة التحكيم · تحدي الابتكار الرقمي' : 'Judging brief · Digital Innovation Challenge'}
              </span>
              <h2 className={`mt-6 text-4xl font-semibold tracking-[-0.04em] sm:text-6xl ${textMain}`}>
                {isAr ? 'من إشارة صغيرة إلى وقت قرار حقيقي للمدينة.' : 'From a weak signal to real decision time for the city.'}
              </h2>
              <p className={`mt-6 max-w-2xl text-lg leading-8 ${textSub}`}>
                {isAr
                  ? 'KAIRO يحول الهاتف أو اللابتوب إلى نقطة دخول آمنة لمنظومة إنذار مبكر، ثم يفصل بوضوح بين البيانات الحية والمؤشر التقديري وما يحتاج تحققًا ميدانيًا.'
                  : 'KAIRO turns a phone or laptop into a safe entry point for early warning, clearly separating live data, estimated indices, and evidence that still needs field verification.'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {researchStats.map(([value, label]) => (
                <div key={label} className={`rounded-2xl border p-4 sm:p-5 ${border} ${surface}`}>
                  <div className={`text-2xl font-black sm:text-3xl ${textMain}`}>{value}</div>
                  <div className={`mt-1 text-[10px] font-bold uppercase tracking-[.12em] sm:text-xs ${textSub}`}>{label}</div>
                </div>
              ))}
            </div>
          </MotionDiv>

          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {judgingBrief.map(({ Icon, index, title, text }, cardIndex) => (
              <MotionDiv
                key={title}
                {...reveal}
                transition={{ ...reveal.transition, delay: cardIndex * 0.07 }}
                className={`group rounded-[1.75rem] border p-6 transition-transform duration-300 hover:-translate-y-1 ${border} ${surface}`}
              >
                <div className="mb-9 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-kairo-green/10 text-kairo-green">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`font-mono text-xs ${textSub}`}>{index}</span>
                </div>
                <h3 className={`text-lg font-extrabold ${textMain}`}>{title}</h3>
                <p className={`mt-4 text-sm leading-7 ${textSub}`}>{text}</p>
              </MotionDiv>
            ))}
          </div>

          <MotionDiv
            {...reveal}
            className={`mt-6 flex flex-col justify-between gap-5 rounded-[1.75rem] border p-6 sm:flex-row sm:items-center ${border} ${
              isLight ? 'bg-[#09241d] text-white' : 'bg-kairo-green/[0.07]'
            }`}
          >
            <div>
              <p className="text-xs font-black uppercase tracking-[.16em] text-kairo-green">
                {isAr ? 'المسار: تحدي الابتكار الرقمي' : 'Track: Digital Innovation Challenge'}
              </p>
              <p className={`mt-2 text-base font-bold ${isLight ? 'text-white' : textMain}`}>
                {isAr
                  ? 'نسخة عرض قابلة للتشغيل الآن، مع مسار معايرة ميدانية واضح قبل أي ادعاء باحتمال تسريب إحصائي.'
                  : 'A working demonstration now, with a clear field-calibration path before any claim of statistical leak probability.'}
              </p>
            </div>
            <Link
              to="/impact"
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-kairo-green px-6 text-sm font-extrabold text-[#052019]"
            >
              {isAr ? 'استكشف المنهجية' : 'Explore methodology'}
              <ArrowUpRight className={`h-4 w-4 ${dir === 'rtl' ? '-scale-x-100' : ''}`} />
            </Link>
          </MotionDiv>
        </div>
      </section>

      <section className="relative py-24 sm:py-32">
        <div className="kairo-shell">
          <MotionDiv {...reveal} className="grid gap-12 lg:grid-cols-[.72fr_1.28fr] lg:gap-20">
            <div>
              <span className="kairo-eyebrow">{isAr ? 'المشكلة' : 'The constraint'}</span>
              <h2 className={`mt-6 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl ${textMain}`}>
                {t.home.reality.title}
              </h2>
              <p className={`mt-6 text-lg leading-8 ${textSub}`}>
                {t.home.reality.closing}
              </p>
            </div>

            <div className={`overflow-hidden rounded-[2rem] border ${border}`}>
              {t.home.reality.points.map((point: string, index: number) => (
                <MotionDiv
                  key={point}
                  whileHover={reduceMotion ? undefined : { x: dir === 'rtl' ? -8 : 8 }}
                  className={`group flex items-center gap-5 border-b p-5 last:border-0 sm:p-6 ${border} ${
                    isLight ? 'bg-white/55 hover:bg-white' : 'bg-white/[0.025] hover:bg-white/[0.05]'
                  }`}
                >
                  <span className="font-mono text-xs font-bold text-kairo-green">0{index + 1}</span>
                  <span className={`flex-1 text-base font-semibold sm:text-lg ${textMain}`}>{point}</span>
                  <ArrowUpRight className={`h-4 w-4 opacity-30 transition group-hover:opacity-100 ${dir === 'rtl' ? '-scale-x-100' : ''}`} />
                </MotionDiv>
              ))}
            </div>
          </MotionDiv>
        </div>
      </section>

      <section id="how-it-works" className={`border-y py-24 sm:py-32 ${border} ${isLight ? 'bg-white/55' : 'bg-white/[0.018]'}`}>
        <div className="kairo-shell">
          <MotionDiv {...reveal} className="mx-auto mb-14 max-w-3xl text-center">
            <span className="kairo-eyebrow">
              <Orbit className="h-3.5 w-3.5" />
              {isAr ? 'حلقة الذكاء' : 'Intelligence loop'}
            </span>
            <h2 className={`mt-6 text-4xl font-semibold tracking-[-0.04em] sm:text-6xl ${textMain}`}>
              {t.home.loop.title}
            </h2>
            <p className="mt-5 font-mono text-sm font-semibold text-kairo-green">
              {t.home.loop.subtitle}
            </p>
          </MotionDiv>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((stepNumber, index) => {
              const step = t.home.loop.steps[stepNumber];
              const Icon = loopIcons[index];
              return (
                <MotionDiv
                  key={stepNumber}
                  {...reveal}
                  transition={{ ...reveal.transition, delay: index * 0.08 }}
                  whileHover={reduceMotion ? undefined : { y: -8 }}
                  className={`kairo-shine group relative min-h-[315px] rounded-[1.75rem] border p-7 ${border} ${surface}`}
                >
                  <div className="mb-14 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-kairo-green/10 text-kairo-green transition group-hover:bg-kairo-green group-hover:text-[#08221b]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`font-mono text-xs ${textSub}`}>0{stepNumber}</span>
                  </div>
                  <h3 className={`text-xl font-extrabold ${textMain}`}>{step.title}</h3>
                  <p className={`mt-4 text-sm leading-6 ${textSub}`}>{step.desc}</p>
                  <div className="absolute bottom-7 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-kairo-green">
                    {step.link}
                    <ArrowUpRight className={`h-3.5 w-3.5 ${dir === 'rtl' ? '-scale-x-100' : ''}`} />
                  </div>
                </MotionDiv>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-32">
        <div className="kairo-shell">
          <MotionDiv
            {...reveal}
            className={`relative overflow-hidden rounded-[2.25rem] border p-7 sm:p-12 lg:p-16 ${border} ${
              isLight ? 'bg-[#09241d] text-white' : 'bg-[#0b1c17]'
            }`}
          >
            <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-kairo-green/20 blur-[100px]" />
            <div className="relative grid items-center gap-12 lg:grid-cols-[1fr_.82fr]">
              <div>
                <span className="kairo-eyebrow">{isAr ? 'العائد الحقيقي' : 'Measurable return'}</span>
                <h2 className="mt-6 max-w-2xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-6xl">
                  {t.home.roi.title}
                </h2>
                <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">{t.home.roi.desc}</p>
                <p className="mt-8 max-w-xl border-s-2 border-kairo-green ps-5 text-base font-semibold text-white">
                  {t.home.roi.closing}
                </p>
              </div>
              <div className="grid gap-3">
                {t.home.roi.points.map((point: string, index: number) => (
                  <MotionDiv
                    key={point}
                    whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-kairo-green text-[#062219]">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <span className="flex-1 font-bold text-white">{point}</span>
                    <span className="font-mono text-xs text-slate-500">0{index + 1}</span>
                  </MotionDiv>
                ))}
              </div>
            </div>
          </MotionDiv>
        </div>
      </section>

      <section className={`border-t py-24 sm:py-32 ${border}`}>
        <div className="kairo-shell">
          <MotionDiv {...reveal} className="mx-auto max-w-4xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-kairo-green/10 text-kairo-green">
              <Globe2 className="h-6 w-6" />
            </div>
            <h2 className={`mt-7 text-4xl font-semibold tracking-[-0.04em] sm:text-6xl ${textMain}`}>
              {t.home.global.title}
            </h2>
            <p className={`mx-auto mt-6 max-w-2xl text-lg leading-8 ${textSub}`}>{t.home.global.desc}</p>
            <p className={`mx-auto mt-8 max-w-3xl text-xl font-semibold sm:text-2xl ${textMain}`}>
              “{t.home.global.quote}”
            </p>

            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/dashboard"
                className="btn-tactile inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-kairo-green px-8 text-sm font-extrabold text-[#052019]"
              >
                {t.home.hero.ctaPrimary}
                <ArrowUpRight className={`h-4 w-4 ${dir === 'rtl' ? '-scale-x-100' : ''}`} />
              </Link>
              <Link
                to="/about"
                className={`btn-tactile inline-flex min-h-14 items-center justify-center gap-3 rounded-full border px-8 text-sm font-bold ${border} ${textMain}`}
              >
                <ShieldCheck className="h-4 w-4 text-kairo-green" />
                {t.nav.about}
              </Link>
            </div>
          </MotionDiv>

          <div className={`mt-20 grid gap-5 border-t pt-8 sm:grid-cols-3 ${border}`}>
            {[
              { Icon: LockKeyhole, title: t.home.trust[0] },
              { Icon: Activity, title: t.home.trust[1] },
              { Icon: ShieldCheck, title: t.home.trust[2] },
            ].map(({ Icon, title }) => (
              <div key={title} className="flex items-center justify-center gap-3">
                <Icon className="h-4 w-4 text-kairo-green" />
                <span className={`text-xs font-bold uppercase tracking-[0.1em] ${textSub}`}>{title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
