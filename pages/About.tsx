
import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Target,
  Globe,
  ArrowRight,
  Activity,
  Zap,
  Database,
  Recycle,
  Wind,
  FlaskConical,
  Building2,
  RadioTower,
  Award,
  BookOpen,
  BrainCircuit,
  Code2,
  GraduationCap,
  Medal,
  Network,
  Trophy,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { kairoPublicIdentity } from '../config/kairoKnowledge';

// Type casting to bypass strict environment checks
const MotionDiv = motion.div as any;

const activeTeam = {
    founder: {
      name: kairoPublicIdentity.founder.en,
      nameAr: kairoPublicIdentity.founder.ar,
      image: "https://lh3.googleusercontent.com/d/1Ytrot7_Ct_wJEjUbctwRa2a5M6x6D4Ev=w1600"
    }
};

const About: React.FC = () => {
  const { t, theme, dir, language } = useApp();
  const isLight = theme === 'light';
  const isAr = language === 'ar';

  const textMain = isLight ? 'text-gray-900' : 'text-white';
  const textSub = isLight ? 'text-gray-600' : 'text-gray-400';
  const bgSection = isLight ? 'bg-gray-50' : 'bg-black';
  const cardBg = isLight ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10';
  const cardBorder = isLight ? 'border-gray-200' : 'border-white/10';

  const expertise = isAr
    ? ['تعلم الآلة', 'التعلم العميق', 'علم البيانات', 'تطوير البرمجيات', 'تطبيقات الذكاء الاصطناعي']
    : ['Machine Learning', 'Deep Learning', 'Data Science', 'Software Development', 'AI Applications'];

  const trainingOrganizations = ['ALX Africa', 'DEPI', 'Amideast', 'Zewail City', 'ITI', 'Huawei', 'The Sparks Foundation'];

  const achievements = [
    {
      Icon: Medal,
      title: isAr ? 'خبرة متقدمة في الحوسبة السحابية' : 'Advanced cloud computing experience',
      meta: isAr ? 'بناء وتشغيل حلول رقمية قابلة للتوسع' : 'Building scalable digital solutions',
    },
    {
      Icon: Trophy,
      title: isAr ? 'تميز مهني في تطوير الحلول' : 'Professional achievement in solution delivery',
      meta: isAr ? 'تنفيذ منتجات رقمية موجهة للمستخدم' : 'Delivering user-centered digital products',
    },
    {
      Icon: Award,
      title: isAr ? 'خبرة في الابتكار البحثي التطبيقي' : 'Applied research and innovation experience',
      meta: isAr ? 'تحويل الأفكار العلمية إلى نماذج قابلة للاختبار' : 'Turning scientific ideas into testable prototypes',
    },
  ];

  return (
    <div className={`min-h-screen px-4 pb-20 pt-28 transition-colors duration-500 sm:px-6 sm:pt-32 lg:pt-36 ${bgSection}`} dir={dir}>
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="mb-24 max-w-4xl mx-auto text-center md:text-start">
             <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border ${isLight ? 'bg-white border-gray-200 text-gray-500' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                <Users className="w-3 h-3" /> {t.nav.about}
            </div>
            <h1 className={`text-5xl md:text-7xl font-bold mb-8 leading-[1.1] ${textMain}`}>
                {t.about.title} <br/>
                <span className="text-kairo-green">{t.about.titleSub}</span>
            </h1>
            <p className={`text-xl md:text-2xl leading-relaxed font-light ${textSub}`}>
                {t.about.intro}
            </p>
        </header>

        {/* 1. THE PROBLEM (High Authority) */}
        <section className="mb-32">
            <div className={`p-10 md:p-16 rounded-[2.5rem] bg-slate-950 border border-white/10 text-white relative overflow-hidden`}>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <div className="relative z-10">
                    <h2 className="mb-12 border-s-4 border-kairo-green ps-6 text-3xl font-bold md:text-4xl">{t.about.problem.title}</h2>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                        {t.about.problem.vectors.map((vec: any, i: number) => (
                            <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                <div className="text-kairo-green mb-4">
                                    {[<Activity/>, <Zap/>, <Recycle/>, <Wind/>, <Database/>][i] || <Activity/>}
                                </div>
                                <h3 className="text-lg font-bold mb-2">{vec.title}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">{vec.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="p-8 border-t border-white/10 text-center md:text-start">
                        <p className="text-xl md:text-2xl font-light text-gray-300">
                            "{t.about.problem.bridge}"
                        </p>
                    </div>
                </div>
            </div>
        </section>

        {/* 2. ORIGIN & CONTEXT */}
        <section className="mb-32 grid md:grid-cols-2 gap-16 items-center">
            <div>
                <h3 className={`text-sm font-bold uppercase tracking-widest mb-6 ${textSub}`}>{t.about.origin.title}</h3>
                <div className="space-y-6 text-lg leading-relaxed">
                    <p className={textMain}>{t.about.origin.p1}</p>
                    <p className={textSub}>{t.about.origin.p2}</p>
                    <p className="border-s-2 border-kairo-green ps-4 font-bold text-kairo-green">{t.about.origin.statement}</p>
                </div>
            </div>
            <div className={`p-8 rounded-3xl border ${cardBg}`}>
                <Globe className={`w-12 h-12 mb-6 ${textMain}`} />
                <h3 className={`text-2xl font-bold mb-4 ${textMain}`}>{t.about.context.title}</h3>
                <p className={`mb-6 ${textSub}`}>{t.about.context.desc}</p>
                <div className="p-4 bg-kairo-green/10 rounded-xl text-kairo-green font-bold text-sm">
                    "{t.about.context.quote}"
                </div>
            </div>
        </section>

        {/* 3. PHILOSOPHY (What Makes Us Different) */}
        <section className={`mb-32 py-16 border-y ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
            <div className="max-w-4xl mx-auto text-center">
                <h2 className={`text-3xl font-bold mb-12 ${textMain}`}>{t.about.philosophy.title}</h2>
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {t.about.philosophy.statements.map((stmt: string, i: number) => (
                        <div key={i} className={`p-6 rounded-2xl border ${isLight ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`}>
                            <div className="text-red-500 mb-2 mx-auto w-fit"><Target className="w-6 h-6"/></div>
                            <p className={`font-bold ${textMain}`}>{stmt}</p>
                        </div>
                    ))}
                </div>
                <p className={`text-xl ${textSub} mb-8`}>{t.about.philosophy.desc}</p>
                <p className={`text-2xl font-bold ${textMain}`}>"{t.about.philosophy.tagline}"</p>
            </div>
        </section>

        {/* 4. VALUES & PRINCIPLES */}
        <section className="mb-32">
            <h2 className={`text-3xl font-bold mb-12 text-center ${textMain}`}>{t.about.valuesTitle}</h2>
            <div className="grid md:grid-cols-2 gap-8">
                {t.about.values.map((val: any, i: number) => (
                    <MotionDiv 
                        key={i}
                        whileHover={{ y: -5 }}
                        className={`p-8 rounded-3xl border ${cardBg} ${cardBorder}`}
                    >
                        <h3 className={`text-xl font-bold mb-3 ${textMain}`}>{val.title}</h3>
                        <p className={`leading-relaxed ${textSub}`}>{val.desc}</p>
                    </MotionDiv>
                ))}
            </div>
        </section>

        {/* 5. FLOW VISUALIZATION */}
        <section className="mb-32 text-center">
            <div className={`inline-block p-10 rounded-[3rem] border ${cardBg}`}>
                <h3 className={`text-xl font-bold mb-8 ${textMain}`}>{t.about.flow.title}</h3>
                <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-8">
                    {t.about.flow.steps.map((step: string, i: number) => (
                        <React.Fragment key={i}>
                            <div className={`px-6 py-3 rounded-xl font-bold ${isLight ? 'bg-gray-100 text-gray-800' : 'bg-white/10 text-white'}`}>
                                {step}
                            </div>
                            {i < t.about.flow.steps.length - 1 && (
                                <div className="hidden md:flex items-center text-gray-400">
                                    <ArrowRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
                <p className={textSub}>{t.about.flow.desc}</p>
            </div>
        </section>

        {/* 6. FOUNDER */}
        <section className="mb-28">
            <div className="mb-10 max-w-3xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-kairo-green/20 bg-kairo-green/10 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-kairo-green">
                    <BrainCircuit className="h-3.5 w-3.5" />
                    {isAr ? 'المؤسس وراء الرؤية' : 'Founder behind the vision'}
                </span>
                <h2 className={`mt-5 text-3xl font-bold md:text-5xl ${textMain}`}>
                    {isAr ? 'ذكاء اصطناعي مبني لحل مشكلة حقيقية.' : 'AI built to solve a real problem.'}
                </h2>
            </div>

            <div className={`overflow-hidden rounded-[2.5rem] border ${cardBg} ${cardBorder}`}>
                <div className="grid lg:grid-cols-[.72fr_1.28fr]">
                    <div className="group relative h-[480px] overflow-hidden sm:h-[560px] lg:h-full lg:min-h-[700px]">
                        <img
                            src={activeTeam.founder.image}
                            alt={activeTeam.founder.name}
                            className="absolute inset-0 h-full w-full object-cover object-top grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-7 text-white">
                            <p className="text-[10px] font-black uppercase tracking-[.16em] text-kairo-green">
                                {isAr ? 'المؤسس ومهندس الذكاء الاصطناعي' : 'Founder & AI Engineer'}
                            </p>
                            <h3 className="mt-2 text-3xl font-black">{isAr ? activeTeam.founder.nameAr : activeTeam.founder.name}</h3>
                        </div>
                    </div>

                    <div className="p-6 sm:p-9 lg:p-12">
                        <p className={`text-lg leading-8 ${textMain}`}>
                            {isAr
                                ? 'مروان ياسر حسن عبد الغفار هو مؤسس KAIRO Intelligence ومطوّرها ومهندس ذكاء اصطناعي شغوف ببناء أنظمة ذكية تحل مشكلات واقعية. تمتد خبرته عبر تعلم الآلة والتعلم العميق وعلم البيانات وتطوير البرمجيات وتطبيقات الذكاء الاصطناعي.'
                                : 'Marwan Yasser Hassan Abdel Ghafar is the founder and developer of KAIRO Intelligence, and an AI engineer passionate about building intelligent systems that solve real-world problems. His expertise spans machine learning, deep learning, data science, software development, and AI applications.'}
                        </p>

                        <div className="mt-7 flex flex-wrap gap-2">
                            {expertise.map((item) => (
                                <span key={item} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${cardBorder} ${textSub}`}>{item}</span>
                            ))}
                        </div>

                        <div className={`mt-8 grid gap-4 border-t pt-8 md:grid-cols-2 ${cardBorder}`}>
                            <div className={`rounded-2xl border p-5 ${cardBorder}`}>
                                <GraduationCap className="h-5 w-5 text-kairo-green" />
                                <h4 className={`mt-4 font-black ${textMain}`}>{isAr ? 'الخلفية الأكاديمية' : 'Academic foundation'}</h4>
                                <p className={`mt-2 text-sm leading-7 ${textSub}`}>
                                    {isAr
                                        ? 'يدرس بكالوريوس علوم البترول والمعادن بتخصص الجيولوجيا والكيمياء، جامعًا بين فهم الأنظمة الطبيعية وبناء الحلول الرقمية.'
                                        : 'He is pursuing a Bachelor’s degree in Petroleum and Mineral Sciences, specializing in Geology and Chemistry—connecting natural systems with digital solutions.'}
                                </p>
                            </div>
                            <div className={`rounded-2xl border p-5 ${cardBorder}`}>
                                <Network className="h-5 w-5 text-kairo-green" />
                                <h4 className={`mt-4 font-black ${textMain}`}>{isAr ? 'التدريب المهني' : 'Professional training'}</h4>
                                <p className={`mt-2 text-sm leading-7 ${textSub}`}>
                                    {isAr
                                        ? 'تدريب وخبرات عملية مع مؤسسات محلية وعالمية عبر مسارات التكنولوجيا والبيانات والابتكار.'
                                        : 'Professional training and internships across technology, data and innovation with local and global organizations.'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-2">
                            {trainingOrganizations.map((organization) => (
                                <span key={organization} className="rounded-lg bg-kairo-green/[0.08] px-3 py-2 text-xs font-extrabold text-kairo-green">{organization}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
                {achievements.map(({ Icon, title, meta }) => (
                    <div key={title} className={`rounded-3xl border p-6 ${cardBg} ${cardBorder}`}>
                        <Icon className="h-6 w-6 text-kairo-green" />
                        <h3 className={`mt-6 font-black leading-6 ${textMain}`}>{title}</h3>
                        <p className={`mt-2 text-sm ${textSub}`}>{meta}</p>
                    </div>
                ))}
            </div>

            <div className={`mt-5 grid gap-5 rounded-[2rem] border p-6 sm:p-8 lg:grid-cols-[.45fr_1.55fr] ${cardBg} ${cardBorder}`}>
                <div className="rounded-3xl bg-kairo-green p-6 text-[#052019]">
                    <BookOpen className="h-6 w-6" />
                    <div className="mt-8 text-4xl font-black">35,000+</div>
                    <p className="mt-2 text-sm font-extrabold">
                        {isAr ? 'متخصص وطالب ضمن مجتمع المعرفة على LinkedIn' : 'professionals and students in his LinkedIn knowledge community'}
                    </p>
                </div>
                <div className="flex flex-col justify-center">
                    <Code2 className="h-6 w-6 text-kairo-green" />
                    <h3 className={`mt-5 text-2xl font-black ${textMain}`}>{isAr ? 'مهمته' : 'His mission'}</h3>
                    <p className={`mt-3 text-base leading-8 ${textSub}`}>
                        {isAr
                            ? 'تصميم حلول ذكاء اصطناعي قابلة للتوسع تصنع أثرًا قابلًا للقياس، وتربط البحث بالصناعة، مع مشاركة موارد تعليمية وفرص عملية تساعد الطلاب والمتخصصين على النمو.'
                            : 'To design scalable AI solutions that create measurable impact, bridge research and industry, and help students and professionals grow through accessible knowledge, opportunities and practical AI resources.'}
                    </p>
                </div>
            </div>
        </section>

        {/* 7. AI ARCHITECTURE */}
        <section className={`mb-32 p-10 md:p-14 rounded-[3rem] border relative overflow-hidden ${isLight ? 'bg-white border-gray-200' : 'bg-[#050505] border-white/10'}`}>
             <div className="absolute top-0 right-0 p-8 opacity-10">
                 <Database className="w-32 h-32 text-kairo-green" />
             </div>
             <div className="relative z-10 max-w-3xl">
                 <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-kairo-green/10 text-kairo-green text-xs font-bold uppercase tracking-wider mb-6 border border-kairo-green/20">
                    {t.about.aiArchitecture.subtitle}
                 </div>
                 <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${textMain}`}>{t.about.aiArchitecture.title}</h2>
                 <p className={`text-lg leading-relaxed ${textSub}`}>
                     {t.about.aiArchitecture.desc}
                 </p>
             </div>
        </section>

        {/* 8. RESEARCH & COMMERCIAL ROADMAP */}
        <section className="mb-20">
            <div className="mb-10 max-w-3xl">
                <span className="inline-flex rounded-full border border-kairo-green/20 bg-kairo-green/10 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-kairo-green">
                    {isAr ? 'من البحث إلى التطبيق' : 'From research to deployment'}
                </span>
                <h2 className={`mt-5 text-3xl font-bold md:text-5xl ${textMain}`}>
                    {isAr ? 'طريق واضح من البحث إلى أثر قابل للقياس.' : 'A clear path from research to measurable impact.'}
                </h2>
                <p className={`mt-5 text-lg leading-8 ${textSub}`}>
                    {isAr
                        ? 'نُقيّم نجاح كايرو بدقة التقدير، والتوفير المُثبت، وقدرته على مساعدة المستخدم والمؤسسة—وليس بعدد الخصائص فقط.'
                        : 'KAIRO will be judged by estimate accuracy, verified savings and its ability to help people and institutions—not by feature count alone.'}
                </p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
                {[
                    {
                        Icon: FlaskConical,
                        phase: isAr ? 'الآن · نموذج بحثي' : 'Now · Research prototype',
                        title: isAr ? 'نظام متكامل قابل للعرض' : 'Integrated demonstrator',
                        desc: isAr
                            ? 'سبع وحدات قرار، دعم عربي/إنجليزي، قراءة نصوص وفواتير، وثوابت مصرية مع فصل واضح بين القياس والتقدير.'
                            : 'Seven decision modules, Arabic/English support, text and bill reading, and Egyptian constants with explicit measurement/estimate labels.'
                    },
                    {
                        Icon: RadioTower,
                        phase: isAr ? 'التالي · تحقق ميداني' : 'Next · Field validation',
                        title: isAr ? 'اختبارات قبل وبعد' : 'Before-and-after pilots',
                        desc: isAr
                            ? 'ربط فواتير وعدادات حقيقية، قياس خطأ النماذج، وتجارب سلوكية مع أسر ومدارس ومؤسسات بإشراف بحثي.'
                            : 'Connect real bills and meters, quantify model error, and run supervised behavioral pilots with households, schools and organizations.'
                    },
                    {
                        Icon: Building2,
                        phase: isAr ? 'التوسع · سوق الندرة' : 'Scale · Scarcity market',
                        title: isAr ? 'منتج مؤسسي وإقليمي' : 'Institutional, regional product',
                        desc: isAr
                            ? 'اشتراكات ولوحات ESG وواجهات API للمدن والمرافق، ثم تكييف الثوابت والتعرفة لأسواق الشرق الأوسط وشمال أفريقيا.'
                            : 'Subscriptions, ESG dashboards and APIs for cities and utilities, then localized constants and tariffs across MENA.'
                    }
                ].map(({ Icon, phase, title, desc }) => (
                    <div key={title} className={`rounded-3xl border p-7 ${cardBg} ${cardBorder}`}>
                        <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-kairo-green/10 text-kairo-green">
                            <Icon className="h-5 w-5" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[.15em] text-kairo-green">{phase}</p>
                        <h3 className={`mt-3 text-xl font-bold ${textMain}`}>{title}</h3>
                        <p className={`mt-4 text-sm leading-7 ${textSub}`}>{desc}</p>
                    </div>
                ))}
            </div>
            <div className="mt-7">
                <Link
                    to="/saas-roadmap"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-kairo-green px-6 py-3 text-sm font-extrabold text-[#052019]"
                >
                    {isAr ? 'افتح خطة التحول إلى SaaS كاملة' : 'Open the complete SaaS roadmap'}
                    <ArrowRight className={`h-4 w-4 ${isAr ? 'rotate-180' : ''}`} />
                </Link>
            </div>
        </section>

        {/* 9. FUTURE & CLOSING */}
        <section className={`p-12 rounded-[3rem] text-center ${isLight ? 'bg-slate-100' : 'bg-white/5'}`}>
            <h2 className={`text-2xl md:text-4xl font-bold mb-6 ${textMain}`}>{t.about.future.title}</h2>
            <p className={`text-lg leading-relaxed max-w-3xl mx-auto mb-8 ${textSub}`}>
                {t.about.future.desc}
            </p>
            <div className="inline-block px-8 py-4 border-t border-gray-500/20">
                <p className={`text-xl font-medium ${textMain}`}>
                    "{t.about.future.closing}"
                </p>
            </div>
        </section>

      </div>
    </div>
  );
};

export default About;
