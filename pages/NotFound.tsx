import React from 'react';
import { ArrowLeft, ArrowRight, SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

const NotFound: React.FC = () => {
  const { language, dir, theme } = useApp();
  const isAr = language === 'ar';
  const isLight = theme === 'light';
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  return (
    <main className={`flex min-h-screen items-center justify-center px-5 pb-20 pt-32 ${isLight ? 'bg-[#f5f8f6]' : 'bg-kairo-ink'}`} dir={dir}>
      <section className={`w-full max-w-2xl rounded-[2rem] border p-8 text-center shadow-2xl sm:p-12 ${isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-white/[0.035]'}`}>
        <SearchX className="mx-auto mb-6 h-12 w-12 text-kairo-green" aria-hidden="true" />
        <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-kairo-green">404</p>
        <h1 className={`text-3xl font-black sm:text-5xl ${isLight ? 'text-slate-950' : 'text-white'}`}>
          {isAr ? 'الصفحة غير موجودة' : 'Page not found'}
        </h1>
        <p className={`mx-auto mt-5 max-w-xl leading-8 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          {isAr
            ? 'قد يكون الرابط قد تغيّر أو لم يعد متاحاً. ارجع إلى لوحة Kairo لاستكشاف أدوات الذكاء البيئي.'
            : 'The link may have changed or is no longer available. Return to Kairo to explore the environmental intelligence tools.'}
        </p>
        <Link to="/" className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-kairo-green px-7 font-extrabold text-[#052019] transition-transform hover:-translate-y-0.5">
          {isAr ? 'العودة إلى الرئيسية' : 'Return home'}
          <Arrow className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
};

export default NotFound;
