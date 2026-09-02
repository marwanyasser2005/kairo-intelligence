import React, { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowDown,
  BadgeCheck,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileCheck2,
  Gauge,
  Plus,
  RefreshCw,
  Scale,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingDown,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { generateFromAPI } from '../services/aiClient';
import {
  IMPACT_METRICS,
  calculateImpactPortfolio,
  type ImpactAction,
  type ImpactMeasurement,
  type ImpactMetricId,
} from '../services/impactVerification';
import { usePersistentState } from '../utils/storage';

interface AiImpactReview {
  executiveSummary: string;
  evidenceAssessment: string;
  risks: string[];
  nextMeasurement: string;
  repeatabilitySteps: string[];
}

const reviewSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'executiveSummary',
    'evidenceAssessment',
    'risks',
    'nextMeasurement',
    'repeatabilitySteps',
  ],
  properties: {
    executiveSummary: { type: 'string' },
    evidenceAssessment: { type: 'string' },
    risks: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 4 },
    nextMeasurement: { type: 'string' },
    repeatabilitySteps: {
      type: 'array',
      items: { type: 'string' },
      minItems: 2,
      maxItems: 5,
    },
  },
} as const;

const emptyMeasurement = (metric: ImpactMetricId = 'energy'): ImpactMeasurement => ({
  id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
  metric,
  baselineValue: 0,
  baselineDays: 30,
  followUpValue: 0,
  followUpDays: 30,
  unitCost: 0,
  baselineEvidence: '',
  followUpEvidence: '',
  sameScope: true,
});

const formatNumber = (value: number, language: 'ar' | 'en', digits = 1) =>
  new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-GB', {
    maximumFractionDigits: digits,
  }).format(value);

