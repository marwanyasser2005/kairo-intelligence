import React from 'react';
import { motion } from 'framer-motion';
import { 
    Cpu, Network, Database, BrainCircuit, Activity, Globe, Layout, 
    ArrowRight, MessageSquare, Terminal, Eye, AlertTriangle, 
    CheckCircle2, RefreshCw, Zap, Droplet, Utensils, Wind, Truck, 
    Recycle, Layers, Target, Code2, LineChart, ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

const MotionDiv = motion.div as any;

const TechnicalArchitecture: React.FC = () => {
  const { theme, dir, language } = useApp();
  const isLight = theme === 'light';
  const isAr = language === 'ar';

  const textMain = isLight ? 'text-gray-900' : 'text-white';
  const textDim = isLight ? 'text-gray-500' : 'text-gray-400';
  const bgApp = isLight ? 'bg-slate-50' : 'bg-[#050505]';
  const bgCard = isLight ? 'bg-white border-slate-200' : 'bg-[#0f0f11] border-white/5';
  const bgGlass = isLight ? 'bg-white/80 border-slate-200/50 backdrop-blur-xl' : 'bg-[#151518]/90 border-white/10 backdrop-blur-2xl';

  return (
    <div className={`min-h-screen pt-32 lg:pt-36 px-4 lg:px-8 pb-32 transition-colors duration-500 ${bgApp} font-sans selection:bg-indigo-500/30`} dir={dir}>
      <div className="max-w-[1400px] mx-auto space-y-32">
        
        {/* HEADER */}
        <header className="max-w-4xl mx-auto text-center">
            <MotionDiv 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 border ${isLight ? 'bg-indigo-100/50 border-indigo-200 text-indigo-600' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'}`}
            >
                <BrainCircuit className="w-3.5 h-3.5" /> {isAr ? 'الهندسة المعرفية' : 'Intelligence Architecture'}
            </MotionDiv>
            <h1 className={`text-5xl md:text-7xl font-black mb-6 tracking-tighter ${textMain}`}>
                {isAr ? 'نظام تشغيل كايرو (KOS)' : 'Kairo Operating System'}
            </h1>
            <p className={`text-xl md:text-2xl font-light leading-relaxed max-w-3xl mx-auto ${textDim}`}>
                {isAr 
                    ? 'عمارة ذكية بيئية ذاتية التحكم. مُصممة لرصد التلمتري، تحليل الموارد، واستنتاج قرارات التحسين لتعظيم العائد الاقتصادي والبيئي، مع التركيز على اقتصاد الندرة.' 
                    : 'An autonomous environmental intelligence engine designed to observe, reason, and optimize resource sustainability in scarcity-driven economies.'}
            </p>
        </header>

        {/* SECTION 1: Intelligence Architecture (Diagram) */}
        <section>
            <div className="flex items-center gap-4 mb-10">
                <span className={`text-xs font-black uppercase tracking-widest ${textDim}`}>{isAr ? '01 — خط تدفق المعرفة' : '01 — Logic Pipeline'}</span>
                <div className={`h-px flex-1 ${isLight ? 'bg-slate-200' : 'bg-white/10'}`} />
            </div>

            <div className={`${bgGlass} rounded-[2rem] p-8 md:p-12 border overflow-hidden relative shadow-2xl`}>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
                
                <h2 className={`text-2xl md:text-3xl font-bold mb-12 flex items-center gap-3 ${textMain}`}>
                    <Network className="w-6 h-6 text-indigo-500" /> {isAr ? 'الشبكة العصبية متعددة الطبقات' : 'Multi-Layer AI Pipeline'}
                </h2>

                <div className="flex flex-col lg:flex-row gap-4 items-stretch justify-between relative z-10">
                    
                    {/* Layer 1 */}
                    <div className={`flex-1 ${bgCard} border rounded-2xl p-6 relative group`}>
                        <div className={`absolute ${isAr ? '-left-3' : '-right-3'} top-1/2 -translate-y-1/2 z-20 hidden lg:block ${isLight ? 'text-slate-300' : 'text-white/20'}`}>
                            <ArrowRight className={`${isAr ? 'rotate-180' : ''}`} />
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-6">{isAr ? 'طبقة الاستيعاب (Input)' : 'Input & Ingestion'}</div>
                        <div className="space-y-3">
                            <div className={`p-3 rounded-lg border text-sm font-bold flex items-center gap-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-white/5'}`}><MessageSquare className="w-4 h-4 text-slate-400" /> {isAr ? 'مستشعرات التلمتري' : 'Telemetry Feeds'}</div>
                            <div className={`p-3 rounded-lg border text-sm font-bold flex items-center gap-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-white/5'}`}><Eye className="w-4 h-4 text-emerald-400" /> {isAr ? 'نماذج استخراج OCR' : 'OCR Extractors'}</div>
                            <div className={`p-3 rounded-lg border text-sm font-bold flex items-center gap-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-white/5'}`}><Database className="w-4 h-4 text-blue-400" /> {isAr ? 'قواعد القياسات الجغرافية' : 'Geo-spatial Sensors'}</div>
                        </div>
                    </div>

                    {/* Layer 2 */}
                    <div className={`flex-[1.5] ${isLight ? 'bg-indigo-50 border-indigo-100' : 'bg-indigo-950/20 border-indigo-500/20'} border rounded-2xl p-6 relative group shadow-[0_0_30px_rgba(99,102,241,0.1)]`}>
                        <div className={`absolute ${isAr ? '-left-3' : '-right-3'} top-1/2 -translate-y-1/2 z-20 hidden lg:block ${isLight ? 'text-indigo-300' : 'text-indigo-500/50'}`}>
                            <ArrowRight className={`${isAr ? 'rotate-180' : ''}`} />
                        </div>
                        <div className="flex justify-between items-start mb-6">
                            <div className="text-[10px] font-black uppercase tracking-widest text-indigo-500">{isAr ? 'المعالج المركزي' : 'Processing Core'}</div>
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        </div>
                        <div className="space-y-3">
                            <div className={`p-3 rounded-lg border text-sm font-bold flex items-center gap-2 ${isLight ? 'bg-white border-indigo-100 text-indigo-900' : 'bg-black/50 border-indigo-500/20 text-indigo-100'}`}><BrainCircuit className="w-4 h-4 text-indigo-500" /> {isAr ? 'المنسق (Orchestrator)' : 'Kairo Orchestrator'}</div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className={`p-3 rounded-lg border text-xs font-bold text-center ${isLight ? 'bg-white border-indigo-100 text-indigo-800' : 'bg-black/50 border-indigo-500/20 text-indigo-200'}`}>{isAr ? 'محرك الاستدلال' : 'Reasoning Engine'}</div>
                                <div className={`p-3 rounded-lg border text-xs font-bold text-center ${isLight ? 'bg-white border-indigo-100 text-indigo-800' : 'bg-black/50 border-indigo-500/20 text-indigo-200'}`}>{isAr ? 'محرك المخاطر' : 'Risk Engine'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Layer 3 */}
                    <div className={`flex-1 ${bgCard} border rounded-2xl p-6`}>
                        <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-6">{isAr ? 'طبقة الحتمية (Output)' : 'Output Layer'}</div>
                        <div className="space-y-3">
                            <div className={`p-3 rounded-lg border text-sm font-bold flex items-center gap-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-white/5'}`}><Target className="w-4 h-4 text-emerald-500" /> {isAr ? 'أدوات التحسين' : 'Optimizations'}</div>
                            <div className={`p-3 rounded-lg border text-sm font-bold flex items-center gap-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-white/5'}`}><AlertTriangle className="w-4 h-4 text-orange-500" /> {isAr ? 'تنبيهات المخاطر' : 'Risk Alerts'}</div>
                            <div className={`p-3 rounded-lg border text-sm font-bold flex items-center gap-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/50 border-white/5'}`}><Layout className="w-4 h-4 text-blue-500" /> {isAr ? 'خرائط بيانية مرئية' : 'Data Visualizations'}</div>
                        </div>
                    </div>

                </div>
            </div>
        </section>

        {/* SECTION 2: Architecture Details */}
        <section className="grid md:grid-cols-2 gap-8">
            <div className={`p-10 rounded-3xl ${bgCard} border`}>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-6">
                    <Database className="w-6 h-6" />
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${textMain}`}>{isAr ? 'طوبولوجيا المعالجة (JSON)' : 'Structured Schemas'}</h3>
                <p className={`text-sm leading-relaxed mb-6 ${textDim} font-mono bg-black/5 border border-white/5 p-4 rounded-lg`}>
                    {isAr ? 'تلتزم كل دعوة نموذجية بواجهة JSON صارمة محددة مسبقًا. لا يمكن أن ينحرف مسار المحرك عن قواعد المصفوفة، لا مجال للغة التوليدية العشوائية. هذا يضمن حتمية مطلقة على مستوى المؤسسة.' : 'Every model call is bound by a strict JSON interface. The orchestrator enforces types, arrays, and enums, entirely eliminating unstructured natural language from the data path.'}
                </p>
                <Link to="/architecture/tokenrouter" className="inline-flex items-center gap-2 text-xs font-bold text-indigo-500 hover:text-indigo-400">
                    {isAr ? 'مشاهدة هيكل بوابة Gemini' : 'View Gemini AI Gateway'} <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                </Link>
            </div>

            <div className={`p-10 rounded-3xl ${bgCard} border`}>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${textMain}`}>{isAr ? 'التحقق السلوكي والحوكمة' : 'Validation & Governance'}</h3>
                <p className={`text-sm leading-relaxed mb-6 ${textDim} font-mono bg-black/5 border border-white/5 p-4 rounded-lg`}>
                    {isAr ? 'قبل عرض الأرقام لك (في لوحة القيادة CSR، وحاسبة الكربون)، تمر النتائج بخوارزميات تقييم للمنطق الفيزيائي والجدول. يضمن كايرو ألا يتم كسر قوانين الحفظ الديناميكي الحراري أثناء حساب الكربون.' : 'Before UI render, calculated outputs traverse physical validation layers ensuring that mass and energy conservation laws are not violated by AI generation.'}
                </p>
            </div>
        </section>

        {/* SECTION 3: Deep Context (The Brain) */}
        <section>
            <div className="flex items-center gap-4 mb-10">
                <span className={`text-xs font-black uppercase tracking-widest ${textDim}`}>{isAr ? '02 — السياق العميق' : '02 — Deep Context'}</span>
                <div className={`h-px flex-1 ${isLight ? 'bg-slate-200' : 'bg-white/10'}`} />
            </div>

            <div className={`grid lg:grid-cols-3 gap-6`}>
                
                <div className={`lg:col-span-1 p-8 rounded-3xl ${bgCard} border`}>
                    <h3 className={`text-xl font-bold mb-6 ${textMain}`}>{isAr ? 'المتجهات البيئية' : 'Environmental Vectors'}</h3>
                    <div className="space-y-4">
                        {[
                            { name: isAr ? 'التعريفات الجمركية' : 'Grid Tariffs', val: isAr ? 'شرائح الكهرباء' : 'EGP Tiers' },
                            { name: isAr ? 'مستويات حوض النيل' : 'Nile Shed Levels', val: isAr ? 'ندرة مائية' : 'Scarce' },
                            { name: isAr ? 'جودة الهواء' : 'Real-time AQI', val: isAr ? 'تلمتري مباشر' : 'Telemetry' },
                            { name: isAr ? 'متوسط الأجهزة' : 'Appliance Averages', val: isAr ? 'واط' : 'W' },
                            { name: isAr ? 'تسعير الكربون' : 'Carbon Pricing', val: 'CBAM' }
                        ].map((v,i) => (
                             <div key={i} className="flex justify-between items-center text-sm">
                                <span className={textDim}>{v.name}</span>
                                <span className={`font-mono font-bold ${textMain}`}>{v.val}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={`lg:col-span-2 p-8 rounded-3xl ${bgGlass} border flex flex-col justify-center`}>
                     <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold uppercase tracking-widest mb-6 w-fit border border-orange-500/20">
                        <AlertTriangle className="w-3.5 h-3.5" /> {isAr ? 'قيود المحتوي (Context)' : 'Context Constraints'}
                     </div>
                     <h3 className={`text-2xl md:text-4xl font-black mb-4 ${textMain}`}>{isAr ? 'التصميم الموجه بندرة الموارد' : 'Scarcity-First Design'}</h3>
                     <p className={`text-lg leading-relaxed ${textDim} max-w-2xl`}>
                        {isAr ? 'يجبر محرك الذكاء الحلول على التكيف مع قيود ندرة الموارد المحلية في مصر بدلاً من افتراض موارد لا نهائية. فهو يبني النماذج انطلاقاً من حالة أساسية حيث يمثل الإجهاد المائي والإجهاد الحراري المعطيات الأساسية للنظام.' : 'The intelligence engine forces solutions to adapt to local scarcity constraints instead of assuming infinite resources. It models a baseline where water stress and grid instability are the starting parameters, not corner cases.'}
                     </p>
                </div>

            </div>
        </section>
        
      </div>
    </div>
  );
};

export default TechnicalArchitecture;
