
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Recycle, Cpu, Smartphone, Laptop, Loader2, ArrowRight, CheckCircle2, Box, RefreshCw, Heart, Trash2, Info, AlertTriangle, Download, Save, AlertOctagon, Network, Scale, TrendingUp, Database, PackageCheck, Battery, Monitor, ShieldCheck, FileText, Camera, UploadCloud, Volume2, Usb, Image as ImageIcon } from 'lucide-react';
import { runEwasteAnalysis, analyzeEwasteOCR } from '../../services/tokenRouterService';
import { EwasteAnalysisReport } from '../../types';
import { usePersistentState } from '../../utils/storage';
import { exportAsPdf, exportAsPng } from '../../utils/export';
import { useApp } from '../../contexts/AppContext';
import BillUploader from '../../components/BillUploader';
import SdgBadge from '../../components/SdgBadge';
import CapabilityContext from '../../components/CapabilityContext';

const MotionDiv = motion.div as any;

interface EwasteRecyclerProps {
    report: EwasteAnalysisReport | null;
    setGlobalReport?: (report: EwasteAnalysisReport | null) => void;
}

const EwasteRecycler: React.FC<EwasteRecyclerProps> = ({ report, setGlobalReport }) => {
    const { t, theme, dir, language } = useApp();
    const isLight = theme === 'light';
    const isAr = language === 'ar';
    
    const [analyzing, setAnalyzing] = useState(false);
    const [exportingPdf, setExportingPdf] = useState(false);
    const [exportingPng, setExportingPng] = useState(false);
    
    // Inputs Mode
    const [activeTab, setActiveTab] = useState<'manual' | 'ocr'>('manual');
    const [ocrProcessing, setOcrProcessing] = useState(false);

    // Form State
    const [deviceType, setDeviceType] = usePersistentState('kre_type', 'Smartphone');
    const [brand, setBrand] = usePersistentState('kre_brand', 'Apple');
    const [model, setModel] = usePersistentState('kre_model', '');
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

    const handleAnalyze = async () => {
        setAnalyzing(true);
        try {
            const inputData = {
                deviceType, brand, model, purchaseYear, purchasePrice, dailyUsageHours, yearsOfUse, batteryHealth,
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

    const handleExportPdf = async () => {
        setExportingPdf(true);
        await exportAsPdf('ewaste-report-container', 'Kairo_Lifecycle_Report');
        setExportingPdf(false);
    };

    const handleExportPng = async () => {
        setExportingPng(true);
        await exportAsPng('ewaste-report-container', 'Kairo_Lifecycle_Report');
        setExportingPng(false);
    };

    const textMain = isLight ? 'text-gray-900' : 'text-white';
    const textSub = isLight ? 'text-gray-500' : 'text-gray-400';
    const bgCard = isLight ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10';
    const inputBg = isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-black/50 border-white/10 text-white';

    const getGradeColor = (grade: string) => {
        if (!grade) return 'text-gray-500';
        if (grade.includes('A')) return 'text-emerald-500';
        if (grade.includes('B')) return 'text-lime-500';
        if (grade.includes('C')) return 'text-yellow-500';
        if (grade.includes('D')) return 'text-orange-500';
        return 'text-red-500';
    };

    return (
        <div className={`min-h-screen pt-32 lg:pt-36 px-4 md:px-6 pb-20 ${isLight ? 'bg-slate-50' : 'bg-black'} transition-colors duration-500`} dir={dir}>
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
                        <SdgBadge sdgs={[11, 12]} />
                    </div>

                    <div className="flex gap-3 no-export">
                        {report && (
                            <>
                                <div className="flex bg-blue-500/10 border border-blue-500/20 rounded-xl overflow-hidden self-start mt-2">
                                    <button 
                                        onClick={handleExportPdf} 
                                        disabled={exportingPdf || exportingPng}
                                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-all text-blue-600 hover:bg-blue-500 hover:text-white ${isLight ? 'text-blue-700' : 'text-blue-400'}`}
                                        title="Export as PDF"
                                    >
                                        {exportingPdf ? <Loader2 className="w-4 h-4 animate-spin"/> : <FileText className="w-4 h-4" />}
                                        PDF
                                    </button>
                                    <div className="w-[1px] bg-blue-500/20"></div>
                                    <button 
                                        onClick={handleExportPng} 
                                        disabled={exportingPdf || exportingPng}
                                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-all text-blue-600 hover:bg-blue-500 hover:text-white ${isLight ? 'text-blue-700' : 'text-blue-400'}`}
                                        title="Export as PNG"
                                    >
                                        {exportingPng ? <Loader2 className="w-4 h-4 animate-spin"/> : <ImageIcon className="w-4 h-4" />}
                                        PNG
                                    </button>
                                </div>
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
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">{isAr ? 'النوع' : 'Type'}</label>
                                            <select value={deviceType} onChange={e => setDeviceType(e.target.value)} className={`w-full p-3 rounded-xl border ${inputBg}`} >
                                                {['Smartphone', 'Laptop', 'Tablet', 'Desktop PC', 'Monitor', 'Printer', 'Router', 'Gaming Console', 'Other'].map(v => <option key={v} value={v}>{v}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">{isAr ? 'الماركة' : 'Brand'}</label>
                                            <select value={brand} onChange={e => setBrand(e.target.value)} className={`w-full p-3 rounded-xl border ${inputBg}`} >
                                                {['Apple', 'Samsung', 'Xiaomi', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'Sony', 'Huawei', 'Other'].map(v => <option key={v} value={v}>{v}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">{isAr ? 'سنة الشراء' : 'Purchase Year'}</label>
                                            <input type="number" min="2000" max={new Date().getFullYear()} value={purchaseYear} onChange={e => setPurchaseYear(Number(e.target.value))} className={`w-full p-3 rounded-xl border ${inputBg}`} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">{isAr ? 'السعر التقريبي (EGP)' : 'Purchase Price (EGP)'}</label>
                                            <input type="number" min="0" value={purchasePrice} onChange={e => setPurchasePrice(Number(e.target.value))} className={`w-full p-3 rounded-xl border ${inputBg}`} />
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
                        {/* Executive Summary */}
                        <div className={`${bgCard} border rounded-3xl p-8 md:p-10 text-center relative overflow-hidden`}>
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500"></div>
                            <h2 className="text-sm font-bold uppercase text-gray-500 tracking-widest mb-6">{isAr ? 'التوصية النهائية' : 'Executive Recommendation'}</h2>
                            <div className={`text-4xl md:text-5xl font-black mb-6 ${textMain}`}>{report.recommended_pathway}</div>
                            <p className={`text-lg md:text-xl max-w-3xl mx-auto ${textSub} leading-relaxed`}>{report.ai_executive_recommendation}</p>
                        </div>

                        {/* Grading & Key Indicators */}
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className={`${bgCard} border rounded-3xl p-6 flex flex-col items-center text-center`}>
                                <div className="text-xs font-bold uppercase text-gray-500 mb-4">{isAr ? 'تقييم الجهاز' : 'Device Grade'}</div>
                                <div className={`text-4xl font-black mb-2 ${getGradeColor(report.device_grade)}`}>{report.device_grade}</div>
                                <div className={`text-sm ${textSub}`}>{isAr ? 'الحالة العامة للجهاز' : 'Overall Hardware State'}</div>
                            </div>
                            <div className={`${bgCard} border rounded-3xl p-6 flex flex-col items-center text-center`}>
                                <div className="text-xs font-bold uppercase text-gray-500 mb-4">{isAr ? 'صحة الجهاز' : 'Device Health'}</div>
                                <div className={`text-4xl font-black mb-2 ${textMain}`}>{report.device_health_score}<span className="text-xl text-gray-400">/100</span></div>
                                <div className={`text-sm ${textSub}`}>{isAr ? 'مؤشر الصلاحية التقنية' : 'Technical Viability Index'}</div>
                            </div>
                            <div className={`${bgCard} border rounded-3xl p-6 flex flex-col items-center text-center`}>
                                <div className="text-xs font-bold uppercase text-gray-500 mb-4">{isAr ? 'مؤشر الاقتصاد الدائري' : 'Circularity Score'}</div>
                                <div className={`text-4xl font-black mb-2 text-blue-500`}>{report.circular_economy_score}<span className="text-xl text-gray-400">/100</span></div>
                                <div className={`text-sm ${textSub}`}>{isAr ? 'تأثير الاستدامة' : 'Sustainability Impact'}</div>
                            </div>
                        </div>

                        {/* Economic & Environmental Columns */}
                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Economic Section */}
                            <div className={`${bgCard} border rounded-3xl p-8`}>
                                <h3 className={`font-bold text-xl mb-6 flex items-center gap-2 ${textMain}`}><TrendingUp className="text-emerald-500" /> {isAr ? 'التحليل الاقتصادي' : 'Economic Analysis'}</h3>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5">
                                        <div className={textSub}>{isAr ? 'القيمة السوقية الحالية' : 'Current Market Value'}</div>
                                        <div className={`font-bold text-lg ${textMain}`}>{report.economic_analysis?.current_market_value_egp?.toLocaleString() ?? 0} EGP</div>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5">
                                        <div className={textSub}>{isAr ? 'نسبة الاستهلاك (الإهلاك)' : 'Depreciation'}</div>
                                        <div className={`font-bold text-lg text-red-500`}>-{report.economic_analysis?.depreciation_percentage ?? 0}%</div>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5">
                                        <div className={textSub}>{isAr ? 'القيمة المتبقية' : 'Residual Value'}</div>
                                        <div className={`font-bold text-lg ${textMain}`}>{report.economic_analysis?.residual_value_egp?.toLocaleString() ?? 0} EGP</div>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5">
                                        <div className={textSub}>{isAr ? 'تكلفة الاستبدال' : 'Replacement Cost'}</div>
                                        <div className={`font-bold text-lg text-orange-500`}>{report.economic_analysis?.replacement_cost_egp?.toLocaleString() ?? 0} EGP</div>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5">
                                        <div className={textSub}>{isAr ? 'تكلفة مالكية كاملة' : 'Total Ownership Value'}</div>
                                        <div className={`font-bold text-lg ${textMain}`}>{report.economic_analysis?.total_ownership_value_egp?.toLocaleString() ?? 0} EGP</div>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5">
                                        <div className={textSub}>{isAr ? 'تكلفة التجديد التقديرية' : 'Estimated Refurbish Cost'}</div>
                                        <div className={`font-bold text-lg ${textMain}`}>{report.economic_analysis?.refurbish_cost_estimate_egp?.toLocaleString() ?? 0} EGP</div>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <div className={textSub}>{isAr ? 'عائد استثمار التجديد' : 'Refurbish ROI'}</div>
                                        <div className={`font-black text-xl text-emerald-500`}>+{report.economic_analysis?.refurbish_roi_percentage ?? 0}%</div>
                                    </div>
                                </div>
                            </div>

                            {/* Enivronmental Section */}
                            <div className={`${bgCard} border rounded-3xl p-8`}>
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
                        <div className={`${bgCard} border rounded-3xl p-8`}>
                            <h3 className={`font-bold text-xl mb-6 flex items-center gap-2 ${textMain}`}><Network className="text-purple-500" /> {isAr ? 'المسارات البديلة المتاحة' : 'Alternative Pathways'}</h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {(report.alternative_pathways || []).map((path, idx) => (
                                    <div key={idx} className={`p-5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'}`}>
                                        <div className="font-bold mb-2 text-indigo-500">{path.pathway}</div>
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
                                <span className="text-emerald-500 text-sm font-bold uppercase">{isAr ? 'القيمة التقديرية:' : 'Est. Value:'} {report.urban_mining_potential?.estimated_value_egp ?? 0} EGP</span>
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
                                <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${report.security_risk_assessment?.risk_level === 'Critical' || report.security_risk_assessment?.risk_level === 'High' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'}`}>{report.security_risk_assessment?.risk_level || 'Unknown'} RISK</span>
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