const ImpactVerification: React.FC = () => {
  const { language, theme, dir } = useApp();
  const isAr = language === 'ar';
  const isLight = theme === 'light';
  const reduceMotion = useReducedMotion();
  const [action, setAction] = usePersistentState<ImpactAction>('kairo_verified_action_v1', {
    title: '',
    owner: '',
    startedAt: new Date().toISOString().slice(0, 10),
    scope: '',
    notes: '',
  });
  const [measurements, setMeasurements] = usePersistentState<ImpactMeasurement[]>(
    'kairo_verified_measurements_v1',
    [emptyMeasurement('energy')],
  );
  const [aiReview, setAiReview] = usePersistentState<AiImpactReview | null>(
    'kairo_verified_ai_review_v1',
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const portfolio = useMemo(
    () => calculateImpactPortfolio(measurements, action),
    [measurements, action],
  );
  const textMain = isLight ? 'text-slate-950' : 'text-white';
  const textSub = isLight ? 'text-slate-600' : 'text-slate-300';
  const textSoft = isLight ? 'text-slate-500' : 'text-slate-400';

  const updateMeasurement = <K extends keyof ImpactMeasurement>(
    id: string,
    key: K,
    value: ImpactMeasurement[K],
  ) => {
    setMeasurements((current) =>
      current.map((measurement) =>
        measurement.id === id ? { ...measurement, [key]: value } : measurement,
      ),
    );
    setAiReview(null);
  };

  const addMeasurement = () => {
    const used = new Set(measurements.map((item) => item.metric));
    const next = IMPACT_METRICS.find((item) => !used.has(item.id))?.id ?? 'energy';
    setMeasurements((current) => [...current, emptyMeasurement(next)]);
  };

  const removeMeasurement = (id: string) => {
    setMeasurements((current) => current.filter((measurement) => measurement.id !== id));
    setAiReview(null);
  };

  const runAiReview = async () => {
    if (!portfolio.results.length) {
      setError(
        isAr
          ? 'أدخل قيم خط الأساس والمتابعة أولًا.'
          : 'Enter baseline and follow-up values first.',
      );
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await generateFromAPI(
        JSON.stringify({
          action,
          measurements: portfolio.results,
          portfolio: {
            averageEvidence: portfolio.averageEvidence,
            positiveResults: portfolio.positiveResults,
            totalFinancialSaving: portfolio.totalFinancialSaving,
            repeatable: portfolio.repeatable,
          },
        }),
        reviewSchema,
        `You are KAIRO's impact-evidence reviewer. Respond in ${isAr ? 'Arabic' : 'English'}.
Review only the supplied deterministic calculations. Never invent readings, savings, causality, certification, or third-party verification. Distinguish documented evidence from estimates. Explain confounders and propose a precise next measurement and repeatability protocol. Keep every field concise and practical.`,
      );
      setAiReview(result as AiImpactReview);
    } catch (reviewError) {
      setError(
        reviewError instanceof Error
          ? reviewError.message
          : isAr
            ? 'تعذر إكمال المراجعة الآن.'
            : 'The review could not be completed.',
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadEvidence = () => {
    const payload = {
      product: 'KAIRO Intelligence',
      exportedAt: new Date().toISOString(),
      methodology: 'Period-normalized before/after comparison',
      action,
      measurements,
      results: portfolio,
      aiReview,
      disclaimer:
        'This evidence pack documents user-supplied sources and deterministic calculations. It is not an independent audit or proof of causality.',
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `kairo-impact-evidence-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen pb-24 pt-28" dir={dir}>
      <div className="kairo-shell">
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.35 }}
          className="kairo-proof-hero kairo-glass-panel overflow-hidden rounded-[2rem] p-6 sm:p-9 lg:p-12"
        >
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-4xl">
              <span className="kairo-eyebrow">
                <BadgeCheck className="h-4 w-4" />
                {isAr ? 'KAIRO Proof of Impact' : 'KAIRO Proof of Impact'}
              </span>
              <h1 className={`mt-6 text-4xl font-semibold leading-[1.12] sm:text-5xl lg:text-6xl ${textMain}`}>
                {isAr ? 'حوّل القرار إلى وفر موثّق وقابل للتكرار' : 'Turn a decision into documented, repeatable savings'}
              </h1>
              <p className={`mt-5 max-w-3xl text-base leading-8 sm:text-lg ${textSub}`}>
                {isAr
                  ? 'قارن فترات متكافئة قبل الإجراء وبعده، اربط كل قيمة بمصدرها، واحصل على حساب شفاف ومراجعة ذكية لا تتجاوز حدود الدليل.'
                  : 'Compare equivalent periods before and after an action, link every value to its source, and get a transparent calculation plus an AI review that stays within the evidence.'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
              {[
                { value: portfolio.results.length, label: isAr ? 'مؤشرات محسوبة' : 'Calculated metrics' },
                { value: `${portfolio.averageEvidence}%`, label: isAr ? 'اكتمال الدليل' : 'Evidence completeness' },
                { value: portfolio.positiveResults, label: isAr ? 'نتائج تحسن' : 'Improved results' },
                { value: portfolio.repeatable ? '✓' : '—', label: isAr ? 'قابل للتكرار' : 'Repeatable' },
              ].map((item) => (
                <div key={item.label} className="kairo-glass-tile min-w-[8.5rem] rounded-2xl p-4">
                  <strong className={`block text-2xl ${textMain}`}>{item.value}</strong>
                  <span className={`mt-1 block text-[10px] font-bold ${textSoft}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.header>

        <section className="mt-6 grid gap-6 xl:grid-cols-[.82fr_1.18fr]" aria-labelledby="action-title">
          <div className="kairo-glass-panel rounded-[2rem] p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <span className="kairo-icon-well"><ClipboardCheck className="h-5 w-5" /></span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.16em] text-kairo-green">01</p>
                <h2 id="action-title" className={`text-2xl font-semibold ${textMain}`}>
                  {isAr ? 'وثّق الإجراء' : 'Document the action'}
                </h2>
              </div>
            </div>
            <div className="mt-6 grid gap-4">
              <label className="kairo-field-label">
                <span>{isAr ? 'الإجراء المنفذ' : 'Implemented action'}</span>
                <input value={action.title} onChange={(event) => setAction({ ...action, title: event.target.value })} placeholder={isAr ? 'مثال: ضبط تشغيل التكييف' : 'Example: optimise AC schedule'} />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="kairo-field-label">
                  <span>{isAr ? 'المسؤول' : 'Owner'}</span>
                  <input value={action.owner} onChange={(event) => setAction({ ...action, owner: event.target.value })} />
                </label>
                <label className="kairo-field-label">
                  <span>{isAr ? 'تاريخ البدء' : 'Start date'}</span>
                  <input type="date" value={action.startedAt} onChange={(event) => setAction({ ...action, startedAt: event.target.value })} />
                </label>
              </div>
              <label className="kairo-field-label">
                <span>{isAr ? 'النطاق الثابت للمقارنة' : 'Comparison scope'}</span>
                <input value={action.scope} onChange={(event) => setAction({ ...action, scope: event.target.value })} placeholder={isAr ? 'المبنى، الموقع، عدد المستخدمين…' : 'Building, site, occupants…'} />
              </label>
              <label className="kairo-field-label">
                <span>{isAr ? 'ظروف أو ملاحظات مؤثرة' : 'Context and confounders'}</span>
                <textarea rows={4} value={action.notes} onChange={(event) => setAction({ ...action, notes: event.target.value })} placeholder={isAr ? 'الطقس، الإشغال، أيام الإغلاق، تغير الأسعار…' : 'Weather, occupancy, closures, tariff changes…'} />
              </label>
            </div>
          </div>

          <div className="kairo-glass-panel rounded-[2rem] p-5 sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="kairo-icon-well"><Scale className="h-5 w-5" /></span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[.16em] text-kairo-green">02</p>
                  <h2 className={`text-2xl font-semibold ${textMain}`}>{isAr ? 'قِس قبل وبعد' : 'Measure before and after'}</h2>
                </div>
              </div>
              <button type="button" onClick={addMeasurement} className="kairo-secondary-button">
                <Plus className="h-4 w-4" /> {isAr ? 'أضف مؤشرًا' : 'Add metric'}
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {measurements.map((measurement, index) => {
                const definition = IMPACT_METRICS.find((item) => item.id === measurement.metric)!;
                const result = portfolio.results.find((item) => item.id === measurement.id);
                return (
                  <article key={measurement.id} className="kairo-glass-tile rounded-[1.5rem] p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-3">
                      <select aria-label={isAr ? 'نوع المؤشر' : 'Metric type'} value={measurement.metric} onChange={(event) => updateMeasurement(measurement.id, 'metric', event.target.value as ImpactMetricId)} className="max-w-[15rem] font-bold">
                        {IMPACT_METRICS.map((metric) => <option key={metric.id} value={metric.id}>{isAr ? metric.label.ar : metric.label.en} · {metric.unit}</option>)}
                      </select>
                      {measurements.length > 1 && (
                        <button type="button" onClick={() => removeMeasurement(measurement.id)} className="kairo-icon-button text-rose-400" aria-label={isAr ? `حذف المؤشر ${index + 1}` : `Remove metric ${index + 1}`}><Trash2 className="h-4 w-4" /></button>
                      )}
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {[
                        ['baselineValue', isAr ? 'قيمة خط الأساس' : 'Baseline value', measurement.baselineValue],
                        ['baselineDays', isAr ? 'أيام خط الأساس' : 'Baseline days', measurement.baselineDays],
                        ['followUpValue', isAr ? 'قيمة المتابعة' : 'Follow-up value', measurement.followUpValue],
                        ['followUpDays', isAr ? 'أيام المتابعة' : 'Follow-up days', measurement.followUpDays],
                      ].map(([key, label, value]) => (
                        <label key={String(key)} className="kairo-field-label">
                          <span>{String(label)}</span>
                          <input type="number" min="0" step="any" value={Number(value)} onChange={(event) => updateMeasurement(measurement.id, key as 'baselineValue', Number(event.target.value))} />
                        </label>
                      ))}
                      {measurement.metric !== 'cost' && (
                        <label className="kairo-field-label md:col-span-2">
                          <span>{isAr ? `تكلفة الوحدة الاختيارية (جنيه/${definition.unit})` : `Optional unit cost (EGP/${definition.unit})`}</span>
                          <input type="number" min="0" step="any" value={measurement.unitCost ?? 0} onChange={(event) => updateMeasurement(measurement.id, 'unitCost', Number(event.target.value))} />
                        </label>
                      )}
                      <label className="kairo-field-label">
                        <span>{isAr ? 'مصدر خط الأساس' : 'Baseline evidence source'}</span>
                        <input value={measurement.baselineEvidence} onChange={(event) => updateMeasurement(measurement.id, 'baselineEvidence', event.target.value)} placeholder={isAr ? 'رقم فاتورة أو قراءة عداد' : 'Invoice or meter reference'} />
                      </label>
                      <label className="kairo-field-label">
                        <span>{isAr ? 'مصدر المتابعة' : 'Follow-up evidence source'}</span>
                        <input value={measurement.followUpEvidence} onChange={(event) => updateMeasurement(measurement.id, 'followUpEvidence', event.target.value)} placeholder={isAr ? 'رقم فاتورة أو قراءة عداد' : 'Invoice or meter reference'} />
                      </label>
                    </div>
                    <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold">
                      <input type="checkbox" checked={measurement.sameScope} onChange={(event) => updateMeasurement(measurement.id, 'sameScope', event.target.checked)} className="h-5 w-5 accent-emerald-400" />
                      <span className={textSub}>{isAr ? 'أؤكد أن الموقع والنطاق متكافئان بين الفترتين' : 'The site and scope are equivalent across both periods'}</span>
                    </label>
                    {result && (
                      <div className="mt-5 grid gap-2 border-t border-white/10 pt-4 sm:grid-cols-3">
                        <div><span className={`text-[10px] ${textSoft}`}>{isAr ? 'التغير المطبّع' : 'Normalised change'}</span><strong className={`block text-lg ${result.percentChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{result.percentChange >= 0 ? '−' : '+'}{formatNumber(Math.abs(result.percentChange), language)}%</strong></div>
                        <div><span className={`text-[10px] ${textSoft}`}>{isAr ? 'الوفر في المتابعة' : 'Follow-up saving'}</span><strong className={`block text-lg ${textMain}`}>{formatNumber(result.savedDuringFollowUp, language)} {definition.unit}</strong></div>
                        <div><span className={`text-[10px] ${textSoft}`}>{isAr ? 'اكتمال الدليل' : 'Evidence completeness'}</span><strong className={`block text-lg ${textMain}`}>{result.evidenceScore}%</strong></div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[.72fr_1.28fr]" aria-labelledby="proof-results-title">
          <div className="kairo-glass-panel rounded-[2rem] p-5 sm:p-7">
            <span className="kairo-eyebrow"><Gauge className="h-4 w-4" /> {isAr ? 'درجة الإثبات' : 'Evidence score'}</span>
            <div className="mt-6 flex items-center gap-5">
              <div className="kairo-proof-ring" style={{ '--proof-score': portfolio.averageEvidence } as React.CSSProperties} aria-label={`${portfolio.averageEvidence}%`}>
                <span>{portfolio.averageEvidence}<small>/100</small></span>
              </div>
              <div>
                <h2 id="proof-results-title" className={`text-2xl font-semibold ${textMain}`}>{isAr ? 'نتيجة قابلة للمراجعة' : 'Reviewable result'}</h2>
                <p className={`mt-2 text-sm leading-6 ${textSub}`}>{portfolio.repeatable ? (isAr ? 'الأدلة مكتملة والنتائج إيجابية عبر كل المؤشرات.' : 'Evidence is complete and every measured result is positive.') : (isAr ? 'أكمل المصادر والنطاق والفترات للوصول إلى دليل أقوى.' : 'Complete sources, scope and periods to strengthen the evidence.')}</p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="kairo-glass-tile rounded-2xl p-4"><TrendingDown className="h-5 w-5 text-emerald-400" /><strong className={`mt-3 block text-2xl ${textMain}`}>{portfolio.positiveResults}</strong><span className={`text-[10px] ${textSoft}`}>{isAr ? 'مؤشرات تحسنت' : 'Improved metrics'}</span></div>
              <div className="kairo-glass-tile rounded-2xl p-4"><ShieldCheck className="h-5 w-5 text-cyan-400" /><strong className={`mt-3 block text-2xl ${textMain}`}>{formatNumber(portfolio.totalFinancialSaving, language)} <small className="text-xs">EGP</small></strong><span className={`text-[10px] ${textSoft}`}>{isAr ? 'وفر مالي موثق بالفترة' : 'Period financial saving'}</span></div>
            </div>
            <button type="button" onClick={downloadEvidence} disabled={!portfolio.results.length} className="kairo-secondary-button mt-5 w-full justify-center disabled:cursor-not-allowed disabled:opacity-45"><Download className="h-4 w-4" /> {isAr ? 'نزّل حزمة الدليل JSON' : 'Download evidence pack'}</button>
          </div>

          <div className="kairo-glass-panel rounded-[2rem] p-5 sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="kairo-icon-well"><Bot className="h-5 w-5" /></span>
                <div><p className="text-[10px] font-black uppercase tracking-[.16em] text-kairo-green">03 · AI</p><h2 className={`text-2xl font-semibold ${textMain}`}>{isAr ? 'راجع الدليل وحدود النتيجة' : 'Review evidence and result limits'}</h2></div>
              </div>
              <button type="button" onClick={runAiReview} disabled={loading || !portfolio.results.length} className="kairo-primary-button disabled:cursor-not-allowed disabled:opacity-45">
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {loading ? (isAr ? 'تجري المراجعة…' : 'Reviewing…') : (isAr ? 'شغّل مراجعة KAIRO' : 'Run KAIRO review')}
              </button>
            </div>
            {error && <p role="alert" className="mt-5 rounded-2xl border border-rose-400/25 bg-rose-400/10 p-4 text-sm text-rose-300">{error}</p>}
            {aiReview ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="kairo-glass-tile rounded-2xl p-5 md:col-span-2"><div className="flex items-center gap-2 text-kairo-green"><CheckCircle2 className="h-4 w-4" /><strong className="text-sm">{isAr ? 'الخلاصة التنفيذية' : 'Executive summary'}</strong></div><p className={`mt-3 text-sm leading-7 ${textSub}`}>{aiReview.executiveSummary}</p></div>
                <div className="kairo-glass-tile rounded-2xl p-5"><strong className={`text-sm ${textMain}`}>{isAr ? 'تقييم الدليل' : 'Evidence assessment'}</strong><p className={`mt-3 text-sm leading-7 ${textSub}`}>{aiReview.evidenceAssessment}</p></div>
                <div className="kairo-glass-tile rounded-2xl p-5"><strong className={`text-sm ${textMain}`}>{isAr ? 'القياس التالي' : 'Next measurement'}</strong><p className={`mt-3 text-sm leading-7 ${textSub}`}>{aiReview.nextMeasurement}</p></div>
                <div className="kairo-glass-tile rounded-2xl p-5"><strong className={`text-sm ${textMain}`}>{isAr ? 'مخاطر الاستنتاج' : 'Inference risks'}</strong><ul className={`mt-3 space-y-2 text-sm leading-6 ${textSub}`}>{aiReview.risks.map((item) => <li key={item} className="flex gap-2"><ArrowDown className="mt-1 h-4 w-4 shrink-0 text-amber-400" /><span>{item}</span></li>)}</ul></div>
                <div className="kairo-glass-tile rounded-2xl p-5"><strong className={`text-sm ${textMain}`}>{isAr ? 'بروتوكول التكرار' : 'Repeatability protocol'}</strong><ol className={`mt-3 space-y-2 text-sm leading-6 ${textSub}`}>{aiReview.repeatabilitySteps.map((item, index) => <li key={item} className="flex gap-2"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-[10px] font-black text-emerald-400">{index + 1}</span><span>{item}</span></li>)}</ol></div>
              </div>
            ) : (
              <div className="mt-6 flex min-h-64 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-white/10 p-8 text-center">
                <FileCheck2 className="h-10 w-10 text-kairo-green/70" />
                <p className={`mt-4 max-w-lg text-sm leading-7 ${textSub}`}>{isAr ? 'الحسابات تتم محليًا أولًا. بعدها يراجع KAIRO اكتمال الدليل، العوامل المربكة وخطوات تكرار النتيجة، من دون اختراع أي رقم.' : 'Calculations happen locally first. KAIRO then reviews evidence completeness, confounders and repeatability without inventing any number.'}</p>
              </div>
            )}
          </div>
        </section>

        <p className={`mx-auto mt-8 max-w-4xl text-center text-xs leading-6 ${textSoft}`}>
          {isAr ? 'هذه الأداة توثّق البيانات التي أدخلها المستخدم والحسابات المطبّعة زمنيًا. لا تمثل تدقيقًا مستقلًا ولا تثبت السببية بمفردها؛ استخدم فواتير وقراءات معتمدة ومراجعًا مستقلًا للادعاءات الرسمية.' : 'This tool documents user-supplied data and period-normalised calculations. It is not an independent audit and does not prove causality on its own; use authoritative readings and an independent reviewer for formal claims.'}
        </p>
      </div>
    </main>
  );
};

export default ImpactVerification;

