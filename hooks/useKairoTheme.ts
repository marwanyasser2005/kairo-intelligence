import { useApp } from '../contexts/AppContext';

/**
 * One shared theme vocabulary for every page and module. Pages previously
 * declared their own textMain/textSub/bgCard tuples in two dialects (slate vs
 * gray); this hook returns the single KAIRO system so surfaces, borders, and
 * muted text match across the app.
 */
export interface KairoTheme {
  isLight: boolean;
  isAr: boolean;
  dir: 'rtl' | 'ltr';
  textMain: string;
  textSub: string;
  textSoft: string;
  border: string;
  surface: string;
  /** Elevated card surface with its border, ready to spread into className. */
  card: string;
  inputStyle: string;
  labelStyle: string;
}

export const useKairoTheme = (): KairoTheme => {
  const { theme, language, dir } = useApp();
  const isLight = theme === 'light';
  const isAr = language === 'ar';
  const textMain = isLight ? 'text-slate-950' : 'text-white';
  const textSub = isLight ? 'text-slate-600' : 'text-slate-400';
  const textSoft = isLight ? 'text-slate-500' : 'text-slate-500';
  const border = isLight ? 'border-slate-900/[0.09]' : 'border-white/[0.09]';
  const surface = isLight ? 'bg-white/80' : 'bg-white/[0.04]';

  return {
    isLight,
    isAr,
    dir: dir === 'ltr' ? 'ltr' : 'rtl',
    textMain,
    textSub,
    textSoft,
    border,
    surface,
    card: isLight
      ? 'bg-white border-slate-900/[0.08] shadow-[0_1px_3px_rgb(0_0_0/0.04)]'
      : 'bg-white/[0.035] border-white/[0.08]',
    inputStyle: `w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-kairo-green/40 transition-all ${
      isLight
        ? 'bg-slate-50 border border-slate-200 text-slate-900'
        : 'bg-black/25 border border-white/10 text-white'
    }`,
    labelStyle: `block text-xs font-bold uppercase tracking-wider mb-2 ${textSub}`,
  };
};
