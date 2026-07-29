import React from 'react';
import { motion } from 'framer-motion';
import { 
    BrainCircuit, ShieldCheck, Database, FileJson, 
    Code, Server, Zap, ArrowRight, Focus, Fingerprint
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

const MotionDiv = motion.div as any;

const TokenRouterArchitecture: React.FC = () => {
  const { theme, dir, language } = useApp();
  const isLight = theme === 'light';
  const isAr = language === 'ar';

  const bgApp = isLight ? 'bg-[#FAFAFA]' : 'bg-[#0a0a0c]';
  const textMain = isLight ? 'text-[#111111]' : 'text-slate-100';
  const textDim = isLight ? 'text-[#666666]' : 'text-[#888888]';
  const textMuted = isLight ? 'text-[#999999]' : 'text-[#555555]';
  const borderSubtle = isLight ? 'border-[#EAEAEA]' : 'border-white/[0.04]';
  const bgCard = isLight ? 'bg-white' : 'bg-[#111114]';

  return (
    <div className={`min-h-screen pt-32 lg:pt-36 px-6 lg:px-12 pb-24 transition-colors duration-500 rounded-lg ${bgApp} font-sans`} dir={dir}>
      <div className="max-w-[1200px] mx-auto space-y-32">
        
        {/* HEADER */}
        <header className="max-w-3xl">
            <Link to="/architecture" className={`inline-flex items-center gap-2 text-xs font-semibold ${isLight ? 'text-blue-600 hover:text-blue-800' : 'text-blue-400 hover:text-blue-300'} mb-12 transition-colors uppercase tracking-[0.1em]`}>
                <ArrowRight className={`w-3 h-3 ${dir === 'rtl' ? '' : 'rotate-180'}`} /> {isAr ? 'بنية المنطق الأساسية' : 'Core Logic Architecture'}
            </Link>
            
            <h1 className={`text-4xl md:text-6xl font-medium mb-8 tracking-tight leading-[1.1] ${textMain}`}>
                {isAr ? 'عمارة بوابة Gemini المعرفية' : 'Gemini AI Gateway Architecture'}
            </h1>
            <p className={`text-xl md:text-2xl font-light leading-[1.6] ${textDim} max-w-2xl`}>
                {isAr 
                    ? 'نهج متعدد الطبقات يختار تلقائيًا نموذج Gemini المجاني الأنسب حسب نوع المهمة، مع تبديل آمن عند حدود الاستخدام أو تعطل أحد النماذج.'
                    : 'A capability-aware gateway that selects the best free Gemini model for each workload and fails over safely when a model is unavailable or rate-limited.'}
            </p>

            <div className={`mt-12 flex gap-6 text-[11px] uppercase tracking-widest font-mono ${textMuted}`}>
                 <span className="flex items-center gap-2"><Server className="w-3.5 h-3.5" /> {isAr ? 'الإصدار المباشر: 3.1' : 'LIVE BUILD: 3.1'}</span>
                 <span className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5" /> {isAr ? 'منطق محدد' : 'DETERMINISTIC LOGIC'}</span>
            </div>
        </header>

        {/* SECTION 1: SYSTEM CARD / INTENT */}
        <section className={`border-y ${borderSubtle} py-16 grid md:grid-cols-12 gap-12`}>
            <div className="md:col-span-4">
                <h2 className={`text-sm font-semibold uppercase tracking-widest ${textDim}`}>{isAr ? '01 // النموذج العقلي' : '01 // Mental Model'}</h2>
            </div>
            <div className="md:col-span-8 flex flex-col gap-12">
                <h3 className={`text-2xl font-medium leading-[1.4] ${textMain}`}>
                    {isAr 
                        ? 'تُعد نماذج الذكاء الاصطناعي التقليدية في المقام الأول محركات لغوية توليدية. لقد قمنا بتصميم طبقات "كايرو" لإجبار النموذج على العمل كمحرك استدلال رياضي ومنطقي صارم لحل المعالجات الجغرافية والموارد.'
                        : "Traditional AI models are primarily generative semantic engines. We architected Kairo's layers to force the model to operate as a strict temporal and spatial mathematical reasoning engine."}
                </h3>
            </div>
        </section>

        {/* SECTION 2: THE REASONING LOOP */}
        <section>
            <div className="mb-16">
                <h2 className={`text-sm font-semibold uppercase tracking-widest ${textDim}`}>{isAr ? '02 // دورة الاستدلال المقيد' : '02 // Constrained Reasoning Loop'}</h2>
            </div>

            <div className={`grid md:grid-cols-3 gap-6`}>
                {[
                    {
                        step: '01',
                        icon: <Focus className="w-5 h-5" />,
                        title: isAr ? 'استخراج القيود (JSON)' : 'Constraint Extraction (JSON)',
                        desc: isAr ? 'يتم استقبال بيانات التلمتري من النظام (استهلاك المياه، أسعار الطاقة). تحدد هذه القيم الصارمة حدود خوارزميات الاستدلال دون السماح بهلوسة الحقائق الجغرافية.' : 'Telemetry parameters are injected via standardized schema constraints, defining strict geographic boundaries before any generation begins.'
                    },
                    {
                        step: '02',
                        icon: <BrainCircuit className="w-5 h-5" />,
                        title: isAr ? 'تحليل التكلفة البيئية المختلطة' : 'Temporal Trade-off Analysis',
                        desc: isAr ? 'يتم بناء مصفوفة مخاطر حيث يقارن محرك جيميناي التكلفة الحيوية بين تخفيف أحمال التكييف وتكلفة الطاقة. يتم استبعاد الحلول المتضاربة منطقياً.' : 'The model conducts zero-shot reasoning to cross-evaluate competing environmental variables, eliminating physically contradictory solutions automatically.'
                    },
                    {
                        step: '03',
                        icon: <Fingerprint className="w-5 h-5" />,
                        title: isAr ? 'الإخراج الموحد للحتمية' : 'Deterministic Routing',
                        desc: isAr ? 'يتجاوز النظام اللغة الطبيعية وينتج هيكل JSON مقيد بشيفرات محددة ليتم عرضها عبر لوحات القيادة (UI) بأمان وحتمية كاملة.' : 'Bypassing conversational prose entirely, output strictly maps to strongly-typed logical trees to render safe, deterministic interfaces.'
                    }
                ].map((item, i) => (
                    <div key={i} className={`p-10 ${bgCard} border ${borderSubtle} rounded-2xl flex flex-col items-start hover:border-blue-500/30 transition-colors`}>
                        <div className="flex justify-between w-full mb-8 items-start">
                             <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${borderSubtle} ${textMain}`}>{item.icon}</div>
                             <span className={`font-mono text-xs ${textDim}`}>{item.step}</span>
                        </div>
                        <h3 className={`text-lg font-semibold mb-4 ${textMain}`}>{item.title}</h3>
                        <p className={`text-sm leading-[1.7] ${textMuted}`}>{item.desc}</p>
                    </div>
                ))}
            </div>
        </section>

        {/* SECTION 3: SCHEMA DEFINITION (CODE) */}
        <section className={`border ${borderSubtle} ${bgCard} rounded-3xl overflow-hidden`}>
            <div className={`px-8 py-6 border-b ${borderSubtle} flex justify-between items-center`}>
                <div className="flex gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-400/20 border border-red-400/50" />
                    <div className="w-3 h-3 rounded-full bg-amber-400/20 border border-amber-400/50" />
                    <div className="w-3 h-3 rounded-full bg-green-400/20 border border-green-400/50" />
                </div>
                <div className={`font-mono text-xs ${textDim}`}>orchestrator/schema.ts</div>
            </div>
            <div className={`p-8 md:p-12 font-mono text-xs md:text-sm overflow-x-auto ${isLight ? 'bg-[#FDFDFD] text-slate-800' : 'bg-black text-gray-300'}`}>
<pre>
{`export const VERIFICATION_SCHEMA = {
  type: "OBJECT",
  properties: {
    \${isAr ? \`is_greenwashing: { type: "BOOLEAN", description: "هل الادعاء مضلل بيئياً؟" },
    confidence_score: { type: "NUMBER", description: "درجة اليقين العلمي (0.0 إلى 1.0)" },
    logical_flaw: { type: "STRING", enum: ['Omission', 'Vagueness', 'No Proof', 'Fibbing', 'None'] },
    forensic_analysis: { type: "STRING", description: "خلاصة أدلة التدقيق البيئي" }\` : \`is_greenwashing: { type: "BOOLEAN", description: "Is the claim ecologically misleading?" },
    confidence_score: { type: "NUMBER", description: "Scientific certainty threshold (0.0 to 1.0)" },
    logical_flaw: { type: "STRING", enum: ['Omission', 'Vagueness', 'No Proof', 'Fibbing', 'None'] },
    forensic_analysis: { type: "STRING", description: "Forensic audit reasoning breakdown" }\`}
  },
  required: ["is_greenwashing", "confidence_score", "forensic_analysis"]
};`}
</pre>
            </div>
        </section>

      </div>
    </div>
  );
};

export default TokenRouterArchitecture;
