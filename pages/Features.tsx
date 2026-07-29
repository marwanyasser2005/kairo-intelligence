import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Droplet, Utensils, Wind, Zap, Database, ArrowRight, Network, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

// Type casting to bypass strict environment checks
const MotionDiv = motion.div as any;

const FeatureCard = ({ title, problem, reasoning, outcome, icon, color, delay, theme, dir, isAr }: any) => (
  <MotionDiv 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className={`group relative border hover:border-opacity-50 rounded-[2rem] p-8 md:p-10 overflow-hidden transition-all ${
        theme === 'dark' 
        ? `bg-white/[0.02] border-white/5 hover:border-${color}-500/30` 
        : `bg-white border-gray-200 hover:border-${color}-500/50 shadow-sm`
    }`}
  >
    <div className={`absolute top-0 ${dir === 'rtl' ? 'left-0' : 'right-0'} p-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity text-${color}-500`}>
        {icon}
    </div>
    
    <div className="relative z-10">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border transition-colors ${
            theme === 'dark' 
            ? `bg-${color}-500/10 text-${color}-400 border-${color}-500/20` 
            : `bg-${color}-50 text-${color}-600 border-${color}-100`
        }`}>
            {icon}
        </div>
        
        <h3 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
        
        <div className="space-y-6">
            <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> {isAr ? 'المشكلة' : 'Problem'}
                </div>
                <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{problem}</p>
            </div>
            
            <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-kairo-green"></span> {isAr ? 'منطق التحليل' : 'Reasoning'}
                </div>
                <p className={`border-s-2 ps-4 text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-300 border-white/10' : 'text-gray-700 border-gray-200'}`}>
                    {reasoning}
                </p>
            </div>

            <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> {isAr ? 'النتيجة' : 'Outcome'}
                </div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{outcome}</p>
            </div>
        </div>
    </div>
  </MotionDiv>
);

