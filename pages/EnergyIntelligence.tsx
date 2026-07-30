import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, AlertTriangle, ArrowRight, Activity, ShieldCheck, Loader2, FileText, ChevronRight, Users, Save, Building2, UploadCloud, PieChart, Info, Settings, Target, ZapOff, Sun, Flame, Wind, MonitorSmartphone, Fan, ThermometerSun, Leaf, Car } from 'lucide-react';
import { usePersistentState } from '../utils/storage';
import { useApp } from '../contexts/AppContext';
import ModuleToolbar from '../components/ModuleToolbar';
import BillUploader from '../components/BillUploader';
import CapabilityContext from '../components/CapabilityContext';
import { runEnergyAnalysis } from '../services/tokenRouterService';
import { EnergyAnalysisReport, EnergyAnalysisInputs, EnergyBillExtraction } from '../types';
import { ResponsiveContainer, Tooltip as RechartsTooltip, PieChart as RePieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, AreaChart, Area } from 'recharts';

const MotionDiv = motion.div as any;
const COLORS = ['#38bdf8', '#ef4444', '#94a3b8']; // User, Benchmark, National

interface EnergyIntelligenceProps {
    report: EnergyAnalysisReport | null;
    setGlobalReport?: (report: EnergyAnalysisReport | null) => void;
}

