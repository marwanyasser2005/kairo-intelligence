import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, TrendingUp, Loader2, Save, Users, ShoppingCart, PieChart, BrainCircuit, LineChart, Leaf, Droplet, Flame, ArrowRight, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { runFoodWasteAnalysis } from '../../services/tokenRouterService';
import { FoodWasteAnalysisReport } from '../../types';
import { exportAsPdf } from '../../utils/export';
import ModuleToolbar from '../../components/ModuleToolbar';
import BillUploader from '../../components/BillUploader';
import CapabilityContext from '../../components/CapabilityContext';
import { UploadCloud } from 'lucide-react';
import { usePersistentState } from '../../utils/storage';
import { ResponsiveContainer, Tooltip as RechartsTooltip, PieChart as RePieChart, Pie, Cell, Legend } from 'recharts';
const MotionDiv = motion.div as any;
const COLORS = ['#22c55e', '#eab308', '#f97316', '#ef4444', '#8b5cf6'];
const FoodWaste: React.FC<any> = ({ report, setGlobalReport, globalFoodData, setGlobalFoodData }) => {
    const { t, theme, language } = useApp();
    const isLight = theme === 'light';
    const bgCard = isLight ? 'bg-white' : 'bg-gray-900 border-white/10';
    const textMain = isLight ? 'text-gray-900' : 'text-white';
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [activeTab, setActiveTab] = useState<'audit' | 'ocr'>('audit');
    const [ocrData, setOcrData] = useState<any>(null);
    const [familySize, setFamilySize] = usePersistentState<any>('kairo_fw_sys_familySize', 4);
    const [adults, setAdults] = usePersistentState<any>('kairo_fw_sys_adults', 2);
    const [children, setChildren] = usePersistentState<any>('kairo_fw_sys_children', 2);
    const [monthlyBudget, setMonthlyBudget] = usePersistentState<any>('kairo_fw_sys_monthlyBudget', 4000);
    const [restaurantPercent, setRestaurantPercent] = usePersistentState<any>('kairo_fw_sys_restaurantPercent', 20);
    const [shoppingFreq, setShoppingFreq] = usePersistentState<any>('kairo_fw_sys_shoppingFreq', 2);
    const [shoppingMethod, setShoppingMethod] = usePersistentState<any>('kairo_fw_sys_shoppingMethod', 'supermarket');
    const [homeMealsPerDay, setHomeMealsPerDay] = usePersistentState<any>('kairo_fw_sys_homeMealsPerDay', 3);
    const [deliveryPerWeek, setDeliveryPerWeek] = usePersistentState<any>('kairo_fw_sys_deliveryPerWeek', 1);
    const [throwAwayFreq, setThrowAwayFreq] = usePersistentState<any>('kairo_fw_sys_throwAwayFreq', 2);
    const [expiredFound, setExpiredFound] = usePersistentState<any>('kairo_fw_sys_expiredFound', 1);
    const [hasMealPlan, setHasMealPlan] = usePersistentState<any>('kairo_fw_sys_hasMealPlan', false);
    const [foodOrigin, setFoodOrigin] = usePersistentState<any>('kairo_fw_sys_foodOrigin', 'local');
    const [shelfLifeDays, setShelfLifeDays] = usePersistentState<any>('kairo_fw_sys_shelfLifeDays', 5);
    const [reductionTarget, setReductionTarget] = usePersistentState<any>('kairo_fw_sys_reductionTarget', 0);

    const handleRunAnalysis = async () => {
        setLoading(true);
        try {
            const inputs = { familySize, adults, children, monthlyBudget, restaurantPercent, shoppingFreq, shoppingMethod, homeMealsPerDay, deliveryPerWeek, throwAwayFreq, expiredFound, hasMealPlan, foodOrigin, shelfLifeDays, reductionTarget };
            const result = await runFoodWasteAnalysis(inputs, language);
            if (setGlobalReport) setGlobalReport(result);
        if (setGlobalFoodData) {
            // Link the detailed assessment to the unified dashboard summary.
            setGlobalFoodData({
                mealsPerDay: homeMealsPerDay,
                costPerMealLE: Math.round(monthlyBudget / (homeMealsPerDay * 30)),
                wastePercentage: Math.round((result.metrics.monthly_waste_cost / monthlyBudget) * 100)
            });
        }
        } catch (e) { console.error(e); }
        setLoading(false);
    };
    const advancedReport = report as FoodWasteAnalysisReport | null;
    const renderInput = (label: string, value: any, setter: any, type='number', min='0') => (
        <div className="mb-4">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{label}</label>
            {type === 'select' ? (
                <select value={value} onChange={e => setter(e.target.value)} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-3 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-orange-500">
                    <option value="supermarket">Supermarket</option>
                    <option value="local">Local Market</option>
                    <option value="delivery">Delivery Apps</option>
                    <option value="mixed">Mixed</option>
                </select>
            ) : type === 'origin_select' ? (
                <select value={value} onChange={e => setter(e.target.value)} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-3 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-orange-500">
                    <option value="local">Local Farmers (Egypt)</option>
                    <option value="imported">Mostly Imported (Global)</option>
                    <option value="mixed">Mixed Supply Chain</option>
                </select>
            ) : (
                <input type={type} min={min} value={value} onChange={e => setter(type === 'number' ? Number(e.target.value) : e.target.value)} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-3 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-orange-500" />
            )}
        </div>
    );
    const getScoreColor = (rating: string) => {
        if (!rating) return 'text-gray-500';
        const r = rating.toLowerCase();
        if (r.includes('excellent') || r.includes('ممتاز')) return 'text-green-500';
        if (r.includes('good') || r.includes('جيد')) return 'text-yellow-500';
        if (r.includes('improve') || r.includes('تحسين')) return 'text-orange-500';
        return 'text-red-500';
    };
    return (
        <div className="w-full min-h-screen pt-32 lg:pt-36 pb-20 px-4 md:px-6 lg:px-8 space-y-8 max-w-7xl mx-auto">
            <CapabilityContext capabilityId="food" />
            <ModuleToolbar 
                title={language === 'ar' ? 'محاكي هدر الطعام المتقدم' : 'Advanced Food Waste Simulator'}
                description={language === 'ar' ? 'تحليل ذكي لسلسلة الإمداد المنزلية والبصمة البيئية.' : 'Intelligent household supply chain & environmental footprint analysis.'}
                icon={<Utensils className="w-6 h-6 text-orange-500" />}
                onReset={() => { if(setGlobalReport) setGlobalReport(null); setStep(1); }}
                hasReport={!!advancedReport}
                sdgs={[2, 12, 13]}
                exportTargetId="food-report-container"
                exportFilename="Kairo_Food_Assessment"
            />
            <div className="grid lg:grid-cols-12 gap-8 mb-12">
                <div className="lg:col-span-8">
                        <div className={`${bgCard} border rounded-2xl p-6 md:p-8 shadow-sm`}>
                            
                            {activeTab === 'ocr' ? (
                                <div>
                                    <h3 className={`font-bold text-lg mb-4 ${textMain}`}>
                                        {language === 'ar' ? 'رفع إيصال المشتريات' : 'Upload Grocery Receipt'}
                                    </h3>
                                    <BillUploader forceType="food" onDataExtracted={(t, data) => {
                                        setOcrData(data);
                                        setMonthlyBudget(data.total_cost_egp * 4);
                                        setActiveTab('audit');
                                    }} />
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-4">

                                {[1, 2, 3, 4].map(s => (
                                    <button key={s} onClick={() => setStep(s)} className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-colors ${step === s ? 'bg-orange-500 text-white' : 'bg-black/5 dark:bg-white/5 text-gray-500'}`}>
                                        {language === 'ar' ? ['السكان', 'الإنفاق', 'العادات', 'التخطيط'][s-1] : ['Demographics', 'Spending', 'Habits', 'Planning'][s-1]}
                                    </button>
                                ))}
                            </div>
                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <MotionDiv key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                        <div className="flex items-center gap-3 mb-6 border-b border-black/10 dark:border-white/10 pb-4">
                                            <Users className="w-5 h-5 text-orange-500" />
                                            <h2 className={`text-lg font-bold ${textMain}`}>{language === 'ar' ? 'البيانات السكانية' : 'Demographics'}</h2>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {renderInput(language === 'ar' ? 'عدد أفراد الأسرة' : 'Family Size', familySize, setFamilySize)}
                                            {renderInput(language === 'ar' ? 'عدد البالغين' : 'Adults', adults, setAdults)}
                                            {renderInput(language === 'ar' ? 'عدد الأطفال' : 'Children', children, setChildren)}
                                        </div>
                                    </MotionDiv>
                                )}
                                {step === 2 && (
                                    <MotionDiv key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                        <div className="flex items-center gap-3 mb-6 border-b border-black/10 dark:border-white/10 pb-4">
                                            <TrendingUp className="w-5 h-5 text-orange-500" />
                                            <h2 className={`text-lg font-bold ${textMain}`}>{language === 'ar' ? 'الإنفاق المحتمل' : 'Monthly Spending'}</h2>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {renderInput(language === 'ar' ? 'الميزانية الشهرية (EGP)' : 'Monthly Budget (EGP)', monthlyBudget, setMonthlyBudget)}
                                            {renderInput(language === 'ar' ? 'نسبة الإنفاق على المطاعم (%)' : 'Restaurant Spending %', restaurantPercent, setRestaurantPercent)}
                                        </div>
                                    </MotionDiv>
                                )}
                                {step === 3 && (
                                    <MotionDiv key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                        <div className="flex items-center gap-3 mb-6 border-b border-black/10 dark:border-white/10 pb-4">
                                            <ShoppingCart className="w-5 h-5 text-orange-500" />
                                            <h2 className={`text-lg font-bold ${textMain}`}>{language === 'ar' ? 'عادات الاستهلاك' : 'Consumption Habits'}</h2>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {renderInput(language === 'ar' ? 'مرات التسوق أسبوعياً' : 'Shopping Frequency / Wk', shoppingFreq, setShoppingFreq)}
                                            {renderInput(language === 'ar' ? 'طلبات التوصيل أسبوعياً' : 'Delivery Orders / Wk', deliveryPerWeek, setDeliveryPerWeek)}
                                            {renderInput(language === 'ar' ? 'طريقة التسوق' : 'Primary Shopping Method', shoppingMethod, setShoppingMethod, 'select')}
                                            {renderInput(language === 'ar' ? 'مصدر الطعام' : 'Food Origin Focus', foodOrigin, setFoodOrigin, 'origin_select')}
                                            {renderInput(language === 'ar' ? 'متوسط فترة الصلاحية (أيام)' : 'Avg Shelf Life (Days)', shelfLifeDays, setShelfLifeDays)}
                                            {renderInput(language === 'ar' ? 'وجبات منزلية يومياً' : 'Home Meals / Day', homeMealsPerDay, setHomeMealsPerDay)}
                                        </div>
                                    </MotionDiv>
                                )}
                                {step === 4 && (
                                    <MotionDiv key="step4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                        <div className="flex items-center gap-3 mb-6 border-b border-black/10 dark:border-white/10 pb-4">
                                            <PieChart className="w-5 h-5 text-orange-500" />
                                            <h2 className={`text-lg font-bold ${textMain}`}>{language === 'ar' ? 'التخطيط والإدارة' : 'Planning & Management'}</h2>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            {renderInput(language === 'ar' ? 'مرات رمي الطعام أسبوعياً' : 'Throwing Away Freq / Wk', throwAwayFreq, setThrowAwayFreq)}
                                            {renderInput(language === 'ar' ? 'عثور على منتهي الصلاحية شهرياً' : 'Expired Food Found / Mo', expiredFound, setExpiredFound)}
                                        </div>
                                        <label className="flex items-center gap-3 cursor-pointer p-4 border border-black/10 dark:border-white/10 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                            <input type="checkbox" checked={hasMealPlan} onChange={e => setHasMealPlan(e.target.checked)} className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500" />
                                            <span className={`font-bold ${textMain}`}>{language === 'ar' ? 'لدي خطة أسبوعية للوجبات' : 'I actively maintain a weekly meal plan'}</span>
                                        </label>
                                    </MotionDiv>
                                )}
                            </AnimatePresence>
                                </>
                            )}
                            {activeTab === 'audit' && (
                                <div className="mt-8 pt-6 border-t border-black/10 dark:border-white/10 flex justify-between items-center">
                                    <button onClick={() => setStep(Math.max(1, step - 1))} className={`px-6 py-3 rounded-xl font-bold transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-500'}`}>{language === 'ar' ? 'السابق' : 'Back'}</button>
                                    {step < 4 ? (
                                        <button onClick={() => setStep(step + 1)} className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-transform active:scale-95">{language === 'ar' ? 'التالي' : 'Next'}</button>
                                    ) : (
                                        <button onClick={handleRunAnalysis} disabled={loading} className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-bold transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-orange-500/20 disabled:opacity-50">
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
                                            {language === 'ar' ? 'توليد تقرير الذكاء الاصطناعي' : 'Generate AI Report'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="lg:col-span-4 space-y-6">
                        <div className={`${bgCard} p-6 border rounded-2xl`}>
                            <h3 className={`font-bold flex items-center gap-2 mb-4 ${textMain}`}><LineChart className="w-5 h-5 text-blue-500" /> {language === 'ar' ? 'لماذا هذه البيانات؟' : 'Why this data?'}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed mb-4">
                                {language === 'ar' ? 'نحن نستخدم نموذج ذكاء اصطناعي متقدم لتحليل سلوك الأسرة في الشراء والاستهلاك والتخلص لتحديد نقاط الخلل في سلسلة الإمداد المنزلية بدقة غير مسبوقة.' : 'We use an advanced AI model to analyze your household\'s behavioral patterns across the micro-supply chain to pinpoint inefficiencies with unprecedented accuracy.'}
                            </p>
                        </div>
                    </div>
                </div>
            {advancedReport && (
                <MotionDiv id="food-report-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pt-8 border-t border-black/10 dark:border-white/10">
                    
                    {/* Inputs Summary */}
                    <div className={`${bgCard} border rounded-2xl p-6 relative overflow-hidden`}>
                        <h3 className={`text-sm font-bold uppercase mb-4 text-gray-500`}>{language === 'ar' ? 'ملخص المُدخلات' : 'Session Inputs'}</h3>
                        <div className="flex flex-wrap gap-4">
                            <div className="px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-300">
                                {language === 'ar' ? 'الأسرة:' : 'Family:'} {familySize}
                            </div>
                            <div className="px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-300">
                                {language === 'ar' ? 'الميزانية:' : 'Budget:'} {monthlyBudget} EGP
                            </div>
                            <div className="px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-300">
                                {language === 'ar' ? 'التسوق:' : 'Shopping:'} {shoppingFreq}/wk
                            </div>
                            <div className="px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-300">
                                {language === 'ar' ? 'المنشأ:' : 'Origin:'} {foodOrigin}
                            </div>
                            <div className="px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-300">
                                {language === 'ar' ? 'صلاحية:' : 'Shelf Life:'} {shelfLifeDays}d
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className={`${bgCard} border rounded-2xl p-6 relative overflow-hidden`}>
                            <div className="text-xs text-gray-500 uppercase font-bold mb-2">{language === 'ar' ? 'مؤشر كفاءة الطعام' : 'Efficiency Score'}</div>
                            <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-500">{advancedReport.metrics.food_efficiency_score}%</div>
                            <div className={`text-xs mt-2 font-bold ${getScoreColor(advancedReport.metrics.sustainability_rating)}`}>{advancedReport.metrics.sustainability_rating}</div>
                        </div>
                        <div className={`${bgCard} border rounded-2xl p-6 relative overflow-hidden`}>
                            <div className="text-xs text-gray-500 uppercase font-bold mb-2">{language === 'ar' ? 'خسارة مالية سنوية' : 'Annual Waste Cost'}</div>
                            <div className={`text-4xl font-bold ${textMain}`}>{advancedReport.metrics.annual_waste_cost.toLocaleString()} <span className="text-sm">EGP</span></div>
                        </div>
                        <div className={`${bgCard} border rounded-2xl p-6 relative overflow-hidden`}>
                            <div className="text-xs text-gray-500 uppercase font-bold mb-2">{language === 'ar' ? 'انبعاثات الميثان' : 'Methane Output'}</div>
                            <div className={`text-4xl font-bold ${textMain}`}>{advancedReport.metrics.methane_emissions_kg} <span className="text-sm">kg</span></div>
                        </div>
                        <div className={`${bgCard} border rounded-2xl p-6 relative overflow-hidden`}>
                            <div className="text-xs text-gray-500 uppercase font-bold mb-2">{language === 'ar' ? 'البصمة المائية' : 'Water Footprint Loss'}</div>
                            <div className={`text-4xl font-bold ${textMain}`}>{advancedReport.metrics.water_footprint_loss_liters.toLocaleString()} <span className="text-sm">L</span></div>
                        </div>
                    </div>
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <div className={`${bgCard} border rounded-2xl p-8`}>
                                <div className="flex items-center gap-3 mb-6 border-b border-black/10 dark:border-white/10 pb-4">
                                    <BrainCircuit className="w-6 h-6 text-purple-500" />
                                    <h2 className={`text-xl font-bold ${textMain}`}>{language === 'ar' ? 'تشخيص الذكاء الاصطناعي: سلسلة الإمداد' : 'AI Supply Chain Diagnosis'}</h2>
                                </div>
                                <div className="grid md:grid-cols-2 gap-8 items-center">
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RePieChart>
                                                <Pie data={[{ name: language==='ar'?'شراء':'Purchase', value: advancedReport.ai_supply_chain_diagnosis?.stage_breakdown_percentages?.purchase || 0 }, { name: language==='ar'?'تخزين':'Storage', value: advancedReport.ai_supply_chain_diagnosis?.stage_breakdown_percentages?.storage || 0 }, { name: language==='ar'?'تحضير':'Prep', value: advancedReport.ai_supply_chain_diagnosis?.stage_breakdown_percentages?.preparation || 0 }, { name: language==='ar'?'استهلاك':'Consumption', value: advancedReport.ai_supply_chain_diagnosis?.stage_breakdown_percentages?.consumption || 0 }, { name: language==='ar'?'تخلص':'Disposal', value: advancedReport.ai_supply_chain_diagnosis?.stage_breakdown_percentages?.disposal || 0 }]} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={2} dataKey="value">
                                                    {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                                                </Pie>
                                                <RechartsTooltip contentStyle={{ backgroundColor: isLight ? '#fff' : '#1e293b', borderRadius: '12px', borderColor: isLight?'#e2e8f0':'#334155', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                <Legend verticalAlign="bottom" height={36}/>
                                            </RePieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-500 font-bold text-xs uppercase mb-4 border border-red-500/20">
                                            <AlertTriangle className="w-3 h-3" />
                                            Most Inefficient: {advancedReport.ai_supply_chain_diagnosis?.most_inefficient_stage}
                                        </div>
                                        <p className="text-gray-500 text-sm leading-relaxed">{advancedReport.ai_supply_chain_diagnosis?.bottleneck_explanation}</p>
                                    </div>
                                </div>
                            </div>
                            <div className={`${bgCard} border rounded-2xl p-8`}>
                                <h2 className={`text-xl font-bold mb-4 ${textMain}`}>{language === 'ar' ? 'التحليل السلوكي' : 'Behavioral Analysis'}</h2>
                                <p className="text-gray-500 mb-6">{advancedReport.ai_waste_analysis?.behavioral_insights}</p>
                                <div className="grid gap-3">
                                    {advancedReport.ai_waste_analysis?.primary_causes?.map((c: any, i: any) => (
                                        <div key={i} className="p-3 bg-black/5 dark:bg-white/5 rounded-lg text-sm font-medium">{c}</div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8">
                                <h2 className="text-xl font-bold text-green-500 mb-6">{language === 'ar' ? 'خطة التحسين' : 'Optimization Plan'}</h2>
                                <h4 className="text-xs font-bold uppercase text-gray-500 mb-3">Immediate</h4>
                                <ul className="space-y-2 mb-6">
                                    {advancedReport.ai_optimization_plan?.immediate_actions?.map((act: any, i: any) => <li key={i} className={`text-sm flex gap-2 ${textMain}`}>• {act}</li>)}
                                </ul>
                                <h4 className="text-xs font-bold uppercase text-gray-500 mb-3">Long-term</h4>
                                <ul className="space-y-2">
                                    {advancedReport.ai_optimization_plan?.long_term_habits?.map((act: any, i: any) => <li key={i} className={`text-sm flex gap-2 ${textMain}`}>• {act}</li>)}
                                </ul>
                            </div>
                            <div className={`${bgCard} border rounded-2xl p-6`}>
                                <h3 className={`font-bold mb-4 ${textMain}`}>What-If Simulator</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-xs font-bold text-gray-500 mb-2"><span>Waste Reduction Target</span><span>{reductionTarget}%</span></div>
                                        <input type="range" min="0" max="50" step="5" value={reductionTarget} onChange={e => setReductionTarget(Number(e.target.value))} className="w-full accent-orange-500" />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs font-bold text-orange-500 uppercase">Projected Savings</div>
                                        <div className="text-2xl font-bold text-orange-600">+ {((advancedReport.metrics.annual_waste_cost * reductionTarget) / 100).toLocaleString()} EGP</div>
                                    </div>
                                    {reductionTarget > 0 && <button onClick={handleRunAnalysis} disabled={loading} className="w-full py-2 bg-black/5 dark:bg-white/5 rounded-lg text-sm font-bold">Recalculate Model</button>}
                                </div>
                            </div>
                        </div>
                    </div>
                </MotionDiv>
            )}
        </div>
    );
};
export default FoodWaste;
