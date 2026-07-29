
import React, { useState } from 'react';
import { Wind, Satellite, Activity, AlertCircle, ArrowRight, Shield, MapPin, Clock, Loader2, Info, Eye, Download, RefreshCw, Save, FileText, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { runExposureAgent } from '../../services/tokenRouterService';
import { ExposureAnalysis } from '../../types';
import { usePersistentState } from '../../utils/storage';
import { exportAsPdf, exportAsPng } from '../../utils/export';
import { useApp } from '../../contexts/AppContext';
import SdgBadge from '../../components/SdgBadge';
import CapabilityContext from '../../components/CapabilityContext';

// Type casting to bypass strict environment checks
const MotionDiv = motion.div as any;

interface UrbanExposureProps {
    report: ExposureAnalysis | null;
    setGlobalReport?: (report: ExposureAnalysis | null) => void;
}

const UrbanExposure: React.FC<UrbanExposureProps> = ({ report, setGlobalReport }) => {
  const { t, theme, dir, language } = useApp();
  const isLight = theme === 'light';
  const [analyzing, setAnalyzing] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingPng, setExportingPng] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Inputs - Persisted locally
  const [locationName, setLocationName] = usePersistentState('kairo_exposure_loc', 'Cairo, Egypt');
  const [coordinates, setCoordinates] = usePersistentState<{lat: number, lon: number} | null>('kairo_exposure_coords', null);
  const [hoursOutdoors, setHoursOutdoors] = usePersistentState('kairo_exposure_hours', 2);
  const [transportMode, setTransportMode] = usePersistentState('kairo_exposure_mode', 'Public Bus');

  const handleGetLocation = () => {
    setGeoError(null);
    if (!navigator.geolocation) {
        setGeoError("Geolocation not supported");
        return;
    }
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            setCoordinates({ lat: pos.coords.latitude, lon: pos.coords.longitude });
            setLocationName(`Lat: ${pos.coords.latitude.toFixed(4)}, Lon: ${pos.coords.longitude.toFixed(4)}`);
        },
        (err) => {
            setGeoError("Location access denied");
        }
    );
  };

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    try {
        const payload = {
            locationName,
            lat: coordinates?.lat,
            lon: coordinates?.lon,
            hoursOutdoors,
            transportMode
        };
        const result = await runExposureAgent(payload, language);
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

  const handleExportPdf = async () => {
      setExportingPdf(true);
      await exportAsPdf('exposure-report-container', 'kairo_exposure_analysis');
      setExportingPdf(false);
  };

  const handleExportPng = async () => {
      setExportingPng(true);
      await exportAsPng('exposure-report-container', 'kairo_exposure_analysis');
      setExportingPng(false);
  };

  const textMain = isLight ? 'text-gray-900' : 'text-white';
  const textSub = isLight ? 'text-gray-600' : 'text-gray-400';
  const bgCard = isLight ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10';
  const inputBg = isLight ? 'bg-white border-gray-200' : 'bg-black border-white/20';

  return (
    <div className={`min-h-screen pt-32 lg:pt-36 px-6 pb-20 transition-colors duration-500 ${isLight ? 'bg-gray-50' : 'bg-black'}`} dir={dir}>
      <div className="max-w-6xl mx-auto">
        <CapabilityContext capabilityId="exposure" />
        
        {/* Workflow Toolbar */}
        <div className="flex justify-end gap-3 mb-8 no-export">
            {report && (
                <>
                    <div className={`flex border rounded-lg overflow-hidden ${isLight ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`}>
                        <button 
                            onClick={handleExportPdf} 
                            disabled={exportingPdf || exportingPng}
                            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold transition-colors ${isLight ? 'text-gray-700 hover:bg-gray-50' : 'text-gray-300 hover:bg-white/10'}`}
                        >
                            {exportingPdf ? <Loader2 className="w-3 h-3 animate-spin"/> : <FileText className="w-3 h-3" />}
                            PDF
                        </button>
                        <div className={`w-[1px] ${isLight ? 'bg-gray-200' : 'bg-white/10'}`}></div>
                        <button 
                            onClick={handleExportPng} 
                            disabled={exportingPdf || exportingPng}
                            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold transition-colors ${isLight ? 'text-gray-700 hover:bg-gray-50' : 'text-gray-300 hover:bg-white/10'}`}
                        >
                            {exportingPng ? <Loader2 className="w-3 h-3 animate-spin"/> : <ImageIcon className="w-3 h-3" />}
                            PNG
                        </button>
                    </div>
                    <button 
                        onClick={handleReset} 
                        className="flex items-center gap-2 px-4 py-2 bg-red-900/20 hover:bg-red-900/30 border border-red-500/20 rounded-lg text-xs font-bold text-red-400 transition-colors"
                    >
                        <RefreshCw className="w-3 h-3" />
                        {t.common.reset}
                    </button>
                </>
            )}
        </div>

        {/* Hero Section */}
        <header className="mb-20 max-w-4xl">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/30 text-red-400 text-xs font-bold uppercase tracking-wider mb-6 border border-red-500/30">
              <Wind className="w-3 h-3" /> Core System
           </div>
           <h1 className={`text-5xl md:text-7xl font-bold mb-6 leading-tight ${textMain}`}>
             {t.exposure.title}
           </h1>
           <p className={`text-xl md:text-2xl leading-relaxed mb-6 ${textSub}`}>
             {t.exposure.desc}
           </p>
           <SdgBadge sdgs={[11, 13]} />
           <div className="flex items-center gap-4 text-sm text-gray-500 font-mono border-l-2 border-red-500 pl-4 mt-8">
              <Satellite className="w-4 h-4" />
              <span>Context: Sentinel-5P Tropospheric Modeling</span>
           </div>
        </header>

        {/* SYSTEM INTERFACE */}
        <div className="grid lg:grid-cols-3 gap-8 mb-24">
            
            {/* Input Console */}
            <div className="lg:col-span-1 no-export">
                <div className={`${bgCard} border rounded-2xl p-6 sticky top-28`}>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        {t.exposure.console}
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="text-xs text-gray-400 font-mono uppercase mb-2 block">{t.exposure.location}</label>
                            <div className="flex gap-2">
                                <div className={`flex-1 flex items-center rounded-lg px-3 py-3 ${inputBg}`}>
                                    <MapPin className="w-4 h-4 text-gray-500 ltr:mr-2 rtl:ml-2" />
                                    <input 
                                        type="text" 
                                        value={locationName} 
                                        onChange={(e) => setLocationName(e.target.value)}
                                        className={`bg-transparent text-sm w-full focus:outline-none ${textMain}`}
                                        placeholder="City or Coordinates"
                                    />
                                </div>
                                <button 
                                    onClick={handleGetLocation}
                                    className={`px-3 rounded-lg transition-colors ${isLight ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                    title="Get GPS Coords"
                                >
                                    <Satellite className="w-4 h-4" />
                                </button>
                            </div>
                            {geoError && <div className="text-[10px] text-red-400 mt-1">{geoError}</div>}
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 font-mono uppercase mb-2 block">{t.exposure.hours}</label>
                            <div className={`flex items-center rounded-lg px-3 py-3 ${inputBg}`}>
                                <Clock className="w-4 h-4 text-gray-500 ltr:mr-2 rtl:ml-2" />
                                <input 
                                    type="number" 
                                    min="0"
                                    max="24"
                                    value={hoursOutdoors} 
                                    onChange={(e) => setHoursOutdoors(Number(e.target.value))}
                                    className={`bg-transparent text-sm w-full focus:outline-none ${textMain}`}
                                />
                            </div>
                        </div>

                         <div>
                             <label className="text-xs text-gray-400 font-mono uppercase mb-2 block">{t.exposure.commute}</label>
                             <select 
                                value={transportMode} 
                                onChange={(e) => setTransportMode(e.target.value)}
                                className={`w-full rounded-lg p-3 focus:border-red-500 focus:outline-none text-sm ${inputBg} ${textMain}`}
                            >
                                <option>Walking</option>
                                <option>Bicycle</option>
                                <option>Public Bus</option>
                                <option>Metro</option>
                                <option>Private Car</option>
                                <option>Motorcycle</option>
                            </select>
                        </div>

                        <button 
                            onClick={handleRunAnalysis}
                            disabled={analyzing}
                            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                            {t.common.runAnalysis}
                        </button>
                    </div>
                </div>
            </div>

            {/* Output Display */}
            <div className="lg:col-span-2" id="exposure-report-container">
                <AnimatePresence mode="wait">
                    {report ? (
                        <MotionDiv 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-2 mb-4 bg-red-900/10 border border-red-500/20 p-3 rounded-lg text-red-400 text-xs font-bold uppercase tracking-wide w-fit">
                                <Save className="w-3 h-3" /> {t.common.saved}
                            </div>

                            {/* Summary Card */}
                            <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Shield className="w-32 h-32 text-red-500" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-6">
                                        <div>
                                            <div className="text-sm text-gray-400 mb-1 font-mono uppercase">{t.exposure.aqi}</div>
                                            <div className={`text-6xl font-bold mb-1 ${
                                                (report.estimated_aqi || 0) > 150 ? 'text-red-500' :
                                                (report.estimated_aqi || 0) > 100 ? 'text-orange-500' :
                                                (report.estimated_aqi || 0) > 50 ? 'text-yellow-400' : 'text-green-500'
                                            }`}>
                                                {report.estimated_aqi || 0}
                                            </div>
                                            <div className="inline-block px-2 py-1 rounded bg-white/10 text-xs font-bold text-gray-300 mt-2">
                                                Risk: {report.risk_level || 'Unknown'}
                                            </div>
                                        </div>
                                        <div className="text-left md:text-right">
                                            <div className="text-sm text-gray-400 mb-1 font-mono uppercase">{t.exposure.pm25}</div>
                                            <div className="text-3xl font-bold text-white">
                                                {(report.pm25_concentration_ug_m3 || 0).toFixed(1)} <span className="text-sm text-gray-500">µg/m³</span>
                                            </div>
                                            <div className="text-[10px] text-gray-500 mt-1">Satellite Proxy Inferred</div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                                        <div className="flex items-center gap-2 mb-2 text-red-400 text-xs font-bold uppercase tracking-wide">
                                            <Activity className="w-3 h-3" /> {t.exposure.health}
                                        </div>
                                        <p className="text-gray-300 text-sm leading-relaxed">
                                            {report.health_implication || "Data unavailable"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className={`border rounded-2xl p-6 ${bgCard}`}>
                                    <h3 className={`font-bold mb-4 flex items-center gap-2 ${textMain}`}>
                                        <Shield className="w-4 h-4 text-green-400" /> {t.exposure.mitigation}
                                    </h3>
                                    <ul className="space-y-3">
                                        {(report.mitigation_strategy || []).map((item, i) => (
                                            <li key={i} className={`text-sm flex items-start gap-3 ${textSub}`}>
                                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                
                                <div className={`border rounded-2xl p-6 flex flex-col justify-center ${bgCard}`}>
                                    <h3 className={`font-bold mb-4 flex items-center gap-2 ${textMain}`}>
                                        <Info className="w-4 h-4 text-blue-400" /> {t.exposure.methodology}
                                    </h3>
                                    <p className={`text-xs leading-relaxed italic border-l-2 border-blue-500/20 pl-4 ${textSub}`}>
                                        "{report.methodology_note || "Satellite-based proxy estimation."}"
                                    </p>
                                </div>
                            </div>

                        </MotionDiv>
                    ) : (
                        <div className={`h-full flex flex-col items-center justify-center border rounded-2xl min-h-[500px] text-center p-8 ${bgCard}`}>
                             <div className="w-16 h-16 rounded-full bg-red-900/10 flex items-center justify-center text-red-500 mb-6">
                                <Satellite className="w-8 h-8" />
                             </div>
                             <h3 className={`text-xl font-bold mb-2 ${textMain}`}>Proxy Estimator Ready</h3>
                             <p className="text-gray-500 max-w-sm">
                                Enter your location and commute details to model your respiratory exposure risk using satellite data.
                             </p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>

        {/* Scientific Disclaimer & Output */}
        <section className={`grid md:grid-cols-2 gap-12 mb-24 border-t pt-12 no-export ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
             <div className={`border rounded-3xl p-8 ${bgCard}`}>
                <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${textMain}`}>
                    <AlertCircle className="w-5 h-5 text-gray-400" /> {t.exposure.disclaimer}
                </h3>
                <p className={`text-sm leading-relaxed ${textSub}`}>
                    This module provides environmental estimation, not medical advice. Satellite proxies have limitations compared to hardware sensors but offer vastly superior coverage for general awareness in data-scarce regions.
                </p>
             </div>
             <div className="flex flex-col justify-center pl-4">
                <h3 className={`text-2xl font-bold mb-4 ${textMain}`}>{t.impact.method.title}</h3>
                <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3 text-gray-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> 
                        <span><strong>Sentinel-5P:</strong> Tropospheric NO₂ column density</span>
                    </li>
                    <li className="flex items-center gap-3 text-gray-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> 
                        <span><strong>Ground Conversion:</strong> Wind vector correlation</span>
                    </li>
                    <li className="flex items-center gap-3 text-gray-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> 
                        <span><strong>Risk Scoring:</strong> Annual WHO exposure limits</span>
                    </li>
                </ul>
             </div>
        </section>

      </div>
    </div>
  );
};

export default UrbanExposure;
