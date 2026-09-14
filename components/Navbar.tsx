
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@heroui/react';
import { Menu, X, ChevronDown, Droplet, Utensils, Wind, Recycle, Moon, Sun, Zap, Truck, FlaskConical, Map as MapIcon, LayoutDashboard, RadioTower } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { KairoBrandMark } from './KairoBrand';

// Type casting to bypass strict environment checks
const MotionDiv = motion.div as any;

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme, language, toggleLanguage, t, playSound, dir } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [systemsOpen, setSystemsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateScrollState = () => setScrolled(window.scrollY > 18);
    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollState);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSystemsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [mobileMenuOpen]);

  const isActive = (path: string) => location.pathname === path;
  
  const systems = [
    {
      label:
        language === 'ar'
          ? 'KAIRO SIGNALS · الاستباق البيئي'
          : 'KAIRO SIGNALS · Environmental foresight',
      path: "/monitor",
      icon: <RadioTower className="w-4 h-4"/>,
    },
    { label: t.nav.systemsList.water, path: "/systems/water-scarcity", icon: <Droplet className="w-4 h-4"/> },
    { label: t.nav.systemsList.energy, path: "/energy", icon: <Zap className="w-4 h-4"/> },
    { label: t.nav.systemsList.food, path: "/systems/food-security", icon: <Utensils className="w-4 h-4"/> },
    { label: t.nav.systemsList.transport, path: "/transport", icon: <Truck className="w-4 h-4"/> },
    { label: t.nav.systemsList.exposure, path: "/systems/urban-exposure", icon: <Wind className="w-4 h-4"/> },
    { label: t.nav.systemsList.ewaste, path: "/systems/ewaste", icon: <Recycle className="w-4 h-4"/> },
    { label: t.nav.systemsList.scenarios, path: "/scenarios", icon: <FlaskConical className="w-4 h-4"/> },
  ];

  const navItems = [
    { label: t.nav.home, path: "/" },
    { label: t.nav.dashboard, path: "/dashboard" },
    { label: language === 'ar' ? 'إثبات الأثر' : 'Proof of impact', path: "/proof" },
    { label: t.nav.logic, path: "/architecture" },
    { label: t.common.methodology || "Methodology", path: "/impact" },
    { label: t.nav.about, path: "/about" },
  ];

  const isLight = theme === 'light';
  const textColor = isLight ? 'text-slate-950' : 'text-white';
  const bgGlass = scrolled
    ? isLight
      ? 'bg-white/78 border-slate-900/[0.08] shadow-[0_10px_40px_rgba(10,50,40,.07)]'
      : 'bg-[#07100e]/78 border-white/[0.07] shadow-[0_16px_50px_rgba(0,0,0,.2)]'
    : 'bg-transparent border-transparent';

  return (
    <nav className={`kairo-navbar fixed top-0 z-50 w-full border-b backdrop-blur-2xl transition-all duration-300 ${bgGlass}`} dir={dir} aria-label={language === 'ar' ? 'التنقل الرئيسي' : 'Primary navigation'}>
      <div className={`mx-auto flex max-w-[1680px] items-center justify-between px-4 transition-all duration-300 sm:px-7 lg:px-10 xl:px-12 2xl:px-16 ${scrolled ? 'h-16' : 'h-20'}`}>
        
        {/* LOGO */}
        <Link to="/" className="group flex min-h-11 shrink-0 items-center outline-none" onClick={() => playSound('click')} aria-label={language === 'ar' ? 'العودة إلى الرئيسية' : 'Back to home'}>
          <div className="relative flex items-center justify-center">
             <KairoBrandMark className={`${scrolled ? 'h-14 sm:h-16 xl:h-[4.5rem]' : 'h-16 sm:h-[4.5rem] xl:h-20'} aspect-[822/938] transition-all duration-500 group-hover:scale-105`} />
          </div>
        </Link>
        
        {/* DESKTOP NAV LOGIC (1024px+) */}
        <div className="mx-4 hidden shrink-0 items-center gap-1 xl:flex xl:gap-2">
          {navItems.map(item => (
             <Link 
                key={item.path}
                to={item.path} 
                onClick={() => playSound('click')}
                aria-current={isActive(item.path) ? 'page' : undefined}
                className={`relative isolate inline-flex min-h-11 items-center overflow-hidden rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${isActive(item.path) ? textColor : (isLight ? 'text-slate-500 hover:text-black' : 'text-slate-400 hover:text-white')}`}
             >
                 {isActive(item.path) && (
                   <motion.span
                     layoutId="nav-active-pill"
                     className={`absolute inset-0 -z-10 rounded-full ${isLight ? 'bg-slate-900/[0.06]' : 'bg-white/[0.08]'}`}
                     transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                   />
                 )}
                 <span className="relative z-10">{item.label}</span>
             </Link>
          ))}

          {/* Systems Dropdown */}
          <div className="relative ms-1 block" onMouseEnter={() => setSystemsOpen(true)} onMouseLeave={() => setSystemsOpen(false)}>
              <button onClick={() => setSystemsOpen((open) => !open)} aria-expanded={systemsOpen} aria-haspopup="menu" className={`min-h-11 px-4 py-2 text-sm font-bold rounded-full transition-all flex items-center gap-1.5 ${location.pathname.includes('/systems') || ['/energy', '/transport', '/monitor', '/scenarios'].includes(location.pathname) ? (isLight ? 'bg-slate-900/[0.06] text-black' : 'bg-white/10 text-white') : (isLight ? 'text-slate-500 hover:text-black hover:bg-slate-50' : 'text-slate-400 hover:text-white hover:bg-white/5')}`}>
                  {t.nav.systems} <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${systemsOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                  {systemsOpen && (
                      <MotionDiv 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        role="menu"
                        className={`absolute top-full ${dir === 'rtl' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'} mt-2 w-[29rem] rounded-3xl shadow-2xl overflow-hidden p-3 border ${isLight ? 'bg-[#f8fbf9] border-emerald-950/10' : 'bg-[#0a1713] border-white/10'}`}
                      >
                          <div className="grid grid-cols-2 gap-1.5">
                          {systems.map((sys) => (
                              <Link 
                                key={sys.path} 
                                to={sys.path}
                                onClick={() => { setSystemsOpen(false); playSound('click'); }}
                                role="menuitem"
                                className={`flex min-h-14 items-center gap-3 rounded-2xl px-3 py-3 text-[13px] font-semibold leading-5 transition-colors ${isLight ? 'text-[#425c53] hover:bg-emerald-950/[0.05] hover:text-[#102a22]' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
                              >
                                  <span className={`grid size-9 shrink-0 place-items-center rounded-xl text-emerald-500 ${isLight ? 'bg-emerald-950/[0.05]' : 'bg-emerald-400/[0.08]'}`}>{sys.icon}</span>
                                  <span>{sys.label}</span>
                              </Link>
                          ))}
                          </div>
                      </MotionDiv>
                  )}
              </AnimatePresence>
          </div>
        </div>

        {/* SHARED ACTIONS (Visible on all breakpoints, wraps nicely) */}
        <div className="flex items-center gap-1 md:gap-3 shrink-0 z-50">
           
           {/* Language Toggle (Visible Everywhere) */}
           <Button
             isIconOnly
             size="sm"
             variant="ghost"
             onPress={toggleLanguage}
             className={`rounded-full ${isLight ? 'text-slate-700' : 'text-slate-300'}`}
             aria-label={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
           >
             <span className="font-cairo font-bold text-sm md:text-md">{language === 'en' ? 'ع' : 'En'}</span>
           </Button>

           {/* Theme Toggle (Visible Everywhere) */}
           <Button
             isIconOnly
             size="sm"
             variant="ghost"
             onPress={toggleTheme}
             className={`rounded-full ${isLight ? 'text-yellow-600' : 'text-sky-400'}`}
             aria-label={language === 'ar' ? 'تبديل المظهر' : 'Toggle theme'}
           >
             {isLight ? <Moon className="w-4 h-4 md:w-5 md:h-5" /> : <Sun className="w-4 h-4 md:w-5 md:h-5" />}
           </Button>

           {/* Primary dashboard entry */}
           <Button
            size="sm"
            variant="secondary"
            onPress={() => {
              playSound('click');
              navigate('/dashboard');
            }}
            className="hidden rounded-full text-[10px] font-bold uppercase tracking-wider sm:flex md:text-xs"
            aria-label={language === 'ar' ? 'فتح المتابعة البيئية' : 'Open environmental dashboard'}
           >
            <LayoutDashboard className="h-3 w-3 text-emerald-500 md:h-4 md:w-4" />
            <span className="hidden lg:inline">
              {language === 'ar' ? 'ابدأ المتابعة' : 'Open dashboard'}
            </span>
           </Button>

           <Link 
            to="/action" 
            onClick={() => playSound('click')}
            className={`hidden xl:flex px-4 py-2.5 rounded-full text-xs font-bold transition-all uppercase tracking-wider items-center gap-2 border hover:-translate-y-0.5 ${isLight ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
           >
            <MapIcon className="w-3 h-3" />
            {t.nav.roadmap}
          </Link>
          
          {/* MOBILE MENU BTN (Tablet / Mobile Only) */}
          <button 
              onClick={() => setMobileMenuOpen(true)} 
              className={`xl:hidden flex h-9 min-[380px]:h-10 items-center justify-center gap-2 rounded-lg border px-2 min-[380px]:px-3 ${isLight ? 'bg-white border-slate-200 active:bg-slate-100 text-slate-800' : 'bg-white/5 border-white/10 active:bg-white/10 text-white'}`}
              aria-label={language === 'ar' ? 'فتح القائمة' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
          >
            <span className="hidden min-[430px]:inline text-xs font-bold uppercase tracking-wider">{language === 'ar' ? 'القائمة' : 'Menu'}</span>
            <Menu className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>

      {/* Render outside the filtered navbar so fixed positioning uses the viewport. */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
                <MotionDiv 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm xl:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
                <MotionDiv 
                    initial={{ x: dir === 'rtl' ? '100%' : '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: dir === 'rtl' ? '100%' : '-100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className={`fixed inset-y-0 ${dir === 'rtl' ? 'right-0 border-l' : 'left-0 border-r'} z-[110] h-[100dvh] w-[min(92vw,24rem)] overflow-y-auto overscroll-contain shadow-2xl ${isLight ? 'border-slate-200 bg-white' : 'bg-[#07100e] border-white/10'}`}
                    role="dialog"
                    aria-modal="true"
                    aria-label={language === 'ar' ? 'قائمة التنقل' : 'Navigation menu'}
                >
                    <div className="flex min-h-full flex-col p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:p-6">
                        <div className="mb-7 flex items-center justify-between">
                            <KairoBrandMark className="h-28 aspect-[822/938]" />
                            <button onClick={() => setMobileMenuOpen(false)} aria-label={language === 'ar' ? 'إغلاق القائمة' : 'Close menu'} className={`p-2 rounded-full border ${isLight ? 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'}`}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Navigation Links */}
                        <div className="space-y-1.5 mb-8">
                            {navItems.map(item => (
                                <Link 
                                    key={item.path} 
                                    to={item.path}
                                    onClick={() => { setMobileMenuOpen(false); playSound('click'); }}
                                    className={`block rounded-xl p-3.5 text-base font-bold transition-colors sm:p-4 sm:text-lg ${isActive(item.path) ? (isLight ? 'bg-black text-white' : 'bg-white text-black') : (isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-300 hover:bg-white/5')}`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                            <div className="my-6 border-t border-dashed border-slate-300 dark:border-white/10"></div>
                            
                            <Link 
                                to="/action"
                                onClick={() => { setMobileMenuOpen(false); playSound('click'); }}
                                className={`flex items-center gap-3 p-4 rounded-xl font-bold text-lg transition-colors ${isActive('/action') ? (isLight ? 'bg-black text-white' : 'bg-white text-black') : (isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-300 hover:bg-white/5')}`}
                            >
                                <MapIcon className="w-5 h-5 text-emerald-500" />
                                {t.nav.roadmap}
                            </Link>
                        </div>

                        {/* Systems Module Footer */}
                        <div className="mt-6 border-t border-slate-200 pt-6 dark:border-white/10">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t.nav.systems}</div>
                            <div className="grid grid-cols-1 gap-2">
                                {systems.map((sys) => (
                                    <Link 
                                        key={sys.path}
                                        to={sys.path}
                                        onClick={() => { setMobileMenuOpen(false); playSound('click'); }}
                                        className={`flex items-center gap-3 p-4 rounded-xl text-sm font-medium transition-colors ${isLight ? 'bg-slate-50 text-slate-700 border border-slate-100 hover:bg-slate-100' : 'bg-white/5 text-slate-300 border border-white/5 hover:bg-white/10'}`}
                                    >
                                        <div className={`p-2 rounded-lg ${isLight ? 'bg-white shadow-sm' : 'bg-black/50'} text-indigo-500`}>{sys.icon}</div>
                                        <span className="text-start text-sm font-bold leading-5">{sys.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </MotionDiv>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </nav>
  );
};

export default Navbar;