const EnergyIntelligence: React.FC<EnergyIntelligenceProps> = ({ report, setGlobalReport }) => {
    const { t, theme, dir, language } = useApp();
    const isLight = theme === 'light';
    const isAr = language === 'ar';
    const [loading, setLoading] = useState(false);

    // UI state
    const [activeTab, setActiveTab] = usePersistentState<'quick' | 'ocr' | 'audit'>('kairo_energy_tab', 'quick');
    const [type, setType] = usePersistentState<'residential' | 'corporate'>('kairo_energy_type', 'residential');

    // Quick Assessment (Residential/Commercial)
    const [propType, setPropType] = usePersistentState<'apartment' | 'house' | 'villa' | 'office' | 'store' | 'restaurant' | 'factory' | 'school' | 'hospital'>('kairo_en_prop_type', 'apartment');
    const [occupants, setOccupants] = usePersistentState('kairo_en_occ', 4);
    const [area, setArea] = usePersistentState('kairo_en_area', 120);
    const [bill, setBill] = usePersistentState('kairo_en_bill', 500);
    const [billIncreased, setBillIncreased] = usePersistentState<'yes' | 'no' | 'unknown'>('kairo_en_inc', 'unknown');
    const [acCount, setAcCount] = usePersistentState('kairo_en_ac_c', 2);
    const [acHours, setAcHours] = usePersistentState('kairo_en_ac_h', 6);
    const [fridgeCount, setFridgeCount] = usePersistentState('kairo_en_fridge', 1);
    const [hasHeater, setHasHeater] = usePersistentState<'yes'|'no'>('kairo_en_heater', 'yes');
    const [hasDishwasher, setHasDishwasher] = usePersistentState<'yes'|'no'>('kairo_en_dish', 'no');
    const [hasDryer, setHasDryer] = usePersistentState<'yes'|'no'>('kairo_en_dryer', 'no');
    const [occupancyHours, setOccupancyHours] = usePersistentState('kairo_en_occh', 12);
    const [lighting, setLighting] = usePersistentState<'led' | 'traditional' | 'mixed'>('kairo_en_light', 'mixed');
    const [hasSolar, setHasSolar] = usePersistentState<'yes'|'no'>('kairo_en_solar', 'no');
    const [hasHighP, setHasHighP] = usePersistentState<'yes'|'no'>('kairo_en_high', 'no');

    // Advanced (Corporate)
    const [computers, setComputers] = usePersistentState('kairo_en_comp', 20);
    const [servers, setServers] = usePersistentState('kairo_en_serv', 1);
    const [shifts, setShifts] = usePersistentState('kairo_en_shifts', 1);
    const [hasDataCenter, setHasDataCenter] = usePersistentState<'yes'|'no'>('kairo_en_dc', 'no');
    const [hasCooling, setHasCooling] = usePersistentState<'yes'|'no'>('kairo_en_cool', 'yes');
    const [hasInd, setHasInd] = usePersistentState<'yes'|'no'>('kairo_en_ind', 'no');

    // OCR State
    const [ocrData, setOcrData] = useState<EnergyBillExtraction | null>(null);

    const handleRunAnalysis = async () => {
        setLoading(true);
        try {
            const inputs: EnergyAnalysisInputs = {
                type,
                ocrData,
                property_type: propType,
                occupants,
                area_m2: area,
                monthly_bill: bill,
                bill_increased: billIncreased,
                ac_count: acCount,
                ac_hours_daily: acHours,
                fridge_count: fridgeCount,
                has_electric_heater: hasHeater,
                has_dishwasher: hasDishwasher,
                has_dryer: hasDryer,
                daily_occupancy_hours: occupancyHours,
                lighting_type: lighting,
                has_solar_panels: hasSolar,
                has_high_consumption_devices: hasHighP,
            };
            
            if (activeTab === 'audit' || type === 'corporate') {
                inputs.computers_count = computers;
                inputs.servers_count = servers;
                inputs.shifts_count = shifts;
                inputs.has_data_center = hasDataCenter;
                inputs.has_cooling_systems = hasCooling;
                inputs.has_industrial_equipment = hasInd;
            }
            
            const result = await runEnergyAnalysis(inputs, language);
            if (setGlobalReport) setGlobalReport(result);
            
        } catch (err) {
            console.error(err);
            alert('Analysis failed. Check your API key or network.');
        } finally {
            setLoading(false);
        }
    };

    const textMain = isLight ? 'text-gray-900' : 'text-white';
    const textSub = isLight ? 'text-gray-600' : 'text-gray-400';
    const bgCard = isLight ? 'bg-white border-gray-200' : 'bg-[#0f172a] border-white/10';
    const inputStyle = `w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${isLight ? "bg-slate-50 border border-slate-200 text-slate-900" : "bg-black/20 border border-white/10 text-white"}`;
    const labelStyle = `block text-xs font-bold uppercase tracking-wider mb-2 ${textSub}`;

    const getRiskColor = (risk: string) => {
        if (!risk) return 'text-gray-500';
        const r = risk.toLowerCase();
        if (r.includes('high') || r.includes('severe') || r.includes('عالي')) return 'text-red-500';
        if (r.includes('medium') || r.includes('moderate') || r.includes('متوسط')) return 'text-orange-500';
        return 'text-green-500';
    };
    const localizeRisk = (value: string) => {
        if (!isAr) return value;
        return ({ Low: 'منخفض', Medium: 'متوسط', Moderate: 'متوسط', High: 'مرتفع', Severe: 'شديد' } as Record<string, string>)[value] || value;
    };

    const navTabs = [
        { id: 'quick', icon: <Target className="w-5 h-5" />, label: isAr ? 'التقييم السريع' : 'Quick Assessment' },
        { id: 'ocr', icon: <UploadCloud className="w-5 h-5" />, label: isAr ? 'التحليل الذكي للفواتير' : 'Smart Bill OCR' },
        { id: 'audit', icon: <Building2 className="w-5 h-5" />, label: isAr ? 'التدقيق المتقدم' : 'Advanced Audit' }
    ];

    return (
        <div className="w-full min-h-screen bg-[#edf4f1] dark:bg-[#020617] pt-32 lg:pt-36 pb-20 px-4 md:px-6 lg:px-8 font-sans" dir={dir}>
            <div className="max-w-7xl mx-auto space-y-8">
                <CapabilityContext capabilityId="energy" />
                <ModuleToolbar 
                    title={isAr ? 'ذكاء الطاقة' : 'AI Energy Intelligence'}
                    description={isAr ? 'حلّل الفاتورة والأجهزة وساعات التشغيل، واعرف فرص التوفير وحدود كل تقدير.' : 'Analyze bills, appliances, and operating hours with transparent savings estimates.'}
                    icon={<Zap className="w-6 h-6 text-amber-500" />}
                    onReset={() => { if(setGlobalReport) setGlobalReport(null); setOcrData(null); }}
                    hasReport={!!report}
                    sdgs={[7, 11, 13]}
                    exportTargetId="energy-report-container"
                    exportFilename="Kairo_Energy_Intelligence"
                />

                <div className="grid lg:grid-cols-12 gap-8 mb-12">
                    <div className="lg:col-span-8 flex flex-col gap-6">
                            
                            {/* Tabs Navigation */}
                            <div className="flex flex-wrap gap-2 p-2 rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 shadow-sm">
                                {navTabs.map(tab => (
                                    <button 
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : `text-gray-500 hover:bg-black/5 dark:hover:bg-white/5`}`}
                                    >
                                        {tab.icon}
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {activeTab === 'ocr' && (
                                <MotionDiv initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className={`${bgCard} border rounded-2xl p-6 shadow-sm`}>
                                    <h3 className={`font-bold text-lg mb-4 ${textMain}`}>
                                        {isAr ? 'رفع فاتورة الكهرباء للتحليل' : 'Upload Electricity Bill for Analysis'}
                                    </h3>
                                    <BillUploader onDataExtracted={(t, data) => setOcrData(data)} />
                                    {ocrData && (
                                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl mt-4 flex items-center gap-3">
                                            <ShieldCheck className="w-5 h-5 text-green-500" />
                                            <div>
                                                <div className="text-sm font-bold text-green-600">{isAr ? 'تم استخراج البيانات وتقسيم الشرائح بنجاح' : 'Bill parsed and tariff tiers extracted'}</div>
                                                <div className="text-xs text-green-700/70">{ocrData.consumption_kwh} kWh • {ocrData.total_amount} {isAr ? 'جنيه' : 'EGP'}</div>
                                            </div>
                                        </div>
                                    )}
                                </MotionDiv>
                            )}

                            {(activeTab === 'quick' || activeTab === 'audit') && (
                                <MotionDiv initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className={`${bgCard} border rounded-3xl overflow-hidden shadow-sm`}>
                                    <div className="flex border-b border-black/5 dark:border-white/10">
                                        <button onClick={() => setType('residential')} className={`flex-1 py-4 text-sm font-bold transition-colors ${type === 'residential' ? 'border-b-2 border-amber-500 text-amber-500' : textSub}`}>
                                            {isAr ? 'سكني' : 'Residential'}
                                        </button>
                                        <button onClick={() => setType('corporate')} className={`flex-1 py-4 text-sm font-bold transition-colors ${type === 'corporate' ? 'border-b-2 border-amber-500 text-amber-500' : textSub}`}>
                                            {isAr ? 'تجاري / صناعي' : 'Commercial / Industrial'}
                                        </button>
                                    </div>
                                    
                                    <div className="p-6 md:p-8 space-y-8">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className={labelStyle}>{isAr ? 'نوع العقار' : 'Property Type'}</label>
                                                <select value={propType} onChange={e => setPropType(e.target.value as any)} className={inputStyle}>
                                                    <option value="apartment">{isAr ? 'شقة' : 'Apartment'}</option>
                                                    <option value="house">{isAr ? 'منزل مستقل' : 'House'}</option>
                                                    <option value="villa">{isAr ? 'فيلا' : 'Villa'}</option>
                                                    <option value="office">{isAr ? 'مكتب' : 'Office'}</option>
                                                    <option value="store">{isAr ? 'متجر' : 'Store'}</option>
                                                    <option value="restaurant">{isAr ? 'مطعم' : 'Restaurant'}</option>
                                                    <option value="factory">{isAr ? 'مصنع' : 'Factory'}</option>
                                                    <option value="school">{isAr ? 'مدرسة' : 'School'}</option>
                                                    <option value="hospital">{isAr ? 'مستشفى' : 'Hospital'}</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className={labelStyle}>{isAr ? 'الأفراد / الموظفين' : 'Occupants / Staff'}</label>
                                                <input type="number" min="1" value={occupants} onChange={e => setOccupants(Number(e.target.value))} className={inputStyle} />
                                            </div>
                                            <div>
                                                <label className={labelStyle}>{isAr ? 'المساحة (متر مربع)' : 'Area (m²)'}</label>
                                                <input type="number" min="1" value={area} onChange={e => setArea(Number(e.target.value))} className={inputStyle} />
                                            </div>
                                            <div>
                                                <label className={labelStyle}>{isAr ? 'متوسط الفاتورة الشهرية (جنيه)' : 'Avg Monthly Bill (EGP)'}</label>
                                                <input type="number" min="0" value={bill} onChange={e => setBill(Number(e.target.value))} className={inputStyle} />
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-black/5 dark:border-white/10">
                                            <h4 className={`text-sm font-bold mb-4 flex items-center gap-2 ${textMain}`}><Flame className="w-4 h-4 text-amber-500"/> {isAr ? 'الأحمال والمعدات' : 'Loads & Equipment'}</h4>
                                            <div className="grid md:grid-cols-3 gap-6">
                                                <div>
                                                    <label className={labelStyle}>{isAr ? 'عدد التكييفات' : 'AC Units'}</label>
                                                    <input type="number" min="0" value={acCount} onChange={e => setAcCount(Number(e.target.value))} className={inputStyle} />
                                                </div>
                                                <div>
                                                    <label className={labelStyle}>{isAr ? 'ساعات التكييف/يوم' : 'AC Hours/Day'}</label>
                                                    <input type="number" min="0" value={acHours} onChange={e => setAcHours(Number(e.target.value))} className={inputStyle} />
                                                </div>
                                                <div>
                                                    <label className={labelStyle}>{isAr ? 'نوع الإضاءة' : 'Lighting Type'}</label>
                                                    <select value={lighting} onChange={e => setLighting(e.target.value as any)} className={inputStyle}>
                                                        <option value="led">LED</option>
                                                        <option value="traditional">{isAr ? 'تقليدية (هالوجين وغيرها)' : 'Traditional'}</option>
                                                        <option value="mixed">{isAr ? 'مختلط' : 'Mixed'}</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        {activeTab === 'audit' && (
                                            <MotionDiv initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="p-6 rounded-2xl bg-slate-100 dark:bg-[#1e293b] space-y-6">
                                                <h4 className={`text-sm font-bold flex items-center gap-2 ${textMain}`}><Building2 className="w-4 h-4 text-amber-500"/> {isAr ? 'معايير التدقيق المتقدم' : 'Advanced Audit Metrics'}</h4>
                                                <div className="grid md:grid-cols-3 gap-6">
                                                    <div>
                                                        <label className={labelStyle}>{isAr ? 'أجهزة الكمبيوتر' : 'Computers'}</label>
                                                        <input type="number" min="0" value={computers} onChange={e => setComputers(Number(e.target.value))} className={inputStyle} />
                                                    </div>
                                                    <div>
                                                        <label className={labelStyle}>{isAr ? 'الخوادم' : 'Servers'}</label>
                                                        <input type="number" min="0" value={servers} onChange={e => setServers(Number(e.target.value))} className={inputStyle} />
                                                    </div>
                                                    <div>
                                                        <label className={labelStyle}>{isAr ? 'نظام تبريد مركزي' : 'Central Cooling'}</label>
                                                        <select value={hasCooling} onChange={e => setHasCooling(e.target.value as any)} className={inputStyle}>
                                                            <option value="yes">{isAr ? 'نعم' : 'Yes'}</option>
                                                            <option value="no">{isAr ? 'لا' : 'No'}</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </MotionDiv>
                                        )}

                                        <button 
                                            onClick={handleRunAnalysis} 
                                            disabled={loading}
                                            className="w-full py-5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm md:text-base flex items-center justify-center gap-3 transition-colors shadow-lg shadow-amber-500/25"
                                        >
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                                            {isAr ? 'توليد ذكاء الطاقة والمحاكاة' : 'Generate Energy Intelligence'}
                                        </button>
                                    </div>
                                </MotionDiv>
                            )}
                        </div>
                        
                        <div className="lg:col-span-4">
                            <div className={`${bgCard} border rounded-3xl p-8 space-y-6 shadow-sm sticky top-8`}>
                                <div className="p-3 bg-amber-500/10 w-fit rounded-xl text-amber-500 mb-6">
                                    <MonitorSmartphone className="w-8 h-8" />
                                </div>
                                <h3 className={`font-black text-xl leading-tight ${textMain}`}>
                                    {isAr ? 'محرك التعريفة المصرية الذكي' : 'Smart Tariff Engine'}
                                </h3>
                                <p className={`text-sm leading-relaxed ${textSub}`}>
                                    {isAr ? 'يقوم نموذج الذكاء الاصطناعي لدينا بتقدير الكيلووات السعري الفعلي بناءً على أحدث قرارات جهاز تنظيم مرفق الكهرباء وحماية المستهلك.' : 'Our AI model estimates actual kWh consumption directly from EGP value using the latest local tariff tiers.'}
                                </p>
                                <ul className="space-y-3 mt-6">
                                    {[
                                        isAr ? 'دعم شرائح الاستخدام السكني والتجاري' : 'Residential & Commercial Tiers',
                                        isAr ? 'اكتشاف الأجهزة المهدرة لتغير الشريحة' : 'Tariff jump & leak detection',
                                        isAr ? 'حساب الانبعاثات وفق الشبكة المحلية' : 'Emissions synced with local grid'
                                    ].map((feature, i) => (
                                        <li key={i} className={`flex items-center gap-3 text-sm font-medium ${textMain}`}>
                                            <ShieldCheck className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {report && (
                    <MotionDiv id="energy-report-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pt-8 border-t border-black/10 dark:border-white/10">
                        {/* Inputs Summary */}
                        <div className={`${bgCard} border rounded-3xl p-6 relative overflow-hidden`}>
                            <h3 className={`text-sm font-bold uppercase mb-4 text-gray-500`}>{isAr ? 'ملخص المُدخلات' : 'Session Inputs'}</h3>
                            <div className="flex flex-wrap gap-4">
                                <div className="px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-300">
                                    {isAr ? 'النوع:' : 'Type:'} {type === 'residential' ? (isAr ? 'سكني' : 'Residential') : (isAr ? 'تجاري' : 'Corporate')} ({propType})
                                </div>
                                <div className="px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-300">
                                    {isAr ? 'الفاتورة:' : 'Bill:'} {bill} EGP
                                </div>
                                <div className="px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-300">
                                    {isAr ? 'المساحة:' : 'Area:'} {area} m²
                                </div>
                                <div className="px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-300">
                                    {isAr ? 'التكييفات:' : 'ACs:'} {acCount} ({acHours} {isAr ? 'ساعات/يوم' : 'hrs/day'})
                                </div>
                            </div>
                        </div>

                        {/* KPI Grid */}
                        <div className="grid lg:grid-cols-4 gap-4">
                            <div className={`${bgCard} border rounded-3xl p-6 relative overflow-hidden`}>
                                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">{isAr?'كفاءة الاستهلاك':'Efficiency Score'}</div>
                                <div className={`text-4xl font-black ${textMain}`}>{report.metrics?.energy_efficiency_score || 0}<span className="text-xl font-normal text-gray-400">/100</span></div>
                            </div>
                            <div className={`${bgCard} border rounded-3xl p-6 relative overflow-hidden`}>
                                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">{isAr?'استهلاك مقدر':'Est. Consumption'}</div>
                                <div className={`text-4xl font-black text-amber-500`}>{report.metrics?.estimated_consumption_kwh || 0} <span className="text-lg font-normal text-gray-500">kWh</span></div>
                            </div>
                            <div className={`${bgCard} border rounded-3xl p-6 relative overflow-hidden`}>
                                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">{isAr?'فاقد مالي مقدر':'Financial Waste'}</div>
                                <div className={`text-4xl font-black text-red-500`}>{(report.metrics?.financial_loss_estimate_egp || 0).toLocaleString()} <span className="text-lg font-normal text-gray-500">EGP/m</span></div>
                            </div>
                            <div className={`${bgCard} border rounded-3xl p-6 relative overflow-hidden`}>
                                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">{isAr?'مخاطر الحمل وقت الذروة':'Peak Load Risk'}</div>
                                <div className={`text-2xl mt-2 font-black ${getRiskColor(report.metrics?.peak_load_risk || '')}`}>
                                    {localizeRisk(report.metrics?.peak_load_risk || (isAr ? 'غير متاح' : 'N/A'))}
                                </div>
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Analytics Col */}
                            <div className="lg:col-span-2 space-y-8">
                                <div className={`${bgCard} border rounded-3xl p-8`}>
                                    <h2 className={`text-2xl font-black mb-6 flex items-center gap-3 ${textMain}`}>
                                        <PieChart className="w-6 h-6 text-amber-500" />
                                        {isAr ? 'البصمة والأداء' : 'Footprint & Performance'}
                                    </h2>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="kairo-chart h-72 p-3" dir="ltr">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={[
                                                        { name: isAr?'المتوسط الوطني':'National Avg', kwh: report.benchmarks?.national_avg_kwh || 0, fill: '#94a3b8' },
                                                        { name: isAr?'أماكن مشابهة':'Similar Avg', kwh: report.benchmarks?.similar_properties_avg_kwh || 0, fill: '#f59e0b' },
                                                        { name: isAr?'استهلاكك':'Your Usage', kwh: report.metrics?.estimated_consumption_kwh || 0, fill: '#ef4444' }
                                                    ]}
                                                    margin={{ top: 24, right: 12, left: 0, bottom: 14 }}
                                                    barSize={40}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLight ? '#e2e8f0' : '#334155'} />
                                                    <XAxis dataKey="name" interval={0} tickMargin={10} tick={{fill: isLight ? '#526b62' : '#a9bbb4', fontSize: 11, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                                                    <YAxis tick={{fill: isLight ? '#64748b' : '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} />
                                                    <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: isLight?'#fff':'#0f172a', borderRadius: '12px', borderColor: isLight?'#e2e8f0':'#334155', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                                                    <Bar dataKey="kwh" name="kWh" radius={[6, 6, 0, 0]}>
                                                        {COLORS.map((color) => <Cell key={color} fill={color} />)}
                                                        <LabelList dataKey="kwh" position="top" fill={isLight ? '#36574c' : '#d3e7df'} fontSize={10} fontWeight={800} />
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="space-y-4 flex flex-col justify-center">
                                            <div className="p-4 rounded-2xl bg-gray-100 dark:bg-white/5">
                                                <div className="text-xs text-gray-500 uppercase font-bold mb-1">{isAr?'الشريحة الحالية':'Current Tariff Tier'}</div>
                                                <div className={`font-black text-xl ${textMain}`}>{report.metrics?.current_tariff_tier || 'N/A'}</div>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-orange-100/50 dark:bg-orange-500/10">
                                                <div className="text-xs text-orange-600 dark:text-orange-400 uppercase font-bold mb-1">{isAr?'متوسط سعر الكيلووات':'Avg Price per kWh'}</div>
                                                <div className={`font-black text-xl text-orange-700 dark:text-orange-500`}>{report.metrics?.average_kwh_price_egp || 0} {isAr ? 'جنيه' : 'EGP'}</div>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-red-100/50 dark:bg-red-500/10">
                                                <div className="text-xs text-red-600 dark:text-red-400 uppercase font-bold mb-1">{isAr?'البصمة الكربونية الشهرية':'Monthly Carbon Footprint'}</div>
                                                <div className={`font-black text-xl text-red-700 dark:text-red-500`}>{report.metrics?.carbon_footprint_kg || 0} Kg CO₂</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={`${bgCard} border rounded-3xl p-8`}>
                                    <h2 className={`text-2xl font-black mb-6 flex items-center gap-3 ${textMain}`}>
                                        <Target className="w-6 h-6 text-amber-500" />
                                        {isAr ? 'تحليل ذكاء الأعمال' : 'AI Business Intelligence'}
                                    </h2>
                                    <div className="space-y-6">
                                        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                                            <h4 className="font-bold text-amber-800 dark:text-amber-400 mb-2">{isAr ? 'فرص التوفير الرئيسية' : 'Primary Savings Opportunity'}</h4>
                                            <p className="text-sm text-amber-900/80 dark:text-amber-200/80">{report.ai_energy_intelligence?.savings_opportunities}</p>
                                        </div>

                                        {report.ai_energy_intelligence?.quick_wins?.length > 0 && (
                                            <div>
                                                <h4 className={`font-bold mb-3 flex items-center gap-2 ${textMain}`}><Zap className="w-4 h-4 text-green-500"/> {isAr ? 'إجراءات سريعة التنفيذ (Quick Wins)' : 'Quick Wins'}</h4>
                                                <ul className="grid sm:grid-cols-2 gap-3">
                                                    {report.ai_energy_intelligence.quick_wins.map((win, i) => (
                                                        <li key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border dark:border-white/5 text-sm font-medium text-gray-700 dark:text-gray-300 flex gap-2">
                                                            <div className="w-2 h-2 mt-1.5 rounded-full bg-green-500 flex-shrink-0"></div>
                                                            {win}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        
                                        {report.ai_energy_intelligence?.operational_risks?.length > 0 && (
                                            <div>
                                                <h4 className={`font-bold mb-3 flex items-center gap-2 ${textMain}`}><AlertTriangle className="w-4 h-4 text-red-500"/> {isAr ? 'المخاطر التشغيلية' : 'Operational Risks'}</h4>
                                                <ul className="space-y-2">
                                                    {report.ai_energy_intelligence.operational_risks.map((risk, i) => (
                                                        <li key={i} className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-sm font-medium text-red-800 dark:text-red-200">
                                                            {risk}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar: Scenarios & Data */}
                            <div className="space-y-8">
                                <div className="bg-gradient-to-br from-slate-900 to-[#020617] rounded-3xl p-8 text-white shadow-xl shadow-black/20 border border-white/10">
                                    <h2 className="text-xl font-black flex items-center gap-2 mb-6">
                                        <Activity className="w-5 h-5 text-amber-500" />
                                        {isAr ? 'محاكي السيناريوهات (شهري)' : 'Scenario Simulator (Monthly)'}
                                    </h2>
                                    <div className="space-y-4">
                                        {[
                                            { label: isAr?'تثبيت التكييف على 24':'Set AC to 24C', data: report.scenario_simulation?.ac_to_24, icon: <ThermometerSun className="w-4 h-4"/>, color: 'text-blue-400' },
                                            { label: isAr?'تركيب إضاءة LED':'Upgrade to LED', data: report.scenario_simulation?.replace_with_led, icon: <Zap className="w-4 h-4"/>, color: 'text-amber-400' },
                                            { label: isAr?'العزل الحراري':'Thermal Insulation', data: report.scenario_simulation?.thermal_insulation, icon: <Building2 className="w-4 h-4"/>, color: 'text-indigo-400' },
                                            { label: isAr?'ألواح طاقة شمسية':'Solar Panels', data: report.scenario_simulation?.solar_panels, icon: <Sun className="w-4 h-4"/>, color: 'text-yellow-400' },
                                        ].map((scenario, i) => (
                                            scenario.data && (
                                                <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className={`p-1.5 rounded-lg bg-white/10 ${scenario.color}`}>{scenario.icon}</div>
                                                        <div className="text-sm font-bold text-white">{scenario.label}</div>
                                                    </div>
                                                    <div className="flex justify-between items-baseline mt-3 pl-9">
                                                        <div>
                                                            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">{isAr?'توفير':'Savings'}</div>
                                                            <div className="text-lg font-black text-green-400">{(scenario.data.savings_egp || 0).toLocaleString()} {isAr ? 'جنيه' : 'EGP'}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">{isAr?'الكربون':'CO₂'}</div>
                                                            <div className="text-sm font-bold text-gray-300">-{(scenario.data.emissions_reduction_kg || 0).toLocaleString()} Kg</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>
                                
                                <div className={`${bgCard} border rounded-3xl p-6`}>
                                    <h4 className={`font-bold mb-4 flex items-center gap-2 ${textMain}`}><PieChart className="w-4 h-4 text-amber-500"/> {isAr ? 'أكبر المستهلكين' : 'Top Consumers'}</h4>
                                    <div className="space-y-3">
                                        {(report.ai_energy_intelligence?.top_consuming_devices || []).map((dev, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <span className={`text-sm font-medium ${textMain}`}>{dev.name}</span>
                                                <div className="flex items-center gap-3 w-1/2">
                                                    <div className="h-2 flex-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                                                        <div className="h-full bg-amber-500 rounded-full" style={{width: `${dev.percentage}%`}}></div>
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-500 w-8 text-right">{dev.percentage}%</span>
                                                </div>
                                            </div>
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

export default EnergyIntelligence;
