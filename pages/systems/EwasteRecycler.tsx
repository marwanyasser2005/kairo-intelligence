
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Recycle, Cpu, Smartphone, Loader2, RefreshCw, AlertTriangle, AlertOctagon, Network, Scale, TrendingUp, Database, ShieldCheck, Camera, Search, ExternalLink } from 'lucide-react';
import { runEwasteAnalysis, analyzeEwasteOCR } from '../../services/tokenRouterService';
import { EwasteAnalysisReport } from '../../types';
import { usePersistentState } from '../../utils/storage';
import { useApp } from '../../contexts/AppContext';
import BillUploader from '../../components/BillUploader';
import SdgBadge from '../../components/SdgBadge';
import CapabilityContext from '../../components/CapabilityContext';
import ReportActions from '../../components/ReportActions';
import DecisionIntelligence from '../../components/DecisionIntelligence';

const MotionDiv = motion.div as any;

interface EwasteRecyclerProps {
    report: EwasteAnalysisReport | null;
    setGlobalReport?: (report: EwasteAnalysisReport | null) => void;
}

interface DeviceCatalogEntry {
    type: string;
    brand: string;
    model: string;
}

const DEVICE_CATALOG: DeviceCatalogEntry[] = [
    { type: 'Smartphone', brand: 'Apple', model: 'iPhone 16 Pro Max' },
    { type: 'Smartphone', brand: 'Apple', model: 'iPhone 15 Pro' },
    { type: 'Smartphone', brand: 'Apple', model: 'iPhone 14' },
    { type: 'Smartphone', brand: 'Apple', model: 'iPhone 13' },
    { type: 'Smartphone', brand: 'Samsung', model: 'Galaxy S25 Ultra' },
    { type: 'Smartphone', brand: 'Samsung', model: 'Galaxy S24 Ultra' },
    { type: 'Smartphone', brand: 'Samsung', model: 'Galaxy A55 5G' },
    { type: 'Smartphone', brand: 'Samsung', model: 'Galaxy A35 5G' },
    { type: 'Smartphone', brand: 'Xiaomi', model: 'Redmi Note 14 Pro' },
    { type: 'Smartphone', brand: 'Xiaomi', model: 'Redmi Note 13' },
    { type: 'Smartphone', brand: 'Google', model: 'Pixel 9 Pro' },
    { type: 'Smartphone', brand: 'Oppo', model: 'Reno 13' },
    { type: 'Smartphone', brand: 'Huawei', model: 'Pura 70 Pro' },
    { type: 'Laptop', brand: 'Apple', model: 'MacBook Air M4' },
    { type: 'Laptop', brand: 'Apple', model: 'MacBook Air M3' },
    { type: 'Laptop', brand: 'Apple', model: 'MacBook Pro M3' },
    { type: 'Laptop', brand: 'Dell', model: 'XPS 13' },
    { type: 'Laptop', brand: 'Dell', model: 'Latitude 7440' },
    { type: 'Laptop', brand: 'HP', model: 'Spectre x360 14' },
    { type: 'Laptop', brand: 'HP', model: 'EliteBook 840 G10' },
    { type: 'Laptop', brand: 'Lenovo', model: 'ThinkPad X1 Carbon Gen 12' },
    { type: 'Laptop', brand: 'Lenovo', model: 'IdeaPad Slim 5' },
    { type: 'Laptop', brand: 'Asus', model: 'Zenbook 14 OLED' },
    { type: 'Laptop', brand: 'Acer', model: 'Swift Go 14' },
    { type: 'Tablet', brand: 'Apple', model: 'iPad Pro M4' },
    { type: 'Tablet', brand: 'Apple', model: 'iPad Air M2' },
    { type: 'Tablet', brand: 'Samsung', model: 'Galaxy Tab S10 Ultra' },
    { type: 'Gaming Console', brand: 'Sony', model: 'PlayStation 5 Slim' },
    { type: 'Gaming Console', brand: 'Microsoft', model: 'Xbox Series X' },
    { type: 'Gaming Console', brand: 'Nintendo', model: 'Switch OLED' },
    { type: 'Monitor', brand: 'Samsung', model: 'Odyssey G7' },
    { type: 'Monitor', brand: 'Dell', model: 'UltraSharp U2723QE' },
    { type: 'Printer', brand: 'HP', model: 'LaserJet Pro M404dn' },
    { type: 'Router', brand: 'TP-Link', model: 'Archer AX55' },
];

const DEVICE_TYPE_LABELS: Record<string, string> = {
    Smartphone: 'هاتف ذكي',
    Laptop: 'لابتوب',
    Tablet: 'تابلت',
    'Desktop PC': 'كمبيوتر مكتبي',
    Monitor: 'شاشة',
    Printer: 'طابعة',
    Router: 'راوتر',
    'Gaming Console': 'جهاز ألعاب',
    Other: 'جهاز آخر',
};

