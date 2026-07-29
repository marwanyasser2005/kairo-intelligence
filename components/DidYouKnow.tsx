
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Sparkles } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

// Type casting to bypass strict environment checks
const MotionP = motion.p as any;

const DidYouKnow: React.FC = () => {
  const { t, theme } = useApp();
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    // Rotate facts every 10 seconds
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % t.trivia.facts.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [t.trivia.facts.length]);

  return (
    <div className={`rounded-2xl p-6 border transition-colors relative overflow-hidden ${
        theme === 'dark' 
        ? 'bg-gradient-to-r from-blue-900/10 to-transparent border-blue-500/20' 
        : 'bg-white border-blue-200 shadow-sm'
    }`}>
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Lightbulb className={`w-24 h-24 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
      </div>
      
      <div className="relative z-10">
        <div className={`flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-widest ${
            theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
        }`}>
            <Sparkles className="w-4 h-4" />
            {t.trivia.title}
        </div>
        
        <div className="h-16 flex items-center">
            <AnimatePresence mode="wait">
                <MotionP
                    key={factIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className={`text-lg font-medium leading-relaxed ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}
                >
                    "{t.trivia.facts[factIndex]}"
                </MotionP>
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default DidYouKnow;
