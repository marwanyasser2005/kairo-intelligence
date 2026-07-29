
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitCompare, Plus, Trash2, Zap, Droplet, Utensils, TrendingDown, CheckCircle2, AlertTriangle, ArrowRight, Save, FlaskConical, LayoutDashboard, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CalculatorResults, WaterData, FoodData, Scenario, ScenarioComparisonAnalysis } from '../types';
import { saveScenario, getScenarios, deleteScenario, compareScenariosAgent } from '../services/ScenarioLab';
import { useApp } from '../contexts/AppContext';

// Type casting to bypass strict environment checks
const MotionDiv = motion.div as any;

const CompareScenarios: React.FC = () => {
  const { t, theme, dir } = useApp();
  const isLight = theme === 'light';
  
  // State
  const [currentResults, setCurrentResults] = useState<CalculatorResults | null>(null);
  const [currentWater, setCurrentWater] = useState<WaterData | null>(null);
  const [currentFood, setCurrentFood] = useState<FoodData | null>(null);
  
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [newScenarioName, setNewScenarioName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const [analysis, setAnalysis] = useState<ScenarioComparisonAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Load Data
  useEffect(() => {
      // Load current state for "Snapshot" capability
      const r = localStorage.getItem('kairo_mini_results');
      const w = localStorage.getItem('kairo_input_water');
      const f = localStorage.getItem('kairo_input_food');
      
      if (r) setCurrentResults(JSON.parse(r));
      if (w) setCurrentWater(JSON.parse(w));
      if (f) setCurrentFood(JSON.parse(f));

      // Load saved scenarios
      setScenarios(getScenarios());
  }, []);

  const handleSave = () => {
      if (!currentResults || !currentWater || !currentFood || !newScenarioName.trim()) return;
      setIsSaving(true);
      const s = saveScenario(newScenarioName, currentResults, currentWater, currentFood);
      setScenarios([...scenarios, s]);
      setNewScenarioName('');
      setIsSaving(false);
  };

  const handleDelete = (id: string) => {
      setScenarios(deleteScenario(id));
      setAnalysis(null); // Clear stale analysis
  };

  const handleCompare = async () => {
      if (scenarios.length < 2) return;
      setAnalyzing(true);
      try {
          const res = await compareScenariosAgent(scenarios);
          setAnalysis(res);
      } catch (e) {
          console.error(e);
      } finally {
          setAnalyzing(false);
      }
  };

  const bgSection = isLight ? 'bg-gray-50' : 'bg-black';
  const textMain = isLight ? 'text-gray-900' : 'text-white';
  const textSub = isLight ? 'text-gray-600' : 'text-gray-400';
  const cardBg = isLight ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10';

  return (
    <div className={`min-h-screen pt-32 lg:pt-36 px-6 pb-20 ${bgSection} transition-colors duration-500`} dir={dir}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-wider mb-4 border border-purple-500/20">
                <FlaskConical className="w-3 h-3" /> {t.scenarios.title}
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className={`text-4xl md:text-5xl font-bold mb-2 ${textMain}`}>{t.scenarios.title}</h1>
                    <p className={`${textSub} max-w-2xl text-lg`}>
                        {t.scenarios.desc}
                    </p>
                </div>
                <Link to="/dashboard" className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${isLight ? 'bg-gray-200 text-gray-800' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                    <LayoutDashboard className="w-3 h-3" /> {t.nav.dashboard}
                </Link>
            </div>
        </header>

        {/* 1. SNAPSHOT CREATOR */}
        <section className={`mb-12 p-6 rounded-2xl border ${cardBg}`}>
            <h3 className={`font-bold mb-4 flex items-center gap-2 ${textMain}`}>
                <Save className="w-4 h-4 text-purple-500" /> {t.scenarios.snapshot}
            </h3>
            
            {currentResults ? (
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">{t.common.context}</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Optimized Plan 2025" 
                            value={newScenarioName}
                            onChange={(e) => setNewScenarioName(e.target.value)}
                            className={`w-full p-3 rounded-xl border focus:outline-none focus:border-purple-500 transition-colors ${isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-black border-white/20 text-white'}`}
                        />
                    </div>
                    <button 
                        onClick={handleSave}
                        disabled={!newScenarioName.trim() || isSaving}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 transition-all"
                    >
                        <Plus className="w-4 h-4" /> {t.scenarios.save}
                    </button>
                </div>
            ) : (
                <div className="text-sm text-gray-500">
                    {t.scenarios.empty} <Link to="/mini" className="text-purple-500 font-bold hover:underline">{t.scenarios.runMini}</Link>
                </div>
            )}
        </section>

        {/* 2. SCENARIO MATRIX */}
        {scenarios.length > 0 && (
            <section className="mb-12">
                <div className="flex justify-between items-center mb-6">
                    <h3 className={`font-bold text-xl ${textMain}`}>{t.scenarios.savedTitle} ({scenarios.length})</h3>
                    {scenarios.length >= 2 && (
                        <button 
                            onClick={handleCompare}
                            disabled={analyzing}
                            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitCompare className="w-4 h-4" />}
                            {t.scenarios.run}
                        </button>
                    )}
                </div>

                <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-white/10">
                    <table className={`w-full text-sm text-left ${isLight ? 'bg-white' : 'bg-black'}`}>
                        <thead className={`text-xs uppercase ${isLight ? 'bg-gray-50 text-gray-500' : 'bg-white/5 text-gray-400'}`}>
                            <tr>
                                <th className="px-6 py-4 font-bold">{t.impact.method.title}</th>
                                {scenarios.map(s => (
                                    <th key={s.id} className="px-6 py-4 relative group">
                                        <div className="flex justify-between items-center">
                                            <span>{s.name}</span>
                                            <button onClick={() => handleDelete(s.id)} className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isLight ? 'divide-gray-100' : 'divide-white/5'}`}>
                            {/* CO2 Row */}
                            <tr>
                                <td className={`px-6 py-4 font-medium flex items-center gap-2 ${textMain}`}>
                                    <Zap className="w-4 h-4 text-yellow-500" /> {t.scenarios.metrics.co2}
                                </td>
                                {scenarios.map(s => (
                                    <td key={s.id} className={`px-6 py-4 ${textSub}`}>
                                        {s.results.totalCo2Kg}
                                    </td>
                                ))}
                            </tr>
                            {/* Water Row */}
                            <tr>
                                <td className={`px-6 py-4 font-medium flex items-center gap-2 ${textMain}`}>
                                    <Droplet className="w-4 h-4 text-blue-500" /> {t.scenarios.metrics.water}
                                </td>
                                {scenarios.map(s => (
                                    <td key={s.id} className={`px-6 py-4 ${textSub}`}>
                                        {s.results.water.monthlyWastedLiters.toLocaleString()}
                                    </td>
                                ))}
                            </tr>
                            {/* Money Row */}
                            <tr>
                                <td className={`px-6 py-4 font-medium flex items-center gap-2 ${textMain}`}>
                                    <TrendingDown className="w-4 h-4 text-green-500" /> {t.scenarios.metrics.loss}
                                </td>
                                {scenarios.map(s => (
                                    <td key={s.id} className={`px-6 py-4 font-bold ${isLight ? 'text-green-600' : 'text-green-400'}`}>
                                        {(s.results.water.monthlyCostLE + s.results.food.monthlyFinancialLossLE).toFixed(0)}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        )}

        {/* 3. AI SYNTHESIS */}
        <AnimatePresence>
            {analysis && (
                <MotionDiv 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid md:grid-cols-3 gap-8"
                >
                    <div className="md:col-span-2">
                        <div className={`p-8 rounded-3xl border mb-6 ${isLight ? 'bg-gradient-to-br from-purple-50 to-white border-purple-100' : 'bg-gradient-to-br from-purple-900/20 to-black border-purple-500/20'}`}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-widest text-purple-500">{t.scenarios.analysis.optimal}</div>
                                    <h3 className={`text-2xl font-bold ${textMain}`}>
                                        {scenarios.find(s => s.id === analysis.optimal_scenario_id)?.name || "Recommended Path"}
                                    </h3>
                                </div>
                            </div>
                            <p className={`text-lg leading-relaxed mb-6 ${textSub}`}>
                                {analysis.analysis_summary}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {analysis.high_leverage_actions.map((action, i) => (
                                    <span key={i} className={`text-xs font-bold px-3 py-1 rounded-full border ${isLight ? 'bg-white border-gray-200 text-gray-700' : 'bg-white/5 border-white/10 text-gray-300'}`}>
                                        {action}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-4">
                            {analysis.trade_offs.map((trade, i) => (
                                <div key={i} className={`p-4 rounded-xl border flex items-start gap-4 ${isLight ? 'bg-white border-gray-200' : 'bg-white/[0.02] border-white/5'}`}>
                                    <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-1" />
                                    <div>
                                        <div className={`text-sm font-bold mb-1 ${textMain}`}>
                                            {scenarios.find(s => s.id === trade.scenario_id)?.name || "Scenario"} {t.scenarios.analysis.tradeoff}
                                        </div>
                                        <div className="text-xs text-green-500 font-bold mb-1">+ {trade.pro}</div>
                                        <div className="text-xs text-red-500 font-bold">- {trade.con}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="md:col-span-1">
                        <div className={`p-6 rounded-2xl border h-full ${cardBg}`}>
                            <h4 className={`font-bold mb-4 ${textMain}`}>{t.scenarios.analysis.diff}</h4>
                            <ul className="space-y-4">
                                {analysis.key_differentiators.map((diff, i) => (
                                    <li key={i} className={`text-sm flex items-start gap-3 ${textSub}`}>
                                        <ArrowRight className={`w-4 h-4 text-purple-500 shrink-0 mt-1 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                                        {diff}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </MotionDiv>
            )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default CompareScenarios;