const EwasteRecycler: React.FC<EwasteRecyclerProps> = ({ report, setGlobalReport }) => {
    const { theme, dir, language } = useApp();
    const isLight = theme === 'light';
    const isAr = language === 'ar';
    
    const [analyzing, setAnalyzing] = useState(false);
    
    // Inputs Mode
    const [activeTab, setActiveTab] = useState<'manual' | 'ocr'>('manual');
    const [ocrProcessing, setOcrProcessing] = useState(false);

    // Form State
    const [deviceType, setDeviceType] = usePersistentState('kre_type', 'Smartphone');
    const [brand, setBrand] = usePersistentState('kre_brand', 'Apple');
    const [model, setModel] = usePersistentState('kre_model', '');
    const [deviceQuery, setDeviceQuery] = usePersistentState('kre_device_query', '');
    const [purchaseYear, setPurchaseYear] = usePersistentState('kre_year', new Date().getFullYear() - 2);
    const [purchasePrice, setPurchasePrice] = usePersistentState('kre_price', 0);
    const [dailyUsageHours, setDailyUsageHours] = usePersistentState('kre_daily_usage', 4);
    const [yearsOfUse, setYearsOfUse] = usePersistentState('kre_years_use', 2);
    const [batteryHealth, setBatteryHealth] = usePersistentState('kre_battery', 100);
    const [details, setDetails] = usePersistentState('kre_details', '');

    // Booleans
    const [hasScreenCracks, setHasScreenCracks] = usePersistentState('kre_crack', false);
    const [hasBatteryIssues, setHasBatteryIssues] = usePersistentState('kre_batt_iss', false);
    const [hasCameraIssues, setHasCameraIssues] = usePersistentState('kre_cam_iss', false);
    const [hasAudioIssues, setHasAudioIssues] = usePersistentState('kre_audio_iss', false);
    const [hasPortIssues, setHasPortIssues] = usePersistentState('kre_port_iss', false);
    const [isFullyFunctional, setIsFullyFunctional] = usePersistentState('kre_func', true);
    const [supportsLatestUpdates, setSupportsLatestUpdates] = usePersistentState('kre_updates', true);
    const [previouslyRepaired, setPreviouslyRepaired] = usePersistentState('kre_rep', false);
    const [originalBoxPresent, setOriginalBoxPresent] = usePersistentState('kre_box', true);
    const [originalChargerPresent, setOriginalChargerPresent] = usePersistentState('kre_charger', true);
    const [receiptPresent, setReceiptPresent] = usePersistentState('kre_receipt', false);
    const [cloudLocked, setCloudLocked] = usePersistentState('kre_cloud', false);
    const [unDeletedPersonalData, setUnDeletedPersonalData] = usePersistentState('kre_data', true);

    const deviceMatches = useMemo(() => {
        const query = deviceQuery.trim().toLocaleLowerCase();
        if (query.length < 2) return [];
        return DEVICE_CATALOG
            .filter((device) =>
                `${device.brand} ${device.model} ${device.type}`.toLocaleLowerCase().includes(query),
            )
            .slice(0, 6);
    }, [deviceQuery]);

    const selectDevice = (device: DeviceCatalogEntry) => {
        setDeviceType(device.type);
        setBrand(device.brand);
        setModel(device.model);
        setDeviceQuery(`${device.brand} ${device.model}`);
    };

    const handleAnalyze = async () => {
        setAnalyzing(true);
        try {
            const inputData = {
                deviceType, brand, model, deviceSearchQuery: deviceQuery, purchaseYear, purchasePrice, dailyUsageHours, yearsOfUse, batteryHealth,
                condition: {
                    isFullyFunctional, hasScreenCracks, hasBatteryIssues, hasCameraIssues, hasAudioIssues, hasPortIssues, previouslyRepaired, supportsLatestUpdates
                },
                accessories: { originalBoxPresent, originalChargerPresent, receiptPresent },
                security: { cloudLocked, unDeletedPersonalData },
                details
            };
            const result = await runEwasteAnalysis(JSON.stringify(inputData), language);
            if (setGlobalReport) setGlobalReport(result);
        } catch (e) {
            console.error(e);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleOCR = async (base64String: string, imageMimeType?: string) => {
        setOcrProcessing(true);
        try {
            const data = await analyzeEwasteOCR(base64String, language, imageMimeType);
            if (data?.deviceType) setDeviceType(data.deviceType);
            if (data?.brand) setBrand(data.brand);
            if (data?.model) {
                setModel(data.model);
                setDeviceQuery(`${data.brand || brand} ${data.model}`.trim());
            }
            if (data?.purchaseYear) setPurchaseYear(data.purchaseYear);
            if (data?.approximatePurchasePrice) setPurchasePrice(data.approximatePurchasePrice);
            if (data?.batteryHealth) setBatteryHealth(data.batteryHealth);
            setActiveTab('manual');
        } catch (error) {
            console.error("OCR Failed", error);
            alert(isAr ? 'فشل استخراج البيانات. الرجاء إدخالها يدوياً.' : 'Data extraction failed. Please enter manually.');
        } finally {
            setOcrProcessing(false);
        }
    };

    const handleReset = () => {
        if (setGlobalReport) setGlobalReport(null);
    };

    const textMain = isLight ? 'text-gray-900' : 'text-white';
    const textSub = isLight ? 'text-gray-500' : 'text-gray-400';
    const bgCard = isLight ? 'bg-[#f8fbf9] border-emerald-950/10 shadow-[0_16px_50px_rgba(17,76,58,.045)]' : 'bg-white/5 border-white/10';
    const inputBg = isLight ? 'bg-[#edf4f1] border-emerald-950/10 text-[#173029] focus:border-emerald-600/40' : 'bg-black/50 border-white/10 text-white';

    const getGradeColor = (grade: string) => {
        if (!grade) return 'text-gray-500';
        if (grade.includes('A')) return 'text-emerald-500';
        if (grade.includes('B')) return 'text-lime-500';
        if (grade.includes('C')) return 'text-yellow-500';
        if (grade.includes('D')) return 'text-orange-500';
        return 'text-red-500';
    };
    const localizePathway = (value: string) => {
        if (!isAr) return value;
        return ({
            'Continue Using': 'استمر في استخدامه',
            Repair: 'إصلاح',
            Refurbish: 'تجديد وإعادة تأهيل',
            Upgrade: 'ترقية مدروسة',
            Donate: 'تبرع',
            Resell: 'إعادة بيع',
            'Trade-In': 'استبدال لدى جهة موثوقة',
            Recycle: 'تدوير آمن',
            'Urban Mining': 'استرداد المواد',
        } as Record<string, string>)[value] || value;
    };
    const localizeGrade = (value: string) => isAr ? value.replace('Grade', 'فئة') : value;
    const localizeRisk = (value: string) => {
        if (!isAr) return value;
        return ({ Low: 'منخفض', Medium: 'متوسط', High: 'مرتفع', Critical: 'حرج' } as Record<string, string>)[value] || value;
    };

    return (
        <div className={`min-h-screen pt-32 lg:pt-36 px-4 md:px-6 pb-20 ${isLight ? 'bg-[#edf4f1]' : 'bg-black'} transition-colors duration-500`} dir={dir}>
            <div className="max-w-6xl mx-auto">
                <CapabilityContext capabilityId="ewaste" />
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-500/20">
                            <Scale className="w-3.5 h-3.5" /> {isAr ? 'تقييم دورة حياة الأجهزة' : 'Device Lifecycle Assessment'}
                        </div>
                        <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${textMain}`}>
                            {isAr ? 'ذكاء الأجهزة الإلكترونية' : 'E-Waste Intelligence'}
                        </h1>
                        <p className={`text-lg ${textSub} max-w-2xl mb-4`}>
                            {isAr ? 'تقييم شامل لدورة حياة الأجهزة، والمسار الدائري الأمثل، والقيمة الاقتصادية.' : 'Comprehensive lifecycle assessment, optimal circular pathway, and economic valuation.'}
                        </p>
                        <SdgBadge sdgs={[11, 12, 13]} />
                    </div>

                    <div className="flex gap-3 no-export">
                        {report && (
                            <>
                                <ReportActions
                                    targetId="ewaste-report-container"
                                    filename="Kairo_Ewaste_Lifecycle_Report"
                                    title={isAr ? 'تقرير دورة حياة الأجهزة' : 'Device lifecycle report'}
                                    subtitle={isAr ? 'تقييم المسار الدائري والقيمة والمخاطر البيئية والأمنية.' : 'Circular pathway, value, environmental, and data-risk assessment.'}
                                    sdgs={[11, 12, 13]}
                                    className="self-start mt-2"
                                />
                                <button onClick={handleReset} className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 self-start mt-2 hover:bg-red-500/20 text-red-500 rounded-xl font-bold text-sm transition-all">
                                    <RefreshCw className="w-4 h-4" />
                                    {isAr ? 'إعادة التقييم' : 'Reset'}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8 mb-12">
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        
                        {/* Tabs */}
                        <div className="flex gap-2 p-2 rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 shadow-sm">
                            <button onClick={() => setActiveTab('manual')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'manual' ? (isLight ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-500/20 text-emerald-400') : textSub}`}>
                                <Database className="w-4 h-4" /> {isAr ? 'إدخال يدوي' : 'Manual Entry'}
                            </button>
                            <button onClick={() => setActiveTab('ocr')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'ocr' ? (isLight ? 'bg-blue-50 text-blue-600' : 'bg-blue-500/20 text-blue-400') : textSub}`}>
                                <Camera className="w-4 h-4" /> {isAr ? 'المسح الآلي (OCR)' : 'OCR Scanner'}
                            </button>
                        </div>

                        {activeTab === 'ocr' ? (
                            <div className={`${bgCard} border rounded-3xl p-8`}>
                                <h3 className={`font-bold mb-4 ${textMain}`}>{isAr ? 'مسح تفاصيل الجهاز' : 'Scan Device Details'}</h3>
                                <p className={`text-sm mb-6 ${textSub}`}>{isAr ? 'قم برفع صورة للجهاز، الفاتورة، أو تقرير صحة البطارية لاستخراج البيانات تلقائياً.' : 'Upload an image of the device, receipt, or battery report to extract data automatically.'}</p>
                                {ocrProcessing ? (
                                    <div className="py-12 flex flex-col items-center">
                                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                                        <div className={`font-bold ${textMain}`}>{isAr ? 'جاري التحليل...' : 'Analyzing Image...'}</div>
                                    </div>
                                ) : (
                                    <BillUploader onUpload={handleOCR} />
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div className={`${bgCard} border rounded-3xl p-6`}>
                                    <h3 className={`font-bold mb-4 flex items-center gap-2 ${textMain}`}><Smartphone className="w-5 h-5 text-emerald-500"/> {isAr ? 'المعلومات الأساسية' : 'Basic Information'}</h3>
                                    <div className="mb-5">
                                        <div className="mb-2 flex items-center justify-between gap-3">
                                            <label className="text-xs font-bold uppercase text-gray-500">
                                                {isAr ? 'ابحث عن الجهاز أو اكتب اسمه كاملًا' : 'Search or enter the exact device'}
                                            </label>
                                            {deviceQuery.trim() && (
                                                <a
                                                    href={`https://www.google.com/search?q=${encodeURIComponent(`${deviceQuery} specifications release year`)}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-500"
                                                >
                                                    {isAr ? 'تحقق من المواصفات' : 'Verify specifications'}
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <Search className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 ${isAr ? 'right-4' : 'left-4'} text-emerald-500`} />
                                            <input
                                                type="search"
                                                value={deviceQuery}
                                                onChange={(event) => {
                                                    setDeviceQuery(event.target.value);
                                                    setModel(event.target.value);
                                                }}
                                                className={`w-full rounded-2xl border py-3.5 ${isAr ? 'pr-11 pl-4' : 'pl-11 pr-4'} ${inputBg}`}
                                                placeholder={isAr ? 'مثال: Samsung Galaxy S24 Ultra أو Dell XPS 13' : 'e.g. Samsung Galaxy S24 Ultra or Dell XPS 13'}
                                                autoComplete="off"
                                            />
                                        </div>
                                        {deviceMatches.length > 0 && (
                                            <div className={`mt-2 overflow-hidden rounded-2xl border ${isLight ? 'border-emerald-950/10 bg-[#f8fbf9]' : 'border-white/10 bg-[#101915]'}`}>
                                                {deviceMatches.map((device) => (
                                                    <button
                                                        type="button"
                                                        key={`${device.brand}-${device.model}`}
                                                        onClick={() => selectDevice(device)}
                                                        className={`flex w-full items-center justify-between gap-4 border-b px-4 py-3 text-start text-sm last:border-0 ${isLight ? 'border-emerald-950/8 hover:bg-emerald-50' : 'border-white/5 hover:bg-white/5'}`}
                                                    >
                                                        <span className={`font-bold ${textMain}`}>{device.brand} {device.model}</span>
                                                        <span className="shrink-0 text-[10px] font-bold text-emerald-600">
                                                            {isAr ? DEVICE_TYPE_LABELS[device.type] || device.type : device.type}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        <p className={`mt-2 text-[11px] leading-5 ${textSub}`}>
                                            {isAr
                                                ? 'الاقتراحات تساعدك تختار بسرعة، والكتابة الحرة متاحة لأي جهاز. رابط التحقق يفتح بحثًا خارجيًا؛ Kairo لا يدّعي أنه قرأ سعرًا لحظيًا من Google.'
                                                : 'Suggestions speed up selection, while free text supports any device. The verification link opens external search; Kairo does not claim live Google pricing.'}
                                        </p>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">{isAr ? 'النوع' : 'Type'}</label>
                                            <select value={deviceType} onChange={e => setDeviceType(e.target.value)} className={`w-full p-3 rounded-xl border ${inputBg}`} >
                                                {['Smartphone', 'Laptop', 'Tablet', 'Desktop PC', 'Monitor', 'Printer', 'Router', 'Gaming Console', 'Other'].map(v => <option key={v} value={v}>{isAr ? DEVICE_TYPE_LABELS[v] || v : v}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">{isAr ? 'الماركة' : 'Brand'}</label>
                                            <input value={brand} onChange={e => setBrand(e.target.value)} className={`w-full p-3 rounded-xl border ${inputBg}`} placeholder={isAr ? 'مثال: Samsung' : 'e.g. Samsung'} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">{isAr ? 'الموديل الدقيق' : 'Exact Model'}</label>
                                            <input value={model} onChange={e => setModel(e.target.value)} className={`w-full p-3 rounded-xl border ${inputBg}`} placeholder={isAr ? 'مثال: Galaxy S24 Ultra 256GB' : 'e.g. Galaxy S24 Ultra 256GB'} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">{isAr ? 'سنة الشراء' : 'Purchase Year'}</label>
                                            <input type="number" min="2000" max={new Date().getFullYear()} value={purchaseYear} onChange={e => setPurchaseYear(Number(e.target.value))} className={`w-full p-3 rounded-xl border ${inputBg}`} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">{isAr ? 'السعر التقريبي (EGP)' : 'Purchase Price (EGP)'}</label>
                                            <input type="number" min="0" value={purchasePrice} onChange={e => setPurchasePrice(Number(e.target.value))} className={`w-full p-3 rounded-xl border ${inputBg}`} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">{isAr ? 'مدة الاستخدام الفعلية (سنة)' : 'Actual Years Used'}</label>
                                            <input type="number" min="0" max="30" step="0.5" value={yearsOfUse} onChange={e => setYearsOfUse(Number(e.target.value))} className={`w-full p-3 rounded-xl border ${inputBg}`} />
                                        </div>
                                    </div>
                                </div>

                                {/* Usage & Hardware State */}
                                <div className={`${bgCard} border rounded-3xl p-6`}>
                                    <h3 className={`font-bold mb-4 flex items-center gap-2 ${textMain}`}><Cpu className="w-5 h-5 text-purple-500"/> {isAr ? 'حالة الجهاز والأداء' : 'Hardware State & Usage'}</h3>
                                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">{isAr ? 'ساعات الاستخدام اليومي' : 'Daily Usage (Hours)'}</label>
                                            <input type="number" min="0" max="24" value={dailyUsageHours} onChange={e => setDailyUsageHours(Number(e.target.value))} className={`w-full p-3 rounded-xl border ${inputBg}`} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">{isAr ? 'صحة البطارية (%)' : 'Battery Health (%)'}</label>
                                            <input type="number" min="0" max="100" value={batteryHealth} onChange={e => setBatteryHealth(Number(e.target.value))} className={`w-full p-3 rounded-xl border ${inputBg}`} />
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-3">
                                        <Checkbox label={isAr ? 'يعمل بالكامل' : 'Fully Functional'} checked={isFullyFunctional} onChange={setIsFullyFunctional} />
                                        <Checkbox label={isAr ? 'شاشة مكسورة' : 'Screen Cracks'} checked={hasScreenCracks} onChange={setHasScreenCracks} />
                                        <Checkbox label={isAr ? 'مشاكل بالبطارية' : 'Battery Issues'} checked={hasBatteryIssues} onChange={setHasBatteryIssues} />
                                        <Checkbox label={isAr ? 'مشاكل بالكاميرا' : 'Camera Issues'} checked={hasCameraIssues} onChange={setHasCameraIssues} />
                                        <Checkbox label={isAr ? 'مشاكل بالصوت' : 'Audio Issues'} checked={hasAudioIssues} onChange={setHasAudioIssues} />
                                        <Checkbox label={isAr ? 'مشاكل بالمنافذ' : 'Port/Charging Issues'} checked={hasPortIssues} onChange={setHasPortIssues} />
                                        <Checkbox label={isAr ? 'تدعم التحديثات' : 'Receives OS Updates'} checked={supportsLatestUpdates} onChange={setSupportsLatestUpdates} />
                                        <Checkbox label={isAr ? 'تمت صيانته سابقاً' : 'Previously Repaired'} checked={previouslyRepaired} onChange={setPreviouslyRepaired} />
                                    </div>
                                </div>

                                {/* Security & Accessories */}
                                <div className={`${bgCard} border rounded-3xl p-6`}>
                                    <h3 className={`font-bold mb-4 flex items-center gap-2 ${textMain}`}><ShieldCheck className="w-5 h-5 text-red-500"/> {isAr ? 'الأمان والملحقات' : 'Security & Accessories'}</h3>
                                    <div className="grid md:grid-cols-2 gap-3 mb-6">
                                        <Checkbox label={isAr ? 'مقفول رقمياً (Cloud Lock)' : 'Cloud/Activation Locked'} checked={cloudLocked} onChange={setCloudLocked} />
                                        <Checkbox label={isAr ? 'يحتوي على بيانات شخصية' : 'Undeleted Personal Data'} checked={unDeletedPersonalData} onChange={setUnDeletedPersonalData} />
                                        <Checkbox label={isAr ? 'العلبة الأصلية' : 'Original Box'} checked={originalBoxPresent} onChange={setOriginalBoxPresent} />
                                        <Checkbox label={isAr ? 'الشاحن الأصلي' : 'Original Charger'} checked={originalChargerPresent} onChange={setOriginalChargerPresent} />
                                        <Checkbox label={isAr ? 'فاتورة الشراء' : 'Purchase Receipt'} checked={receiptPresent} onChange={setReceiptPresent} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">{isAr ? 'ملاحظات إضافية' : 'Additional Notes'}</label>
                                        <textarea rows={2} value={details} onChange={e => setDetails(e.target.value)} className={`w-full p-3 rounded-xl border ${inputBg} resize-none`} placeholder={isAr ? 'اكتب أي عيوب أو تفاصيل أخرى...' : 'Describe any other damages or details...'} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-4">
                        <div className="sticky top-28">
                             <div className={`${bgCard} border rounded-3xl p-6 flex flex-col gap-6`}>
                                <div className="text-center">
                                    <div className="inline-flex w-16 h-16 rounded-2xl bg-emerald-500/10 items-center justify-center text-emerald-500 mb-4">
                                        <Recycle className="w-8 h-8" />
                                    </div>
                                    <h3 className={`font-bold text-lg mb-2 ${textMain}`}>{isAr ? 'محرك التقييم الدائري' : 'Circular Assessment Engine'}</h3>
                                    <p className={`text-sm ${textSub}`}>{isAr ? 'احصل على تحليل كامل للقيمة وإمكانية التدوير.' : 'Get a full lifecycle & value analysis.'}</p>
                                </div>
                                <button onClick={handleAnalyze} disabled={analyzing} className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2">
                                    {analyzing ? <Loader2 className="w-5 h-5 animate-spin"/> : <TrendingUp className="w-5 h-5" />}
                                    {isAr ? 'بدء التقييم' : 'Run Assessment'}
                                </button>
                             </div>
                        </div>
                    </div>
                </div>

                {report && (
                    <MotionDiv id="ewaste-report-container" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pt-8 border-t border-black/10 dark:border-white/10">
                        {report.device_identity && (
                            <div className={`${bgCard} grid gap-5 border rounded-3xl p-6 md:grid-cols-[1.25fr_.75fr] md:items-center`}>
                                <div>
                                    <div className="mb-2 flex items-center gap-2 text-xs font-bold text-emerald-600">
                                        <Search className="h-4 w-4" />
                                        {isAr ? 'هوية الجهاز المستخدمة في التقييم' : 'Device identity used for assessment'}
                                    </div>
                                    <h2 className={`text-2xl font-black ${textMain}`}>{report.device_identity.normalized_name}</h2>
                                    <p className={`mt-2 text-sm leading-6 ${textSub}`}>{report.device_identity.evidence_basis}</p>
                                    <p className="mt-2 text-[11px] font-bold text-amber-600">{report.device_identity.market_data_status}</p>
                                </div>
                                <div className={`rounded-2xl border p-5 ${isLight ? 'border-emerald-950/10 bg-[#edf4f1]' : 'border-white/10 bg-black/20'}`}>
                                    <div className="mb-3 flex items-center justify-between text-xs font-bold text-gray-500">
                                        <span>{isAr ? 'ثقة التعرّف' : 'Identification confidence'}</span>
                                        <span>{Math.round(report.device_identity.identification_confidence)}%</span>
                                    </div>
                                    <div className={`h-2 overflow-hidden rounded-full ${isLight ? 'bg-emerald-950/10' : 'bg-white/10'}`}>
                                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.max(0, Math.min(100, report.device_identity.identification_confidence))}%` }} />
                                    </div>
                                    <div className={`mt-3 text-[11px] ${textSub}`}>
                                        {isAr ? 'راجع الموديل والسنة قبل اتخاذ قرار بيع أو إصلاح.' : 'Verify the model and year before a sale or repair decision.'}
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Executive Summary */}
                        <div className={`${bgCard} kairo-analysis-panel border rounded-3xl p-6 sm:p-8 md:p-10 text-center relative overflow-hidden`}>
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500"></div>
                            <h2 className="text-sm font-bold uppercase text-gray-500 tracking-widest mb-6">{isAr ? 'التوصية النهائية' : 'Executive Recommendation'}</h2>
                            <div className={`text-4xl md:text-5xl font-black mb-6 ${textMain}`}>{localizePathway(report.recommended_pathway)}</div>
                            <p className={`text-lg md:text-xl max-w-3xl mx-auto ${textSub} leading-relaxed`}>{report.ai_executive_recommendation}</p>
                        </div>

                        {/* Grading & Key Indicators */}
                        <div className="kairo-metric-grid grid sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                            <div className={`${bgCard} kairo-metric-card border rounded-3xl p-6 flex flex-col items-center text-center`}>
                                <div className="text-xs font-bold uppercase text-gray-500 mb-4">{isAr ? 'تقييم الجهاز' : 'Device Grade'}</div>
                                <div className={`text-4xl font-black mb-2 ${getGradeColor(report.device_grade)}`}>{localizeGrade(report.device_grade)}</div>
                                <div className={`text-sm ${textSub}`}>{isAr ? 'الحالة العامة للجهاز' : 'Overall Hardware State'}</div>
                            </div>
                            <div className={`${bgCard} kairo-metric-card border rounded-3xl p-6 flex flex-col items-center text-center`}>
                                <div className="text-xs font-bold uppercase text-gray-500 mb-4">{isAr ? 'صحة الجهاز' : 'Device Health'}</div>
                                <div className={`kairo-metric-value text-4xl font-black mb-2 ${textMain}`}>{report.device_health_score}<span className="text-xl text-gray-400">/100</span></div>
                                <div className={`text-sm ${textSub}`}>{isAr ? 'مؤشر الصلاحية التقنية' : 'Technical Viability Index'}</div>
                            </div>
                            <div className={`${bgCard} kairo-metric-card border rounded-3xl p-6 flex flex-col items-center text-center`}>
                                <div className="text-xs font-bold uppercase text-gray-500 mb-4">{isAr ? 'مؤشر الاقتصاد الدائري' : 'Circularity Score'}</div>
                                <div className={`kairo-metric-value text-4xl font-black mb-2 text-blue-500`}>{report.circular_economy_score}<span className="text-xl text-gray-400">/100</span></div>
                                <div className={`text-sm ${textSub}`}>{isAr ? 'تأثير الاستدامة' : 'Sustainability Impact'}</div>
                            </div>
                        </div>

                        <DecisionIntelligence
                            module="ewaste"
                            score={report.circular_economy_score}
                            status={localizePathway(report.recommended_pathway)}
                            confidence="medium"
                        />

                        {/* Economic & Environmental Columns */}
                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Economic Section */}
                            <div className={`${bgCard} kairo-analysis-panel border rounded-3xl p-5 sm:p-8`}>
                                <h3 className={`font-bold text-xl mb-6 flex items-center gap-2 ${textMain}`}><TrendingUp className="text-emerald-500" /> {isAr ? 'التحليل الاقتصادي' : 'Economic Analysis'}</h3>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5">
                                        <div className={textSub}>{isAr ? 'القيمة السوقية الحالية' : 'Current Market Value'}</div>
                                        <div className={`font-bold text-lg ${textMain}`}>{report.economic_analysis?.current_market_value_egp?.toLocaleString() ?? 0} {isAr ? 'جنيه' : 'EGP'}</div>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5">
                                        <div className={textSub}>{isAr ? 'نسبة الاستهلاك (الإهلاك)' : 'Depreciation'}</div>
                                        <div className={`font-bold text-lg text-red-500`}>-{report.economic_analysis?.depreciation_percentage ?? 0}%</div>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5">
                                        <div className={textSub}>{isAr ? 'القيمة المتبقية' : 'Residual Value'}</div>
                                        <div className={`font-bold text-lg ${textMain}`}>{report.economic_analysis?.residual_value_egp?.toLocaleString() ?? 0} {isAr ? 'جنيه' : 'EGP'}</div>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5">
                                        <div className={textSub}>{isAr ? 'تكلفة الاستبدال' : 'Replacement Cost'}</div>
                                        <div className={`font-bold text-lg text-orange-500`}>{report.economic_analysis?.replacement_cost_egp?.toLocaleString() ?? 0} {isAr ? 'جنيه' : 'EGP'}</div>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5">
                                        <div className={textSub}>{isAr ? 'تكلفة مالكية كاملة' : 'Total Ownership Value'}</div>
                                        <div className={`font-bold text-lg ${textMain}`}>{report.economic_analysis?.total_ownership_value_egp?.toLocaleString() ?? 0} {isAr ? 'جنيه' : 'EGP'}</div>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5">
                                        <div className={textSub}>{isAr ? 'تكلفة التجديد التقديرية' : 'Estimated Refurbish Cost'}</div>
                                        <div className={`font-bold text-lg ${textMain}`}>{report.economic_analysis?.refurbish_cost_estimate_egp?.toLocaleString() ?? 0} {isAr ? 'جنيه' : 'EGP'}</div>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <div className={textSub}>{isAr ? 'عائد استثمار التجديد' : 'Refurbish ROI'}</div>
                                        <div className={`font-black text-xl text-emerald-500`}>+{report.economic_analysis?.refurbish_roi_percentage ?? 0}%</div>
                                    </div>
                                </div>
                            </div>

                            {/* Enivronmental Section */}
                            <div className={`${bgCard} kairo-analysis-panel border rounded-3xl p-5 sm:p-8`}>
                                <h3 className={`font-bold text-xl mb-6 flex items-center gap-2 ${textMain}`}><Recycle className="text-blue-500" /> {isAr ? 'الأثر البيئي' : 'Environmental Impact'}</h3>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5">
                                        <div className={textSub}>{isAr ? 'توفير الكربون' : 'Carbon Savings'}</div>
                                        <div className={`font-bold text-lg text-emerald-500`}>{report.environmental_impact?.carbon_savings_kg ?? 0} kg CO₂e</div>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5">
                                        <div className={textSub}>{isAr ? 'المواد الخام المحفوظة' : 'Raw Materials Saved'}</div>
                                        <div className={`font-bold text-lg ${textMain}`}>{report.environmental_impact?.raw_material_savings_kg ?? 0} kg</div>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5">
                                        <div className={textSub}>{isAr ? 'النفايات الإلكترونية المتجنبة' : 'E-Waste Prevented'}</div>
                                        <div className={`font-bold text-lg ${textMain}`}>{report.environmental_impact?.ewaste_prevented_kg ?? 0} kg</div>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <div className={textSub}>{isAr ? 'مؤشر الفائدة البيئية' : 'Environmental Benefit'}</div>
                                        <div className={`font-black text-xl text-blue-500`}>{report.environmental_impact?.circular_economy_impact_score ?? 0}/100</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Alternate Pathways */}
                        <div className={`${bgCard} kairo-analysis-panel border rounded-3xl p-5 sm:p-8`}>
                            <h3 className={`font-bold text-xl mb-6 flex items-center gap-2 ${textMain}`}><Network className="text-purple-500" /> {isAr ? 'المسارات البديلة المتاحة' : 'Alternative Pathways'}</h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {(report.alternative_pathways || []).map((path, idx) => (
                                    <div key={idx} className={`p-5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'}`}>
                                        <div className="font-bold mb-2 text-indigo-500">{localizePathway(path.pathway)}</div>
                                        <div className={`text-sm mb-4 ${textSub}`}>{path.reasoning}</div>
                                        <div className={`text-xs font-bold uppercase bg-indigo-500/10 text-indigo-600 px-3 py-1.5 rounded-lg inline-block`}>ROI: {path.roi_estimate}%</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Urban Mining */}
                        <div className={`${bgCard} border rounded-3xl p-8`}>
                            <h3 className={`font-bold text-xl mb-6 flex items-center justify-between ${textMain}`}>
                                <span className="flex items-center gap-2"><Cpu className="text-yellow-500" /> {isAr ? 'التعدين الحضري واسترجاع المواد' : 'Urban Mining Potential'}</span>
                                <span className="text-emerald-500 text-sm font-bold uppercase">{isAr ? 'القيمة التقديرية:' : 'Est. Value:'} {report.urban_mining_potential?.estimated_value_egp ?? 0} {isAr ? 'جنيه' : 'EGP'}</span>
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 text-center">
                                {Object.entries(report.urban_mining_potential?.materials || {}).map(([mat, weight]) => (
                                    <div key={mat} className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-yellow-200' : 'bg-black/40 border-yellow-500/20'}`}>
                                        <div className="text-xs font-bold uppercase text-gray-500 mb-2">{mat.replace('_g', '').replace(/_/g, ' ')}</div>
                                        <div className={`font-black ${textMain}`}>{weight as React.ReactNode} <span className="text-xs font-normal text-gray-400">g</span></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Security Risk */}
                        <div className={`border rounded-3xl p-8 ${report.security_risk_assessment?.risk_level === 'High' || report.security_risk_assessment?.risk_level === 'Critical' ? 'bg-red-500/5 border-red-500/30' : (isLight ? 'bg-orange-50 border-orange-200' : 'bg-orange-900/10 border-orange-500/20')}`}>
                            <h3 className={`font-bold text-xl mb-6 flex items-center justify-between ${textMain}`}>
                                <span className="flex items-center gap-2"><AlertOctagon className={report.security_risk_assessment?.risk_level === 'Critical' ? 'text-red-500' : 'text-orange-500'} /> {isAr ? 'تقييم المخاطر الأمنية' : 'Security & Data Risk Assessment'}</span>
                                <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${report.security_risk_assessment?.risk_level === 'Critical' || report.security_risk_assessment?.risk_level === 'High' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'}`}>
                                    {localizeRisk(report.security_risk_assessment?.risk_level || 'Unknown')} {isAr ? '' : 'RISK'}
                                </span>
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className={`text-sm font-bold uppercase mb-3 ${textSub}`}>{isAr ? 'المخاطر المحددة' : 'Identified Risks'}</h4>
                                    <ul className="space-y-2">
                                        {(report.security_risk_assessment?.identified_risks || []).map((r, i) => (
                                            <li key={i} className={`flex items-start gap-2 text-sm ${textMain}`}><AlertTriangle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" /> <span>{r}</span></li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className={`text-sm font-bold uppercase mb-3 ${textSub}`}>{isAr ? 'خطة مسح البيانات (Wipe Plan)' : 'Data Wipe Plan'}</h4>
                                    <ol className="space-y-2 list-decimal list-inside">
                                        {(report.security_risk_assessment?.data_wipe_plan || []).map((r, i) => (
                                            <li key={i} className={`text-sm ${textMain} marker:font-bold marker:text-emerald-500`}>{r}</li>
                                        ))}
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </MotionDiv>
                )}
            </div>
        </div>
    );
};

const Checkbox = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) => {
    const { theme } = useApp();
    const isLight = theme === 'light';
    return (
        <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${checked ? (isLight ? 'bg-emerald-50 border-emerald-300' : 'bg-emerald-500/20 border-emerald-500/30') : (isLight ? 'bg-white border-gray-200' : 'bg-black/40 border-white/10')}`}>
            <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="w-4 h-4 accent-emerald-500 flex-shrink-0" />
            <span className={`text-xs font-bold leading-tight ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>{label}</span>
        </label>
    );
}

export default EwasteRecycler;
