import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Droplet, LayoutDashboard, RadioTower, Utensils, Zap } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

/**
 * App-style bottom navigation for phones. It mirrors the core resource system
 * (water, energy, food) plus the live signal layer, which is the same
 * information architecture the dashboard uses. Keeping it here means the
 * installed PWA and any future Capacitor shell already have native-feeling
 * primary navigation without touching the desktop header.
 */
const MobileTabBar: React.FC = () => {
  const { language, theme } = useApp();
  const location = useLocation();
  const isAr = language === 'ar';
  const isLight = theme === 'light';

  // The marketing home page carries its own calls to action.
  if (location.pathname === '/') return null;

  const tabs = [
    {
      id: 'dashboard',
      label: isAr ? 'المتابعة' : 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'water',
      label: isAr ? 'المياه' : 'Water',
      path: '/systems/water-scarcity',
      icon: Droplet,
    },
    {
      id: 'energy',
      label: isAr ? 'الطاقة' : 'Energy',
      path: '/energy',
      icon: Zap,
    },
    {
      id: 'food',
      label: isAr ? 'الغذاء' : 'Food',
      path: '/systems/food-security',
      icon: Utensils,
    },
    {
      id: 'signals',
      label: isAr ? 'الإشارات' : 'Signals',
      path: '/monitor',
      icon: RadioTower,
    },
  ];

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <nav
      aria-label={isAr ? 'التنقل السريع للتطبيق' : 'App quick navigation'}
      className={`kairo-app-tabbar fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-2xl lg:hidden ${
        isLight
          ? 'border-slate-900/10 bg-white/92 text-slate-900'
          : 'border-white/10 bg-[#07110f]/94 text-slate-100'
      }`}
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-1 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          return (
            <li key={tab.id} className="flex-1">
              <Link
                to={tab.path}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-[3.75rem] flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-black transition ${
                  active
                    ? 'text-kairo-green'
                    : isLight
                      ? 'text-slate-500 hover:bg-slate-900/[0.04]'
                      : 'text-slate-400 hover:bg-white/[0.05]'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
                <span
                  aria-hidden="true"
                  className={`h-1 w-1 rounded-full ${active ? 'bg-kairo-green' : 'bg-transparent'}`}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MobileTabBar;
