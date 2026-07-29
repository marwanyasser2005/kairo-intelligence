
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wind, MapPin, Loader2, Info, Activity } from 'lucide-react';
import { EnvironmentalSnapshot } from '../types';
import { runContextEngine } from '../services/tokenRouterService';
import { useApp } from '../contexts/AppContext';

// Type casting to bypass strict environment checks
const MotionDiv = motion.div as any;

const AirQuality: React.FC = () => {
  const { t, theme, dir, language } = useApp();
  const isLight = theme === 'light';
  
  const [data, setData] = useState<EnvironmentalSnapshot | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEstimate = () => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const result = await runContextEngine(pos.coords.latitude, pos.coords.longitude);
        setData(result);
        setLoading(false);
    });
  };

  const bgMain = isLight ? 'bg-slate-50' : 'bg-black';
  const textPrimary = isLight ? 'text-slate-900' : 'text-white';
  const textSecondary = isLight ? 'text-slate-500' : 'text-gray-400';
  const cardBg = isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10';

  return (
    <div className={`min-h-screen pt-32 lg:pt-36 px-6 pb-20 ${bgMain}`} dir={dir}>
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-500/20">
            <Activity className="w-3 h-3" />
            {t.airQuality.badge}
          </div>
          <h1 className={`text-4xl font-bold mb-6 ${textPrimary}`}>{t.airQuality.title}</h1>
          <p className={`${textSecondary} max-w-2xl`}>
            {t.airQuality.desc}
          </p>
        </header>

        <div className={`rounded-3xl p-8 md:p-12 text-center min-h-[400px] flex flex-col items-center justify-center border ${cardBg}`}>
            {!data && !loading && (
                <>
                    <Wind className="w-16 h-16 text-gray-600 mb-6" />
                    <button onClick={handleEstimate} className={`px-8 py-4 rounded-full font-bold transition-all flex items-center gap-2 ${isLight ? 'bg-black text-white hover:bg-gray-800' : 'bg-white text-black hover:bg-gray-200'}`}>
                        <MapPin className="w-5 h-5" /> {t.airQuality.estimate}
                    </button>
                    <p className="text-xs text-gray-500 mt-4">{t.common.dataPrivacy}: Uses browser location</p>
                </>
            )}

            {loading && (
                <div className="flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-kairo-green animate-spin mb-4" />
                    <p className="text-gray-400">{t.common.loading}</p>
                </div>
            )}

            {data && (
                <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full text-left">
                    <div className="flex justify-between items-start mb-12">
                        <div>
                            <div className="text-sm text-gray-500 uppercase tracking-wide mb-1">{t.airQuality.location}</div>
                            <div className={`text-3xl font-bold ${textPrimary}`}>{data.location}</div>
                        </div>
                        <div className="text-right">
                             <div className="text-xs bg-white/10 px-2 py-1 rounded text-gray-400 inline-block">{data.methodology}</div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 mb-12">
                        <div>
                            <div className="text-sm text-gray-400 mb-2">{t.monitor.aqi}</div>
                            <div className={`text-6xl font-bold ${textPrimary}`}>{data.aqi_estimate}</div>
                            <div className="text-sm text-blue-400 font-bold mt-2">{data.status}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-400 mb-2">Ambient CO₂ (ppm)</div>
                            <div className={`text-6xl font-bold ${textPrimary}`}>{data.co2_estimate_ppm}</div>
                            <div className="text-sm text-gray-500 mt-2">Global Avg: ~420</div>
                        </div>
                    </div>

                    <div className={`p-6 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/5'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <Info className="w-4 h-4 text-kairo-green" />
                            <span className={`font-bold text-sm ${textPrimary}`}>{t.exposure.health}</span>
                        </div>
                        <p className={`text-sm leading-relaxed ${textSecondary}`}>{data.health_implication}</p>
                    </div>
                </MotionDiv>
            )}
        </div>
      </div>
    </div>
  );
};

export default AirQuality;
