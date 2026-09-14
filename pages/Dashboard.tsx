import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chip } from '@heroui/react';
import { useReducedMotion } from 'framer-motion';
import { CircleGauge, Droplet, Layers, Leaf, Wind } from 'lucide-react';
import type {
  CarbonAnalysisReport,
  EnergyAnalysisReport,
  EwasteAnalysisReport,
  ExposureAnalysis,
  FoodWasteAnalysisReport,
  MobilityIntelligenceReport,
  WaterAnalysisReport,
} from '../types';
import { useApp } from '../contexts/AppContext';
import ModuleToolbar from '../components/ModuleToolbar';
import EvidenceAndImpact, {
  type EvidencePassportItem,
} from '../components/EvidenceAndImpact';
import { usePersistentState } from '../utils/storage';
import {
  audienceProfiles,
  getAudienceProfile,
  kairoCapabilities,
  type AudienceId,
} from '../config/kairoCapabilities';
import { upsertKairoProfile } from '../services/kairoDatabase';
import {
  buildCapabilityStates,
  buildCostChartData,
  buildEvidencePassportItems,
  buildScoreChartData,
  type DashboardReveal,
  type DashboardTheme,
  type EarlyWarningSnapshot,
} from './dashboard/dashboardDisplay';
import {
  AudienceLedgerSection,
  CapabilityCardsSection,
  CoreResourcesSection,
  CostChartPanel,
  MotionDiv,
  PathSection,
  ScoreChartPanel,
  SignalsBand,
  ToolsSection,
} from './dashboard/dashboardSections';

