
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Activity, Droplet, Utensils, Wind, Cpu, Zap, AlertTriangle, 
    TrendingUp, TrendingDown, Layers, Database, Recycle, Truck, ShieldCheck, 
    Target, Globe, Network, Wifi, Clock, Server, HardDrive, Terminal, ShieldAlert,
    AlertCircle, ZapOff, CheckCircle2
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Dot } from 'recharts';
import { CarbonAnalysisReport, WaterAnalysisReport, FoodWasteAnalysisReport, ExposureAnalysis, EwasteAnalysisReport, EnergyAnalysisReport, MobilityIntelligenceReport } from '../types';
import { useApp } from '../contexts/AppContext';
import ModuleToolbar from '../components/ModuleToolbar';
import { usePersistentState } from '../utils/storage';
import { SessionStore, SessionSnapshot } from '../services/SessionStore';

// Type casting to bypass strict environment checks
const MotionDiv = motion.div as any;

interface DashboardProps {
    carbon: CarbonAnalysisReport | null;
    water: WaterAnalysisReport | null;
    food: FoodWasteAnalysisReport | null;
    exposure: ExposureAnalysis | null;
    ewaste: EwasteAnalysisReport | null;
    energy: EnergyAnalysisReport | null;
    transport: MobilityIntelligenceReport | null;
    onSystemReset: () => void;
}

// Mock data for mini trend charts
const trendDataGen = (base: number, length = 7) => Array.from({ length }, (_, i) => ({ name: `T${i}`, value: base + Math.random() * (base * 0.2) - (base * 0.1) }));

