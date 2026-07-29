import React, { useState, useEffect } from 'react';
import { Droplet, AlertTriangle, ArrowRight, Waves, Scale, ShieldCheck, Loader2, FileText, ChevronRight, Activity, Users, Save, Building2, UploadCloud, PieChart, Info, Settings, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { runWaterAnalysis } from '../../services/tokenRouterService';
import { WaterAnalysisReport, WaterData, WaterBillExtraction, WaterAnalysisInputs } from '../../types';
import { usePersistentState } from '../../utils/storage';
import { useApp } from '../../contexts/AppContext';
import ModuleToolbar from '../../components/ModuleToolbar';
import { exportAsPdf } from '../../utils/export';
import BillUploader from '../../components/BillUploader';
import CapabilityContext from '../../components/CapabilityContext';
import { ResponsiveContainer, Tooltip as RechartsTooltip, PieChart as RePieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

const MotionDiv = motion.div as any;
const COLORS = ['#38bdf8', '#ef4444', '#94a3b8']; // User, Benchmark, National

interface WaterScarcityProps {
    report: WaterAnalysisReport | null;
    setGlobalReport?: (report: WaterAnalysisReport | null) => void;
    globalWaterData?: WaterData;
}

const WaterScarcity: React.FC<WaterScarcityProps> = ({ report, setGlobalReport, globalWaterData }) => {
    const { t, theme, dir, language } = useApp();
    const isLight = theme === 'light';
    const [loading, setLoading] = useState(false);
    
    // UI state
    const [activeTab, setActiveTab] = usePersistentState<'quick' | 'ocr'>('kairo_water_tab', 'quick');
    const [type, setType] = usePersistentState<'residential' | 'corporate'>('kairo_water_type', 'residential');
    
    // Residential Inputs
    const [familySize, setFamilySize] = usePersistentState('kairo_water_family_size', 4);
    const [housingType, setHousingType] = usePersistentState<'apartment' | 'house' | 'villa'>('kairo_water_housing_type', 'apartment');
    const [monthlyBill, setMonthlyBill] = usePersistentState('kairo_water_monthly_bill', 150);
    const [billIncreased, setBillIncreased] = usePersistentState<'yes' | 'no' | 'unknown'>('kairo_water_increased', 'unknown');
    const [constantSound, setConstantSound] = usePersistentState<'yes' | 'no'>('kairo_water_sound', 'no');
    const [dampStains, setDampStains] = usePersistentState<'yes' | 'no'>('kairo_water_stains', 'no');
    const [toiletRefills, setToiletRefills] = usePersistentState<'yes' | 'no'>('kairo_water_refills', 'no');
    const [washingMachineWeekly, setWashingMachineWeekly] = usePersistentState('kairo_water_washing', 3);
    
    // Corporate Inputs
    const [facilityType, setFacilityType] = usePersistentState<'office' | 'factory' | 'hotel' | 'restaurant' | 'hospital' | 'university' | 'school'>('kairo_water_facility', 'office');
    const [employees, setEmployees] = usePersistentState('kairo_water_employees', 50);
    const [visitors, setVisitors] = usePersistentState('kairo_water_visitors', 10);
    const [monthlyWaterM3, setMonthlyWaterM3] = usePersistentState('kairo_water_m3', 500);
    const [irrigation, setIrrigation] = usePersistentState<'yes' | 'no'>('kairo_water_irr', 'no');
    const [coolingTowers, setCoolingTowers] = usePersistentState<'yes' | 'no'>('kairo_water_cool', 'no');
    const [cleaningSystems, setCleaningSystems] = usePersistentState<'yes' | 'no'>('kairo_water_clean', 'no');

    // OCR State
    const [ocrData, setOcrData] = useState<WaterBillExtraction | null>(null);

    // Hydration from global (optional)
    useEffect(() => {
        if (globalWaterData && !report) {
            if (globalWaterData.monthlyBillLE) setMonthlyBill(globalWaterData.monthlyBillLE);
            if (globalWaterData.volumetricM3) setMonthlyWaterM3(globalWaterData.volumetricM3);
        }
    }, [globalWaterData, report]);

    const handleRunAnalysis = async () => {
        setLoading(true);
        try {
            const inputs: WaterAnalysisInputs = {
                type,
                monthly_bill: monthlyBill,
                bill_increased: billIncreased,
                constant_water_sound: constantSound,
                damp_stains: dampStains,
                toilet_refills: toiletRefills,
                washing_machine_weekly: washingMachineWeekly,
                ocrData
            };
            
            if (type === 'residential') {
                inputs.family_size = familySize;
                inputs.housing_type = housingType;
            } else {
                inputs.facility_type = facilityType;
                inputs.employees_count = employees;
                inputs.visitors_count = visitors;
                inputs.monthly_water_use_m3 = monthlyWaterM3;
                inputs.irrigation_systems = irrigation;
                inputs.cooling_towers = coolingTowers;
                inputs.cleaning_systems = cleaningSystems;
            }
            
            const result = await runWaterAnalysis(inputs, language);
            if (setGlobalReport) setGlobalReport(result);
            
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const textMain = isLight ? 'text-gray-900' : 'text-white';
    const textSub = isLight ? 'text-gray-600' : 'text-gray-400';
    const bgCard = isLight ? 'bg-white border-gray-200' : 'bg-gray-900 border-white/10';
    const inputStyle = `w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring2-2 focus:ring-blue-500/50 transition-all ${isLight ? "bg-slate-50 border border-slate-200 text-slate-900" : "bg-black/20 border border-white/10 text-white"}`;
    const labelStyle = `block text-xs font-bold uppercase tracking-wider mb-2 ${textSub}`;

    const getRiskColor = (level: string) => {
        switch(level) {
            case 'Excellent': return 'text-green-500';
            case 'Very Good': return 'text-blue-500';
            case 'Good': return 'text-yellow-500';
            case 'Needs Improvement': return 'text-orange-500';
            case 'High Risk': return 'text-red-500';
            default: return 'text-blue-500';
        }
    };

    return (
        <div className="w-full min-h-screen pt-32 lg:pt-36 pb-20 px-4 md:px-6 lg:px-8 space-y-8 max-w-7xl mx-auto" dir={dir}>
            <CapabilityContext capabilityId="water" />
            <ModuleToolbar 
                title={language === 'ar' ? 'ذكاء المياه والندرة' : 'Water & Scarcity Intelligence'}
                description={language === 'ar' ? 'حلّل استهلاك المياه والهدر وحالة الشبكة، واعرف تبدأ التحسين منين.' : 'Understand consumption, losses, and network conditions to prioritize the next improvement.'}
                icon={<Waves className="w-6 h-6 text-blue-500" />}
                onReset={() => { if(setGlobalReport) setGlobalReport(null); setOcrData(null); }}
                hasReport={!!report}
                theme={theme}
                sdgs={[6, 11, 13]}
                exportTargetId="water-report-container"
                exportFilename="Water_Scarcity_Intelligence"
            />

            <div className="grid lg:grid-cols-12 gap-8 mb-12">
                <div className="lg:col-span-8 space-y-6">
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setActiveTab('quick')}
                                className={`flex-1 py-4 border rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${activeTab === 'quick' ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20' : `${bgCard} ${textSub}`}`}
                            >
                                <Target className="w-6 h-6" />
                                <span className="font-bold text-sm">{language === 'ar' ? 'التقييم السريع' : 'Quick Assessment'}</span>
                            </button>
                            <button 
                                onClick={() => setActiveTab('ocr')}
                                className={`flex-1 py-4 border rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${activeTab === 'ocr' ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20' : `${bgCard} ${textSub}`}`}
                            >
                                <UploadCloud className="w-6 h-6" />
                                <span className="font-bold text-sm">{language === 'ar' ? 'التحليل الذكي للفواتير' : 'Smart OCR Analysis'}</span>
                            </button>
                        </div>

                        {activeTab === 'ocr' && (
                            <div className={`${bgCard} border rounded-2xl p-6`}>
                                <h3 className={`font-bold text-lg mb-4 ${textMain}`}>
                                    {language === 'ar' ? 'رفع فاتورة المياه' : 'Upload Water Bill'}
                                </h3>
                                <BillUploader forceType="water" onDataExtracted={(t, data) => setOcrData(data)} />
                                {ocrData && (
                                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl mt-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <ShieldCheck className="w-5 h-5 text-green-500" />
                                            <div>
                                                <div className="text-sm font-bold text-green-600">{language === 'ar' ? 'تم استخراج البيانات بنجاح' : 'Data extracted successfully'}</div>
                                                <div className="text-xs text-green-700/70">{ocrData.total_consumption_m3} m³ • {ocrData.total_amount} {ocrData.currency || 'EGP'}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className={`${bgCard} border rounded-2xl overflow-hidden`}>
                            <div className="flex border-b border-black/10 dark:border-white/10">
                                <button onClick={() => setType('residential')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${type === 'residential' ? 'border-b-2 border-blue-500 text-blue-500' : textSub}`}>
                                    <Droplet className="w-4 h-4" /> {language === 'ar' ? 'منزل (سكني)' : 'Residential'}
                                </button>
                                <button onClick={() => setType('corporate')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${type === 'corporate' ? 'border-b-2 border-blue-500 text-blue-500' : textSub}`}>
                                    <Building2 className="w-4 h-4" /> {language === 'ar' ? 'مؤسسة (تجاري)' : 'Corporate'}
                                </button>
                            </div>
                            
                            <div className="p-6 md:p-8 space-y-8">
                                {type === 'residential' ? (
                                    <AnimatePresence mode="wait">
                                        <MotionDiv key="res" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className={labelStyle}>{language === 'ar' ? 'عدد أفراد الأسرة' : 'Family Size'}</label>
                                                    <input type="number" min="1" value={familySize} onChange={e => setFamilySize(Number(e.target.value))} className={inputStyle} />
                                                </div>
                                                <div>
                                                    <label className={labelStyle}>{language === 'ar' ? 'نوع السكن' : 'Housing Type'}</label>
                                                    <select value={housingType} onChange={e => setHousingType(e.target.value as any)} className={inputStyle}>
                                                        <option value="apartment">{language === 'ar' ? 'شقة' : 'Apartment'}</option>
                                                        <option value="house">{language === 'ar' ? 'منزل مستقل' : 'House'}</option>
                                                        <option value="villa">{language === 'ar' ? 'فيلا' : 'Villa'}</option>
                                                    </select>
                                                </div>
                                            </div>
                                            
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className={labelStyle}>{language === 'ar' ? 'متوسط الفاتورة الشهرية (جنيه)' : 'Average Monthly Bill'}</label>
                                                    <input type="number" min="0" value={monthlyBill} onChange={e => setMonthlyBill(Number(e.target.value))} className={inputStyle} />
                                                </div>
                                                <div>
                                                    <label className={labelStyle}>{language === 'ar' ? 'هل ارتفعت الفاتورة آخر 3 أشهر؟' : 'Bill Increased Recently?'}</label>
                                                    <select value={billIncreased} onChange={e => setBillIncreased(e.target.value as any)} className={inputStyle}>
                                                        <option value="unknown">{language === 'ar' ? 'لا أعلم' : 'Unknown'}</option>
                                                        <option value="yes">{language === 'ar' ? 'نعم' : 'Yes'}</option>
                                                        <option value="no">{language === 'ar' ? 'لا' : 'No'}</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 space-y-4">
                                                <h4 className={`text-sm font-bold ${textMain}`}>{language === 'ar' ? 'علامات التسرب والعادات' : 'Leak Signs & Habits'}</h4>
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <label className="flex items-center gap-3 text-sm cursor-pointer">
                                                        <input type="checkbox" checked={constantSound === 'yes'} onChange={e => setConstantSound(e.target.checked ? 'yes' : 'no')} className="w-4 h-4 accent-blue-500 border-gray-300 rounded" />
                                                        <span className={textMain}>{language === 'ar' ? 'صوت مياه مستمر؟' : 'Constant sound of running water?'}</span>
                                                    </label>
                                                    <label className="flex items-center gap-3 text-sm cursor-pointer">
                                                        <input type="checkbox" checked={dampStains === 'yes'} onChange={e => setDampStains(e.target.checked ? 'yes' : 'no')} className="w-4 h-4 accent-blue-500 border-gray-300 rounded" />
                                                        <span className={textMain}>{language === 'ar' ? 'بقع رطوبة أو علامات تسرب؟' : 'Damp stains or leak signs?'}</span>
                                                    </label>
                                                    <label className="flex items-center gap-3 text-sm cursor-pointer">
                                                        <input type="checkbox" checked={toiletRefills === 'yes'} onChange={e => setToiletRefills(e.target.checked ? 'yes' : 'no')} className="w-4 h-4 accent-blue-500 border-gray-300 rounded" />
                                                        <span className={textMain}>{language === 'ar' ? 'يعاد ملء السيفون باستمرار؟' : 'Toilet refilling continuously?'}</span>
                                                    </label>
                                                </div>
                                                <div className="pt-4">
                                                    <label className={labelStyle}>{language === 'ar' ? 'مرات تشغيل الغسالة أسبوعياً' : 'Washing machine runs / week'}</label>
                                                    <input type="number" min="0" value={washingMachineWeekly} onChange={e => setWashingMachineWeekly(Number(e.target.value))} className={inputStyle} />
                                                </div>
                                            </div>
                                        </MotionDiv>
                                    </AnimatePresence>
                                ) : (
                                    <AnimatePresence mode="wait">
                                        <MotionDiv key="corp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className={labelStyle}>{language === 'ar' ? 'نوع المنشأة' : 'Facility Type'}</label>
                                                    <select value={facilityType} onChange={e => setFacilityType(e.target.value as any)} className={inputStyle}>
                                                        <option value="office">{language === 'ar' ? 'مكتب / مبنى إداري' : 'Office'}</option>
                                                        <option value="factory">{language === 'ar' ? 'مصنع' : 'Factory'}</option>
                                                        <option value="hotel">{language === 'ar' ? 'فندق' : 'Hotel'}</option>
                                                        <option value="hospital">{language === 'ar' ? 'مستشفى' : 'Hospital'}</option>
                                                        <option value="school">{language === 'ar' ? 'مدرسة' : 'School'}</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className={labelStyle}>{language === 'ar' ? 'استهلاك المياه (م³/شهر)' : 'Water Use (m³/month)'}</label>
                                                    <input type="number" min="0" value={monthlyWaterM3} onChange={e => setMonthlyWaterM3(Number(e.target.value))} className={inputStyle} />
                                                </div>
                                            </div>
                                            
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className={labelStyle}>{language === 'ar' ? 'عدد الموظفين' : 'Employees'}</label>
                                                    <input type="number" min="1" value={employees} onChange={e => setEmployees(Number(e.target.value))} className={inputStyle} />
                                                </div>
                                                <div>
                                                    <label className={labelStyle}>{language === 'ar' ? 'الزوار (يومياً)' : 'Daily Visitors'}</label>
                                                    <input type="number" min="0" value={visitors} onChange={e => setVisitors(Number(e.target.value))} className={inputStyle} />
                                                </div>
                                            </div>

                                            <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 space-y-4">
                                                <h4 className={`text-sm font-bold ${textMain}`}>{language === 'ar' ? 'مرافق مستهلكة للمياه' : 'Water-Intensive Facilities'}</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <label className="flex items-center gap-3 text-sm cursor-pointer">
                                                        <input type="checkbox" checked={irrigation === 'yes'} onChange={e => setIrrigation(e.target.checked ? 'yes' : 'no')} className="w-4 h-4 accent-orange-500 border-gray-300 rounded" />
                                                        <span className={textMain}>{language === 'ar' ? 'أنظمة ري' : 'Irrigation'}</span>
                                                    </label>
                                                    <label className="flex items-center gap-3 text-sm cursor-pointer">
                                                        <input type="checkbox" checked={coolingTowers === 'yes'} onChange={e => setCoolingTowers(e.target.checked ? 'yes' : 'no')} className="w-4 h-4 accent-orange-500 border-gray-300 rounded" />
                                                        <span className={textMain}>{language === 'ar' ? 'أبراج تبريد' : 'Cooling Towers'}</span>
                                                    </label>
                                                    <label className="flex items-center gap-3 text-sm cursor-pointer">
                                                        <input type="checkbox" checked={cleaningSystems === 'yes'} onChange={e => setCleaningSystems(e.target.checked ? 'yes' : 'no')} className="w-4 h-4 accent-orange-500 border-gray-300 rounded" />
                                                        <span className={textMain}>{language === 'ar' ? 'أنظمة تنظيف صناعية' : 'Commercial Cleaning'}</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </MotionDiv>
                                    </AnimatePresence>
                                )}

                                <button 
                                    onClick={handleRunAnalysis} 
                                    disabled={loading}
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-bold text-sm md:text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-blue-500/25"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
                                    {language === 'ar' ? 'توليد الاستخبارات المائية' : 'Generate Water Intelligence'}
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="lg:col-span-4 space-y-6">
                        <div className={`${bgCard} border rounded-2xl p-6 space-y-6`}>
                            <div>
                                <h3 className={`font-bold text-lg mb-2 ${textMain}`}>
                                    {language === 'ar' ? 'لماذا الذكاء الاصطناعي؟' : 'Why AI Analysis?'}
                                </h3>
                                <p className={`text-sm leading-relaxed ${textSub}`}>
                                    {language === 'ar' ? 'يصعب جداً قياس التسرب يدوياً. يحلل هذا النظام التشوهات السلوكية وأنماط الاستهلاك مقارنة بالمنازل/المنشآت المشابهة.' : 'It is difficult to measure leakage manually. This AI system analyzes behavioral anomalies and benchmarking patterns across similar households/facilities.'}
                                </p>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="mt-1 p-2 rounded-lg bg-blue-500/10 text-blue-500"><ShieldCheck className="w-5 h-5" /></div>
                                <div>
                                    <div className={`text-sm font-bold mb-1 ${textMain}`}>{language === 'ar' ? 'بيانات فعالة' : 'Real-World Data'}</div>
                                    <div className={`text-xs ${textSub}`}>{language === 'ar' ? 'يعتمد على الفواتير والعلامات الملحوظة بدلاً من الافتراضات العمياء.' : 'Relies on actual bills and noticeable signs rather than blind assumptions.'}</div>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="mt-1 p-2 rounded-lg bg-orange-500/10 text-orange-500"><Building2 className="w-5 h-5" /></div>
                                <div>
                                    <div className={`text-sm font-bold mb-1 ${textMain}`}>{language === 'ar' ? 'تحليل قطاعي' : 'Sector Analysis'}</div>
                                    <div className={`text-xs ${textSub}`}>{language === 'ar' ? 'نماذج مخصصة للشركات، المدارس، المصانع، والمنازل.' : 'Customized models for businesses, schools, factories, and homes.'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            {report && (
                <MotionDiv id="water-report-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pt-8 border-t border-black/10 dark:border-white/10">
                    
                    {/* Inputs Summary */}
                    <div className={`${bgCard} border rounded-2xl p-6 relative overflow-hidden`}>
                        <h3 className={`text-sm font-bold uppercase mb-4 text-gray-500`}>{language === 'ar' ? 'ملخص المُدخلات' : 'Session Inputs'}</h3>
                        <div className="flex flex-wrap gap-4">
                            <div className="px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-300">
                                {language === 'ar' ? 'النوع:' : 'Type:'} {type === 'residential' ? (language === 'ar' ? 'سكني' : 'Residential') : (language === 'ar' ? 'تجاري' : 'Corporate')}
                            </div>
                            {type === 'residential' ? (
                                <>
                                    <div className="px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-300">
                                        {language === 'ar' ? 'الأسرة:' : 'Family:'} {familySize}
                                    </div>
                                    <div className="px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-300">
                                        {language === 'ar' ? 'الفاتورة:' : 'Bill:'} {monthlyBill} EGP
                                    </div>
                                    <div className="px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-300">
                                        {language === 'ar' ? 'السكن:' : 'Housing:'} {housingType}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-300">
                                        {language === 'ar' ? 'المنشأة:' : 'Facility:'} {facilityType}
                                    </div>
                                    <div className="px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-300">
                                        {language === 'ar' ? 'الاستهلاك:' : 'Usage:'} {monthlyWaterM3} m³
                                    </div>
                                    <div className="px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-300">
                                        {language === 'ar' ? 'الموظفين:' : 'Staff:'} {employees}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className={`${bgCard} border rounded-2xl p-6 relative overflow-hidden`}>
                            <div className="text-xs text-gray-500 uppercase font-bold mb-2">{language === 'ar' ? 'كفاءة المياه' : 'Efficiency Score'}</div>
                            <div className={`text-4xl font-bold ${textMain}`}>{report.metrics?.water_efficiency_score || 0}<span className="text-xl text-gray-400">/100</span></div>
                        </div>
                        <div className={`${bgCard} border rounded-2xl p-6 relative overflow-hidden`}>
                            <div className="text-xs text-gray-500 uppercase font-bold mb-2">{language === 'ar' ? 'احتمالية التسرب' : 'Leak Probability'}</div>
                            <div className="text-4xl font-bold text-orange-500">{report.metrics?.leak_probability_score || 0}%</div>
                        </div>
                        <div className={`${bgCard} border rounded-2xl p-6 relative overflow-hidden`}>
                            <div className="text-xs text-gray-500 uppercase font-bold mb-2">{language === 'ar' ? 'فاقد مالي مقدر' : 'Financial Loss'}</div>
                            <div className={`text-4xl font-bold text-red-500`}>{(report.metrics?.financial_loss_estimate_egp || 0).toLocaleString()} <span className="text-sm text-gray-400">EGP/Yr</span></div>
                        </div>
                        <div className={`${bgCard} border rounded-2xl p-6 relative overflow-hidden`}>
                            <div className="text-xs text-gray-500 uppercase font-bold mb-2">{language === 'ar' ? 'مستوى المخاطرة' : 'Risk Level'}</div>
                            <div className={`text-2xl mt-2 font-bold ${getRiskColor(report.metrics?.water_risk_level || '')}`}>
                                {report.metrics?.water_risk_level || 'N/A'}
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Benchmarks & Charts */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className={`${bgCard} border rounded-2xl p-8`}>
                                <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${textMain}`}>
                                    <Scale className="w-5 h-5 text-blue-500" />
                                    {language === 'ar' ? 'مقارنة مرجعية' : 'Benchmarking'}
                                </h2>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={[
                                                { name: language==='ar'?'المتوسط الوطني':'National Avg', liters: report.benchmarks?.national_avg_liters || 0, fill: '#94a3b8' },
                                                { name: language==='ar'?'منازل مشابهة':'Similar Avg', liters: report.benchmarks?.similar_household_avg_liters || 0, fill: '#38bdf8' },
                                                { name: language==='ar'?'استهلاكك':'Your Usage', liters: report.benchmarks?.user_estimated_liters || 0, fill: '#ef4444' }
                                            ]}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                            barSize={40}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLight ? '#e2e8f0' : '#334155'} />
                                            <XAxis dataKey="name" tick={{fill: isLight ? '#64748b' : '#94a3b8', fontSize: 12, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                                            <YAxis tick={{fill: isLight ? '#64748b' : '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} />
                                            <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: isLight?'#fff':'#1e293b', borderRadius: '12px', borderColor: isLight?'#e2e8f0':'#334155', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                            <Bar dataKey="liters" name={language === 'ar' ? 'لتر/شهر' : 'Liters/Mo'} radius={[6, 6, 0, 0]}>
                                                {COLORS.map((c, i) => <Cell key={i} />)}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Recommendations */}
                            <div className={`${bgCard} border rounded-2xl p-8`}>
                                <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${textMain}`}>
                                    <Target className="w-5 h-5 text-green-500" />
                                    {language === 'ar' ? 'توصيات الذكاء الاصطناعي القابلة للتنفيذ' : 'Actionable AI Recommendations'}
                                </h2>
                                <div className="space-y-4">
                                    {(report.ai_recommendations || []).map((rec, i) => (
                                        <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'}`}>
                                            <div className="mt-1 p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                                                <ShieldCheck className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className={`text-sm font-bold mb-2 ${textMain}`}>{rec.action}</h4>
                                                <div className="flex gap-3 text-xs">
                                                    <span className={`px-2 py-1 rounded border ${rec.impact === 'High' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300'}`}>
                                                        {language === 'ar' ? 'التأثير: ' : 'Impact: '} {rec.impact}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded border bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300`}>
                                                        {language === 'ar' ? 'التكلفة: ' : 'Cost: '} {rec.cost}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded border bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300`}>
                                                        {language === 'ar' ? 'السرعة: ' : 'Speed: '} {rec.speed}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar: AI Intelligence & Simulator */}
                        <div className="space-y-8">
                            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg">
                                <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                                    <Activity className="w-5 h-5 opacity-80" />
                                    {language === 'ar' ? 'تحليل ذكاء الأعمال' : 'AI Intelligence'}
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-xs uppercase text-blue-200 font-bold mb-1 opacity-80">{language === 'ar' ? 'تحليل التسرب' : 'Leak Analysis'}</div>
                                        <p className="text-sm leading-relaxed">{report.ai_water_intelligence?.leak_probability_analysis}</p>
                                    </div>
                                    <div>
                                        <div className="text-xs uppercase text-blue-200 font-bold mb-1 opacity-80">{language === 'ar' ? 'العوامل المؤثرة' : 'Primary Drivers'}</div>
                                        <ul className="text-sm list-disc pl-4 space-y-1">
                                            {(report.ai_water_intelligence?.primary_bill_drivers || []).map((driver, i) => (
                                                <li key={i}>{driver}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <div className="text-xs uppercase text-blue-200 font-bold mb-1 opacity-80">{language === 'ar' ? 'فرص التوفير' : 'Reduction Opportunities'}</div>
                                        <p className="text-sm leading-relaxed">{report.ai_water_intelligence?.cost_reduction_opportunities}</p>
                                    </div>
                                </div>
                            </div>

                            <div className={`${bgCard} border rounded-2xl p-6`}>
                                <h2 className={`text-lg font-bold flex items-center gap-2 mb-6 ${textMain}`}>
                                    <Droplet className="w-5 h-5 text-blue-500" />
                                    {language === 'ar' ? 'محاكي السيناريوهات' : 'Scenario Simulator'}
                                </h2>
                                <div className="space-y-4">
                                    {[
                                        { label: language==='ar'? 'إصلاح التسربات' : 'Fix Leaks', data: report.scenario_simulation?.fix_leaks, color: 'text-orange-500' },
                                        { label: language==='ar'? 'توفير 10%' : 'Reduce 10%', data: report.scenario_simulation?.reduce_10_percent, color: 'text-blue-500' },
                                        { label: language==='ar'? 'تركيب أجهزة توفير' : 'Install Aerators', data: report.scenario_simulation?.install_aerators, color: 'text-green-500' },
                                    ].map((scenario, i) => (
                                        scenario.data && (
                                            <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-black/5 dark:bg-white/5">
                                                <div className={`text-sm font-bold ${textMain}`}>{scenario.label}</div>
                                                <div className="text-right">
                                                    <div className={`text-sm font-bold ${scenario.color}`}>-{(scenario.data?.savings_egp || 0).toLocaleString()} EGP</div>
                                                    <div className="text-xs text-gray-500">-{(scenario.data?.savings_liters || 0).toLocaleString()} L</div>
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </MotionDiv>
            )}
        </div>
    );
};

export default WaterScarcity;
