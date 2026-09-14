import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import {
  AnimatePresence,
  motion,
  HTMLMotionProps,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'framer-motion';
import Navbar from './components/Navbar';
import { KairoBrandMark } from './components/KairoBrand';
import SeoManager from './components/SeoManager';
import AIServiceStatus from './components/AIServiceStatus';
import MobileTabBar from './components/MobileTabBar';

// Lazy loaded pages
const Home = lazy(() => import('./pages/Home'));

const ClimateAction = lazy(() => import('./pages/ClimateAction'));
const Impact = lazy(() => import('./pages/Impact'));
const Learn = lazy(() => import('./pages/Learn'));
const About = lazy(() => import('./pages/About'));
const SaasRoadmap = lazy(() => import('./pages/SaasRoadmap'));
const EnergyIntelligence = lazy(() => import('./pages/EnergyIntelligence'));
const TransportImpact = lazy(() => import('./pages/TransportImpact'));

const ExposureReport = lazy(() => import('./pages/ExposureReport'));
const LiveMonitor = lazy(() => import('./pages/LiveMonitor'));
const CsrDashboard = lazy(() => import('./pages/CsrDashboard'));
const TechnicalArchitecture = lazy(() => import('./pages/TechnicalArchitecture'));
const TokenRouterArchitecture = lazy(() => import('./pages/TokenRouterArchitecture'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ImpactVerification = lazy(() => import('./pages/ImpactVerification'));
const NotFound = lazy(() => import('./pages/NotFound'));
const CompareScenarios = lazy(() => import('./pages/CompareScenarios'));
const WaterPage = lazy(() => import('./pages/Education').then(m => ({ default: m.WaterPage })));
const FoodPage = lazy(() => import('./pages/Education').then(m => ({ default: m.FoodPage })));
const CO2Page = lazy(() => import('./pages/Education').then(m => ({ default: m.CO2Page })));
const SustainabilityPage = lazy(() => import('./pages/Education').then(m => ({ default: m.SustainabilityPage })));

const WaterScarcity = lazy(() => import('./pages/systems/WaterScarcity'));
const FoodSecurityIntelligence = lazy(() => import('./pages/systems/FoodSecurityIntelligence'));
const UrbanExposure = lazy(() => import('./pages/systems/UrbanExposure'));

const EwasteRecycler = lazy(() => import('./pages/systems/EwasteRecycler'));

import { 
    WaterData, FoodData, EnergyData, CalculatorResults, UserProgress, 
    CarbonAnalysisReport, WaterAnalysisReport, FoodWasteAnalysisReport, 
    ExposureAnalysis, EwasteAnalysisReport, EnergyAnalysisReport, MobilityIntelligenceReport 
} from './types';
import KairoChat from './components/KairoChat';
import { usePersistentState, clearKairoStorage } from './utils/storage';
import { AppProvider, useApp } from './contexts/AppContext';
import { loadModuleReports, upsertModuleReport } from './services/kairoDatabase';

const MotionDiv = motion.div as React.FC<HTMLMotionProps<"div">>;

const isCopyAllowedTarget = (target: EventTarget | null) =>
  target instanceof Element &&
  Boolean(
    target.closest(
      'input, textarea, select, [contenteditable="true"], [data-allow-copy="true"]',
    ),
  );

const preventProtectedContentAction = (
  event: React.SyntheticEvent<HTMLElement>,
) => {
  if (!isCopyAllowedTarget(event.target)) {
    event.preventDefault();
  }
};

const useKairoCloudReportSync = (
  module: 'carbon' | 'water' | 'food' | 'exposure' | 'ewaste' | 'energy' | 'mobility',
  report: unknown,
  score?: number | null,
) => {
  React.useEffect(() => {
    if (!report) return;
    const timer = window.setTimeout(() => {
      void upsertModuleReport(module, report, score).catch(() => {
        // Local persistence remains available while cloud sync is unavailable.
      });
    }, 900);
    return () => window.clearTimeout(timer);
  }, [module, report, score]);
};

const ScrollProgress = () => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 120,
        damping: 28,
        mass: 0.25,
    });

    return (
        <motion.div
            aria-hidden="true"
            className="fixed inset-x-0 top-0 z-[80] h-[2px] origin-left bg-kairo-green shadow-[0_0_16px_rgba(43,212,167,.75)]"
            style={{ scaleX }}
        />
    );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
    window.requestAnimationFrame(() => {
      document.getElementById('kairo-main-content')?.focus({ preventScroll: true });
    });
  }, [pathname]);
  return null;
};