interface DashboardProps {
  carbon: CarbonAnalysisReport | null;
  water: WaterAnalysisReport | null;
  food: FoodWasteAnalysisReport | null;
  exposure: ExposureAnalysis | null;
  ewaste: EwasteAnalysisReport | null;
  energy: EnergyAnalysisReport | null;
  transport: MobilityIntelligenceReport | null;
  onSystemReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  carbon,
  water,
  food,
  exposure,
  ewaste,
  energy,
  transport,
  onSystemReset,
}) => {
  const { theme, dir, language } = useApp();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [earlyWarningData] = usePersistentState<EarlyWarningSnapshot | null>(
    'kairo_early_warning',
    null,
  );
  const [audience, setAudience] = usePersistentState<AudienceId>(
    'kairo_audience',
    'individual',
  );

  const isLight = theme === 'light';
  const isAr = language === 'ar';
  const currentLanguage = isAr ? 'ar' : 'en';
  const pageBg = isLight ? 'bg-[#f5f8f6]' : 'bg-[#07110f]';
  const textMain = isLight ? 'text-slate-950' : 'text-white';
  const textSub = isLight ? 'text-slate-600' : 'text-slate-400';
  const textSoft = isLight ? 'text-slate-500' : 'text-slate-500';
  const border = isLight ? 'border-slate-900/[0.09]' : 'border-white/[0.09]';
  const surface = isLight ? 'bg-white/82' : 'bg-white/[0.035]';

  const themeTokens: DashboardTheme = {
    isAr,
    isLight,
    dir,
    border,
    surface,
    textMain,
    textSub,
    textSoft,
  };

  const totalCarbon =
    (carbon?.baseline?.monthly_total_kg_co2 || 0) +
    (energy?.metrics?.carbon_footprint_kg || 0) +
    (transport?.metrics?.monthly_carbon_kg || 0) +
    (food?.metrics?.methane_emissions_kg ? food.metrics.methane_emissions_kg / 12 : 0);

  const capabilityStates = useMemo(
    () =>
      buildCapabilityStates({
        earlyWarningData,
        water,
        food,
        energy,
        transport,
        exposure,
        ewaste,
        isAr,
      }),
    [earlyWarningData, energy, ewaste, exposure, food, isAr, transport, water],
  );

  const completedAnalyses = Object.entries(capabilityStates).filter(
    ([id, state]) => id !== 'scenarios' && state.ready,
  ).length;
  const filteredCapabilities = kairoCapabilities.filter((capability) =>
    capability.audiences.includes(audience),
  );
  const coreCapabilities = filteredCapabilities.filter((capability) => capability.tier === 'core');
  const supportCapabilities = filteredCapabilities.filter((capability) => capability.tier === 'support');
  const toolCapabilities = filteredCapabilities.filter((capability) => capability.tier === 'tool');
  const selectedAudience = getAudienceProfile(audience) ?? audienceProfiles[0];
  const scoreChartData = useMemo(
    () => buildScoreChartData(capabilityStates, isAr),
    [capabilityStates, isAr],
  );
  const costChartData = useMemo(
    () => buildCostChartData({ water, food, energy, transport, isAr }),
    [energy, food, isAr, transport, water],
  );
  const evidencePassportItems = useMemo<EvidencePassportItem[]>(
    () =>
      buildEvidencePassportItems({
        capabilityStates,
        earlyWarningData,
        currentLanguage,
        isAr,
      }),
    [capabilityStates, currentLanguage, earlyWarningData, isAr],
  );

  useEffect(() => {
    const syncTimer = window.setTimeout(() => {
      void upsertKairoProfile(audience, currentLanguage).catch(() => {
        // Local preferences remain available when cloud sync is unavailable.
      });
    }, 600);

    return () => window.clearTimeout(syncTimer);
  }, [audience, currentLanguage]);

  const reveal: DashboardReveal = {
    initial: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-55px' },
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  };

  return (
    <main
      id="environmental-dashboard"
      className={`min-h-screen pb-24 pt-28 transition-colors lg:pt-32 ${pageBg}`}
      dir={dir}
    >
      <div className="kairo-shell">
        <ModuleToolbar
          hasData={completedAnalyses > 0}
          onReset={onSystemReset}
          exportTargetId="environmental-dashboard"
          exportFilename="kairo_environmental_dashboard"
          reportTitle={isAr ? 'المتابعة البيئية الموحدة' : 'Unified environmental dashboard'}
          reportSubtitle={
            isAr
              ? 'ملخص مترابط لحالة الموارد والمخاطر والإجراءات داخل Kairo.'
              : 'A connected summary of resource, risk, and action signals across Kairo.'
          }
          sdgs={[2, 3, 6, 7, 11, 12, 13]}
        />

        <header className="mt-5 grid items-end gap-7 lg:grid-cols-[1fr_auto]">
          <div className="max-w-4xl">
            <Chip color="success" size="sm" variant="soft">
              <Chip.Label className="flex items-center gap-2">
                <Leaf className="h-3.5 w-3.5" />
                {isAr ? 'نقطة البداية في Kairo' : 'Your starting point in Kairo'}
              </Chip.Label>
            </Chip>
            <h1 className={`mt-5 text-4xl font-semibold tracking-[-0.045em] sm:text-6xl ${textMain}`}>
              {isAr ? 'المتابعة البيئية الموحدة' : 'Unified environmental dashboard'}
            </h1>
            <p className={`mt-5 max-w-3xl text-base leading-8 sm:text-lg ${textSub}`}>
              {isAr
                ? 'اختر الفئة الأقرب لدورك، افهم الغرض من كل خاصية، ثم انتقل إلى التحليل الذي يساعدك على اتخاذ قرار الآن.'
                : 'Choose the audience closest to your role, understand each capability’s purpose, then open the analysis that supports your next decision.'}
            </p>
          </div>
          <div className={`rounded-2xl border px-5 py-4 ${border} ${surface}`}>
            <p className={`text-[10px] font-black uppercase tracking-[.14em] ${textSoft}`}>
              {isAr ? 'تقدم جلستك' : 'Session progress'}
            </p>
            <div className="mt-2 flex items-end gap-2">
              <span className={`text-3xl font-black ${textMain}`}>{completedAnalyses}</span>
              <span className={`pb-1 text-xs font-bold ${textSub}`}>
                {isAr ? 'نتائج محفوظة من ٧' : 'saved results of 7'}
              </span>
            </div>
            <p className={`mt-3 border-t pt-3 text-[10px] font-bold leading-5 ${border} ${textSoft}`}>
              {isAr
                ? '3 خواص أساسية: مياه وطاقة وغذاء، وطبقة إشارات حية تخدمها'
                : '3 core capabilities: water, energy, and food, plus a live signal layer that serves them'}
            </p>
          </div>
        </header>

        <section className="kairo-metric-grid mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              Icon: CircleGauge,
              label: isAr ? 'المسارات المكتملة' : 'Completed pathways',
              value: `${completedAnalyses}/7`,
              detail: isAr ? 'تتحدث مع كل تحليل جديد' : 'Updates after every analysis',
            },
            {
              Icon: Wind,
              label: isAr ? 'ذروة الهواء المتوقعة' : 'Expected air peak',
              value: earlyWarningData?.air?.peakAqi
                ? `${Math.round(earlyWarningData.air.peakAqi)} AQI`
                : '—',
              detail: earlyWarningData?.air
                ? isAr
                  ? 'ضمن نافذة 24 ساعة'
                  : 'Within a 24-hour window'
                : isAr
                  ? 'افتح الاستباق البيئي'
                  : 'Open environmental foresight',
            },
            {
              Icon: Droplet,
              label: isAr ? 'أولوية فحص المياه' : 'Water inspection priority',
              value:
                earlyWarningData?.water?.score !== undefined
                  ? `${Math.round(earlyWarningData.water.score)}/100`
                  : water
                    ? `${Math.round(water.metrics?.leak_probability_score || 0)}/100`
                    : '—',
              detail: isAr ? 'مؤشر أولوية وليس احتمالًا مؤكدًا' : 'Priority index, not confirmed probability',
            },
            {
              Icon: Leaf,
              label: isAr ? 'الأثر الكربوني المجمع' : 'Combined carbon context',
              value: totalCarbon > 0 ? `${totalCarbon.toFixed(1)} kg` : '—',
              detail: isAr ? 'من نتائج الجلسة المحفوظة' : 'From saved session results',
            },
          ].map(({ Icon, label, value, detail }) => (
            <div key={label} className={`kairo-metric-card rounded-[1.6rem] border p-5 ${border} ${surface}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={`text-xs font-bold ${textSub}`}>{label}</p>
                  <p className={`kairo-metric-value mt-3 text-3xl font-black tracking-tight ${textMain}`}>{value}</p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-kairo-green/10 text-kairo-green">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className={`mt-5 border-t pt-3 text-[11px] leading-5 ${border} ${textSoft}`}>{detail}</p>
            </div>
          ))}
        </section>

        <CoreResourcesSection
          theme={themeTokens}
          currentLanguage={currentLanguage}
          capabilities={coreCapabilities}
          capabilityStates={capabilityStates}
          onNavigate={(path) => navigate(path)}
        />

        <SignalsBand
          theme={themeTokens}
          isAr={isAr}
          earlyWarningData={earlyWarningData}
          state={capabilityStates.foresight}
          onNavigate={(path) => navigate(path)}
        />

        <MotionDiv
          {...reveal}
          className="mt-6 grid gap-5 xl:grid-cols-[1.08fr_.92fr]"
        >
          <ScoreChartPanel
            isAr={isAr}
            isLight={isLight}
            border={border}
            surface={surface}
            textMain={textMain}
            textSub={textSub}
            scores={scoreChartData}
            onStartWater={() => navigate('/systems/water-scarcity')}
          />
          <CostChartPanel
            isAr={isAr}
            isLight={isLight}
            border={border}
            surface={surface}
            textMain={textMain}
            textSub={textSub}
            costs={costChartData}
            onStartEnergy={() => navigate('/energy')}
          />
        </MotionDiv>

        <EvidenceAndImpact
          items={evidencePassportItems}
          isArabic={isAr}
          isLight={isLight}
        />

        <section className="mt-10">
          <div className={`mb-4 flex flex-wrap items-end justify-between gap-3 border-b pb-4 ${border}`}>
            <div>
              <span className="kairo-eyebrow">
                <Layers className="h-3.5 w-3.5" />
                {isAr ? 'خواص مساندة' : 'Support capabilities'}
              </span>
              <h2 className={`mt-3 text-2xl font-black sm:text-3xl ${textMain}`}>
                {isAr ? 'وسّع الصورة حسب نمط حياتك' : 'Extend the picture to your daily pattern'}
              </h2>
              <p className={`mt-2 max-w-3xl text-xs leading-6 sm:text-sm ${textSub}`}>
                {isAr
                  ? 'أربع خواص مساندة تكمل نظام الموارد: إشارات حية، تنقل، تعرض حضري، واقتصاد دائري.'
                  : 'Four support capabilities complete the resource system: live signals, mobility, urban exposure, and circularity.'}
              </p>
            </div>
            <span className={`rounded-full border px-3 py-1.5 text-[10px] font-black ${border} ${textSub}`}>
              {isAr ? '4 خواص مساندة' : '4 support capabilities'}
            </span>
          </div>

          <CapabilityCardsSection
            theme={themeTokens}
            currentLanguage={currentLanguage}
            reveal={reveal}
            filteredCapabilities={supportCapabilities}
            capabilityStates={capabilityStates}
            onNavigate={(path) => navigate(path)}
          />

          <ToolsSection
            theme={themeTokens}
            isAr={isAr}
            currentLanguage={currentLanguage}
            capabilities={toolCapabilities}
            onNavigate={(path) => navigate(path)}
          />

          <AudienceLedgerSection
            theme={themeTokens}
            currentLanguage={currentLanguage}
            audience={audience}
            onAudienceChange={setAudience}
            selectedAudience={selectedAudience}
            filteredCapabilities={filteredCapabilities}
            capabilityStates={capabilityStates}
            onNavigate={(path) => navigate(path)}
          />
        </section>

        <PathSection
          theme={themeTokens}
          currentLanguage={currentLanguage}
          selectedAudience={selectedAudience}
          reveal={reveal}
        />
      </div>
    </main>
  );
};

export default Dashboard;
