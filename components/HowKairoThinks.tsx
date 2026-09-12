
import React, { useState } from 'react';

import { Database, Globe, BrainCircuit, ShieldCheck, ArrowRight, Lock, Server, FileJson } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const HowKairoThinks: React.FC = () => {
  const { t, theme, dir } = useApp();
  const isLight = theme === 'light';
  const [, setActiveStep] = useState<number | null>(null);

  const steps = [
    {
      id: 1,
      icon: <Database className="w-6 h-6" />,
      color: "blue",
      technical: "Sanitization & Structuring",
      ...t.tech.blackBox.steps[0]
    },
    {
      id: 2,
      icon: <Globe className="w-6 h-6" />,
      color: "purple",
      technical: "RAG (Retrieval-Augmented Generation)",
      ...t.tech.blackBox.steps[1]
    },
    {
      id: 3,
      icon: <BrainCircuit className="w-6 h-6" />,
      color: "kairo-green",
      technical: "Chain-of-Thought Processing",
      ...t.tech.blackBox.steps[2]
    },
    {
      id: 4,
      icon: <ShieldCheck className="w-6 h-6" />,
      color: "orange",
      technical: "Adversarial Verification",
      ...t.tech.blackBox.steps[3]
    }
  ];

  const textMain = isLight ? 'text-gray-900' : 'text-white';
  const textSub = isLight ? 'text-gray-600' : 'text-gray-400';
  const bgCard = isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/[0.02] border-white/5';
  const bgSection = isLight ? 'bg-gray-50' : 'bg-white/[0.01]';

  return (
    <section className={`py-24 border-y ${isLight ? 'border-gray-200' : 'border-white/5'} ${bgSection}`} dir={dir}>
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="mb-16 md:text-center max-w-3xl mx-auto">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border ${isLight ? 'bg-white border-gray-200 text-gray-500' : 'bg-white/5 border-white/10 text-gray-400'}`}>
            <Server className="w-3 h-3" /> {t.tech.blackBox.badge}
          </div>
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${textMain}`}>{t.tech.blackBox.title}</h2>
          <p className={`text-lg leading-relaxed ${textSub}`}>
            {t.tech.blackBox.desc}
          </p>
        </div>

        {/* The Pipeline Visualizer */}
        <div className="relative">
          {/* Connector Line (Desktop) */}
          <div className={`hidden md:block absolute top-12 left-0 w-full h-0.5 z-0 ${isLight ? 'bg-gray-200' : 'bg-gradient-to-r from-blue-500/20 via-kairo-green/20 to-orange-500/20'}`}></div>

          <div className="grid md:grid-cols-4 gap-8 relative z-10">
            {steps.map((step: any, index: number) => (
              <div 
                key={step.id} 
                className="group relative"
                onMouseEnter={() => setActiveStep(step.id)}
                onMouseLeave={() => setActiveStep(null)}
              >
                {/* Step Node */}
                <div className={`w-24 h-24 rounded-2xl border flex items-center justify-center mb-8 mx-auto relative transition-all duration-300 group-hover:scale-110 z-20 ${
                    isLight 
                    ? 'bg-white border-gray-200' 
                    : 'bg-black border-white/10'
                } group-hover:border-${step.color === 'kairo-green' ? 'kairo-green' : `${step.color  }-500`}/50`}>
                  <div className={`text-${step.color === 'kairo-green' ? 'kairo-green' : `${step.color  }-400`}`}>
                    {step.icon}
                  </div>
                  
                  {/* Step Number Badge */}
                  <div className={`absolute -top-3 ${dir === 'rtl' ? '-left-3' : '-right-3'} w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${isLight ? 'bg-gray-100 border-gray-200 text-gray-700' : 'bg-white/10 border-white/10 text-white'}`}>
                    0{step.id}
                  </div>
                </div>

                {/* Content Card */}
                <div className={`rounded-2xl p-6 min-h-[280px] border transition-colors relative overflow-hidden ${bgCard} ${isLight ? 'hover:bg-gray-50' : 'hover:bg-white/[0.05]'}`}>
                  <div className="mb-2 text-xs font-bold text-gray-500 uppercase tracking-widest">{step.role}</div>
                  <h3 className={`text-xl font-bold mb-4 ${textMain}`}>{step.title}</h3>
                  <p className={`text-sm leading-relaxed mb-6 ${textSub}`}>
                    {step.desc}
                  </p>
                  
                  {/* Technical Footer */}
                  <div className={`pt-4 border-t flex items-center gap-2 text-xs font-mono text-gray-500 ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
                     {index === 2 ? <BrainCircuit className="w-3 h-3" /> : index === 3 ? <Lock className="w-3 h-3" /> : <FileJson className="w-3 h-3" />}
                     {step.technical}
                  </div>

                  {/* Hover Glow Effect */}
                  <div className={`absolute -right-10 -bottom-10 w-32 h-32 bg-${step.color === 'kairo-green' ? 'kairo-green' : `${step.color  }-500`}/10 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />
                </div>

                {/* Arrow (Mobile Only) */}
                {index < steps.length - 1 && (
                  <div className="md:hidden flex justify-center py-4 text-gray-600">
                    <ArrowRight className="w-6 h-6 rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Safety Note */}
        <div className={`mt-16 p-8 rounded-3xl border flex flex-col md:flex-row items-center gap-8 md:gap-12 ${isLight ? 'bg-white border-gray-200' : 'bg-black border-white/10'}`}>
            <div className="flex-1">
                <h3 className={`text-xl font-bold mb-2 flex items-center gap-2 ${textMain}`}>
                    <ShieldCheck className="w-5 h-5 text-kairo-green" />
                    {t.tech.zero.title}
                </h3>
                <p className={`text-sm leading-relaxed ${textSub}`}>
                    {t.tech.zero.desc}
                </p>
            </div>
            <div className={`shrink-0 flex gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest border-s ps-8 ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
                <div className="flex flex-col gap-1">
                    <span>{t.tech.zero.margin}</span>
                    <span className={`text-lg ${textMain}`}>±12%</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span>{t.tech.zero.confidence}</span>
                    <span className={`text-lg ${textMain}`}>{t.tech.zero.high}</span>
                </div>
            </div>
        </div>

      </div>
    </section>
  );
};

export default HowKairoThinks;