const pageVariants = {
  initial: { opacity: 0, y: 14, filter: 'blur(6px)' },
  in: { opacity: 1, y: 0, filter: 'blur(0px)' },
  out: { opacity: 0, y: -8, filter: 'blur(3px)' }
};

const pageTransition = {
  type: "tween" as const,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  duration: 0.42
};

interface AnimatedRoutesProps {
    results: CalculatorResults | null;
    setResults: (r: CalculatorResults | null) => void;
    waterData: WaterData;
    setWaterData: (d: WaterData) => void;
    foodData: FoodData;
    setFoodData: (d: FoodData) => void;
    energyData: EnergyData;
    setEnergyData: (d: EnergyData) => void;
    carbonReport: CarbonAnalysisReport | null;
    setCarbonReport: (r: CarbonAnalysisReport | null) => void;
    waterReport: WaterAnalysisReport | null;
    setWaterReport: (r: WaterAnalysisReport | null) => void;
    foodReport: FoodWasteAnalysisReport | null;
    setFoodReport: (r: FoodWasteAnalysisReport | null) => void;
    exposureReport: ExposureAnalysis | null;
    setExposureReport: (r: ExposureAnalysis | null) => void;
    ewasteReport: EwasteAnalysisReport | null;
    setEwasteReport: (r: EwasteAnalysisReport | null) => void;
    energyReport: EnergyAnalysisReport | null;
    setEnergyReport: (r: EnergyAnalysisReport | null) => void;
    transportReport: MobilityIntelligenceReport | null;
    setTransportReport: (r: MobilityIntelligenceReport | null) => void;
    userProgress: UserProgress;
    setUserProgress: (p: UserProgress) => void;
    handleSystemReset: () => void;
}

