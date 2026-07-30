import React, { useState } from 'react';
import { 
    Train, Car, Bus, Loader2, Save, Download, RefreshCw, AlertTriangle, 
    Clock, DollarSign, CloudRain, Briefcase, Map as MapIcon, Target, UploadCloud, 
    Scale, Activity, ArrowRight, Zap, Target as TargetIcon, Search, FileText, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { runMobilityIntelligence } from '../services/tokenRouterService';
import { MobilityIntelligenceReport, MobilityInputs } from '../types';
import { usePersistentState } from '../utils/storage';
import { useApp } from '../contexts/AppContext';
import SdgBadge from '../components/SdgBadge';
import CapabilityContext from '../components/CapabilityContext';
import ReportActions from '../components/ReportActions';

const MotionDiv = motion.div as any;

interface TransportImpactProps {
    report: MobilityIntelligenceReport | null;
    setGlobalReport?: (report: MobilityIntelligenceReport | null) => void;
}

const AR_OPTION_LABELS: Record<string, string> = {
    Employee: 'موظف',
    Student: 'طالب',
    'Hybrid Worker': 'عمل هجين',
    'Field Worker': 'عمل ميداني',
    'Business Owner': 'صاحب عمل',
    Freelancer: 'عمل حر',
    Remote: 'عمل عن بُعد',
    Cairo: 'القاهرة',
    Giza: 'الجيزة',
    Alexandria: 'الإسكندرية',
    Dakahlia: 'الدقهلية',
    Sharqia: 'الشرقية',
    Assiut: 'أسيوط',
    Aswan: 'أسوان',
    Other: 'أخرى',
    Metro: 'مترو',
    Train: 'قطار',
    Bus: 'أتوبيس',
    Microbus: 'ميكروباص',
    'Private Car': 'سيارة خاصة',
    Uber: 'أوبر',
    Careem: 'كريم',
    Motorcycle: 'دراجة نارية',
    Walking: 'مشي',
    Bicycle: 'دراجة',
    'Same as Primary': 'نفس وسيلة الذهاب',
    Direct: 'مباشر من غير تبديل',
    '1 Transfer': 'تبديل واحد',
    '2 Transfers': 'تبديلان',
    '3+': '3 تبديلات أو أكثر',
    'Complex Route': 'مسار متعدد المراحل',
    '< 15 min': 'أقل من 15 دقيقة',
    '15-30': 'من 15 إلى 30 دقيقة',
    '30-60': 'من 30 إلى 60 دقيقة',
    '60-90': 'من 60 إلى 90 دقيقة',
    '90+': 'أكثر من 90 دقيقة',
    'Under 300': 'أقل من 300 جنيه',
    '300-600': '300–600 جنيه',
    '600-1000': '600–1000 جنيه',
    '1000-2000': '1000–2000 جنيه',
    '2000+': 'أكثر من 2000 جنيه',
    Low: 'منخفض',
    Moderate: 'متوسط',
    High: 'مرتفع',
    Extreme: 'شديد جدًا',
    Gasoline: 'بنزين',
    Diesel: 'سولار',
    'Natural Gas': 'غاز طبيعي',
    Hybrid: 'هجين',
    Electric: 'كهربائي',
    'Before 2010': 'قبل 2010',
    '2010-2015': '2010–2015',
    '2016-2020': '2016–2020',
    '2021+': '2021 أو أحدث',
    Always: 'دائمًا',
    Frequently: 'غالبًا',
    Occasionally: 'أحيانًا',
    Never: 'أبدًا',
};

const TransportImpact: React.FC<TransportImpactProps> = ({ report, setGlobalReport }) => {
    const { theme, dir, language } = useApp();
    const isLight = theme === 'light';
    const isAr = language === 'ar';
    
    const [analyzing, setAnalyzing] = useState(false);
    const [ocrLoading, setOcrLoading] = useState(false);
    const [routeLoading, setRouteLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'route' | 'ocr'>('profile');

    // Inputs
    const [inputs, setInputs] = usePersistentState<MobilityInputs>('kairo_mobility_inputs', {
        occupationType: 'Employee',
        weeklyCommuteDays: 5,
        governorate: 'Cairo',
        primaryTransport: 'Private Car',
        returnTransport: 'Private Car',
        transfers: 'Direct',
        commuteTime: '60-90',
        monthlySpending: '1000-2000',
        trafficExposure: 'High',
        isCar: true,
        fuelType: 'Gasoline',
        vehicleYear: '2016-2020',
        passengers: '1',
        acUsage: 'Frequently',
        fromLocation: '',
        toLocation: ''
    });

    const updateInput = (key: keyof MobilityInputs, value: any) => {
        setInputs(prev => ({ ...prev, [key]: value }));
    };
    const optionLabel = (value: string) => isAr ? (AR_OPTION_LABELS[value] || value) : value;

    const handleAnalysis = async () => {
        setAnalyzing(true);
        try {
            const result = await runMobilityIntelligence(inputs, language);
            if (setGlobalReport) setGlobalReport(result);
        } catch (e) {
            console.error(e);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleReset = () => {
        if (setGlobalReport) setGlobalReport(null);
    };

    const simulateOCR = () => {
        setOcrLoading(true);
        setTimeout(() => {
            updateInput('monthlySpending', '2000+');
            updateInput('isCar', true);
            updateInput('primaryTransport', 'Careem');
            setOcrLoading(false);
        }, 1500);
    };

    const simulateRoute = () => {
        setRouteLoading(true);
        setTimeout(() => {
            updateInput('commuteTime', '90+');
            updateInput('trafficExposure', 'Extreme');
            setRouteLoading(false);
        }, 1500);
    };

    const bgApp = isLight ? 'bg-[#edf4f1]' : 'bg-[#0a0a0c]';
    const textMain = isLight ? 'text-[#173029]' : 'text-slate-100';
    const textDim = isLight ? 'text-[#526b62]' : 'text-[#a0aaa6]';
    const textMuted = isLight ? 'text-[#6f827b]' : 'text-[#7b8983]';
    const borderSubtle = isLight ? 'border-emerald-950/10' : 'border-white/[0.07]';
    const bgCard = isLight ? 'bg-[#f8fbf9]' : 'bg-[#111714]';
    const inputBg = isLight ? 'bg-[#eef5f2] border-emerald-950/10 text-[#173029] focus:bg-[#f8fbf9] focus:border-emerald-600/40' : 'bg-white/[0.035] border-white/10 text-slate-100 focus:bg-white/[0.06] focus:border-purple-500/50';

    return (
        <div className={`min-h-screen pt-32 lg:pt-36 px-4 lg:px-8 pb-32 transition-colors duration-500 ${bgApp} font-sans`} dir={dir}>
            <div className="max-w-[1400px] mx-auto space-y-12">
                <CapabilityContext capabilityId="mobility" />
                
                {/* HEADER */}
                <header className="max-w-4xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded text-[11px] font-semibold uppercase tracking-[0.1em] mb-8 border bg-purple-500/10 text-purple-600 border-purple-500/20">
                        <Activity className="w-3.5 h-3.5" /> {isAr ? 'منصة ذكاء التنقل' : 'Urban Mobility Intelligence'}
                    </div>
                    
                    <h1 className={`text-4xl md:text-5xl font-medium mb-6 tracking-tight leading-[1.1] ${textMain}`}>
                        {isAr ? 'تحليل التكلفة البيئية والزمنية للمواصلات' : 'Urban Exposure & Commute Analytics'}
                    </h1>
                    <p className={`text-lg md:text-xl font-light leading-[1.6] ${textDim} max-w-2xl mb-6`}>
                        {isAr 
                            ? 'نظام يدمج بين التكلفة المالية، الوقت المهدر في الزحام، أبعاد التعرض الحضري، والبصمة الكربونية لبناء نموذج واقعي لحياتك اليومية.'
                            : 'Fusing financial waste, time loss, urban traffic exposure, and carbon footprint to analyze the genuine impact of your daily movement.'}
                    </p>
                    <SdgBadge sdgs={[11, 13]} />
                </header>

                <div className="grid lg:grid-cols-12 gap-8">
                    
                    {/* INPUTS SIDEBAR */}
                    <div className="lg:col-span-4 space-y-6 flex flex-col">
                        
                        {/* TABS */}
                        <div className={`flex rounded-lg overflow-hidden border ${borderSubtle} ${bgCard} p-1 max-w-full font-mono text-xs uppercase tracking-wider`}>
                            {['profile', 'route', 'ocr'].map(t => (
                                <button 
                                    key={t}
                                    onClick={() => setActiveTab(t as any)}
                                    className={`flex-1 py-3 text-center rounded-md transition-colors ${activeTab === t ? 'bg-purple-500/10 text-purple-600 font-bold' : `text-gray-500 hover:text-gray-900 ${isLight ? '' : 'hover:text-white'}`}`}
                                >
                                    {isAr ? (t === 'profile' ? 'البيانات' : t === 'route' ? 'المسار' : 'استخراج') : t}
                                </button>
                            ))}
                        </div>

                        <div className={`p-8 rounded-3xl ${bgCard} border ${borderSubtle} flex-1 overflow-y-auto max-h-[85vh] sticky top-28 scrollbar-hide`}>
                            
                            {activeTab === 'ocr' && (
                                <div className="space-y-6">
                                    <h3 className={`text-sm font-semibold uppercase tracking-widest ${textDim}`}>{isAr ? 'التحليل الذكي للإيصالات (OCR)' : 'Smart Receipt Analysis'}</h3>
                                    <p className={`text-xs ${textMuted} mb-6`}>{isAr ? 'ارفع إيصال بنزين، أو فاتورة أوبر/كريم، أو تقرير مصاريف، وسنقوم باستخراج الاستهلاك والتكلفة.' : 'Upload a fuel receipt, Uber/Careem invoice, or EV charging bill.'}</p>
                                    
                                    <div className={`border-2 border-dashed ${borderSubtle} rounded-2xl p-8 text-center flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/50 transition-colors group ${isLight ? 'bg-slate-50' : 'bg-black/20'}`} onClick={simulateOCR}>
                                        {ocrLoading ? (
                                            <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-4" />
                                        ) : (
                                            <UploadCloud className="w-8 h-8 text-purple-300 group-hover:text-purple-500 transition-colors mb-4" />
                                        )}
                                        <span className={`text-sm font-bold ${textMain}`}>{isAr ? 'اختر ملف للإستخراج' : 'Select Receipt Image'}</span>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'route' && (
                                <div className="space-y-6">
                                    <h3 className={`text-sm font-semibold uppercase tracking-widest ${textDim}`}>{isAr ? 'تحليل المسار الذكي' : 'Smart Route Mode'}</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className={`block text-[10px] font-bold uppercase tracking-widest mb-2 ${textMuted}`}>{isAr ? 'من الموقع' : 'From Location'}</label>
                                            <input type="text" placeholder={isAr ? 'مثل: مصر الجديدة' : 'e.g., Heliopolis'} className={`w-full rounded-xl px-4 py-3 text-sm border focus:outline-none transition-colors ${inputBg}`} value={inputs.fromLocation || ''} onChange={(e) => updateInput('fromLocation', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={`block text-[10px] font-bold uppercase tracking-widest mb-2 ${textMuted}`}>{isAr ? 'إلى الموقع' : 'To Location'}</label>
                                            <input type="text" placeholder={isAr ? 'مثل: المهندسين' : 'e.g., Mohandeseen'} className={`w-full rounded-xl px-4 py-3 text-sm border focus:outline-none transition-colors ${inputBg}`} value={inputs.toLocation || ''} onChange={(e) => updateInput('toLocation', e.target.value)} />
                                        </div>
                                        <button onClick={simulateRoute} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 text-xs uppercase tracking-wider rounded-xl transition-all flex justify-center items-center gap-2">
                                            {routeLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Search className="w-4 h-4" />} {isAr ? 'تقدير الوقت والتكلفة' : 'Estimate Route Engine'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'profile' && (
                                <div className="space-y-10">
                                    {/* Section 1 */}
                                    <div className="space-y-5">
                                        <h3 className={`text-xs font-semibold uppercase tracking-widest flex items-center gap-2 ${textDim}`}><Briefcase className="w-3.5 h-3.5" /> 1. {isAr ? 'الملف الشخصي' : 'Profile'}</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className={`block text-[10px] uppercase font-bold tracking-widest mb-2 ${textMuted}`}>{isAr ? 'المهنة' : 'Occupation'}</label>
                                                <select className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none ${inputBg}`} value={inputs.occupationType} onChange={(e) => updateInput('occupationType', e.target.value)}>
                                                    {['Employee', 'Student', 'Hybrid Worker', 'Field Worker', 'Business Owner', 'Freelancer', 'Remote'].map(t => <option key={t} value={t}>{optionLabel(t)}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className={`block text-[10px] uppercase font-bold tracking-widest mb-2 ${textMuted}`}>{isAr ? 'أيام التنقل/أسبوع' : 'Commute Days'}</label>
                                                <select className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none ${inputBg}`} value={inputs.weeklyCommuteDays} onChange={(e) => updateInput('weeklyCommuteDays', Number(e.target.value))}>
                                                    {[1,2,3,4,5,6,7].map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className={`block text-[10px] uppercase font-bold tracking-widest mb-2 ${textMuted}`}>{isAr ? 'المحافظة' : 'Governorate'}</label>
                                            <select className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none ${inputBg}`} value={inputs.governorate} onChange={(e) => updateInput('governorate', e.target.value)}>
                                                {['Cairo', 'Giza', 'Alexandria', 'Dakahlia', 'Sharqia', 'Assiut', 'Aswan', 'Other'].map(t => <option key={t} value={t}>{optionLabel(t)}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Section 2 */}
                                    <div className="space-y-5">
                                        <h3 className={`text-xs font-semibold uppercase tracking-widest flex items-center gap-2 ${textDim}`}><Train className="w-3.5 h-3.5" /> 2. {isAr ? 'السلوكيات' : 'Behavior'}</h3>
                                        <div>
                                            <label className={`block text-[10px] uppercase font-bold tracking-widest mb-2 ${textMuted}`}>{isAr ? 'المواصلة الأساسية (ذهاب)' : 'Primary Transport'}</label>
                                            <select className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none ${inputBg}`} value={inputs.primaryTransport} onChange={(e) => {
                                                updateInput('primaryTransport', e.target.value);
                                                updateInput('isCar', e.target.value === 'Private Car');
                                            }}>
                                                {['Metro', 'Train', 'Bus', 'Microbus', 'Private Car', 'Uber', 'Careem', 'Motorcycle', 'Walking', 'Bicycle'].map(t => <option key={t} value={t}>{optionLabel(t)}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={`block text-[10px] uppercase font-bold tracking-widest mb-2 ${textMuted}`}>{isAr ? 'المواصلة (عودة)' : 'Return Transport'}</label>
                                            <select className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none ${inputBg}`} value={inputs.returnTransport} onChange={(e) => updateInput('returnTransport', e.target.value)}>
                                                {['Same as Primary', 'Metro', 'Train', 'Bus', 'Microbus', 'Private Car', 'Uber', 'Careem', 'Motorcycle', 'Walking'].map(t => <option key={t} value={t}>{optionLabel(t)}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={`block text-[10px] uppercase font-bold tracking-widest mb-2 ${textMuted}`}>{isAr ? 'عدد التحويلات' : 'Transfers'}</label>
                                            <select className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none ${inputBg}`} value={inputs.transfers} onChange={(e) => updateInput('transfers', e.target.value)}>
                                                {['Direct', '1 Transfer', '2 Transfers', '3+', 'Complex Route'].map(t => <option key={t} value={t}>{optionLabel(t)}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Section 3 */}
                                    <div className="space-y-5">
                                        <h3 className={`text-xs font-semibold uppercase tracking-widest flex items-center gap-2 ${textDim}`}><AlertTriangle className="w-3.5 h-3.5" /> 3. {isAr ? 'التعرض الحضري' : 'Reality Metrics'}</h3>
                                        <div>
                                            <label className={`block text-[10px] uppercase font-bold tracking-widest mb-2 ${textMuted}`}>{isAr ? 'وقت التنقل اليومي' : 'Daily Commute Time'}</label>
                                            <select className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none ${inputBg}`} value={inputs.commuteTime} onChange={(e) => updateInput('commuteTime', e.target.value)}>
                                                {['< 15 min', '15-30', '30-60', '60-90', '90+'].map(t => <option key={t} value={t}>{optionLabel(t)}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={`block text-[10px] uppercase font-bold tracking-widest mb-2 ${textMuted}`}>{isAr ? 'الإنفاق الشهري (تقريبي)' : 'Monthly Spending (EGP)'}</label>
                                            <select className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none ${inputBg}`} value={inputs.monthlySpending} onChange={(e) => updateInput('monthlySpending', e.target.value)}>
                                                {['Under 300', '300-600', '600-1000', '1000-2000', '2000+'].map(t => <option key={t} value={t}>{optionLabel(t)}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={`block text-[10px] uppercase font-bold tracking-widest mb-2 ${textMuted}`}>{isAr ? 'التعرض للزحام المروري' : 'Traffic Exposure'}</label>
                                            <select className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none ${inputBg}`} value={inputs.trafficExposure} onChange={(e) => updateInput('trafficExposure', e.target.value)}>
                                                {['Low', 'Moderate', 'High', 'Extreme'].map(t => <option key={t} value={t}>{optionLabel(t)}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Car Specific */}
                                    {inputs.isCar && (
                                        <div className="space-y-5 p-5 rounded-2xl border border-purple-500/20 bg-purple-500/5">
                                            <h3 className={`text-xs font-semibold uppercase tracking-widest flex items-center gap-2 text-purple-600`}><Car className="w-3.5 h-3.5" /> 4. {isAr ? 'ذكاء المركبات' : 'Vehicle Intel'}</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className={`block text-[10px] uppercase font-bold !text-purple-600/70 tracking-widest mb-2`}>{isAr ? 'نوع الوقود' : 'Fuel Type'}</label>
                                                    <select className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none ${inputBg} !border-purple-500/20`} value={inputs.fuelType} onChange={(e) => updateInput('fuelType', e.target.value)}>
                                                        {['Gasoline', 'Diesel', 'Natural Gas', 'Hybrid', 'Electric'].map(t => <option key={t} value={t}>{optionLabel(t)}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className={`block text-[10px] uppercase font-bold !text-purple-600/70 tracking-widest mb-2`}>{isAr ? 'موديل السيارة' : 'Vehicle Year'}</label>
                                                    <select className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none ${inputBg} !border-purple-500/20`} value={inputs.vehicleYear} onChange={(e) => updateInput('vehicleYear', e.target.value)}>
                                                        {['Before 2010', '2010-2015', '2016-2020', '2021+'].map(t => <option key={t} value={t}>{optionLabel(t)}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className={`block text-[10px] uppercase font-bold !text-purple-600/70 tracking-widest mb-2`}>{isAr ? 'متوسط الركاب' : 'Passengers'}</label>
                                                    <select className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none ${inputBg} !border-purple-500/20`} value={inputs.passengers} onChange={(e) => updateInput('passengers', e.target.value)}>
                                                        {['1', '2', '3', '4+'].map(t => <option key={t} value={t}>{t}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className={`block text-[10px] uppercase font-bold !text-purple-600/70 tracking-widest mb-2`}>{isAr ? 'التكييف' : 'AC Usage'}</label>
                                                    <select className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none ${inputBg} !border-purple-500/20`} value={inputs.acUsage} onChange={(e) => updateInput('acUsage', e.target.value)}>
                                                        {['Always', 'Frequently', 'Occasionally', 'Never'].map(t => <option key={t} value={t}>{optionLabel(t)}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mt-8">
                                <button 
                                    onClick={handleAnalysis}
                                    disabled={analyzing}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 text-sm uppercase tracking-widest rounded-2xl transition-all shadow-[0_4px_20px_rgba(147,51,234,0.3)] hover:shadow-[0_8px_30px_rgba(147,51,234,0.4)] flex justify-center items-center gap-3 disabled:opacity-50 disabled:shadow-none"
                                >
                                    {analyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                                    {isAr ? 'توليد مصفوفة الذكاء' : 'Generate Intelligence'}
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* DASHBOARD OUTPUT */}
                    <div className="lg:col-span-8 flex flex-col space-y-6" id="mobility-report-container">
                        
                        {/* Toolbar */}
                        <div className="flex justify-between items-center no-export">
                            <h2 className={`text-sm font-bold uppercase tracking-widest ${textMain}`}>{isAr ? 'لوحة القيادة' : 'Output Matrix'}</h2>
                            {report && (
                                <div className="flex gap-3">
                                    <ReportActions
                                        targetId="mobility-report-container"
                                        filename="Kairo_Mobility_Intelligence"
                                        title={isAr ? 'تقرير التنقل منخفض الأثر' : 'Low-impact mobility report'}
                                        subtitle={isAr ? 'تحليل التكلفة والزمن والتعرض الحضري والانبعاثات.' : 'Cost, time, urban exposure, and emissions analysis.'}
                                        sdgs={[11, 13]}
                                    />
                                    <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 bg-red-900/10 hover:bg-red-900/20 border border-red-500/20 text-red-500 rounded-lg text-[10px] uppercase tracking-wider font-bold transition-colors">
                                        <RefreshCw className="w-3 h-3" /> {isAr ? 'إعادة ضبط' : 'Reset'}
                                    </button>
                                </div>
                            )}
                        </div>

                        <AnimatePresence mode="wait">
                            {report && report.scores ? (
                                <MotionDiv 
                                    initial={{ opacity: 0, y: 20 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    className="space-y-8"
                                >
                                    {/* SCORE CARDS */}
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                        {[
                                            { t: isAr ? 'كفاءة التنقل' : 'Mobility Efficiency', v: `${report.scores.mobility_efficiency}/100`, p: report.scores.mobility_efficiency, i: TargetIcon, c: 'text-emerald-500', bar: 'bg-emerald-500' },
                                            { t: isAr ? 'تكلفة التنقل الشهرية' : 'Monthly Transport Cost', v: `${report.metrics.monthly_cost_egp.toLocaleString()} ${isAr ? 'جنيه' : 'EGP'}`, i: DollarSign, c: 'text-red-500' },
                                            { t: isAr ? 'الوقت المهدر شهريًا' : 'Monthly Time Lost', v: `${report.metrics.monthly_hours_lost} ${isAr ? 'ساعة' : 'hours'}`, i: Clock, c: 'text-amber-500' },
                                            { t: isAr ? 'الانبعاثات الشهرية' : 'Monthly Carbon Burden', v: `${report.metrics.monthly_carbon_kg} kg CO₂`, i: CloudRain, c: 'text-cyan-500' },
                                            { t: isAr ? 'التعرض للزحام' : 'Urban Exposure Risk', v: optionLabel(String(report.scores.urban_exposure)), i: AlertTriangle, c: 'text-orange-500' },
                                            { t: isAr ? 'مؤشر هدر المال' : 'Financial Waste Index', v: `${report.scores.financial_waste_index}/100`, p: report.scores.financial_waste_index, i: Activity, c: 'text-rose-500', bar: 'bg-rose-500' },
                                        ].map((card, i) => (
                                            <div key={i} className={`min-w-0 p-5 sm:p-6 rounded-3xl border ${borderSubtle} ${bgCard} flex flex-col justify-between shadow-[0_14px_40px_rgba(10,60,45,.04)]`}>
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${textMuted} w-2/3`}>{card.t}</span>
                                                    <card.i className={`w-4 h-4 ${card.c}`} />
                                                </div>
                                                <div className={`break-words text-xl sm:text-2xl md:text-3xl font-black tracking-tight ${textMain}`}>{card.v}</div>
                                                {typeof card.p === 'number' && (
                                                    <div className={`mt-4 h-1.5 overflow-hidden rounded-full ${isLight ? 'bg-emerald-950/8' : 'bg-white/10'}`}>
                                                        <div className={`h-full rounded-full ${card.bar}`} style={{ width: `${Math.max(0, Math.min(100, card.p))}%` }} />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* ADVANCED INSIGHTS */}
                                    <div className={`p-8 rounded-3xl border ${isLight ? 'bg-indigo-50 border-indigo-100' : 'bg-indigo-950/20 border-indigo-500/20'}`}>
                                        <h3 className={`text-xs font-black uppercase tracking-widest text-indigo-600 mb-6 flex items-center gap-2`}><Target className="w-4 h-4"/> {isAr ? 'عائد التحسين السنوي (المتوقع)' : 'Potential Annual Yields'}</h3>
                                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                                            <div>
                                                <div className={`text-[10px] uppercase font-bold tracking-widest mb-1 ${textMuted}`}>{isAr ? 'توفير مالي' : 'Savings'}</div>
                                                <div className="text-xl font-black text-emerald-500">+{(report.advanced_insights.potential_savings_egp_month * 12).toLocaleString()} {isAr ? 'جنيه' : 'EGP'}</div>
                                            </div>
                                            <div>
                                                <div className={`text-[10px] uppercase font-bold tracking-widest mb-1 ${textMuted}`}>{isAr ? 'استرداد زمني' : 'Time Recovery'}</div>
                                                <div className="text-xl font-black text-blue-500">+{report.advanced_insights.potential_time_recovery_hours * 12} {isAr ? 'ساعة' : 'hours'}</div>
                                            </div>
                                            <div>
                                                <div className={`text-[10px] uppercase font-bold tracking-widest mb-1 ${textMuted}`}>{isAr ? 'تقليل انبعاثات' : 'Carbon Reduction'}</div>
                                                <div className="text-xl font-black text-teal-500">-{report.advanced_insights.potential_co2_reduction_kg * 12} kg CO₂</div>
                                            </div>
                                        </div>
                                        <p className={`text-sm leading-relaxed ${textMain} font-medium`}>"{report.advanced_insights.before_vs_after_narrative}"</p>
                                    </div>

                                    {/* RECOMMENDATIONS GRID */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className={`p-8 rounded-3xl border ${borderSubtle} ${bgCard}`}>
                                            <h3 className={`text-xs font-black uppercase tracking-widest mb-6 ${textDim}`}>{isAr ? 'تحسين مالي' : 'Financial Logic'}</h3>
                                            <ul className="space-y-4">
                                                {report.recommendations.financial.map((r, i) => (
                                                    <li key={i} className={`flex gap-3 text-sm leading-relaxed ${textMain}`}><ArrowRight className={`w-4 h-4 text-emerald-500 shrink-0 mt-0.5 ${dir === 'rtl' ? 'rotate-180' : ''}`} /> {r}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className={`p-8 rounded-3xl border ${borderSubtle} ${bgCard}`}>
                                            <h3 className={`text-xs font-black uppercase tracking-widest mb-6 ${textDim}`}>{isAr ? 'استرداد الزمن' : 'Time Optimization'}</h3>
                                            <ul className="space-y-4">
                                                {report.recommendations.time_optimization.map((r, i) => (
                                                    <li key={i} className={`flex gap-3 text-sm leading-relaxed ${textMain}`}><ArrowRight className={`w-4 h-4 text-blue-500 shrink-0 mt-0.5 ${dir === 'rtl' ? 'rotate-180' : ''}`} /> {r}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className={`p-8 rounded-3xl border ${borderSubtle} ${bgCard}`}>
                                            <h3 className={`text-xs font-black uppercase tracking-widest mb-6 ${textDim}`}>{isAr ? 'الصحة الحضرية' : 'Urban Health'}</h3>
                                            <ul className="space-y-4">
                                                {report.recommendations.urban_health.map((r, i) => (
                                                    <li key={i} className={`flex gap-3 text-sm leading-relaxed ${textMain}`}><ArrowRight className={`w-4 h-4 text-orange-500 shrink-0 mt-0.5 ${dir === 'rtl' ? 'rotate-180' : ''}`} /> {r}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className={`p-8 rounded-3xl border ${borderSubtle} ${bgCard}`}>
                                            <h3 className={`text-xs font-black uppercase tracking-widest mb-6 ${textDim}`}>{isAr ? 'بدائل حركية' : 'Transport Alternatives'}</h3>
                                            <ul className="space-y-4">
                                                {report.recommendations.transportation.map((r, i) => (
                                                    <li key={i} className={`flex gap-3 text-sm leading-relaxed ${textMain}`}><ArrowRight className={`w-4 h-4 text-purple-500 shrink-0 mt-0.5 ${dir === 'rtl' ? 'rotate-180' : ''}`} /> {r}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                </MotionDiv>
                            ) : (
                                <div className={`h-[500px] flex flex-col items-center justify-center rounded-3xl border ${borderSubtle} ${bgCard} text-center px-6`}>
                                    <div className="w-20 h-20 rounded-full border border-purple-500/20 bg-purple-500/5 flex items-center justify-center mb-6">
                                        <MapIcon className="w-8 h-8 text-purple-500" />
                                    </div>
                                    <h3 className={`text-2xl font-medium mb-3 ${textMain}`}>{isAr ? 'محرك الاستدلال خامل' : 'Engine Idle'}</h3>
                                    <p className={`text-sm ${textDim} max-w-sm leading-relaxed`}>
                                        {isAr ? 'أدخل ملفك التعريفي وبيانات رحلتك اليومية واسمح لكايرو بتحليل أبعاد التكلفة البيئية والمالية المخفية لحركتك في المدينة.' : 'Input your commute profile and let Kairo map the hidden financial, temporal, and atmospheric costs of your movement.'}
                                    </p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransportImpact;
