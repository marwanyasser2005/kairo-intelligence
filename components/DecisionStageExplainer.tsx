import React from 'react';
import { ArrowRight, FlaskConical, FileCheck2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

interface Props { stage: 'scenario' | 'proof' }

const DecisionStageExplainer: React.FC<Props> = ({ stage }) => {
  const { language, dir } = useApp();
  const isAr = language === 'ar';
  const scenario = stage === 'scenario';
  const Icon = scenario ? FlaskConical : FileCheck2;
  return (
    <section className="kairo-glass-panel rounded-[1.75rem] border border-emerald-500/15 p-5 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-emerald-500/12 p-3 text-emerald-500"><Icon className="h-5 w-5" /></div>
          <div>
            <div className="text-[11px] font-black uppercase tracking-[.18em] text-emerald-500">{scenario ? (isAr ? 'قبل التنفيذ' : 'Before action') : (isAr ? 'بعد التنفيذ' : 'After action')}</div>
            <h2 className="mt-1 text-lg font-black text-slate-950 dark:text-white">{scenario ? (isAr ? 'مختبر السيناريوهات: ماذا لو؟' : 'Scenario Lab: what if?') : (isAr ? 'إثبات الأثر: ماذا تغيّر فعلًا؟' : 'Proof of Impact: what actually changed?')}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">{scenario ? (isAr ? 'قارن بدائل وافتراضات قبل ما تصرف أو تنفّذ. الناتج توقع تخطيطي، وليس دليلًا على أثر تحقق. استخدم النتائج لاتخاذ قرار موثوق.' : 'Compare alternatives and assumptions before spending or acting. The result is a planning forecast, not proof of achieved impact. Use it to make a confident decision.') : (isAr ? 'قارن خط أساس بقياس متابعة بعد التنفيذ، وسجّل مصدر القياس وحدود الاستنتاج عشان تطلع نتيجة قابلة للمراجعة.' : 'Compare a baseline with a follow-up measurement, recording evidence and inference limits for an auditable result.')}</p>
          </div>
        </div>
        <Link to={scenario ? '/scenarios' : '/proof'} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-emerald-500/25 px-4 text-sm font-bold text-emerald-600 hover:bg-emerald-500/10">
          {scenario ? (isAr ? 'بدأ المختبر' : 'Start Scenario Lab') : (isAr ? 'بدأ الإثبات' : 'Start Proof')}
          <ArrowRight className={`h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
        </Link>
      </div>
    </section>
  );
};

export default DecisionStageExplainer;
