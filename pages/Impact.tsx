import React from 'react';
import { 
    Scale, Code2, Eye, ShieldCheck, 
    RefreshCw, Globe, Leaf, Wind, Droplet, Zap, 
    Users, LineChart, Monitor, AlertTriangle, Target } from 'lucide-react';
import { useApp } from '../contexts/AppContext';


const Impact: React.FC = () => {
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
        <div className={`min-h-screen pt-32 lg:pt-36 px-6 lg:px-12 pb-32 transition-colors duration-500 rounded-lg ${bgApp} font-sans`} dir={dir}>
            <div className="max-w-[1200px] mx-auto space-y-32">
                
                {/* HEADER */}
                <header className="max-w-3xl">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded text-[11px] font-semibold uppercase tracking-[0.1em] mb-12 border ${isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                        <Target className="w-3.5 h-3.5" /> {isAr ? 'عقيدة الاستدامة لكايرو' : 'The Kairo Doctrine'}
                    </div>
                    
                    <h1 className={`text-4xl md:text-6xl font-medium mb-8 tracking-tight leading-[1.1] ${textMain}`}>
                        {isAr ? 'منهجية ذكاء الاستدامة' : 'Sustainability Intelligence Methodology'}
                    </h1>
                    <p className={`text-xl md:text-2xl font-light leading-[1.6] ${textDim} max-w-2xl`}>
                        {isAr 
                            ? 'إطار فكري متقدم يربط بين الاقتصاد السلوكي وندرة الموارد البيئية، ليترجم القرارات اليومية إلى إشارات حيوية لقياس تأثير الكوكب.'
                            : 'An intellectual framework mapping behavioral economics to environmental scarcity, translating human action into planetary signal.'}
                    </p>
                </header>

                {/* SECTION 1: SYSTEMIC SCARCITY */}
                <section className={`border-y ${borderSubtle} py-16 grid md:grid-cols-12 gap-12`}>
                    <div className="md:col-span-4">
                        <h2 className={`text-sm font-semibold uppercase tracking-widest ${textDim}`}>{isAr ? '01 // نظرية الندرة الحيوية' : '01 // Biospheric Scarcity Theory'}</h2>
                    </div>
                    <div className="md:col-span-8 flex flex-col gap-12">
                        <h3 className={`text-2xl font-medium leading-[1.4] ${textMain}`}>
                            {isAr 
                                ? 'يتمحور الابتكار في كايرو حول استبدال "التخمين" بـ "القياس الاستدلالي". من خلال نماذج رياضية تربط استهلاك الطاقة والمياه والمواد بالبيانات الاقتصادية السائدة. نحن لا نصدر تقارير فقط، بل نبني أنظمة قرار.'
                                : 'Kairo\'s innovation centers on replacing "guesswork" with "heuristic measurement." By bridging resource consumption against economic realities, we don\'t just emit reports—we build decision systems.'}
                        </h3>
                    </div>
                </section>

                {/* SECTION 2: THE 6 MATRICES */}
                <section>
                    <div className="mb-16">
                        <h2 className={`text-sm font-semibold uppercase tracking-widest ${textDim}`}>{isAr ? '02 // مصفوفة العجز التشغيلي' : '02 // Operational Scarcity Matrix'}</h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { title: isAr ? "ندرة المياه (النيل)" : "Water Scarcity", icon: Droplet, color: "text-blue-500" },
                            { title: isAr ? "التضخم الطاقي" : "Energy Inflation", icon: Zap, color: "text-amber-500" },
                            { title: isAr ? "التعرض الحضري (هواء)" : "Urban Exposure", icon: Wind, color: "text-cyan-500" },
                            { title: isAr ? "هدر الغذاء" : "Food Waste", icon: Leaf, color: "text-emerald-500" },
                            { title: isAr ? "اضمحلال النفايات التقنية" : "E-Waste Decay", icon: Monitor, color: "text-purple-500" },
                            { title: isAr ? "الإجهاد الموردي العام" : "General Resource Stress", icon: AlertTriangle, color: "text-orange-500" }
                        ].map((item, i) => (
                            <div key={i} className={`p-8 ${bgCard} border ${borderSubtle} rounded-2xl flex items-center gap-6 hover:border-emerald-500/30 transition-colors`}>
                                <div className={`w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center border ${borderSubtle} ${item.color}`}>
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className={`text-base font-semibold mb-1 ${textMain}`}>{item.title}</h3>
                                    <p className={`text-[10px] uppercase font-mono tracking-widest ${textMuted}`}>{isAr ? 'عقدة النظام المراقبة' : 'Monitored System Node'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* SECTION 3: THE ENGINE LOOP */}
                <section>
                    <div className="mb-16">
                        <h2 className={`text-sm font-semibold uppercase tracking-widest ${textDim}`}>{isAr ? '03 // دورة المنهجية (Loop)' : '03 // Methodological Loop'}</h2>
                    </div>

                    <div className={`rounded-3xl border ${borderSubtle} p-12 relative overflow-hidden ${isLight ? 'bg-[#FDFDFD]' : 'bg-black'}`}>
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.05)_0%,transparent_50%)] pointer-events-none" />
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 relative z-10 text-center">
                            {[
                                { title: isAr ? "رصد" : "Observe", icon: Eye },
                                { title: isAr ? "قياس" : "Measure", icon: Scale },
                                { title: "تفسير", icon: Code2 },
                                { title: isAr ? "تحسين" : "Optimize", icon: LineChart },
                                { title: isAr ? "تحقق" : "Verify", icon: ShieldCheck },
                                { title: isAr ? "تكيف" : "Adapt", icon: RefreshCw }
                            ].map((step, i) => (
                                <div key={i} className="flex flex-col items-center group">
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-6 border transition-colors ${isLight ? 'border-emerald-200 text-emerald-700 bg-white group-hover:bg-emerald-50' : 'border-emerald-500/20 text-emerald-400 bg-black group-hover:bg-emerald-500/10'}`}>
                                        <step.icon className="w-5 h-5" />
                                    </div>
                                    <div className={`font-mono text-[10px] font-bold uppercase tracking-[0.2em] ${textMain}`}>{step.title}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SECTION 4: DEEP INSIGHTS */}
                <section className="grid lg:grid-cols-2 gap-12">
                    <div className={`p-12 border ${borderSubtle} rounded-3xl ${bgCard}`}>
                        <div className="text-emerald-500 mb-8 w-12 h-12 flex items-center justify-center rounded-xl bg-emerald-500/10"><Users className="w-6 h-6"/></div>
                        <h3 className={`text-2xl font-semibold mb-6 leading-tight ${textMain}`}>
                            {isAr ? 'المقاييس التي تركز على الإنسان' : 'Human-Centric Metrics'}
                        </h3>
                        <p className={`text-[15px] leading-relaxed ${textDim}`}>
                            {isAr 
                                ? 'بدلاً من استخدام لغة التهديد بالمناخ المجردة، يحول كايرو التأثير البيئي إلى مفاهيم الفقد المالي والمرض والاعتماد على السلاسل. هذا يحفز العمل من خلال الاقتصاد السلوكي التطبيقي.'
                                : 'Rather than abstract climate doom, Kairo translates environmental impact into financial loss, sickness, and dependency. This motivates action through applied behavioral economics.'}
                        </p>
                    </div>
                    <div className={`p-12 border ${borderSubtle} rounded-3xl ${bgCard}`}>
                        <div className="text-blue-500 mb-8 w-12 h-12 flex items-center justify-center rounded-xl bg-blue-500/10"><Globe className="w-6 h-6"/></div>
                        <h3 className={`text-2xl font-semibold mb-6 leading-tight ${textMain}`}>
                            {isAr ? 'البنية التحتية المحلية للقياس' : 'Locally Calibrated Infrastructure'}
                        </h3>
                        <p className={`text-[15px] leading-relaxed ${textDim}`}>
                            {isAr 
                                ? 'النظام مزروع جغرافياً. فهو لا يعتمد على متوسطات طاقة عالمية بل يفهم أسعار شرائح الكهرباء في مصر، وندرة النيل، وأنماط الاستهلاك الإقليمية.'
                                : 'The engine is geographically bound. It does not use global averages; it understands Egyptian tariff steps, Nile water scarcity matrices, and regional consumption quirks natively.'}
                        </p>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default Impact;
