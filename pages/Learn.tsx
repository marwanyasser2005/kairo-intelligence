
import React from 'react';
import { Droplets, Utensils, Wind, Leaf, ArrowRight, BookOpen, GraduationCap, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';

// Type casting to bypass strict environment checks
const MotionDiv = motion.div as any;

const LearnCard = ({ title, desc, icon: Icon, color, link, actionText, theme, dir }: any) => {
    const isLight = theme === 'light';
    const bg = isLight ? 'bg-white border-gray-200 shadow-md hover:shadow-xl' : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]';
    const textMain = isLight ? 'text-gray-900' : 'text-white';
    const textSub = isLight ? 'text-gray-600' : 'text-gray-400';

    return (
        <MotionDiv 
            whileHover={{ y: -5 }}
            className={`group flex flex-col justify-between p-8 rounded-[2rem] border transition-all duration-300 ${bg}`}
        >
            <div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${isLight ? `bg-${color}-100 text-${color}-600` : `bg-${color}-500/20 text-${color}-400`}`}>
                    <Icon className="w-7 h-7" />
                </div>
                <h3 className={`text-2xl font-bold mb-3 ${textMain}`}>{title}</h3>
                <p className={`mb-8 leading-relaxed ${textSub}`}>{desc}</p>
            </div>
            
            <Link to={link} className={`inline-flex items-center gap-2 font-bold text-sm uppercase tracking-wide transition-all group-hover:gap-3 text-${color}-500 hover:text-${color}-400`}>
                {actionText} <ArrowRight className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`}/>
            </Link>
        </MotionDiv>
    );
};

const Learn: React.FC = () => {
  const { t, theme, dir } = useApp();
  const isLight = theme === 'light';
  
  const bgSection = isLight ? 'bg-gray-50' : 'bg-black';
  const textMain = isLight ? 'text-gray-900' : 'text-white';
  const textSub = isLight ? 'text-gray-600' : 'text-gray-400';

  return (
    <div className={`min-h-screen pt-32 lg:pt-36 px-6 pb-20 ${bgSection} transition-colors duration-500`} dir={dir}>
      <div className="max-w-7xl mx-auto">
        
        {/* Editorial Hero */}
        <header className="mb-24 text-center max-w-4xl mx-auto">
            <MotionDiv 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8 border ${isLight ? 'bg-white border-gray-200 text-gray-500' : 'bg-white/5 border-white/10 text-gray-400'}`}
            >
                <GraduationCap className="w-4 h-4" />
                {t.learn.title}
            </MotionDiv>
            <h1 className={`text-5xl md:text-7xl font-bold mb-8 tracking-tight leading-tight ${textMain}`}>
                Knowledge is the <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-kairo-green to-emerald-400">Foundation of Action.</span>
            </h1>
            <p className={`text-xl md:text-2xl font-light leading-relaxed max-w-2xl mx-auto ${textSub}`}>
                {t.learn.desc}
            </p>
        </header>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-24">
            <LearnCard 
                title={t.learn.water.title}
                desc={t.learn.water.desc}
                icon={Droplets}
                color="blue"
                link="/water"
                actionText={t.learn.readGuide}
                theme={theme}
                dir={dir}
            />
            <LearnCard 
                title={t.learn.food.title}
                desc={t.learn.food.desc}
                icon={Utensils}
                color="orange"
                link="/food"
                actionText={t.learn.readGuide}
                theme={theme}
                dir={dir}
            />
            <LearnCard 
                title={t.learn.co2.title}
                desc={t.learn.co2.desc}
                icon={Wind}
                color="gray"
                link="/co2"
                actionText={t.learn.readGuide}
                theme={theme}
                dir={dir}
            />
            <LearnCard 
                title={t.learn.sust.title}
                desc={t.learn.sust.desc}
                icon={Leaf}
                color="green"
                link="/sustainability"
                actionText={t.learn.readGuide}
                theme={theme}
                dir={dir}
            />
        </div>

        {/* Global Context Banner */}
        <div className={`relative overflow-hidden rounded-[3rem] p-12 text-center border ${isLight ? 'bg-white border-gray-200 shadow-xl' : 'bg-gradient-to-b from-gray-900 to-black border-white/10'}`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50"></div>
            <div className="relative z-10 max-w-3xl mx-auto">
                <Globe className="w-16 h-16 mx-auto mb-6 text-gray-500" />
                <h2 className={`text-3xl font-bold mb-4 ${textMain}`}>Global Climate Science</h2>
                <p className={`text-lg mb-8 ${textSub}`}>
                    Kairo aligns all educational content with the latest IPCC reports (AR6) and local Egyptian environmental studies to ensure every fact you read is actionable and accurate.
                </p>
                <div className="flex justify-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                    <span>IPCC Aligned</span>
                    <span>•</span>
                    <span>Regionally Specific</span>
                    <span>•</span>
                    <span>Data Driven</span>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Learn;