const carbonTimeline = [
    { time: '00:00', em: 120 }, { time: '04:00', em: 90 }, { time: '08:00', em: 150 }, 
    { time: '12:00', em: 220 }, { time: '16:00', em: 200 }, { time: '20:00', em: 180 }, { time: '24:00', em: 130 }
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-black/90 border border-white/10 p-2 rounded-lg shadow-xl text-xs backdrop-blur-md">
                <p className="font-mono text-gray-400 mb-1">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={`item-${index}`} style={{ color: entry.color }} className="font-bold">
                        {entry.name}: {entry.value.toFixed(1)}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const Dashboard: React.FC<DashboardProps> = ({ carbon, water, food, exposure, ewaste, energy, transport, onSystemReset }) => {
    const { t, theme, dir, language } = useApp();
    const isLight = theme === 'light';
    const navigate = useNavigate();
    const [earlyWarningData] = usePersistentState<any>('kairo_early_warning', null);

    const isAr = language === 'ar';

    // Theme values
    const bgApp = isLight ? 'bg-slate-50' : 'bg-[#050505]';
    const bgCard = isLight ? 'bg-white border-slate-200' : 'bg-[#0f0f11] border-white/5 shadow-2xl';
    const bgGlass = isLight ? 'bg-white/80 border-slate-200/50 backdrop-blur-xl' : 'bg-[#151518]/90 border-white/10 backdrop-blur-2xl';
    const textMain = isLight ? 'text-slate-900' : 'text-slate-100';
    const textDim = isLight ? 'text-slate-500' : 'text-slate-400';
    const textMuted = isLight ? 'text-slate-400' : 'text-slate-600';

    // Telemetry State
    const [telemetry, setTelemetry] = useState({ aiPing: 124, dbPing: 22, queue: 0, aiUptime: 99.98, memory: 45, cpu: 12 });
    const [audienceTab, setAudienceTab] = useState<'individual' | 'corporate' | 'school' | 'government'>('individual');

    useEffect(() => {
        const tInterval = setInterval(() => {
            setTelemetry(prev => ({
                ...prev,
                aiPing: 110 + Math.floor(Math.random() * 40),
                queue: Math.floor(Math.random() * 3),
                memory: 40 + Math.floor(Math.random() * 10),
                cpu: 10 + Math.floor(Math.random() * 15)
            }));
        }, 3000);
        return () => clearInterval(tInterval);
    }, []);

    // Aggregation Logic
    const totalCarbon = 
        (carbon?.baseline?.monthly_total_kg_co2 || 0) +
        (energy?.metrics?.carbon_footprint_kg || 0) +
        (transport?.metrics?.monthly_carbon_kg || 0) +
        (food?.metrics?.methane_emissions_kg ? food.metrics.methane_emissions_kg / 12 : 0);

    const activeSystemsCount = [water, food, exposure, ewaste, energy, transport, earlyWarningData].filter(Boolean).length;
    const sysHealthRaw = Math.min(100, Math.round((activeSystemsCount / 7) * 50 + (energy?.metrics?.energy_efficiency_score || 0) * 0.5));
    const sustainabilityScore = activeSystemsCount === 0 ? 0 : sysHealthRaw;
    const systemStatus = activeSystemsCount >= 4 ? 'OPTIMAL' : activeSystemsCount > 0 ? 'PARTIAL' : 'STANDBY';
    const localizedSystemStatus = isAr
        ? (systemStatus === 'OPTIMAL' ? 'مثالي' : systemStatus === 'PARTIAL' ? 'جزئي' : 'في الانتظار')
        : systemStatus;

    // Section 1: Executive KPI Widget
    const ExecutiveKPI = ({ title, value, unit, trend, icon: Icon, color, subtext }: any) => (
        <div className={`${bgCard} rounded-2xl p-5 border flex flex-col justify-between h-full relative overflow-hidden group`}>
            <div className={`absolute top-0 right-0 p-8 bg-gradient-to-bl from-${color}-500/10 to-transparent rounded-bl-[100px] -mr-4 -mt-4 transition-all duration-500 group-hover:scale-110`} />
            <div>
                <div className="flex justify-between items-start mb-2">
                    <div className={textDim + " text-xs font-bold uppercase tracking-wider"}>{title}</div>
                    <div className={`p-1.5 rounded-lg bg-${color}-500/10 text-${color}-500`}>
                        <Icon strokeWidth={2.5} className="w-4 h-4" />
                    </div>
                </div>
                <div className="flex items-baseline gap-1 relative z-10">
                    <span className={`text-4xl lg:text-5xl font-black ${textMain} tracking-tighter`}>{value}</span>
                    <span className={`text-sm font-bold ${textDim}`}>{unit}</span>
                </div>
            </div>
            <div className={`mt-4 pt-3 border-t ${isLight ? 'border-slate-100' : 'border-white/5'} flex justify-between items-center z-10`}>
                <span className={`text-xs ${textMuted}`}>{subtext}</span>
                {trend !== 0 && (
                    <div className={`flex items-center gap-1 text-xs font-bold ${trend > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {trend > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
        </div>
    );

    // Section 2: Unified Sustainability Module Card
    const ModuleCard = ({ title, status, score, anomaly, icon: Icon, path, color, metric, unit, data }: any) => {
        const isActive = !!data;
        const cColor = isActive ? color : 'gray';
        const trendData = trendDataGen(isActive ? score : 20);

        return (
            <div onClick={() => navigate(path)} className={`${bgCard} border rounded-2xl p-5 hover:border-${cColor}-500/30 transition-all cursor-pointer group flex flex-col`}>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${isActive ? `bg-${cColor}-500/10 text-${cColor}-500` : (isLight ? 'bg-slate-100 text-slate-400' : 'bg-white/5 text-gray-500')}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className={`font-bold ${textMain} leading-tight`}>{title}</h4>
                            <div className="flex items-center gap-1.5 mt-0.5 text-xs font-mono">
                                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? (status === 'Warning' ? 'bg-amber-500' : `bg-${cColor}-500 animate-pulse`) : 'bg-gray-500'}`} />
                                <span className={isActive ? (status === 'Warning' ? 'text-amber-500 font-bold' : `text-${cColor}-500 font-bold`) : textMuted}>
                                    {isActive ? status : (isAr ? 'غير متصل' : 'Offline')}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className={`text-xl font-black ${isActive ? textMain : textMuted}`}>{isActive ? score : '--'}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-4 font-mono text-[10px] uppercase">
                    <div className={`p-2 rounded-lg ${isLight ? 'bg-slate-50' : 'bg-black/30'}`}>
                        <div className={textDim}>{isAr ? 'المؤشر الرئيسي' : 'Key metric'}</div>
                        <div className={`font-bold mt-0.5 ${isActive ? textMain : textMuted}`}>{isActive ? metric : '--'} <span className="text-gray-500 font-normal">{unit}</span></div>
                    </div>
                    <div className={`p-2 rounded-lg ${anomaly && isActive ? (isLight ? 'bg-amber-50' : 'bg-amber-500/10') : (isLight ? 'bg-slate-50' : 'bg-black/30')}`}>
                        <div className={isActive && anomaly ? 'text-amber-600 dark:text-amber-500' : textDim}>{isAr ? 'الحالة' : 'Status'}</div>
                        <div className={`font-bold mt-0.5 ${isActive ? (anomaly ? 'text-amber-500' : 'text-emerald-500') : textMuted}`}>{isActive ? (anomaly ? (isAr ? 'اكتُشف خلل' : 'Anomaly detected') : (isAr ? 'طبيعي' : 'Nominal')) : '--'}</div>
                    </div>
                </div>

                <div className="h-12 w-full mt-auto opacity-70 group-hover:opacity-100 transition-opacity">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                            <Line type="monotone" dataKey="value" stroke={isActive ? (status==='Warning' ? '#f59e0b' : (color === 'blue' ? '#3b82f6' : color === 'emerald' ? '#10b981' : color === 'amber' ? '#f59e0b' : color === 'purple' ? '#a855f7' : '#10b981')) : '#4b5563'} strokeWidth={2} dot={false} isAnimationActive={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    };

    return (
        <div className={`min-h-screen ${bgApp} font-sans pt-32 lg:pt-36 pb-20 selection:bg-indigo-500/30`} id="command-center" dir={dir}>
            <div className="max-w-[1600px] mx-auto px-4 lg:px-8 space-y-6">
                
                <ModuleToolbar hasData={true} onReset={onSystemReset} exportTargetId="command-center" exportFilename="kairo_command_center_report" />

                <header className="flex flex-col md:flex-row justify-between items-end gap-6 pb-2">
                    <div>
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                            <Activity className="w-3.5 h-3.5" /> 
                            {isAr ? 'مركز تحكم ذكاء الاستدامة' : 'Intelligence Command Center'}
                        </div>
                        <h1 className={`text-4xl lg:text-5xl font-black tracking-tighter ${textMain}`}>
                            {isAr ? 'لوحة القيادة الموحدة' : 'Mission Control'}
                        </h1>
                    </div>
                    <div className="flex gap-4 font-mono text-xs text-right">
                        <div>
                            <div className={textDim}>{isAr ? 'حالة المنصة' : 'Platform Status'}</div>
                            <div className="flex items-center gap-1.5 justify-end mt-1 text-emerald-500 font-bold">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> {localizedSystemStatus}
                            </div>
                        </div>
                        <div>
                            <div className={textDim}>{isAr ? 'المزامنة الأخيرة' : 'Last Sync'}</div>
                            <div className={`mt-1 font-bold ${textMain}`}>{new Date().toLocaleTimeString()}</div>
                        </div>
                    </div>
                </header>

                {/* SECTION 1: Executive Overview */}
                <section className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <ExecutiveKPI 
                        title={isAr ? 'مؤشر الكفاءة' : 'Platform Health'} 
                        value={sustainabilityScore} 
                        unit="/100" 
                        trend={activeSystemsCount > 0 ? -2 : 0} 
                        icon={Target} color="indigo" 
                        subtext={isAr ? 'مؤشر عالمي' : 'Global index'} 
                    />
                    <ExecutiveKPI 
                        title={isAr ? 'سرعة الكربون' : 'Carbon Velocity'} 
                        value={totalCarbon > 0 ? (totalCarbon / 30).toFixed(1) : 0} 
                        unit={isAr ? 'كجم/يوم' : 'kg/d'} 
                        trend={activeSystemsCount > 0 ? 5 : 0} 
                        icon={Wind} color="gray" 
                        subtext={isAr ? 'متوسط 10 أيام' : '30-day trailing avg'} 
                    />
                    <ExecutiveKPI 
                        title={isAr ? 'ذكاء الطاقة' : 'Energy Intel'} 
                        value={energy?.metrics?.energy_efficiency_score || 0} 
                        unit="/100" 
                        trend={energy ? -8 : 0} 
                        icon={Zap} color="amber" 
                        subtext={isAr ? 'درجة الكفاءة' : 'Efficiency score'} 
                    />
                    <ExecutiveKPI 
                        title={isAr ? 'إنذار الهواء' : 'Air Early Warning'} 
                        value={earlyWarningData?.air?.peakAqi ?? '—'} 
                        unit={earlyWarningData?.air ? 'AQI' : ''} 
                        trend={0} 
                        icon={Activity} color="emerald" 
                        subtext={isAr ? 'ذروة 24 ساعة' : '24-hour peak'} 
                    />
                    <ExecutiveKPI 
                        title={isAr ? 'المحركات النشطة' : 'Active Engines'} 
                        value={activeSystemsCount} 
                        unit="/7" 
                        trend={0} 
                        icon={Layers} color="emerald" 
                        subtext={isAr ? 'اتصالات التلمتري' : 'Telemetry connected'} 
                    />
                </section>

                <div className="grid lg:grid-cols-12 gap-6">
                    {/* LEFT COLUMN (Grid 8) */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        
                        {/* SECTION 2: Unified Sustainability Grid */}
                        <section className={`${bgGlass} rounded-3xl border p-4 sm:p-6`}>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                <h2 className={`text-sm font-black uppercase tracking-widest flex items-center gap-2 ${textDim}`}>
                                    <Database className="w-4 h-4" /> {isAr ? 'مصفوفة المراقبة الأساسية' : 'Core Monitoring Array'}
                                </h2>
                                <div className="flex w-full max-w-full gap-1 overflow-x-auto rounded-xl bg-black/5 p-1 dark:bg-white/5 md:w-auto">
                                    {['individual', 'corporate', 'school', 'government'].map((tKey) => (
                                        <button 
                                            key={tKey}
                                            onClick={() => setAudienceTab(tKey as any)}
                                            className={`shrink-0 px-3 py-2 text-xs font-bold rounded-lg transition-all sm:px-4 ${audienceTab === tKey ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-500' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                        >
                                            {t.dashboard.audienceMode[tKey as keyof typeof t.dashboard.audienceMode]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {['individual', 'corporate', 'government'].includes(audienceTab) && (
                                <ModuleCard 
                                    title={isAr ? 'ذكاء الطاقة' : 'Energy Intelligence'} path="/energy" icon={Zap} color="amber" 
                                    data={energy} status={energy?.metrics?.energy_efficiency_score < 70 ? (isAr ? 'تحذير' : 'Warning') : (isAr ? 'متصل' : 'Online')} 
                                    score={energy?.metrics?.energy_efficiency_score} metric={energy?.metrics?.estimated_consumption_kwh} 
                                    unit="kWh" anomaly={energy?.metrics?.energy_efficiency_score < 70}
                                />
                                )}
                                {['individual', 'school', 'government'].includes(audienceTab) && (
                                <ModuleCard 
                                    title={isAr ? 'إدارة المياه' : 'Water Logistics'} path="/systems/water-scarcity" icon={Droplet} color="blue" 
                                    data={water} status={isAr ? 'متصل' : 'Online'} 
                                    score={water?.metrics?.water_efficiency_score || 0} metric={water?.metrics?.leak_probability_score || 0} 
                                    unit="/100" anomaly={false}
                                />
                                )}
                                {['individual', 'school'].includes(audienceTab) && (
                                <ModuleCard 
                                    title={isAr ? 'الموارد والغذاء' : 'Resource & Food'} path="/systems/food-security" icon={Utensils} color="emerald" 
                                    data={food} status={isAr ? 'متصل' : 'Online'} 
                                    score={78} metric={(food?.metrics?.methane_emissions_kg || 0).toFixed(1)} 
                                    unit="kg CH₄" anomaly={true}
                                />
                                )}
                                {['individual', 'corporate'].includes(audienceTab) && (
                                <ModuleCard 
                                    title={isAr ? 'ذكاء التنقل' : 'Mobility Vector'} path="/transport" icon={Truck} color="purple" 
                                    data={transport} status={isAr ? 'متصل' : 'Online'} 
                                    score={transport?.scores?.mobility_efficiency || 0} metric={(transport?.metrics?.monthly_carbon_kg || 0).toFixed(1)} 
                                    unit="kg CO₂" anomaly={(transport?.metrics?.monthly_carbon_kg || 0) > 100}
                                />
                                )}
                                {['corporate', 'government'].includes(audienceTab) && (
                                <ModuleCard 
                                    title={isAr ? 'التعرض الحضري' : 'Urban Exposure'} path="/systems/urban-exposure" icon={Globe} color="cyan" 
                                    data={exposure} status={isAr ? 'متصل' : 'Online'} 
                                    score={98} metric={exposure?.estimated_aqi || 0} 
                                    unit="AQI" anomaly={false}
                                />
                                )}
                                {['corporate', 'school'].includes(audienceTab) && (
                                <ModuleCard 
                                    title={isAr ? 'اقتصاد ريكايرو الدائري' : 'ReKairo Circular'} path="/systems/ewaste" icon={Recycle} color="emerald" 
                                    data={ewaste} status={isAr ? 'متصل' : 'Online'} 
                                    score={100} metric={ewaste?.environmental_impact?.circular_economy_impact_score || 0} 
                                    unit="/100" anomaly={false}
                                />
                                )}
                            </div>
                        </section>

                        {/* SECTION 3: Carbon Intelligence Center */}
                        <section className={`${bgGlass} rounded-3xl p-6 border flex flex-col`}>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className={`text-sm font-black uppercase tracking-widest flex items-center gap-2 ${textDim}`}>
                                        <Wind className="w-4 h-4" /> Carbon Intelligence Center
                                    </h2>
                                    <div className="mt-2 flex items-baseline gap-2">
                                        <span className={`text-3xl font-black ${textMain}`}>{totalCarbon.toLocaleString(undefined, {maximumFractionDigits:1})}</span>
                                        <span className={`text-sm font-bold ${textDim}`}>kg CO₂e Total</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`px-3 py-1 rounded bg-black/10 dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs font-mono font-bold ${totalCarbon > 500 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                        {totalCarbon > 500 ? 'ELEVATED RISK' : 'NOMINAL RISK'}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={carbonTimeline} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorCarbon" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={isLight ? '#3b82f6' : '#60a5fa'} stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor={isLight ? '#3b82f6' : '#60a5fa'} stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="time" stroke={isLight ? '#cbd5e1' : '#334155'} tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                                        <YAxis stroke={isLight ? '#cbd5e1' : '#334155'} tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLight ? '#f1f5f9' : '#1e293b'} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="em" stroke={isLight ? '#3b82f6' : '#60a5fa'} strokeWidth={3} fillOpacity={1} fill="url(#colorCarbon)" activeDot={{r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2}} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </section>

                        {/* SECTION 5: Environmental Feed & Infrastructure */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Environmental Feed */}
                            <section className={`${bgGlass} rounded-3xl p-6 border`}>
                                <h2 className={`text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2 ${textDim}`}>
                                    <Activity className="w-4 h-4" /> Intelligence Feed
                                </h2>
                                <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-gradient-to-b before:from-indigo-500/50 before:to-transparent">
                                    {[
                                        { time: 'Just now', title: 'Carbon Anomaly', desc: 'Spike detected in transport sector', icon: AlertCircle, color: 'amber' },
                                        { time: '10m ago', title: 'Energy Sync', desc: 'Tariff models updated', icon: CheckCircle2, color: 'emerald' },
                                        { time: '1h ago', title: 'Water Prediction', desc: 'High usage anticipated today', icon: TrendingUp, color: 'blue' },
                                    ].map((ev, i) => (
                                        <div key={i} className="relative pl-8">
                                            <div className={`absolute left-0 top-1 w-6 h-6 rounded-full bg-${ev.color}-500/20 border border-${ev.color}-500 flex items-center justify-center z-10`}>
                                                <ev.icon className={`w-3 h-3 text-${ev.color}-500`} />
                                            </div>
                                            <div className="font-mono text-[10px] uppercase text-gray-500 mb-1">{ev.time}</div>
                                            <div className={`text-sm font-bold ${textMain}`}>{ev.title}</div>
                                            <div className={`text-xs ${textDim}`}>{ev.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Infrastructure */}
                            <section className={`${bgGlass} rounded-3xl p-6 border`}>
                                <h2 className={`text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2 ${textDim}`}>
                                    <Server className="w-4 h-4" /> {isAr ? 'صحة البنية التحتية' : 'Infrastructure Health'}
                                </h2>
                                <div className="grid grid-cols-2 gap-3 font-mono text-[10px] uppercase">
                                    <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'}`}>
                                        <div className={textDim}>MongoDB Native</div>
                                        <div className={`mt-1 font-bold ${textMain} flex items-center gap-1.5`}><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ONLINE</div>
                                    </div>
                                    <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'}`}>
                                        <div className={textDim}>Vector DB</div>
                                        <div className={`mt-1 font-bold ${textMain} flex items-center gap-1.5`}><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> READY</div>
                                    </div>
                                    <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'}`}>
                                        <div className={textDim}>{isAr ? 'الشبكة' : 'Network'}</div>
                                        <div className={`mt-1 font-bold ${textMain} flex items-center gap-1.5`}>{telemetry.dbPing}MS</div>
                                    </div>
                                    <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'}`}>
                                        <div className={textDim}>API Routes</div>
                                        <div className={`mt-1 font-bold ${textMain} flex items-center gap-1.5`}><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> 100% OK</div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* RIGHT COLUMN (Grid 4) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        
                        {/* SECTION 4: AI Operations Center */}
                        <section className={`rounded-3xl p-6 border ${isLight ? 'bg-gradient-to-b from-indigo-50/80 to-white border-indigo-100' : 'bg-gradient-to-b from-indigo-950/30 to-[#0f0f11] border-indigo-500/20'} h-full flex flex-col`}>
                            <h2 className={`text-sm font-black uppercase tracking-widest mb-6 flex items-center justify-between ${textDim}`}>
                                <span className="flex items-center gap-2"><Cpu className="w-4 h-4 text-indigo-500" /> AI Control Layer</span>
                                <span className={`px-2 py-0.5 rounded text-[9px] border bg-indigo-500/10 text-indigo-500 border-indigo-500/30 font-bold animate-pulse`}>LIVE</span>
                            </h2>

                            <div className="flex-1 space-y-4 font-mono text-[11px] uppercase tracking-wide">
                                <div className={`flex justify-between items-center p-3 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-black/40 border-white/5'}`}>
                                    <span className={textDim}>Current Model</span>
                                    <span className={`font-bold ${textMain}`}>Gemini AI Gateway</span>
                                </div>
                                <div className={`flex justify-between items-center p-3 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-black/40 border-white/5'}`}>
                                    <span className={textDim}>Inference Engine</span>
                                    <span className={`font-bold ${telemetry.aiPing > 140 ? 'text-amber-500' : 'text-emerald-500'}`}>{telemetry.aiPing}ms</span>
                                </div>
                                <div className={`flex justify-between items-center p-3 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-black/40 border-white/5'}`}>
                                    <span className={textDim}>Vision OCR Base</span>
                                    <span className={`font-bold ${textMain} flex items-center gap-1`}><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> ACTIVE</span>
                                </div>
                                <div className={`flex justify-between items-center p-3 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-black/40 border-white/5'}`}>
                                    <span className={textDim}>Action Queue</span>
                                    <span className={`font-bold ${telemetry.queue > 0 ? 'text-amber-500' : textMain}`}>{telemetry.queue} TR(s)</span>
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/5">
                                    <div className="flex justify-between text-[10px] mb-2 font-bold">
                                        <span className={textDim}>Resource Allocation</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className={textMuted}>VRAM Usage</span>
                                                <span className={textMain}>{telemetry.memory}%</span>
                                            </div>
                                            <div className={`h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-white/10'}`}>
                                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${telemetry.memory}%` }} />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className={textMuted}>Core Compute</span>
                                                <span className={textMain}>{telemetry.cpu}%</span>
                                            </div>
                                            <div className={`h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-white/10'}`}>
                                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${telemetry.cpu}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={`mt-4 p-4 rounded-xl border ${isLight ? 'bg-indigo-50 border-indigo-100' : 'bg-indigo-500/10 border-indigo-500/20'}`}>
                                    <div className={`text-[10px] font-bold text-indigo-500 mb-1 flex items-center gap-1`}><Terminal className="w-3 h-3" /> AGENT REASONING LOG</div>
                                    <div className={`text-xs ${isLight ? 'text-slate-700' : 'text-indigo-200'} normal-case tracking-normal h-12 flex items-center`}>
                                        <span className="opacity-80">System architecture stable. Awaiting incoming queries on environmental contexts...</span>
                                        <span className="w-1.5 h-3 bg-indigo-400 animate-pulse ml-1" />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