const AnimatedRoutes: React.FC<AnimatedRoutesProps> = ({
    results, waterData, foodData, setFoodData,
    carbonReport, waterReport, setWaterReport,
    foodReport, setFoodReport, exposureReport, setExposureReport,
    ewasteReport, setEwasteReport, energyReport, setEnergyReport,
    transportReport, setTransportReport,
    userProgress, setUserProgress, handleSystemReset 
}) => {
    const location = useLocation();
    const reduceMotion = useReducedMotion();

    return (
        <AnimatePresence mode="wait">
            <MotionDiv
               key={location.pathname}
               initial={reduceMotion ? false : "initial"}
               animate="in"
               exit="out"
               variants={reduceMotion ? { in: { opacity: 1 }, out: { opacity: 1 } } : pageVariants}
               transition={reduceMotion ? { duration: 0 } : pageTransition}
               className="kairo-page relative z-10 h-full w-full"
            >
              <Suspense fallback={
                <div className="flex min-h-screen items-center justify-center p-8">
                    <div className="flex flex-col items-center gap-4">
                        <KairoBrandMark className="h-20 aspect-[822/938] animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">KAIRO</span>
                    </div>
                </div>
              }>
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={
                  <Dashboard 
                      carbon={carbonReport}
                      water={waterReport}
                      food={foodReport}
                      exposure={exposureReport}
                      ewaste={ewasteReport}
                      energy={energyReport}
                      transport={transportReport}
                      onSystemReset={handleSystemReset}
                  />
                } />
                <Route path="/proof" element={<ImpactVerification />} />
                <Route path="/action" element={<ClimateAction results={results} userProgress={userProgress} setUserProgress={setUserProgress} />} />
                <Route path="/scenarios" element={<CompareScenarios />} />
                <Route path="/features" element={<Navigate to="/dashboard" replace />} />
                <Route path="/capabilities" element={<Navigate to="/dashboard" replace />} />
                <Route path="/impact" element={<Impact />} />
                <Route path="/learn" element={<Learn />} />
                <Route path="/about" element={<About />} />
                <Route path="/saas-roadmap" element={<SaasRoadmap />} />
                <Route path="/architecture" element={<TechnicalArchitecture />} />
                <Route path="/architecture/tokenrouter" element={<TokenRouterArchitecture />} />
                <Route path="/energy" element={<EnergyIntelligence report={energyReport} setGlobalReport={setEnergyReport} />} />
                <Route path="/transport" element={<TransportImpact report={transportReport} setGlobalReport={setTransportReport} />} />
                <Route path="/monitor" element={<LiveMonitor carbonReport={carbonReport} waterReport={waterReport} energyReport={energyReport} foodReport={foodReport} />} />
                <Route path="/exposure" element={<ExposureReport />} />
                <Route path="/csr" element={<CsrDashboard />} />
                <Route path="/systems/water-scarcity" element={<WaterScarcity report={waterReport} setGlobalReport={setWaterReport} globalWaterData={waterData} />} />
                <Route path="/systems/food-security" element={<FoodSecurityIntelligence report={foodReport} setGlobalReport={setFoodReport} globalFoodData={foodData} setGlobalFoodData={setFoodData} />} />
                <Route path="/systems/urban-exposure" element={<UrbanExposure report={exposureReport} setGlobalReport={setExposureReport} />} />
                <Route path="/systems/ewaste" element={<EwasteRecycler report={ewasteReport} setGlobalReport={setEwasteReport} />} />
                                <Route path="/water" element={<WaterPage />} />
                <Route path="/food" element={<FoodPage />} />
                <Route path="/co2" element={<CO2Page />} />
                <Route path="/sustainability" element={<SustainabilityPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
            </MotionDiv>
        </AnimatePresence>
    );
};

const AppLayout: React.FC = () => {
  const { theme, dir, language } = useApp();

  const [results, setResults] = usePersistentState<CalculatorResults | null>('kairo_baseline_results', null);
  const [waterData, setWaterData] = usePersistentState<WaterData>('kairo_input_water', { leakingTaps: 0, leakingToilets: 0, leakageHoursPerDay: 0, monthlyBillLE: 0 });
  const [foodData, setFoodData] = usePersistentState<FoodData>('kairo_input_food', { mealsPerDay: 3, costPerMealLE: 50, wastePercentage: 10 });
  const [energyData, setEnergyData] = usePersistentState<EnergyData>('kairo_input_energy', { monthlyKwh: 250, billEgp: 0, acCount: 1, acHoursPerDay: 6, acSetTemperature: 20, acType: 'standard', majorAppliances: 3 });
  
  const [carbonReport, setCarbonReport] = usePersistentState<CarbonAnalysisReport | null>('kairo_report_carbon', null);
  const [waterReport, setWaterReport] = usePersistentState<WaterAnalysisReport | null>('kairo_report_water', null);
  const [foodReport, setFoodReport] = usePersistentState<FoodWasteAnalysisReport | null>('kairo_report_food', null);
  const [exposureReport, setExposureReport] = usePersistentState<ExposureAnalysis | null>('kairo_report_exposure', null);
  const [ewasteReport, setEwasteReport] = usePersistentState<EwasteAnalysisReport | null>('kairo_report_ewaste', null);
  const [energyReport, setEnergyReport] = usePersistentState<EnergyAnalysisReport | null>('kairo_report_energy', null);
  const [transportReport, setTransportReport] = usePersistentState<MobilityIntelligenceReport | null>('kairo_report_transport', null);

  const [userProgress, setUserProgress] = usePersistentState<UserProgress>('kairo_user_progress', {
    waterScore: 0, badges: [], co2TargetKg: null, pledges: []
  });

  React.useEffect(() => {
    let active = true;
    void loadModuleReports()
      .then((reports) => {
        if (!active) return;
        if (!carbonReport && reports.carbon) setCarbonReport(reports.carbon as CarbonAnalysisReport);
        if (!waterReport && reports.water) setWaterReport(reports.water as WaterAnalysisReport);
        if (!foodReport && reports.food) setFoodReport(reports.food as FoodWasteAnalysisReport);
        if (!exposureReport && reports.exposure) setExposureReport(reports.exposure as ExposureAnalysis);
        if (!ewasteReport && reports.ewaste) setEwasteReport(reports.ewaste as EwasteAnalysisReport);
        if (!energyReport && reports.energy) setEnergyReport(reports.energy as EnergyAnalysisReport);
        if (!transportReport && reports.mobility) {
          setTransportReport(reports.mobility as MobilityIntelligenceReport);
        }
      })
      .catch(() => {
        // The app remains fully usable with local storage if cloud hydration is unavailable.
      });
    return () => {
      active = false;
    };
  }, []);

  useKairoCloudReportSync('carbon', carbonReport, carbonReport?.baseline?.monthly_total_kg_co2);
  useKairoCloudReportSync('water', waterReport, waterReport?.metrics?.water_efficiency_score);
  useKairoCloudReportSync('food', foodReport, foodReport?.metrics?.food_efficiency_score);
  useKairoCloudReportSync('exposure', exposureReport, exposureReport?.estimated_aqi);
  useKairoCloudReportSync(
    'ewaste',
    ewasteReport,
    ewasteReport?.environmental_impact?.circular_economy_impact_score,
  );
  useKairoCloudReportSync('energy', energyReport, energyReport?.metrics?.energy_efficiency_score);
  useKairoCloudReportSync('mobility', transportReport, transportReport?.scores?.mobility_efficiency);

  const handleSystemReset = () => {
      if (window.confirm(language === 'ar' ? 'هل تريد بدء تشغيل جديد ومسح بيانات الجلسة الحالية؟' : 'Start a new run and clear the current session data?')) {
          clearKairoStorage();
          window.location.reload(); 
      }
  };

  return (
    <>
      <SeoManager />
      <ScrollProgress />
      <ScrollToTop />
      <a className="kairo-skip-link" href="#kairo-main-content">
        {language === 'ar' ? 'انتقل إلى المحتوى الرئيسي' : 'Skip to main content'}
      </a>
      <div
        className={`kairo-site kairo-content-protected relative min-h-screen overflow-x-clip font-sans transition-colors duration-500 ${theme === 'light' ? 'bg-[#f5f8f6] text-slate-950' : 'bg-kairo-ink text-slate-100'}`}
        dir={dir}
        onCopyCapture={preventProtectedContentAction}
        onCutCapture={preventProtectedContentAction}
        onContextMenuCapture={preventProtectedContentAction}
        onDragStartCapture={preventProtectedContentAction}
      >
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            <div className="kairo-ambient-orb absolute -right-40 top-24 h-[32rem] w-[32rem] rounded-full bg-kairo-green/[0.035] blur-[110px]" />
        </div>
        <Navbar />
        <div id="kairo-main-content" tabIndex={-1}>
        <AnimatedRoutes 
            results={results} setResults={setResults}
            waterData={waterData} setWaterData={setWaterData}
            foodData={foodData} setFoodData={setFoodData}
            energyData={energyData} setEnergyData={setEnergyData}
            carbonReport={carbonReport} setCarbonReport={setCarbonReport}
            waterReport={waterReport} setWaterReport={setWaterReport}
            foodReport={foodReport} setFoodReport={setFoodReport}
            exposureReport={exposureReport} setExposureReport={setExposureReport}
            ewasteReport={ewasteReport} setEwasteReport={setEwasteReport}
            energyReport={energyReport} setEnergyReport={setEnergyReport}
            transportReport={transportReport} setTransportReport={setTransportReport}
            userProgress={userProgress} setUserProgress={setUserProgress}
            handleSystemReset={handleSystemReset}
        />
        </div>
        <AIServiceStatus />
        <KairoChat />
        <MobileTabBar />
      </div>
    </>
  );
}

const App: React.FC = () => {
  const basename =
    typeof window !== 'undefined' && /^\/en(?:\/|$)/.test(window.location.pathname)
      ? '/en'
      : undefined;

  return (
    <Router basename={basename}>
      <AppProvider>
        <AppLayout />
      </AppProvider>
    </Router>
  );
};

export default App;
