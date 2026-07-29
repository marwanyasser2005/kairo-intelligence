import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { 
    Loader2, CheckCircle2, Globe, Leaf, Wind, ArrowRight, Zap, Truck, 
    Save, Target, Download, RefreshCw, LayoutDashboard, Share2, 
    Droplet, Utensils, Star, Info, ChevronDown, ChevronUp, Filter, Sparkles, FileText, Image as ImageIcon
} from 'lucide-react';
import { CalculatorResults, ClimateActionPlan, UserProgress, TrackedAction, SmartAction } from '../types';
import { KairoOrchestrator } from '../services/tokenRouterService';
import { Link, useNavigate } from 'react-router-dom';
import { usePersistentState } from '../utils/storage';
import { exportAsPdf, exportAsPng } from '../utils/export';
import { useApp } from '../contexts/AppContext';

const MotionDiv = motion.div as React.FC<HTMLMotionProps<"div">>;

interface ClimateActionProps {
  results: CalculatorResults | null;
  userProgress: UserProgress;
  setUserProgress: (p: UserProgress) => void;
}

const ActionCard: React.FC<{ 
    action: SmartAction; 
    isCompleted: boolean; 
    toggle: () => void; 
    theme: string; 
    dir: string 
}> = ({ action, isCompleted, toggle, theme, dir }) => {
    const [expanded, setExpanded] = useState(false);
    const isLight = theme === 'light';

    const getIcon = () => {
        switch(action.category) {
            case 'Water': return <Droplet className="w-4 h-4 text-blue-500" />;
            case 'Energy': return <Zap className="w-4 h-4 text-yellow-500" />;
            case 'Food': return <Utensils className="w-4 h-4 text-orange-500" />;
            case 'Transport': return <Truck className="w-4 h-4 text-purple-500" />;
            default: return <Leaf className="w-4 h-4 text-green-500" />;
        }
    };

    const getImpactColor = () => {
        if (action.impact_level === 'High') return 'bg-red-500/10 text-red-500 border-red-500/20';
        if (action.impact_level === 'Medium') return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        return 'bg-green-500/10 text-green-500 border-green-500/20';
    };

    return (
        <MotionDiv 
            layout
            className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isCompleted 
                ? 'bg-kairo-green/5 border-kairo-green/30 opacity-75' 
                : (isLight ? 'bg-white border-gray-200 hover:shadow-lg' : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06]')
            }`}
        >
            <div className="p-5 flex items-start gap-4 cursor-pointer" onClick={() => !expanded && toggle()}>
                <div 
                    onClick={(e) => { e.stopPropagation(); toggle(); }}
                    className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                    isCompleted ? 'bg-kairo-green border-kairo-green text-black' : 'border-gray-400 text-transparent hover:border-kairo-green'
                }`}>
                    <CheckCircle2 className="w-4 h-4" />
                </div>

                <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                        <h4 className={`font-bold text-lg ${isLight ? 'text-gray-900' : 'text-white'} ${isCompleted ? 'line-through decoration-gray-500 text-gray-500' : ''}`}>
                            {action.title}
                        </h4>
                        <div className={`text-[10px] px-2 py-1 rounded border font-bold uppercase tracking-wider ${getImpactColor()}`}>
                            {action.impact_level} Impact
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                        <div className="flex items-center gap-1">
                            {getIcon()} {action.category}
                        </div>
                        <div className="flex items-center gap-1 font-mono">
                            <Target className="w-3 h-3" /> {action.estimated_savings}
                        </div>
                        <div className={`px-1.5 py-0.5 rounded ${isLight?'bg-gray-100':'bg-white/10'}`}>
                            {action.difficulty}
                        </div>
                    </div>

                    {expanded && (
                        <MotionDiv 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            className={`mt-4 pt-4 border-t text-sm leading-relaxed ${isLight ? 'border-gray-100 text-gray-600' : 'border-white/10 text-gray-400'}`}
                        >
                            <p>{action.description}</p>
                            <div className="mt-3 flex gap-2">
                                <span className="text-kairo-green text-xs font-bold uppercase tracking-wider">Strategic Note:</span>
                                <span className="text-xs">Directly impacts regional scarcity metrics.</span>
                            </div>
                        </MotionDiv>
                    )}
                </div>

                <button 
                    onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }} 
                    className={`p-1 rounded hover:bg-gray-500/10 transition-colors ${isLight ? 'text-gray-400' : 'text-gray-500'}`}
                >
                    {expanded ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
                </button>
            </div>
        </MotionDiv>
    );
};

