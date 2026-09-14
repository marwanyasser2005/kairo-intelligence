import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BadgeCheck,
  BrainCircuit,
  ChefHat,
  Clock3,
  Info,
  Loader2,
  Receipt,
  ShoppingBasket,
  Sparkles,
  Trash2,
  TrendingDown,
  Users,
  Utensils,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { runFoodWasteAnalysis } from '../../services/tokenRouterService';
import type { FoodWasteAnalysisReport } from '../../types';
import ModuleToolbar from '../../components/ModuleToolbar';
import BillUploader from '../../components/BillUploader';
import CapabilityContext from '../../components/CapabilityContext';
import DecisionIntelligence from '../../components/DecisionIntelligence';
import { usePersistentState } from '../../utils/storage';
import { localizeDisplayValue, riskToneClass } from '../../utils/displayLabels';
import { ResponsiveContainer, Tooltip as RechartsTooltip, Bar, BarChart, Cell, CartesianGrid, XAxis, YAxis } from 'recharts';

const MotionDiv = motion.div as any;

interface FoodSecurityProps {
  report: FoodWasteAnalysisReport | null;
  setGlobalReport?: (report: FoodWasteAnalysisReport | null) => void;
  /** Household summary saved by the unified dashboard flow. */
  globalFoodData?: { mealsPerDay: number; costPerMealLE: number; wastePercentage: number };
  setGlobalFoodData?: (data: { mealsPerDay: number; costPerMealLE: number; wastePercentage: number }) => void;
}

