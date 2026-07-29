import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, CircleGauge, Database, Target, Users } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import {
  getAudienceProfile,
  kairoCapabilities,
  localize,
  type CapabilityId,
} from '../config/kairoCapabilities';

interface CapabilityContextProps {
  capabilityId: CapabilityId;
  className?: string;
}

const CapabilityContext: React.FC<CapabilityContextProps> = ({
  capabilityId,
  className = '',
}) => {
  const { language, theme, dir } = useApp();
  const isAr = language === 'ar';
  const isLight = theme === 'light';
  const currentLanguage = isAr ? 'ar' : 'en';
  const capability = kairoCapabilities.find((item) => item.id === capabilityId);

  if (!capability) return null;

  return (
    <section
      className={`mb-8 overflow-hidden rounded-[1.6rem] border ${
        isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-white/[0.035]'
      } ${className}`}
      aria-label={isAr ? 'دليل استخدام الخاصية' : 'Capability use guide'}
    >
      <div className="grid lg:grid-cols-[.82fr_1.18fr]">
        <div className={`p-5 sm:p-6 ${isLight ? 'bg-[#0b2a22] text-white' : 'bg-kairo-green/[0.07]'}`}>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.15em] text-kairo-green">
            <Target className="h-3.5 w-3.5" />
            {isAr ? 'ليه تستخدم الخاصية دي؟' : 'Why use this capability?'}
          </div>
          <h2 className="mt-4 text-xl font-black text-white">
            {localize(capability.title, currentLanguage)}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            {localize(capability.purpose, currentLanguage)}
          </p>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.15em] text-kairo-green">
            <Users className="h-3.5 w-3.5" />
            {isAr ? 'مين هيستفيد منها؟' : 'Who benefits?'}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {capability.audiences.map((audienceId) => {
              const audience = getAudienceProfile(audienceId);
              return audience ? (
                <span
                  key={audienceId}
                  className={`rounded-full border px-3 py-1.5 text-[10px] font-bold ${
                    isLight
                      ? 'border-slate-200 bg-slate-50 text-slate-600'
                      : 'border-white/10 bg-black/20 text-slate-300'
                  }`}
                >
                  {localize(audience.shortLabel, currentLanguage)}
                </span>
              ) : null;
            })}
          </div>
          <p className={`mt-4 text-xs leading-6 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            <strong className={isLight ? 'text-slate-900' : 'text-white'}>
              {isAr ? 'في الآخر هتحصل على: ' : 'What you will get: '}
            </strong>
            {localize(capability.outcome, currentLanguage)}
          </p>
          <Link
            to="/dashboard"
            className={`mt-4 inline-flex items-center gap-2 text-[11px] font-black ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            {isAr ? 'العودة لصورة المتابعة الكاملة' : 'Return to the full dashboard'}
            <ArrowUpRight className={`h-3.5 w-3.5 text-kairo-green ${dir === 'rtl' ? '-scale-x-100' : ''}`} />
          </Link>
        </div>
      </div>
      <div
        className={`grid gap-px border-t sm:grid-cols-3 ${
          isLight ? 'border-slate-200 bg-slate-200' : 'border-white/10 bg-white/10'
        }`}
      >
        {[
          {
            Icon: Database,
            step: isAr ? '01 · دخل الأساسيات' : '01 · Add the essentials',
            text: isAr ? 'بيانات قليلة وواضحة، من غير تعقيد.' : 'A small, clear set of inputs.',
          },
          {
            Icon: CircleGauge,
            step: isAr ? '02 · افهم المؤشر' : '02 · Understand the indicator',
            text: isAr ? 'اعرف الرقم جاي منين وحدود دقته.' : 'See where the value comes from and its limits.',
          },
          {
            Icon: CheckCircle2,
            step: isAr ? '03 · خُد إجراء' : '03 · Take action',
            text: isAr ? 'نفّذ خطوة قابلة للقياس واحفظ التقرير.' : 'Take a measurable step and save the report.',
          },
        ].map(({ Icon, step, text }) => (
          <div
            key={step}
            className={`flex items-start gap-3 p-4 ${
              isLight ? 'bg-slate-50' : 'bg-[#0b1714]'
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-kairo-green/10 text-kairo-green">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className={`text-[11px] font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {step}
              </p>
              <p className={`mt-1 text-[10px] leading-5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CapabilityContext;