const ClimateAction: React.FC<ClimateActionProps> = ({ results, userProgress, setUserProgress }) => {
  const navigate = useNavigate();
  const { t, theme, dir, language } = useApp();
  const isLight = theme === 'light';
  
  const [plan, setPlan] = usePersistentState<ClimateActionPlan | null>('kairo_generated_plan', null);
  
  const [loading, setLoading] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingPng, setExportingPng] = useState(false);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [filterType, setFilterType] = useState<'All' | 'High Impact' | 'Water' | 'Energy'>('All');
  
  const currentCO2 = results?.totalCo2Kg || 0;

  const [targetPercent, setTargetPercent] = useState(() => {
    if (userProgress.co2TargetKg && currentCO2 > 0) {
        const pct = ((currentCO2 - userProgress.co2TargetKg) / currentCO2) * 100;
        return Math.max(0, Math.min(50, Math.round(pct)));
    }
    return 10;
  });

  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setTargetPercent(val);
    if (currentCO2 > 0) {
        const newTargetKg = currentCO2 * (1 - val / 100);
        setUserProgress({ ...userProgress, co2TargetKg: newTargetKg });
    }
  };

  const targetCO2 = currentCO2 * (1 - targetPercent / 100);

  const [trackedActions, setTrackedActions] = useState<TrackedAction[]>(() => {
    const saved = localStorage.getItem('kairo_actions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('kairo_actions', JSON.stringify(trackedActions));
  }, [trackedActions]);

  const toggleAction = (text: string, category: 'daily' | 'weekly' | 'monthly') => {
    setTrackedActions(prev => {
        const exists = prev.find(a => a.text === text);
        if (exists) {
            return prev.map(a => a.text === text ? { ...a, completed: !a.completed } : a);
        }
        return [...prev, { id: Math.random().toString(36).substr(2, 9), text, category, completed: true, dateAdded: Date.now() }];
    });
  };

  const isCompleted = (text: string) => trackedActions.find(a => a.text === text)?.completed;

  const generatePlan = async () => {
      if (!results) return;
      setLoading(true);
      try {
        const aiPlan = await KairoOrchestrator.generateComprehensivePlan(results, language);
        setPlan(aiPlan);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    if (results && !loading) {
        if (!plan || (plan.meta?.language && plan.meta.language !== language)) {
            generatePlan();
        }
    }
  }, [results, language]);

  const handleExportPdf = async () => {
      setExportingPdf(true);
      await exportAsPdf('roadmap-container', 'kairo_climate_roadmap');
      setExportingPdf(false);
  };

  const handleExportPng = async () => {
      setExportingPng(true);
      await exportAsPng('roadmap-container', 'kairo_climate_roadmap');
      setExportingPng(false);
  };

  const handleRegenerate = () => {
      if(window.confirm(language === 'ar' ? "هل تريد إعادة إنشاء الخطة؟" : "Regenerate Plan?")) {
          setPlan(null); 
          generatePlan();
      }
  };

  const getFilteredActions = (actions: SmartAction[]) => {
      if (filterType === 'All') return actions;
      if (filterType === 'High Impact') return actions.filter(a => a.impact_level === 'High');
      return actions.filter(a => a.category === filterType);
  };

  const bgSection = isLight ? 'bg-gray-50' : 'bg-black';
  const textMain = isLight ? 'text-gray-900' : 'text-white';
  const textSub = isLight ? 'text-gray-500' : 'text-gray-400';
  const cardBg = isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/[0.02] border-white/5';

  if (!results) return (
    <div className={`min-h-screen ${bgSection} flex flex-col items-center justify-center px-6 text-center`} dir={dir}>
        <Leaf className="w-16 h-16 text-kairo-green mb-6" />
        <h2 className={`text-3xl font-bold mb-4 ${textMain}`}>Initialize Your Climate Profile</h2>
        <p className={`${textSub} mb-8 max-w-md mx-auto`}>
            To generate your personalized action plan, Kairo needs to establish a baseline.
        </p>
        <Link to="/mini" className={`px-8 py-4 rounded-full font-bold transition-colors flex items-center gap-2 ${isLight ? 'bg-black text-white hover:bg-gray-800' : 'bg-white text-black hover:bg-gray-200'}`}>
            Start KairoMini <ArrowRight className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`}/>
        </Link>
    </div>
  );

  const completedCount = trackedActions.filter(a => a.completed).length;

  return (
    <div className={`min-h-screen pt-32 lg:pt-36 px-6 pb-20 ${bgSection} transition-colors duration-500`} dir={dir}>
      <div className="max-w-6xl mx-auto">
        
        <header className={`mb-12 border-b pb-8 ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border ${isLight ? 'bg-white border-gray-200 text-gray-500' : 'bg-kairo-green/10 border-kairo-green/20 text-kairo-green'}`}>
                        <Globe className="w-3 h-3" />
                        Climate Action Center
                    </div>
                    <h1 className={`text-4xl md:text-6xl font-bold mb-2 ${textMain}`}>{t.action.title}</h1>
                    <p className={`${textSub} max-w-2xl text-lg`}>
                        {t.action.desc}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto no-export">
                    <div className={`flex border rounded-lg overflow-hidden ${isLight ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`}>
                        <button 
                            onClick={handleExportPdf} 
                            disabled={exportingPdf || exportingPng || !plan}
                            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold transition-colors ${isLight ? 'text-gray-700 hover:bg-gray-50' : 'text-gray-300 hover:bg-white/10'}`}
                            title="Export as PDF"
                        >
                            {exportingPdf ? <Loader2 className="w-3 h-3 animate-spin"/> : <FileText className="w-3 h-3" />}
                            PDF
                        </button>
                        <div className={`w-[1px] ${isLight ? 'bg-gray-200' : 'bg-white/10'}`}></div>
                        <button 
                            onClick={handleExportPng} 
                            disabled={exportingPdf || exportingPng || !plan}
                            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold transition-colors ${isLight ? 'text-gray-700 hover:bg-gray-50' : 'text-gray-300 hover:bg-white/10'}`}
                            title="Export as PNG"
                        >
                            {exportingPng ? <Loader2 className="w-3 h-3 animate-spin"/> : <ImageIcon className="w-3 h-3" />}
                            PNG
                        </button>
                    </div>
                    
                    <button 
                        onClick={handleRegenerate}
                        disabled={loading}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${isLight ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100 border' : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'}`}
                    >
                        {loading ? <Loader2 className="w-3 h-3 animate-spin"/> : <RefreshCw className="w-3 h-3" />}
                        {t.action.regenerate}
                    </button>

                    <button 
                        onClick={() => navigate('/dashboard')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${isLight ? 'bg-gray-200 text-gray-800' : 'bg-kairo-green/10 text-kairo-green border border-kairo-green/30'}`}
                    >
                        <LayoutDashboard className="w-3 h-3" />
                        {t.action.returnDash}
                    </button>
                </div>
            </div>
        </header>

        {loading ? (
          <div className={`h-[400px] w-full flex flex-col items-center justify-center rounded-3xl border ${isLight ? 'bg-white border-gray-200' : 'bg-white/[0.02] border-white/5'}`}>
            <Loader2 className="w-12 h-12 text-kairo-green animate-spin mb-6" />
            <h3 className={`text-xl font-bold mb-2 ${textMain}`}>
                {language === 'ar' ? 'جارٍ تصميم خارطة الطريق...' : 'Architecting your Roadmap...'}
            </h3>
            <p className={`${textSub}`}>
                {language === 'ar' ? 'اختيار نموذج Gemini الأنسب لتخصيص التوصيات' : 'Selecting the best available Gemini model for localized recommendations'}
            </p>
          </div>
        ) : plan ? (
          <div id="roadmap-container" className="space-y-16">
            
            <div className={`${cardBg} rounded-2xl p-4 flex items-center justify-between shadow-sm`}>
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-kairo-green/20 flex items-center justify-center text-kairo-green">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">{t.action.status}</div>
                        <div className={`${textMain} font-bold`}>{t.common.active} & {t.common.saved}</div>
                    </div>
                </div>
                <div className={`${dir === 'rtl' ? 'text-left' : 'text-right'}`}>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">{t.action.actionsTaken}</div>
                    <div className={`text-2xl font-bold ${textMain}`}>{completedCount}</div>
                </div>
            </div>

            <section>
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">01 • {t.action.myActions}</span>
                        <div className={`h-px w-12 ${isLight ? 'bg-gray-200' : 'bg-white/10'}`} />
                    </div>
                    <div className="relative group">
                        <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${isLight ? 'bg-white border-gray-200 text-gray-700' : 'bg-white/5 border-white/10 text-white'}`}>
                            <Filter className="w-4 h-4" /> 
                            {filterType}
                            <ChevronDown className="w-3 h-3" />
                        </button>
                        <div className={`absolute z-10 top-full mt-2 w-48 rounded-xl shadow-xl overflow-hidden hidden group-hover:block ${dir === 'rtl' ? 'left-0' : 'right-0'} ${isLight ? 'bg-white border border-gray-200' : 'bg-black border border-white/10'}`}>
                            {['All', 'High Impact', 'Water', 'Energy'].map(ft => (
                                <button 
                                    key={ft}
                                    onClick={() => setFilterType(ft as any)}
                                    className={`w-full text-left px-4 py-3 text-sm hover:bg-kairo-green/10 hover:text-kairo-green transition-colors ${textMain}`}
                                >
                                    {ft}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={`${isLight ? 'bg-white border-gray-200 shadow-xl' : 'bg-black border-white/10'} border rounded-[2.5rem] overflow-hidden`}>
                    <div className={`border-b flex overflow-x-auto no-export ${isLight ? 'border-gray-100' : 'border-white/10'}`}>
                         {['daily', 'weekly', 'monthly'].map((tVal) => (
                            <button
                              key={tVal}
                              onClick={() => setActiveTab(tVal as any)}
                              className={`flex-1 py-6 px-8 text-center text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${
                                activeTab === tVal 
                                  ? `border-kairo-green ${textMain} ${isLight ? 'bg-gray-50' : 'bg-white/5'}` 
                                  : 'border-transparent text-gray-500 hover:bg-gray-50/5'
                              }`}
                            >
                              {t.action.tabs[tVal as keyof typeof t.action.tabs]}
                            </button>
                          ))}
                    </div>
                    
                    <div className="p-8 md:p-12 min-h-[300px]">
                        <div className="grid md:grid-cols-2 gap-4">
                            {(() => {
                                const rawActions = 
                                    activeTab === 'daily' ? plan.climate_action_plan.daily_actions : 
                                    activeTab === 'weekly' ? plan.climate_action_plan.weekly_actions : 
                                    plan.climate_action_plan.monthly_actions;
                                
                                const filteredActions = getFilteredActions(rawActions);

                                if (filteredActions.length === 0) {
                                    return <div className="col-span-2 text-center text-gray-500 py-12">No actions found for this filter.</div>
                                }

                                return filteredActions.map((action, i) => (
                                    <ActionCard 
                                        key={i} 
                                        action={action} 
                                        isCompleted={!!isCompleted(action.title)} 
                                        toggle={() => toggleAction(action.title, activeTab)} 
                                        theme={theme}
                                        dir={dir}
                                    />
                                ));
                            })()}
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <div className="flex items-center gap-4 mb-8">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">02 • {t.action.commitment}</span>
                    <div className={`h-px flex-1 ${isLight ? 'bg-gray-200' : 'bg-white/10'}`} />
                </div>
                
                <div className={`p-10 rounded-[2.5rem] border relative overflow-hidden ${isLight ? 'bg-white border-gray-200 shadow-xl' : 'bg-gradient-to-r from-gray-900 to-black border-white/10'}`}>
                    <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
                        <div className="flex-1 w-full">
                            <h3 className={`text-2xl font-bold mb-2 flex items-center gap-2 ${textMain}`}>
                                <Target className="w-6 h-6 text-kairo-green" />
                                {t.action.target.title}
                            </h3>
                            <p className={`${textSub} mb-8`}>
                                {t.action.target.desc}
                            </p>
                            
                            <div className="mb-3 flex justify-between text-sm font-bold">
                                <span className={textMain}>{t.action.target.current}</span>
                                <span className="text-kairo-green">{t.action.target.goal} (-{targetPercent}%)</span>
                            </div>
                            
                            <div className={`relative h-6 rounded-full mb-8 ${isLight ? 'bg-gray-200' : 'bg-gray-800'}`}>
                                <MotionDiv 
                                    className="absolute left-0 top-0 h-full bg-kairo-green rounded-full" 
                                    animate={{ width: `${100 - targetPercent}%` }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="50" 
                                    step="5"
                                    value={targetPercent} 
                                    onChange={handleTargetChange}
                                    className="w-full h-full opacity-0 cursor-pointer absolute inset-0 z-20 no-export"
                                />
                            </div>
                        </div>

                        <div className={`text-center p-8 rounded-3xl border min-w-[250px] backdrop-blur-sm ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-black/40 border-white/10'}`}>
                            <div className="text-sm text-gray-400 mb-2 uppercase tracking-widest">{t.action.target.goal}</div>
                            <div className={`text-5xl font-bold mb-2 ${textMain}`}>
                                {targetCO2.toFixed(1)} 
                                <span className="text-lg text-gray-500 ml-2">kg</span>
                            </div>
                            <div className="inline-block px-3 py-1 rounded-full bg-kairo-green/10 text-kairo-green text-xs font-bold border border-kairo-green/20">
                                {t.action.target.saving} { (currentCO2 - targetCO2).toFixed(1) } kg
                            </div>
                        </div>
                    </div>
                </div>
            </section>

             <section className={`${isLight ? 'bg-white border-gray-200 shadow-lg' : 'bg-gradient-to-br from-white/[0.05] to-black border-white/10'} border rounded-[2.5rem] p-10`}>
                <div className="flex items-center gap-4 mb-8">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">03 • {t.common.context}</span>
                    <div className={`h-px flex-1 ${isLight ? 'bg-gray-200' : 'bg-white/10'}`} />
                </div>

                <p className={`${textSub} leading-relaxed text-lg mb-8`}>
                    {plan.impact_summary}
                </p>
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <div className="text-sm font-bold text-kairo-green mb-2 uppercase tracking-wide">{t.common.egyptContext}</div>
                        <p className={`text-sm leading-relaxed border-l-2 border-kairo-green pl-4 ${textSub}`}>
                            {plan.local_context_explanation}
                        </p>
                    </div>
                    <div>
                        <div className="text-sm font-bold text-blue-400 mb-2 uppercase tracking-wide">{t.common.context} Global</div>
                        <p className={`text-sm leading-relaxed border-l-2 border-blue-400 pl-4 ${textSub}`}>
                            {plan.global_context_explanation}
                        </p>
                    </div>
                </div>
             </section>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ClimateAction;