const FoodSecurityIntelligence: React.FC<FoodSecurityProps> = ({
  report,
  setGlobalReport,
  setGlobalFoodData,
}) => {
  const { theme, dir, language } = useApp();
  const isAr = language === 'ar';
  const isLight = theme === 'light';

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptTotal, setReceiptTotal] = useState(0);

  // Step 1: the household and its food budget.
  const [familySize, setFamilySize] = usePersistentState('kairo_fw_v2_family', 4);
  const [homeMealsPerDay, setHomeMealsPerDay] = usePersistentState('kairo_fw_v2_meals', 3);
  const [monthlyBudget, setMonthlyBudget] = usePersistentState('kairo_fw_v2_budget', 4000);
  const [restaurantPercent, setRestaurantPercent] = usePersistentState('kairo_fw_v2_restaurant', 20);

  // Step 2: the waste signals behind the estimate.
  const [throwAwayFreq, setThrowAwayFreq] = usePersistentState('kairo_fw_v2_throw', 2);
  const [expiredFound, setExpiredFound] = usePersistentState('kairo_fw_v2_expired', 1);
  const [hasMealPlan, setHasMealPlan] = usePersistentState('kairo_fw_v2_plan', false);
  const [shelfLifeDays, setShelfLifeDays] = usePersistentState('kairo_fw_v2_shelf', 5);

  // Step 3 (optional): shopping pattern and the reduction target.
  const [shoppingFreq, setShoppingFreq] = usePersistentState('kairo_fw_v2_shopping', 2);
  const [deliveryPerWeek, setDeliveryPerWeek] = usePersistentState('kairo_fw_v2_delivery', 1);
  const [reductionTarget, setReductionTarget] = usePersistentState('kairo_fw_v2_target', 20);

  const advancedReport = report as FoodWasteAnalysisReport | null;
  const facts = (advancedReport as unknown as { facts?: Record<string, number> } | null)?.facts;
  const authoritative = advancedReport?.meta?.authoritative;

  const textMain = isLight ? 'text-gray-900' : 'text-white';
  const textSub = isLight ? 'text-gray-600' : 'text-gray-400';
  const textSoft = isLight ? 'text-gray-500' : 'text-gray-500';
  const bgCard = isLight ? 'bg-white/90 border-black/[0.07]' : 'bg-white/[0.04] border-white/10';
  const border = isLight ? 'border-black/[0.07]' : 'border-white/10';
  const inputStyle = `w-full rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all ${
    isLight ? 'bg-slate-50 border border-slate-200 text-slate-900' : 'bg-black/25 border border-white/10 text-white'
  }`;
  const labelStyle = `block text-xs font-bold uppercase tracking-wider mb-2 ${textSoft}`;

  const steps = useMemo(
    () =>
      isAr
        ? [
            { id: 1, label: 'عائلتك', hint: '٤ أسئلة سريعة', Icon: Users },
            { id: 2, label: 'عاداتك', hint: 'أين يضيع الطعام؟', Icon: Trash2 },
            { id: 3, label: 'دقة أعلى', hint: 'اختياري', Icon: Sparkles },
          ]
        : [
            { id: 1, label: 'Your household', hint: '4 quick questions', Icon: Users },
            { id: 2, label: 'Your habits', hint: 'Where food is lost', Icon: Trash2 },
            { id: 3, label: 'Higher accuracy', hint: 'Optional', Icon: Sparkles },
          ],
    [isAr],
  );

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const adults = Math.max(1, Math.round(familySize * 0.5));
      const inputs = {
        familySize,
        adults,
        children: Math.max(0, familySize - adults),
        monthlyBudget,
        restaurantPercent,
        shoppingFreq,
        deliveryPerWeek,
        homeMealsPerDay,
        throwAwayFreq,
        expiredFound,
        hasMealPlan,
        shelfLifeDays,
        reductionTarget,
        receiptTotalEgp: receiptTotal > 0 ? receiptTotal : undefined,
      };

      const result = await runFoodWasteAnalysis(inputs, language);
      if (setGlobalReport) setGlobalReport(result);

      const factValues = (result as unknown as { facts?: Record<string, number> })?.facts;
      if (setGlobalFoodData) {
        // Feed the dashboard summary from the deterministic facts, not the model.
        setGlobalFoodData({
          mealsPerDay: homeMealsPerDay,
          costPerMealLE: Math.round(factValues?.cost_per_meal_egp ?? monthlyBudget / (homeMealsPerDay * 30)),
          wastePercentage: Math.round(factValues?.waste_rate_percent ?? 0),
        });
      }

      window.setTimeout(() => {
        document.getElementById('food-report-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const numberField = (
    label: string,
    value: number,
    setter: (value: number) => void,
    options: { min?: number; max?: number; suffix?: string; hint?: string; step?: number } = {},
  ) => (
    <div>
      <label className={labelStyle}>
        {label}
        {options.suffix ? <span className={`ms-1 font-normal normal-case ${textSoft}`}>({options.suffix})</span> : null}
      </label>
      <input
        type="number"
        min={options.min ?? 0}
        max={options.max}
        step={options.step}
        value={value}
        onChange={(event) => setter(Number(event.target.value))}
        className={inputStyle}
      />
      {options.hint ? <p className={`mt-1.5 text-[11px] leading-5 ${textSoft}`}>{options.hint}</p> : null}
    </div>
  );

  const chartData = advancedReport
    ? [
        {
          name: isAr ? 'استهلاك منزلي' : 'In-home consumption',
          value: Math.round((facts?.cost_per_meal_egp ?? 0) * (facts?.household_meals_per_month ?? 0)),
          color: '#60a5fa',
        },
        { name: isAr ? 'فاقد شهري' : 'Monthly loss', value: Math.round(advancedReport.metrics.monthly_waste_cost || 0), color: '#fb7185' },
        { name: isAr ? 'هدف التخفيض' : 'Reduction target', value: Math.round(facts?.reduction_target_egp_monthly || 0), color: '#2bd4a7' },
      ].filter((item) => item.value > 0)
    : [];

  return (
    <main className="w-full min-h-screen pt-32 lg:pt-36 pb-24 px-4 md:px-6 lg:px-8 space-y-8 max-w-7xl mx-auto" dir={dir}>
      <CapabilityContext capabilityId="food" />
      <ModuleToolbar
        title={isAr ? 'الأمن الغذائي وتقليل الفاقد' : 'Food security & waste reduction'}
        description={
          isAr
            ? 'ثلاث خطوات فقط: عائلتك، عاداتك، ثم نتيجة واضحة بتكلفة الفاقد وخطة عملية.'
            : 'Three steps only: your household, your habits, then a clear result with the cost of waste and a practical plan.'
        }
        icon={<Utensils className="w-6 h-6 text-orange-500" />}
        onReset={() => {
          if (setGlobalReport) setGlobalReport(null);
          setStep(1);
          setReceiptTotal(0);
        }}
        hasReport={!!advancedReport}
        theme={theme}
        sdgs={[2, 12, 13]}
        exportTargetId="food-report-container"
        exportFilename="Kairo_Food_Assessment"
      />

      {/* Steps + how we calculate */}
      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className={`kairo-glass-panel rounded-[1.8rem] border p-5 sm:p-7 ${bgCard}`}>
          <div className="flex flex-wrap items-center gap-2">
            {steps.map(({ id, label, hint, Icon }) => {
              const active = step === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setStep(id)}
                  aria-current={active ? 'step' : undefined}
                  className={`flex min-h-11 items-center gap-3 rounded-2xl border px-4 text-start transition ${
                    active
                      ? 'border-orange-500/40 bg-orange-500/10 text-orange-500'
                      : `${border} ${textSub} hover:bg-black/5 dark:hover:bg-white/5`
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-black">{label}</span>
                  <span className={`hidden text-[10px] font-bold sm:inline ${textSoft}`}>{hint}</span>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <MotionDiv key="s1" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-7">
                <h2 className={`text-lg font-black ${textMain}`}>{isAr ? 'عائلتك في سطرين' : 'Your household in two lines'}</h2>
                <p className={`mt-1 text-xs leading-6 ${textSub}`}>
                  {isAr
                    ? 'أربع قيم فقط تكفي لحساب الاستهلاك وتكلفة الوجبة بدقة معقولة.'
                    : 'Four values are enough to estimate consumption and cost per meal.'}
                </p>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  {numberField(isAr ? 'عدد أفراد الأسرة' : 'Family size', familySize, setFamilySize, { min: 1, max: 30 })}
                  {numberField(isAr ? 'وجبات منزلية يوميًا' : 'Home meals per day', homeMealsPerDay, setHomeMealsPerDay, {
                    min: 1,
                    max: 12,
                    hint: isAr ? 'للعائلة كلها، وليست للفرد.' : 'For the whole household, not per person.',
                  })}
                  {numberField(isAr ? 'ميزانية الطعام الشهرية' : 'Monthly food budget', monthlyBudget, setMonthlyBudget, {
                    suffix: 'EGP',
                    min: 0,
                    step: 100,
                  })}
                  {numberField(isAr ? 'نسبة الأكل خارج المنزل' : 'Meals eaten out', restaurantPercent, setRestaurantPercent, {
                    suffix: isAr ? '٪' : '%',
                    min: 0,
                    max: 90,
                  })}
                </div>
              </MotionDiv>
            )}

            {step === 2 && (
              <MotionDiv key="s2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-7">
                <h2 className={`text-lg font-black ${textMain}`}>{isAr ? 'أين يضيع الطعام؟' : 'Where does food get lost?'}</h2>
                <p className={`mt-1 text-xs leading-6 ${textSub}`}>
                  {isAr
                    ? 'هذه الإشارات هي التي تحدد معدل الهدر التقديري بدل تخمين النموذج.'
                    : 'These signals set the estimated waste rate instead of letting the model guess.'}
                </p>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  {numberField(isAr ? 'مرات رمي الطعام أسبوعيًا' : 'Food thrown away per week', throwAwayFreq, setThrowAwayFreq, {
                    min: 0,
                    max: 14,
                    hint: isAr ? 'بقايا أو أطعمة فسدت.' : 'Leftovers or spoiled food.',
                  })}
                  {numberField(isAr ? 'منتجات منتهية الصلاحية شهريًا' : 'Expired items found per month', expiredFound, setExpiredFound, { min: 0, max: 30 })}
                  {numberField(isAr ? 'متوسط فترة الصلاحية' : 'Average shelf life', shelfLifeDays, setShelfLifeDays, {
                    suffix: isAr ? 'يوم' : 'days',
                    min: 1,
                    max: 30,
                    hint: isAr ? 'للمنتجات الطازجة التي تشتريها.' : 'For the fresh items you buy.',
                  })}
                  <label className={`flex min-h-11 items-center gap-3 rounded-xl border px-4 text-sm font-bold cursor-pointer ${border} ${textMain}`}>
                    <input
                      type="checkbox"
                      checked={hasMealPlan}
                      onChange={(event) => setHasMealPlan(event.target.checked)}
                      className="h-5 w-5 accent-orange-500"
                    />
                    {isAr ? 'أخطط للوجبات أسبوعيًا' : 'I plan meals weekly'}
                  </label>
                </div>
              </MotionDiv>
            )}

            {step === 3 && (
              <MotionDiv key="s3" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-7">
                <h2 className={`text-lg font-black ${textMain}`}>{isAr ? 'خطوة اختيارية لدقة أعلى' : 'Optional step for higher accuracy'}</h2>
                <p className={`mt-1 text-xs leading-6 ${textSub}`}>
                  {isAr
                    ? 'ارفع إيصال مشتريات واحدًا لمعايرة مستوى الإنفاق، أو أكمل نمط التسوق يدويًا.'
                    : 'Upload one grocery receipt to calibrate your spend level, or set the shopping pattern manually.'}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReceipt((current) => !current)}
                    className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 text-xs font-black transition ${
                      showReceipt ? 'border-orange-500/40 bg-orange-500/10 text-orange-500' : `${border} ${textSub}`
                    }`}
                  >
                    <Receipt className="h-4 w-4" />
                    {showReceipt
                      ? isAr ? 'إخفاء رفع الإيصال' : 'Hide receipt upload'
                      : isAr ? 'ارفع إيصالًا (اختياري)' : 'Upload a receipt (optional)'}
                  </button>
                  {receiptTotal > 0 && (
                    <span className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 text-xs font-black text-emerald-500">
                      <BadgeCheck className="h-4 w-4" />
                      {isAr ? 'إيصال معتمد' : 'Receipt applied'}: {receiptTotal.toLocaleString(isAr ? 'ar-EG' : 'en-GB')} EGP
                    </span>
                  )}
                </div>

                {showReceipt && (
                  <div className="mt-4">
                    <BillUploader
                      forceType="food"
                      onDataExtracted={(_type, data) => {
                        const total = Number((data as { total_cost_egp?: number })?.total_cost_egp) || 0;
                        setReceiptTotal(total);
                      }}
                    />
                  </div>
                )}

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  {numberField(isAr ? 'مرات التسوق أسبوعيًا' : 'Shopping trips per week', shoppingFreq, setShoppingFreq, { min: 1, max: 14 })}
                  {numberField(isAr ? 'طلبات التوصيل أسبوعيًا' : 'Delivery orders per week', deliveryPerWeek, setDeliveryPerWeek, { min: 0, max: 21 })}
                  <div className="sm:col-span-2">
                    <label className={labelStyle}>
                      {isAr ? 'هدفك في تقليل الفاقد' : 'Your waste-reduction target'}
                      <span className="ms-1 font-black normal-case text-orange-500">
                        {reductionTarget}
                        {isAr ? '٪' : '%'}
                      </span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={60}
                      step={5}
                      value={reductionTarget}
                      onChange={(event) => setReductionTarget(Number(event.target.value))}
                      className="h-1.5 w-full cursor-pointer accent-orange-500"
                    />
                    <p className={`mt-2 text-[11px] leading-5 ${textSoft}`}>
                      {isAr ? 'نحوّل النسبة إلى مبلغ شهري قابل للتوفير.' : 'We turn the percentage into a monthly saving figure.'}
                    </p>
                  </div>
                </div>
              </MotionDiv>
            )}
          </AnimatePresence>

          <div className={`mt-7 flex flex-wrap items-center justify-between gap-3 border-t pt-5 ${border}`}>
            <button
              type="button"
              onClick={() => setStep((current) => Math.max(1, current - 1))}
              className={`min-h-11 rounded-xl px-5 text-xs font-black transition ${
                step === 1 ? 'pointer-events-none opacity-0' : `${textSub} hover:bg-black/5 dark:hover:bg-white/5`
              }`}
            >
              {isAr ? 'السابق' : 'Back'}
            </button>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setStep((current) => Math.min(3, current + 1))}
                className={`min-h-11 rounded-xl border px-5 text-xs font-black transition ${border} ${textMain} ${
                  step === 3 ? 'pointer-events-none opacity-0' : ''
                }`}
              >
                {isAr ? 'التالي' : 'Next'}
              </button>
              <button
                type="button"
                onClick={runAnalysis}
                disabled={loading}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-6 text-xs font-black text-white shadow-lg shadow-orange-500/20 transition active:scale-95 disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
                {isAr ? 'حلّل الآن' : 'Analyze now'}
              </button>
            </div>
          </div>
        </div>

        <aside className={`kairo-glass-panel rounded-[1.8rem] border p-5 sm:p-6 ${bgCard}`}>
          <h3 className={`flex items-center gap-2 text-sm font-black ${textMain}`}>
            <Info className="h-4 w-4 text-orange-500" />
            {isAr ? 'كيف نحسب؟' : 'How we calculate'}
          </h3>
          <ul className="mt-4 space-y-3">
            {[
              isAr ? 'معدل الهدر يبدأ من متوسط وطني ويتعدل حسب إشاراتك المعلنة.' : 'The waste rate starts from a national average and moves with your declared signals.',
              isAr ? 'تكلفة الوجبة = ميزانية الطعام داخل المنزل ÷ عدد الوجبات الشهرية.' : 'Cost per meal = in-home food budget ÷ monthly meals.',
              isAr ? 'التكلفة والكربون والمياه تُحسب بمعاملات معلنة وثابتة.' : 'Cost, carbon, and water use declared, fixed coefficients.',
              isAr ? 'لا نطلب اسمك ولا رقم عدّادك، ويمكنك المراجعة قبل الاعتماد.' : 'We never ask for your name or meter number; you review before applying.',
            ].map((line) => (
              <li key={line} className={`flex items-start gap-2 text-[11px] leading-6 ${textSub}`}>
                <ShoppingBasket className="mt-1 h-3.5 w-3.5 shrink-0 text-orange-500" />
                {line}
              </li>
            ))}
          </ul>
          <p className={`mt-5 rounded-xl border px-3 py-2 text-[10px] leading-5 ${border} ${textSoft}`}>
            {isAr
              ? 'تُسجَّل قيم رقمية مجهولة الهوية لمراجعة دقة النماذج وتحسينها لاحقًا.'
              : 'Anonymous numeric values are recorded so the models can be reviewed and improved later.'}
          </p>
        </aside>
      </section>

      {advancedReport && (
        <MotionDiv
          id="food-report-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8 border-t pt-8 border-black/10 dark:border-white/10"
        >
          {authoritative && (
            <div className={`kairo-glass-panel rounded-2xl border p-5 ${bgCard}`}>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[11px] font-black ${authoritative.review_required ? 'text-rose-500' : textMain}`}>
                  {isAr ? 'القيم المعتمدة في التحليل:' : 'Values used in the analysis:'}
                </span>
                <span className={`text-[11px] font-bold ${textMain}`} dir="ltr">
                  {authoritative.amount_egp.toLocaleString(isAr ? 'ar-EG' : 'en-GB')} {isAr ? 'جنيه' : 'EGP'}
                </span>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${border} ${textSub}`}>
                  {authoritative.source}
                </span>
                {authoritative.review_required && (
                  <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-black text-white">
                    {isAr ? 'تحتاج مراجعة' : 'Needs review'}
                  </span>
                )}
              </div>
              {authoritative.review_required && (
                <ul className="mt-3 space-y-1">
                  {authoritative.warnings.map((warning) => (
                    <li key={warning} className="flex items-start gap-2 text-[11px] leading-5 text-rose-500">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                      {warning}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="kairo-metric-grid grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              {
                label: isAr ? 'كفاءة الطعام' : 'Food efficiency',
                value: `${Math.round(advancedReport.metrics.food_efficiency_score || 0)}/100`,
                hint: isAr ? 'كل ما زاد، قلّ الهدر.' : 'Higher means less waste.',
                tone: riskToneClass(advancedReport.metrics.sustainability_rating || ''),
              },
              {
                label: isAr ? 'معدل الهدر التقديري' : 'Estimated waste rate',
                value: `${Math.round(facts?.waste_rate_percent ?? 0)}${isAr ? '٪' : '%'}`,
                hint: isAr ? 'من إشاراتك، وليس تخمينًا حرًا.' : 'From your signals, not a free guess.',
                tone: 'text-orange-500',
              },
              {
                label: isAr ? 'الفاقد الشهري' : 'Monthly loss',
                value: (advancedReport.metrics.monthly_waste_cost || 0).toLocaleString(isAr ? 'ar-EG' : 'en-GB'),
                hint: isAr ? 'جنيه شهريًا يمكن تقليله.' : 'EGP per month you can reduce.',
                tone: 'text-rose-500',
              },
              {
                label: isAr ? 'الفاقد السنوي' : 'Annual loss',
                value: (advancedReport.metrics.annual_waste_cost || 0).toLocaleString(isAr ? 'ar-EG' : 'en-GB'),
                hint: isAr ? 'نفس الخسارة على مدار سنة.' : 'The same loss across a year.',
                tone: 'text-rose-400',
              },
            ].map((item) => (
              <div key={item.label} className={`kairo-metric-card kairo-glass-panel rounded-[1.6rem] border p-5 ${bgCard}`}>
                <p className={`text-xs font-bold ${textSub}`}>{item.label}</p>
                <p className={`kairo-metric-value mt-3 text-3xl font-black tracking-tight ${item.tone}`}>{item.value}</p>
                <p className={`mt-3 border-t pt-3 text-[11px] leading-5 ${border} ${textSoft}`}>{item.hint}</p>
              </div>
            ))}
          </div>

          <DecisionIntelligence
            module="food"
            score={advancedReport.metrics.food_efficiency_score || 0}
            status={localizeDisplayValue(advancedReport.metrics.sustainability_rating || '', isAr ? 'ar' : 'en')}
            confidence="medium"
          />

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className={`kairo-analysis-panel kairo-glass-panel rounded-[1.8rem] border p-5 sm:p-7 ${bgCard}`}>
                <h2 className={`flex items-center gap-2 text-lg font-black ${textMain}`}>
                  <ChefHat className="h-5 w-5 text-orange-500" />
                  {isAr ? 'أين يضيع طعامك؟' : 'Where your food is lost'}
                </h2>
                <div className="kairo-chart kairo-chart-responsive mt-5 h-64 p-3" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 18, right: 8, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLight ? '#e2e8f0' : '#334155'} />
                      <XAxis
                        dataKey="name"
                        interval={0}
                        tickMargin={10}
                        tick={{ fill: isLight ? '#526b62' : '#a9bbb4', fontSize: 11, fontWeight: 'bold' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis tick={{ fill: isLight ? '#64748b' : '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <RechartsTooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{
                          backgroundColor: isLight ? '#fff' : '#0f172a',
                          borderRadius: '12px',
                          borderColor: isLight ? '#e2e8f0' : '#334155',
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="value" name={isAr ? 'جنيه/شهر' : 'EGP/month'} radius={[8, 8, 0, 0]} barSize={46}>
                        {chartData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      label: isAr ? 'وزن الفاقد شهريًا' : 'Wasted weight / month',
                      value: `${(facts?.wasted_kg_per_month ?? 0).toLocaleString(isAr ? 'ar-EG' : 'en-GB')} kg`,
                    },
                    {
                      label: isAr ? 'وجبات مهدرة شهريًا' : 'Wasted meals / month',
                      value: (facts?.wasted_meals_per_month ?? 0).toLocaleString(isAr ? 'ar-EG' : 'en-GB'),
                    },
                    {
                      label: isAr ? 'تكلفة الوجبة' : 'Cost per meal',
                      value: `${(facts?.cost_per_meal_egp ?? 0).toLocaleString(isAr ? 'ar-EG' : 'en-GB')} ${isAr ? 'جنيه' : 'EGP'}`,
                    },
                  ].map((item) => (
                    <div key={item.label} className={`rounded-2xl border p-4 ${border} ${isLight ? 'bg-slate-50/70' : 'bg-black/20'}`}>
                      <p className={`text-[10px] font-bold ${textSoft}`}>{item.label}</p>
                      <p className={`mt-1 text-lg font-black ${textMain}`}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {advancedReport.ai_optimization_plan && (
                <div className={`kairo-analysis-panel kairo-glass-panel rounded-[1.8rem] border p-5 sm:p-7 ${bgCard}`}>
                  <h2 className={`flex items-center gap-2 text-lg font-black ${textMain}`}>
                    <TrendingDown className="h-5 w-5 text-emerald-500" />
                    {isAr ? 'خطتك العملية' : 'Your practical plan'}
                  </h2>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className={`rounded-2xl border p-4 ${border} ${isLight ? 'bg-emerald-50/60' : 'bg-emerald-500/[0.06]'}`}>
                      <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        {isAr ? 'ابدأ هذا الأسبوع' : 'Start this week'}
                      </p>
                      <ul className="mt-3 space-y-2">
                        {(advancedReport.ai_optimization_plan.immediate_actions || []).map((action) => (
                          <li key={action} className={`flex items-start gap-2 text-xs leading-6 ${textSub}`}>
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className={`rounded-2xl border p-4 ${border} ${isLight ? 'bg-slate-50/70' : 'bg-black/20'}`}>
                      <p className={`text-[10px] font-black uppercase tracking-wider ${textSoft}`}>
                        {isAr ? 'عادات للأجل الطويل' : 'Long-term habits'}
                      </p>
                      <ul className="mt-3 space-y-2">
                        {(advancedReport.ai_optimization_plan.long_term_habits || []).map((habit) => (
                          <li key={habit} className={`flex items-start gap-2 text-xs leading-6 ${textSub}`}>
                            <Clock3 className="mt-1 h-3.5 w-3.5 shrink-0 text-orange-500" />
                            {habit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {advancedReport.ai_financial_insights && (
                <div className={`kairo-glass-panel rounded-[1.8rem] border p-5 sm:p-6 ${bgCard}`}>
                  <h3 className={`text-sm font-black ${textMain}`}>{isAr ? 'الأثر المالي' : 'Financial impact'}</h3>
                  <div className="mt-4 space-y-3">
                    {[
                      {
                        label: isAr ? 'توفير شهري ممكن' : 'Possible monthly saving',
                        value: advancedReport.ai_financial_insights.monthly_savings_potential,
                      },
                      {
                        label: isAr ? 'توفير سنوي ممكن' : 'Possible annual saving',
                        value: advancedReport.ai_financial_insights.annual_savings_potential,
                      },
                    ].map((item) => (
                      <div key={item.label} className={`flex items-center justify-between rounded-xl border px-3 py-2 ${border}`}>
                        <span className={`text-[11px] font-bold ${textSub}`}>{item.label}</span>
                        <span className="text-sm font-black text-emerald-500">
                          {Number(item.value || 0).toLocaleString(isAr ? 'ar-EG' : 'en-GB')} {isAr ? 'جنيه' : 'EGP'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <ul className="mt-4 space-y-2">
                    {(advancedReport.ai_financial_insights.redirect_suggestions || []).map((suggestion) => (
                      <li key={suggestion} className={`text-[11px] leading-6 ${textSub}`}>
                        • {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {advancedReport.ai_waste_analysis && (
                <div className={`kairo-glass-panel rounded-[1.8rem] border p-5 sm:p-6 ${bgCard}`}>
                  <h3 className={`text-sm font-black ${textMain}`}>{isAr ? 'الأسباب الرئيسية' : 'Primary drivers'}</h3>
                  <ul className="mt-4 space-y-2">
                    {(advancedReport.ai_waste_analysis.primary_causes || []).map((cause) => (
                      <li key={cause} className={`flex items-start gap-2 text-[11px] leading-6 ${textSub}`}>
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                        {cause}
                      </li>
                    ))}
                  </ul>
                  <p className={`mt-4 rounded-xl border px-3 py-2 text-[11px] leading-6 ${border} ${textSub}`}>
                    {advancedReport.ai_waste_analysis.behavioral_insights}
                  </p>
                </div>
              )}

              {advancedReport.meta?.methodology && (
                <div className={`kairo-glass-panel rounded-[1.8rem] border p-5 sm:p-6 ${bgCard}`}>
                  <h3 className={`text-sm font-black ${textMain}`}>{isAr ? 'منهج الحساب' : 'Calculation method'}</h3>
                  <p className={`mt-3 text-[11px] leading-6 ${textSub}`}>{advancedReport.meta.methodology}</p>
                  <p className={`mt-3 text-[10px] leading-5 ${textSoft}`}>
                    {isAr
                      ? 'الكميات والتكلفة والكربون والمياه محسوبة حتميًا من إدخالاتك، والتحليل النصي بمستوى ثقة متوسط.'
                      : 'Quantities, cost, carbon, and water are computed deterministically from your inputs; the narrative analysis carries medium confidence.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </MotionDiv>
      )}
    </main>
  );
};

export default FoodSecurityIntelligence;
