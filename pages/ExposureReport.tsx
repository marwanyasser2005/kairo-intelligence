
import React, { useState } from 'react';
import { ShieldAlert, Loader2, AlertCircle, Clock, MapPin, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { runExposureAgent } from '../services/tokenRouterService';
import { ExposureAnalysis } from '../types';
import { useApp } from '../contexts/AppContext';
import DecisionIntelligence from '../components/DecisionIntelligence';

// Type casting to bypass strict environment checks
const MotionDiv = motion.div as any;

const ExposureReport: React.FC = () => {
  const { t, dir, language, theme } = useApp();
  const isLight = theme === 'light';
  const pageBg = isLight ? 'bg-[#edf4f1] text-slate-950' : 'bg-kairo-ink text-white';
  const panelBg = isLight ? 'bg-white border-emerald-950/10' : 'bg-white/5 border-white/10';
  const inputBg = isLight ? 'bg-slate-50 border-slate-200 text-slate-950' : 'bg-black/40 border-white/10 text-white';
  const textSub = isLight ? 'text-slate-600' : 'text-slate-400';
  const [analyzing, setAnalyzing] = useState(false);
  const [data, setData] = useState<ExposureAnalysis | null>(null);
  
  // Form State
  const [locationName, setLocationName] = useState('Cairo, Egypt');
  const [hoursOutdoors, setHoursOutdoors] = useState(2);
  const [transportMode, setTransportMode] = useState('Public Bus');

  const handleAnalysis = async () => {
    setAnalyzing(true);
    try {
      const result = await runExposureAgent({ locationName, hoursOutdoors, transportMode }, language);
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className={`min-h-screen pt-28 sm:pt-32 lg:pt-36 px-4 sm:px-6 pb-20 ${pageBg}`} dir={dir}>
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider mb-4 border border-red-500/20">
              <ShieldAlert className="w-3 h-3" /> {t.exposure.console}
           </div>
           <h1 className="text-4xl font-bold mb-4">{t.exposureReport.title}</h1>
           <p className={textSub}>{t.exposureReport.desc}</p>
        </header>

        <div className="grid lg:grid-cols-3 gap-5 lg:gap-8 mb-12">
            <div className="md:col-span-1 space-y-6">
                <div className={`kairo-analysis-panel border rounded-2xl p-5 sm:p-6 ${panelBg}`}>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t.exposureReport.location}</label>
                    <div className={`flex items-center border rounded-xl px-3 py-2 mb-4 ${inputBg}`}>
                        <MapPin className={`w-4 h-4 text-gray-500 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                        <input 
                            type="text" 
                            value={locationName} 
                            onChange={(e) => setLocationName(e.target.value)}
                            className="bg-transparent text-inherit text-sm w-full focus:outline-none"
                        />
                    </div>

                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t.exposureReport.hours}</label>
                    <div className={`flex items-center border rounded-xl px-3 py-2 mb-4 ${inputBg}`}>
                        <Clock className={`w-4 h-4 text-gray-500 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                        <input 
                            type="number" 
                            min="0"
                            max="24"
                            value={hoursOutdoors} 
                            onChange={(e) => setHoursOutdoors(Number(e.target.value))}
                            className="bg-transparent text-inherit text-sm w-full focus:outline-none"
                        />
                    </div>

                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t.exposureReport.commute}</label>
                    <select 
                        value={transportMode}
                        onChange={(e) => setTransportMode(e.target.value)}
                        className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none appearance-none ${inputBg}`}
                    >
                        <option value="Walking">{t.exposureReport.options.walking}</option>
                        <option value="Bicycle">{t.exposureReport.options.bicycle}</option>
                        <option value="Public Bus">{t.exposureReport.options.bus}</option>
                        <option value="Metro">{t.exposureReport.options.metro}</option>
                        <option value="Private Car">{t.exposureReport.options.car}</option>
                        <option value="Motorcycle">{t.exposureReport.options.motorcycle}</option>
                    </select>

                    <button 
                        onClick={handleAnalysis}
                        disabled={analyzing}
                        className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                        {t.exposureReport.analyze}
                    </button>
                </div>
            </div>

            <div className="md:col-span-2">
                {data ? (
                    <MotionDiv initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className={`kairo-analysis-panel border rounded-2xl p-5 sm:p-8 relative overflow-hidden ${panelBg}`}>
                            <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:justify-between sm:items-start">
                                <div>
                                    <div className="text-sm text-gray-400 mb-1">{t.exposureReport.riskLevel}</div>
                                    <div className={`text-4xl font-bold ${
                                        data.risk_level === 'Critical' ? 'text-red-500' :
                                        data.risk_level === 'High' ? 'text-orange-500' :
                                        data.risk_level === 'Moderate' ? 'text-yellow-400' : 'text-green-500'
                                    }`}>
                                        {data.risk_level}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-400 mb-1">{t.exposureReport.annualIntake}</div>
                                    <div className="kairo-metric-value text-2xl font-bold">{data.predicted_annual_accumulation_pm25} <span className="text-sm text-gray-500">µg</span></div>
                                </div>
                            </div>
                            <div className={`mt-6 p-4 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'}`}>
                                <p className={`text-sm leading-relaxed ${textSub}`}>{data.health_implication}</p>
                            </div>
                        </div>

                        <DecisionIntelligence
                            module="exposure"
                            score={Math.max(0, 100 - Math.min(100, (data.estimated_aqi || 0) / 2))}
                            status={data.risk_level}
                            confidence="estimated"
                        />

                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className={`kairo-analysis-panel border rounded-2xl p-5 sm:p-6 ${panelBg}`}>
                                <h3 className="font-bold mb-4 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-400" /> {t.exposureReport.peakTimes}
                                </h3>
                                <ul className="space-y-2">
                                    {data.peak_exposure_times.map((time, i) => (
                                        <li key={i} className={`text-sm flex items-center gap-2 ${textSub}`}>
                                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> {time}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className={`kairo-analysis-panel border rounded-2xl p-5 sm:p-6 ${panelBg}`}>
                                <h3 className="font-bold mb-4 flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4 text-green-400" /> {t.exposureReport.mitigation}
                                </h3>
                                <ul className="space-y-2">
                                    {data.mitigation_strategy.map((item, i) => (
                                        <li key={i} className={`text-sm flex items-start gap-2 ${textSub}`}>
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5" /> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </MotionDiv>
                ) : (
                    <div className={`kairo-analysis-panel h-full min-h-80 flex flex-col items-center justify-center border rounded-2xl p-6 sm:p-12 text-center ${panelBg}`}>
                        <Activity className="w-12 h-12 text-gray-600 mb-4" />
                        <h3 className="text-xl font-bold text-gray-300 mb-2">{t.exposureReport.awaiting}</h3>
                        <p className="text-gray-500 max-w-sm">{t.exposureReport.awaitingDesc}</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ExposureReport;
