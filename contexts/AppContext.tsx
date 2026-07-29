
import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '../utils/translations';

interface AppContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  language: Language;
  toggleLanguage: () => void;
  t: any; // Translation object
  playSound: (type: 'click' | 'success') => void;
  dir: 'ltr' | 'rtl';
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Persistent State Initialization
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('kairo_theme');
      return (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';
    }
    return 'dark';
  });
  
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('kairo_lang');
      return (savedLang === 'en' || savedLang === 'ar') ? savedLang : 'ar';
    }
    return 'ar';
  });

  // 2. Derived State
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const t = translations[language];

  // 3. Global Side Effects (The "Liquid" Engine)
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    
    // Apply Theme Class
    if (theme === 'light') {
      root.classList.add('light-mode');
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.remove('light-mode');
      root.classList.remove('light');
      root.classList.add('dark');
    }
    localStorage.setItem('kairo_theme', theme);

    // Apply Language & Direction
    root.lang = language;
    root.dir = dir;
    localStorage.setItem('kairo_lang', language);

  }, [theme, language, dir]);

  // 4. Actions
  const toggleTheme = () => {
    playSound('click');
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleLanguage = () => {
    playSound('click');
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  };

  const playSound = (type: 'click' | 'success') => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'click') {
        // Crisp UI Pop
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.08);
        osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'success') {
        // Ethereal Chime
        const now = ctx.currentTime;
        const playNote = (freq: number, startTime: number) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.connect(g);
            g.connect(ctx.destination);
            o.type = 'sine';
            o.frequency.value = freq;
            g.gain.setValueAtTime(0.03, startTime);
            g.gain.exponentialRampToValueAtTime(0.00001, startTime + 1.2);
            o.start(startTime);
            o.stop(startTime + 1.2);
        };
        // Major chord for positivity
        playNote(523.25, now);       // C5
        playNote(659.25, now + 0.1); // E5
        playNote(783.99, now + 0.2); // G5
        playNote(1046.50, now + 0.3);// C6
    }
  };

  return (
    <AppContext.Provider value={{ theme, toggleTheme, language, toggleLanguage, t, playSound, dir }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
};
