
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, TrendingDown, Users, FileCheck, AlertOctagon, CheckCircle2, Search, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { runVerificationEngine } from '../services/tokenRouterService';
import { ClaimVerificationResult } from '../types';
import { useApp } from '../contexts/AppContext';
import ReportActions from '../components/ReportActions';
import SdgBadge from '../components/SdgBadge';

// Type casting to bypass strict environment checks
const MotionDiv = motion.div as any;

const CsrDashboard: React.FC = () => {
  const { t, theme, dir, language } = useApp();
  const isLight = theme === 'light';
  
  const [claim, setClaim] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<ClaimVerificationResult | null>(null);
  
  const [chartData, setChartData] = useState<any[]>([]);

  React.useEffect(() => {
    import('../services/SessionStore').then(({ SessionStore }) => {
      const sessions = SessionStore.getSessions();
      const months: any[] = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
          date: d,
          name: d.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'short' })
        });
      }

      const data = months.map(m => {
        const thisMonthSessions = sessions.filter(s => {
          const sd = new Date(s.timestamp);
          return sd.getFullYear() === m.date.getFullYear() && sd.getMonth() === m.date.getMonth();
        });
        
        let emissions = 0;
        let target = 4000;
        if (thisMonthSessions.length > 0) {
          emissions = thisMonthSessions.reduce((acc, s) => acc + (s.previewMetrics?.co2Total || 0), 0) / thisMonthSessions.length;
          target = emissions * 0.9;
        }

        return {
          month: m.name,
          emissions: Math.round(emissions),
          target: Math.round(target)
        };
      });

      const hasData = sessions.some(s => (s.previewMetrics?.co2Total || 0) > 0);
      if (!hasData) {
          setChartData([
            { month: language === 'ar' ? 'يناير' : 'Jan', emissions: 4000, target: 4500 },
            { month: language === 'ar' ? 'فبراير' : 'Feb', emissions: 3800, target: 4400 },
            { month: language === 'ar' ? 'مارس' : 'Mar', emissions: 3600, target: 4300 },
            { month: language === 'ar' ? 'أبريل' : 'Apr', emissions: 3900, target: 4200 },
            { month: language === 'ar' ? 'مايو' : 'May', emissions: 3400, target: 4100 },
            { month: language === 'ar' ? 'يونيو' : 'Jun', emissions: 3100, target: 4000 },
          ]);
      } else {
          setChartData(data);
      }
    });
  }, [language]);

  const handleVerify = async () => {
    if (!claim.trim()) return;
    setVerifying(true);
    try {
      const result = await runVerificationEngine(claim, language);
      setVerificationResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setVerifying(false);
    }
  };

  const getVerdictColor = (v: string) => {
    if (v === 'Scientifically Accurate' || v === 'دقيق علمياً') return 'text-green-500';
    if (v === 'Plausible' || v === 'معقول') return 'text-yellow-500';
    return 'text-red-500';
  };

  const bgSection = isLight ? 'bg-gray-50' : 'bg-black';
  const textMain = isLight ? 'text-gray-900' : 'text-white';
  const textSub = isLight ? 'text-gray-500' : 'text-gray-400';
  const cardBg = isLight ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10';

  return (
    <div id="csr-dashboard-container" className={`min-h-screen pt-32 lg:pt-36 px-6 pb-20 ${bgSection} transition-colors duration-500`} dir={dir}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-500/10 text-gray-500 text-xs font-bold uppercase tracking-wider mb-4 border border-gray-500/20">
                    <Building2 className="w-3 h-3" /> {t.csr.title}
                </div>
                <h1 className={`text-4xl md:text-5xl font-bold mb-2 ${textMain}`}>{t.csr.title}</h1>
                <p className={`${textSub} max-w-2xl`}>
                    {t.csr.desc}
                </p>
                <div className="mt-4">
                    <SdgBadge sdgs={[7, 11, 12, 13]} />
                </div>
            </div>
            <ReportActions
                targetId="csr-dashboard-container"
                filename="Kairo_CSR_Report"
                title={language === 'ar' ? 'تقرير الاستدامة المؤسسية' : 'Corporate sustainability report'}
                subtitle={language === 'ar' ? 'ملخص الأداء والأثر والتحقق من ادعاءات الاستدامة.' : 'Performance, impact, and sustainability-claim verification summary.'}
                sdgs={[7, 11, 12, 13]}
            />
        </header>

        {/* Metrics Grid */}
        <div className="kairo-metric-grid grid sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-12">
            {[
                { label: t.csr.employees, val: '1,240', sub: 'Active Accounts', icon: <Users className="w-5 h-5 text-blue-400"/> },
                { label: t.csr.intensity, val: '12.4', sub: 'Tons CO2e / Year', icon: <TrendingDown className="w-5 h-5 text-green-400"/> },
                { label: t.csr.audit, val: '86%', sub: 'Department Wide', icon: <FileCheck className="w-5 h-5 text-yellow-400"/> },
                { label: t.csr.offset, val: '150', sub: 'Trees Planted', icon: <CheckCircle2 className="w-5 h-5 text-purple-400"/> },
            ].map((metric, i) => (
                <div key={i} className={`kairo-metric-card p-6 rounded-2xl border ${cardBg}`}>
                    <div className="flex justify-between items-start mb-4">
                        <span className={`text-sm font-medium ${textSub}`}>{metric.label}</span>
                        <div className={`p-2 rounded-lg ${isLight ? 'bg-gray-100' : 'bg-black'}`}>{metric.icon}</div>
                    </div>
                    <div className={`kairo-metric-value text-3xl font-bold mb-1 ${textMain}`}>{metric.val}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">{metric.sub}</div>
                </div>
            ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
            
            {/* Chart Area */}
            <div className={`kairo-analysis-panel lg:col-span-2 border rounded-3xl p-5 sm:p-8 ${cardBg}`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-8">
                    <h3 className={`text-xl font-bold ${textMain}`}>{t.csr.chartTitle}</h3>
                    <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div className={`flex items-center gap-2 ${textSub}`}><span className="w-3 h-3 rounded-full bg-kairo-green"></span> {t.csr.scopeActual}</div>
                        <div className={`flex items-center gap-2 ${textSub}`}><span className="w-3 h-3 rounded-full bg-gray-500"></span> {t.csr.scopeTarget}</div>
                    </div>
                </div>
                <div className="kairo-chart kairo-chart-responsive h-[320px] w-full p-3" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#26A17C" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#26A17C" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#eee" : "#333"} vertical={false} />
                            <XAxis dataKey="month" stroke="#888" tick={{fill: '#888'}} axisLine={false} tickLine={false} />
                            <YAxis stroke="#888" tick={{fill: '#888'}} axisLine={false} tickLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: isLight ? '#fff' : '#000', border: '1px solid #333', borderRadius: '8px' }}
                                itemStyle={{ color: isLight ? '#000' : '#fff' }}
                            />
                            <Area type="monotone" dataKey="emissions" stroke="#26A17C" strokeWidth={3} fillOpacity={1} fill="url(#colorEmissions)" />
                            <Area type="monotone" dataKey="target" stroke="#888" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <details className="mt-5 rounded-2xl border border-black/5 bg-black/[0.025] p-3 dark:border-white/5 dark:bg-white/[0.025]">
                    <summary className={`cursor-pointer px-2 py-1 text-sm font-bold ${textMain}`}>
                        {language === 'ar' ? 'عرض جدول البيانات والفجوة عن الهدف' : 'View data table and target gap'}
                    </summary>
                    <div className="kairo-data-table-shell mt-3" role="region" aria-label={language === 'ar' ? 'جدول الانبعاثات والأهداف' : 'Emissions and targets table'} tabIndex={0}>
                        <table className="kairo-data-table">
                            <thead>
                                <tr>
                                    <th>{language === 'ar' ? 'الشهر' : 'Month'}</th>
                                    <th>{language === 'ar' ? 'الانبعاثات' : 'Emissions'}</th>
                                    <th>{language === 'ar' ? 'الهدف' : 'Target'}</th>
                                    <th>{language === 'ar' ? 'الفجوة' : 'Gap'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {chartData.map((row) => {
                                    const gap = row.emissions - row.target;
                                    return (
                                        <tr key={`csr-${row.month}`}>
                                            <td className="font-bold">{row.month}</td>
                                            <td>{row.emissions.toLocaleString()}</td>
                                            <td>{row.target.toLocaleString()}</td>
                                            <td>
                                                <span className={`kairo-status-pill ${gap <= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {gap > 0 ? '+' : ''}{gap.toLocaleString()}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </details>
            </div>

            {/* Anti-Greenwashing Tool */}
            <div className={`kairo-analysis-panel border rounded-3xl p-5 sm:p-8 flex flex-col ${isLight ? 'bg-white border-gray-200' : 'bg-gradient-to-br from-gray-900 to-black border-white/10'}`}>
                <div className="mb-6">
                    <h3 className={`text-xl font-bold mb-2 flex items-center gap-2 ${textMain}`}>
                        <AlertOctagon className="w-5 h-5 text-red-500" /> {t.csr.greenwashing}
                    </h3>
                    <p className={`text-sm ${textSub}`}>
                        {t.csr.desc}
                    </p>
                </div>

                <div className="flex-1 space-y-4">
                    <textarea 
                        className={`w-full h-32 border rounded-xl p-4 text-sm focus:outline-none focus:border-kairo-green/50 resize-none ${isLight ? 'bg-gray-50 border-gray-200 text-gray-800' : 'bg-white/5 border-white/10 text-white'}`}
                        placeholder={t.csr.gwPlaceholder}
                        value={claim}
                        onChange={(e) => setClaim(e.target.value)}
                    />
                    <button 
                        onClick={handleVerify}
                        disabled={verifying || !claim.trim()}
                        className={`w-full font-bold py-3 rounded-xl transition-colors disabled:opacity-50 ${isLight ? 'bg-black text-white hover:bg-gray-800' : 'bg-white text-black hover:bg-gray-200'}`}
                    >
                        {verifying ? t.common.loading : t.csr.verify}
                    </button>
                </div>

                {verificationResult && (
                    <MotionDiv 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-6 pt-6 border-t ${isLight ? 'border-gray-200' : 'border-white/10'}`}
                    >
                        <div className="mb-4 flex items-center gap-4">
                            <div
                                className="kairo-score-ring !h-20 !w-20"
                                style={{ '--kairo-score': verificationResult.confidence_score } as React.CSSProperties}
                                role="img"
                                aria-label={`${t.csr.confidence}: ${verificationResult.confidence_score}%`}
                            >
                                <div className="kairo-score-ring-core"><strong className="!text-xl">{verificationResult.confidence_score}</strong><span>%</span></div>
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-wider text-gray-500">{t.csr.confidence}</div>
                                <span className={`mt-1 block font-bold ${getVerdictColor(verificationResult.verdict)}`}>
                                    {verificationResult.verdict}
                                </span>
                            </div>
                        </div>
                        <p className={`text-xs mb-3 leading-relaxed ${textSub}`}>
                            {verificationResult.analysis}
                        </p>
                        
                        {verificationResult.red_flags.length > 0 && (
                            <div className="mb-3">
                                <span className="text-xs font-bold text-gray-500 uppercase">{t.csr.flags}</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {verificationResult.red_flags.map((flag, i) => (
                                        <span key={i} className="px-2 py-1 bg-red-500/10 text-red-400 text-[10px] rounded border border-red-500/20">{flag}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className={`p-3 rounded-lg ${isLight ? 'bg-gray-50' : 'bg-white/5'}`}>
                            <span className="text-xs font-bold text-gray-500 uppercase block mb-1">{t.csr.suggestion}</span>
                            <p className="text-xs text-kairo-green italic">"{verificationResult.improvement_suggestion}"</p>
                        </div>
                    </MotionDiv>
                )}
            </div>
        </div>

        {/* Feature Sections */}
        <div className="grid md:grid-cols-2 gap-8">
            <div className={`p-8 rounded-3xl border flex gap-6 ${cardBg}`}>
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Search className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <h3 className={`text-lg font-bold mb-2 ${textMain}`}>{t.csr.supply}</h3>
                    <p className={`text-sm leading-relaxed mb-4 ${textSub}`}>
                        Kairo maps Tier 2 and Tier 3 suppliers to estimate upstream water and carbon risks specific to Egyptian manufacturing zones.
                    </p>
                    <button className="text-blue-400 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                        View Supplier Map <ArrowRight className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>

            <div className={`p-8 rounded-3xl border flex gap-6 ${cardBg}`}>
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                    <FileCheck className="w-6 h-6 text-green-400" />
                </div>
                <div>
                    <h3 className={`text-lg font-bold mb-2 ${textMain}`}>{t.csr.compliance}</h3>
                    <p className={`text-sm leading-relaxed mb-4 ${textSub}`}>
                        Automated EGX (Egyptian Exchange) ESG reporting templates available for export. Align with Article 28 of the Investment Law.
                    </p>
                    <button className="text-green-400 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                        Download Templates <ArrowRight className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default CsrDashboard;
