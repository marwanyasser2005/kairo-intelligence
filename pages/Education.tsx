
import React from 'react';
import { Droplets, Utensils, Wind, Leaf, ArrowRight, Check, Medal, Trophy, Lightbulb, Zap, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserProgress } from '../types';
import { useApp } from '../contexts/AppContext';

// Type casting to bypass strict environment checks
const MotionDiv = motion.div as any;
const MotionH1 = motion.h1 as any;
const MotionP = motion.p as any;

interface FactCardProps {
  title: string;
  fact: string;
  icon: React.ReactNode;
}

const FactCard: React.FC<FactCardProps> = ({ title, fact, icon }) => (
  <MotionDiv 
    whileHover={{ y: -5 }}
    className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all"
  >
    <div className="mb-4 text-gray-400">{icon}</div>
    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
    <p className="text-sm text-gray-400 leading-relaxed">{fact}</p>
  </MotionDiv>
);

interface PageLayoutProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  facts: { title: string; fact: string; icon: React.ReactNode }[];
  action: { title: string; desc: string; link: string };
  backText: string;
  insightsTitle: string;
  auditText: string;
  dir?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ title, subtitle, icon, color, facts, action, backText, insightsTitle, auditText, dir }) => {
  return (
    <div className="min-h-screen bg-black pt-32 lg:pt-36 px-6 pb-20" dir={dir}>
      <div className="max-w-5xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 mb-12 hover:text-white transition-colors uppercase tracking-widest">
          <ArrowRight className={`w-3 h-3 ${dir === 'rtl' ? '' : 'rotate-180'}`} /> {backText}
        </Link>
        
        <div className="grid md:grid-cols-2 gap-12 mb-20">
            <div>
                <MotionDiv 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`inline-flex p-4 rounded-3xl bg-${color}-500/10 text-${color}-400 mb-8 border border-${color}-500/20`}
                >
                    {icon}
                </MotionDiv>
                <MotionH1 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight"
                >
                    {title}
                </MotionH1>
            </div>
            <div className="flex items-end">
                <MotionP 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl text-gray-300 leading-relaxed"
                >
                    {subtitle}
                </MotionP>
            </div>
        </div>

        <div className="mb-8 flex items-center gap-4">
             <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">{insightsTitle}</span>
             <div className="h-px bg-white/10 flex-1" />
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {facts.map((f, i) => (
             <MotionDiv 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (i * 0.1) }}
             >
                <FactCard {...f} />
             </MotionDiv>
          ))}
        </div>
        
        <MotionDiv 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={`p-10 rounded-[2.5rem] bg-gradient-to-r from-${color}-900/20 to-black border border-${color}-500/30 flex flex-col md:flex-row items-center justify-between gap-8`}
        >
            <div>
                <h3 className="text-2xl font-bold text-white mb-2">{action.title}</h3>
                <p className={`text-${color}-200/60 max-w-lg`}>{action.desc}</p>
            </div>
            <Link to={action.link} className={`shrink-0 px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-all flex items-center gap-2`}>
                {auditText} <ArrowRight className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
            </Link>
        </MotionDiv>
      </div>
    </div>
  );
};

interface EducationPageProps {
  userProgress?: UserProgress;
  setUserProgress?: React.Dispatch<React.SetStateAction<UserProgress>>;
}

export const WaterPage: React.FC<EducationPageProps> = () => {
  const { t, dir } = useApp();
  const c = t.education.water;
  
  return (
    <PageLayout
      title={c.title}
      subtitle={c.subtitle}
      icon={<Droplets className="w-8 h-8" />}
      color="blue"
      facts={[
        { title: c.facts[0].title, fact: c.facts[0].fact, icon: <AlertTriangle className="w-5 h-5 text-blue-400" /> },
        { title: c.facts[1].title, fact: c.facts[1].fact, icon: <Droplets className="w-5 h-5 text-blue-400" /> },
        { title: c.facts[2].title, fact: c.facts[2].fact, icon: <Utensils className="w-5 h-5 text-blue-400" /> }
      ]}
      action={{ title: c.action.title, desc: c.action.desc, link: "/mini" }}
      backText={t.education.back}
      insightsTitle={t.education.insights}
      auditText={t.education.startAudit}
      dir={dir}
    />
  );
};

export const FoodPage: React.FC = () => {
  const { t, dir } = useApp();
  const c = t.education.food;

  return (
    <PageLayout
      title={c.title}
      subtitle={c.subtitle}
      icon={<Utensils className="w-8 h-8" />}
      color="orange"
      facts={[
        { title: c.facts[0].title, fact: c.facts[0].fact, icon: <ArrowRight className="w-5 h-5 text-orange-400" /> },
        { title: c.facts[1].title, fact: c.facts[1].fact, icon: <Wind className="w-5 h-5 text-orange-400" /> },
        { title: c.facts[2].title, fact: c.facts[2].fact, icon: <Lightbulb className="w-5 h-5 text-orange-400" /> }
      ]}
      action={{ title: c.action.title, desc: c.action.desc, link: "/mini" }}
      backText={t.education.back}
      insightsTitle={t.education.insights}
      auditText={t.education.startAudit}
      dir={dir}
    />
  );
};

export const CO2Page: React.FC = () => {
  const { t, dir } = useApp();
  const c = t.education.co2;

  return (
    <PageLayout
      title={c.title}
      subtitle={c.subtitle}
      icon={<Wind className="w-8 h-8" />}
      color="gray"
      facts={[
        { title: c.facts[0].title, fact: c.facts[0].fact, icon: <Zap className="w-5 h-5 text-gray-400" /> },
        { title: c.facts[1].title, fact: c.facts[1].fact, icon: <ArrowRight className="w-5 h-5 text-gray-400" /> },
        { title: c.facts[2].title, fact: c.facts[2].fact, icon: <Lightbulb className="w-5 h-5 text-gray-400" /> }
      ]}
      action={{ title: c.action.title, desc: c.action.desc, link: "/mini" }}
      backText={t.education.back}
      insightsTitle={t.education.insights}
      auditText={t.education.startAudit}
      dir={dir}
    />
  );
};

export const SustainabilityPage: React.FC = () => {
  const { t, dir } = useApp();
  const c = t.education.sust;

  return (
    <PageLayout
      title={c.title}
      subtitle={c.subtitle}
      icon={<Leaf className="w-8 h-8" />}
      color="green"
      facts={[
        { title: c.facts[0].title, fact: c.facts[0].fact, icon: <ArrowRight className="w-5 h-5 text-green-400" /> },
        { title: c.facts[1].title, fact: c.facts[1].fact, icon: <Check className="w-5 h-5 text-green-400" /> },
        { title: c.facts[2].title, fact: c.facts[2].fact, icon: <Lightbulb className="w-5 h-5 text-green-400" /> }
      ]}
      action={{ title: c.action.title, desc: c.action.desc, link: "/mini" }}
      backText={t.education.back}
      insightsTitle={t.education.insights}
      auditText={t.education.startAudit}
      dir={dir}
    />
  );
};