const Features: React.FC = () => {
  const { t, theme, dir, language } = useApp();
  const isLight = theme === 'light';
  const isAr = language === 'ar';

  const features = [
    {
      title: t.features.capabilities.carbon.title,
      color: "gray",
      icon: <Cpu className="w-8 h-8" />,
      problem: t.features.capabilities.carbon.problem,
      reasoning: isAr
        ? 'يدمج المحرك بيانات النقل والطاقة ويطبق معاملات انبعاث محلية معلنة، مثل 0.45 كجم مكافئ CO₂ لكل ك.و.س للشبكة المصرية، لبناء تقدير قابل للمراجعة.'
        : 'The engine ingests transport and energy data, applying declared local emission factors such as 0.45 kgCO₂e/kWh for the Egyptian grid to build an auditable estimate.',
      outcome: t.features.capabilities.carbon.outcome
    },
    {
      title: t.features.capabilities.water.title,
      color: "blue",
      icon: <Droplet className="w-8 h-8" />,
      problem: t.features.capabilities.water.problem,
      reasoning: isAr
        ? 'يقارن نموذج التحليل معدلات تدفق التركيبات القياسية بساعات التسرب التي يدخلها المستخدم ومؤشرات ندرة المياه المحلية.'
        : 'The reasoning model cross-references standard fixture flow rates with user-reported leakage hours and local scarcity indicators.',
      outcome: t.features.capabilities.water.outcome
    },
    {
      title: t.features.capabilities.food.title,
      color: "orange",
      icon: <Utensils className="w-8 h-8" />,
      problem: t.features.capabilities.food.problem,
      reasoning: isAr
        ? 'يحاكي النظام تكلفة سلسلة الإمداد للغذاء المهدَر، ويحوّل البقايا إلى خسارة مالية بالجنيه وتقدير لاحتمال انبعاث الميثان.'
        : 'The system simulates upstream supply-chain cost, converting leftovers into financial loss in EGP and estimated methane potential.',
      outcome: t.features.capabilities.food.outcome
    },
    {
      title: t.features.capabilities.air.title,
      color: "red",
      icon: <Wind className="w-8 h-8" />,
      problem: t.features.capabilities.air.problem,
      reasoning: isAr
        ? 'يستخدم نموذجًا بديلًا قائمًا على بيانات Sentinel‑5P الجوية لتقدير تركيزات PM2.5 وNO₂ قرب سطح الأرض وفق الموقع، مع توضيح أنها تقديرات وليست محطة رصد.'
        : 'A satellite proxy interprets Sentinel‑5P atmospheric data to estimate ground-level PM2.5 and NO₂ by location, explicitly labeled as an estimate rather than a station measurement.',
      outcome: t.features.capabilities.air.outcome
    },
    {
      title: t.features.capabilities.mini.title,
      color: "kairo-green",
      icon: <Database className="w-8 h-8" />,
      problem: t.features.capabilities.mini.problem,
      reasoning: isAr
        ? 'وحدة سلوكية سريعة تستخدم افتراضات احتمالية معلنة لملء فجوات البيانات عندما تكون مدخلات المستخدم محدودة.'
        : 'A rapid behavioral module uses declared probabilistic defaults to fill gaps when user input has limited granularity.',
      outcome: t.features.capabilities.mini.outcome
    }
  ];

  return (
    <div className={`min-h-screen px-4 pb-20 pt-28 transition-colors duration-500 sm:px-6 sm:pt-32 lg:pt-36 ${isLight ? 'bg-gray-50' : 'bg-black'}`} dir={dir}>
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-20 text-center max-w-3xl mx-auto">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border ${isLight ? 'bg-white border-gray-200 text-gray-500' : 'bg-white/5 border-white/10 text-gray-400'}`}>
            <Network className="w-3 h-3" /> {isAr ? 'قدرات النظام' : 'System capabilities'}
          </div>
          <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${isLight ? 'text-gray-900' : 'text-white'}`}>
            {t.features.title}<br />
            <span className="text-gray-500">{t.features.titleSub}</span>
          </h1>
          <p className={`text-xl leading-relaxed ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
            {t.features.desc}
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6 mb-20">
            {features.map((f, i) => (
                <FeatureCard key={i} {...f} delay={i * 0.1} theme={theme} dir={dir} isAr={isAr} />
            ))}
            
            {/* Call to Action Card */}
            <MotionDiv 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="group relative bg-gradient-to-br from-kairo-green/20 to-transparent border border-kairo-green/30 hover:border-kairo-green/50 rounded-[2rem] p-10 flex flex-col justify-center items-center text-center"
            >
                <div className="w-16 h-16 rounded-2xl bg-kairo-green/20 flex items-center justify-center text-kairo-green mb-6">
                    <Zap className="w-8 h-8" />
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${isLight ? 'text-gray-900' : 'text-white'}`}>{t.features.deploy}</h3>
                <p className={`${isLight ? 'text-gray-600' : 'text-gray-300'} mb-8`}>
                    {t.features.deployDesc}
                </p>
                <Link to="/dashboard" className="px-8 py-4 bg-kairo-green text-white rounded-full font-bold hover:bg-emerald-600 transition-colors flex items-center gap-2 shadow-lg shadow-kairo-green/20">
                    {t.common.start} <ArrowRight className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                </Link>
            </MotionDiv>
        </div>

        {/* Technical Architecture Footer */}
        <div className={`border-t pt-12 ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 opacity-60">
                <div className="flex items-center gap-4">
                    <Globe className="w-12 h-12 text-gray-500" />
                    <div className="text-left">
                        <div className={`text-sm font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{t.features.footer.tokenRouter}</div>
                        <div className="text-xs text-gray-500">{t.features.footer.tokenRouterSub}</div>
                    </div>
                </div>
                 <div className="flex items-center gap-4">
                    <Database className="w-12 h-12 text-gray-500" />
                    <div className="text-left">
                        <div className={`text-sm font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{t.features.footer.context}</div>
                        <div className="text-xs text-gray-500">{t.features.footer.contextSub}</div>
                    </div>
                </div>
                 <div className="flex items-center gap-4">
                    <Cpu className="w-12 h-12 text-gray-500" />
                    <div className="text-left">
                        <div className={`text-sm font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{t.features.footer.compute}</div>
                        <div className="text-xs text-gray-500">{t.features.footer.computeSub}</div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Features;
