import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, Chip, Meter } from '@heroui/react';
import {
  Activity,
  AlertTriangle,
  BatteryCharging,
  Camera,
  CheckCircle2,
  CloudSun,
  Crosshair,
  Database,
  Droplets,
  Gauge,
  Info,
  LocateFixed,
  MapPin,
  Mic,
  Navigation,
  Radio,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  TimerReset,
  Wifi,
  Wind,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import SatelliteMap from '../components/SatelliteMap';
import ReportActions from '../components/ReportActions';
import SdgBadge from '../components/SdgBadge';
import { useApp } from '../contexts/AppContext';
import {
  computeAirEarlyWarning,
  computeWaterLeakRisk,
  fetchEnvironmentalForecast,
  type EnvironmentalSnapshot,
  type PipeMaterial,
  type PressureStability,
  type WarningLevel,
  type WaterNetworkProfile,
} from '../services/earlyWarningEngine';
import {
  collectDeviceSignals,
  requestPreciseLocation,
  type DeviceSignalSnapshot,
  type PreciseLocation,
} from '../services/deviceSignals';
import { saveEnvironmentalSnapshot } from '../services/kairoDatabase';
import type {
  CarbonAnalysisReport,
  EnergyAnalysisReport,
  FoodWasteAnalysisReport,
  WaterAnalysisReport,
} from '../types';

interface LiveMonitorProps {
  carbonReport?: CarbonAnalysisReport | null;
  waterReport?: WaterAnalysisReport | null;
  energyReport?: EnergyAnalysisReport | null;
  foodReport?: FoodWasteAnalysisReport | null;
}

const CAIRO_COORDINATES = {
  latitude: 30.0444,
  longitude: 31.2357,
};

const DEFAULT_PROFILE: WaterNetworkProfile = {
  pipeAgeYears: 15,
  material: 'unknown',
  pressureStability: 'unknown',
  previousLeaks: 0,
  nightFlowAnomaly: 0,
  acousticScore: null,
};

const levelColor: Record<WarningLevel, 'success' | 'warning' | 'danger'> = {
  low: 'success',
  moderate: 'warning',
  high: 'danger',
  critical: 'danger',
};

const levelClass: Record<WarningLevel, string> = {
  low: 'text-emerald-400',
  moderate: 'text-amber-400',
  high: 'text-orange-400',
  critical: 'text-rose-400',
};

const levelFillClass: Record<WarningLevel, string> = {
  low: 'bg-emerald-400',
  moderate: 'bg-amber-400',
  high: 'bg-orange-400',
  critical: 'bg-rose-400',
};

const LiveMonitor: React.FC<LiveMonitorProps> = () => {
  const { language, theme } = useApp();
  const isArabic = language === 'ar';
  const isLight = theme === 'light';
  const [deviceSignals, setDeviceSignals] = useState<DeviceSignalSnapshot | null>(null);
  const [location, setLocation] = useState<PreciseLocation | null>(null);
  const [snapshot, setSnapshot] = useState<EnvironmentalSnapshot | null>(null);
  const [profile, setProfile] = useState<WaterNetworkProfile>(DEFAULT_PROFILE);
  const [loadingForecast, setLoadingForecast] = useState(true);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastCloudSnapshot = useRef<string | null>(null);

  const copy = isArabic
    ? {
        eyebrow: 'KAIRO SIGNALS · الاستباق البيئي',
        title: 'استبق تغير الهواء ومخاطر المياه، وحوّل الإشارة إلى إجراء مناسب.',
        description:
          'خاصية متعددة الأهداف تجمع توقعات جودة الهواء، موقع الجهاز، وسياق شبكة المياه لتدعم الوقاية والفحص الميداني وحماية الفئات الحساسة وتوجيه الموارد.',
        locate: 'استخدم سياق موقعي',
        refresh: 'تحديث الإشارات',
        defaultArea: 'القاهرة · نطاق افتراضي',
        deviceArea: 'موقع الجهاز',
        live: 'بيانات حية',
        method: 'منهج شفاف',
        noFabrication: 'لا توجد بيانات بديلة مصطنعة',
      }
    : {
        eyebrow: 'KAIRO SIGNALS · ENVIRONMENTAL FORESIGHT',
        title: 'Anticipate changing air and water risk, then turn the signal into the right action.',
        description:
          'A multi-purpose capability combining air-quality forecasts, device location, and water-network context for prevention, field screening, protection of sensitive groups, and resource allocation.',
        locate: 'Use my location context',
        refresh: 'Refresh signals',
        defaultArea: 'Cairo · default scope',
        deviceArea: 'Device location',
        live: 'Live data',
        method: 'Transparent method',
        noFabrication: 'No fabricated fallback data',
      };

  const loadForecast = useCallback(async (latitude: number, longitude: number) => {
    setLoadingForecast(true);
    setError(null);
    try {
      const nextSnapshot = await fetchEnvironmentalForecast({ latitude, longitude });
      setSnapshot(nextSnapshot);
    } catch (forecastError) {
      setSnapshot(null);
      setError(
        forecastError instanceof Error
          ? forecastError.message
          : 'Environmental data could not be loaded.',
      );
    } finally {
      setLoadingForecast(false);
    }
  }, []);

  useEffect(() => {
    void collectDeviceSignals().then(setDeviceSignals).catch(() => setDeviceSignals(null));
    void loadForecast(CAIRO_COORDINATES.latitude, CAIRO_COORDINATES.longitude);
  }, [loadForecast]);

  const airWarning = useMemo(
    () => (snapshot ? computeAirEarlyWarning(snapshot) : null),
    [snapshot],
  );
  const waterRisk = useMemo(
    () => computeWaterLeakRisk(profile, snapshot),
    [profile, snapshot],
  );

  useEffect(() => {
    try {
      localStorage.setItem(
        'kairo_early_warning',
        JSON.stringify({
          updatedAt: new Date().toISOString(),
          coordinates: snapshot?.coordinates ?? null,
          air: airWarning
            ? {
                currentAqi: airWarning.currentAqi,
                peakAqi: airWarning.peakAqi,
                level: airWarning.level,
              }
            : null,
          water: {
            score: waterRisk.score,
            level: waterRisk.level,
            confidence: waterRisk.confidence,
          },
        }),
      );
    } catch {
      // Persistence is an enhancement; privacy settings can disable local storage.
    }
  }, [airWarning, snapshot, waterRisk]);

  useEffect(() => {
    if (!snapshot || !airWarning) return;

    const cloudSnapshot = {
      coordinates: snapshot.coordinates,
      air: {
        currentAqi: airWarning.currentAqi,
        peakAqi: airWarning.peakAqi,
        peakAt: airWarning.peakAt,
        level: airWarning.level,
        confidence: airWarning.confidence,
      },
      water: {
        score: waterRisk.score,
        level: waterRisk.level,
        confidence: waterRisk.confidence,
        profile,
      },
      deviceContext: deviceSignals
        ? {
            online: deviceSignals.online,
            network: deviceSignals.network,
            battery: deviceSignals.battery,
            geolocationPermission: deviceSignals.geolocation.permission,
          }
        : null,
    };
    const signature = JSON.stringify(cloudSnapshot);
    if (signature === lastCloudSnapshot.current) return;

    const syncTimer = window.setTimeout(() => {
      void saveEnvironmentalSnapshot(cloudSnapshot)
        .then(() => {
          lastCloudSnapshot.current = signature;
        })
        .catch(() => {
          // The live interface remains usable with local persistence if cloud sync is unavailable.
        });
    }, 1200);

    return () => window.clearTimeout(syncTimer);
  }, [airWarning, deviceSignals, profile, snapshot, waterRisk]);

  const handleLocate = async () => {
    setLocating(true);
    setError(null);
    try {
      const nextLocation = await requestPreciseLocation();
      setLocation(nextLocation);
      await loadForecast(nextLocation.latitude, nextLocation.longitude);
      setDeviceSignals(await collectDeviceSignals());
    } catch (locationError) {
      setError(
        isArabic
          ? 'تعذر الوصول للموقع. راجع إذن الموقع في المتصفح ثم حاول مرة أخرى.'
          : locationError instanceof Error
            ? locationError.message
            : 'Location access failed.',
      );
    } finally {
      setLocating(false);
    }
  };

  const handleRefresh = () => {
    const coordinates = location ?? {
      latitude: CAIRO_COORDINATES.latitude,
      longitude: CAIRO_COORDINATES.longitude,
    };
    void loadForecast(coordinates.latitude, coordinates.longitude);
  };

  const coordinates = snapshot?.coordinates ?? CAIRO_COORDINATES;
  const chartData =
    airWarning?.hourly.map((hour) => ({
      time: hour.time.slice(11, 16),
      AQI: Math.round(hour.aqi),
      'PM2.5': Number(hour.pm25.toFixed(1)),
    })) ?? [];

  return (
    <main
      className={`min-h-screen px-4 pb-20 pt-28 sm:px-6 lg:px-8 lg:pt-32 ${
        isLight ? 'bg-[#f5f8f6] text-slate-950' : 'bg-[#07110f] text-slate-50'
      }`}
    >
      <div id="kairo-signals-report" className="mx-auto max-w-[1480px]">
        <div className="no-export mb-5 flex flex-col gap-3 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.045] p-3 sm:flex-row sm:items-center sm:justify-between">
          <SdgBadge sdgs={[3, 6, 11, 13]} showTitle />
          <ReportActions
            targetId="kairo-signals-report"
            filename="Kairo_Signals_Environmental_Foresight"
            title={copy.eyebrow}
            subtitle={copy.description}
            sdgs={[3, 6, 11, 13]}
            disabled={!snapshot || !airWarning}
          />
        </div>
        <section className="relative mb-8 overflow-hidden rounded-[2rem] border border-emerald-400/15 bg-[radial-gradient(circle_at_top_right,rgba(43,212,167,0.16),transparent_42%),linear-gradient(135deg,rgba(10,31,25,0.98),rgba(7,17,15,0.96))] px-5 py-8 text-white shadow-[0_30px_90px_rgba(0,0,0,0.28)] sm:px-8 lg:px-12 lg:py-12">
          <div className="absolute -end-24 -top-24 h-72 w-72 rounded-full border border-emerald-400/15" />
          <div className="absolute -end-8 -top-8 h-44 w-44 rounded-full border border-emerald-400/20" />
          <div className="relative grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div className="max-w-4xl">
              <Chip color="success" size="sm" variant="soft">
                <Chip.Label>{copy.eyebrow}</Chip.Label>
              </Chip>
              <h1 className="mt-5 max-w-4xl text-balance text-3xl font-black leading-[1.15] tracking-[-0.035em] sm:text-5xl lg:text-6xl">
                {copy.title}
              </h1>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                {copy.description}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <TrustPill icon={<Radio />} text={copy.live} />
                <TrustPill icon={<ShieldCheck />} text={copy.method} />
                <TrustPill icon={<Database />} text={copy.noFabrication} />
              </div>
              <div className="mt-6">
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                  {isArabic ? 'الفئات المستهدفة' : 'Target audiences'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(isArabic
                    ? ['الأفراد والأسر', 'المجتمع والفرق الميدانية', 'التعليم والبحث', 'الشركات والمنشآت', 'المدن والجهات العامة']
                    : ['Individuals & families', 'Communities & field teams', 'Education & research', 'Businesses & facilities', 'Cities & public authorities']
                  ).map((audience) => (
                    <span
                      key={audience}
                      className="rounded-full border border-white/10 bg-black/15 px-3 py-1.5 text-[10px] font-bold text-slate-300"
                    >
                      {audience}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button
                variant="primary"
                size="lg"
                isPending={locating}
                onPress={handleLocate}
                className="min-w-60 font-bold"
              >
                <LocateFixed className="h-5 w-5" />
                {copy.locate}
              </Button>
              <Button
                variant="outline"
                size="lg"
                isPending={loadingForecast}
                onPress={handleRefresh}
                className="min-w-60 border-white/20 bg-white/5 text-white"
              >
                <RefreshCw className="h-5 w-5" />
                {copy.refresh}
              </Button>
            </div>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-400/25 bg-rose-500/10 p-4 text-sm text-rose-200"
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <strong>{isArabic ? 'تعذر تحديث الإشارة' : 'Signal update failed'}</strong>
              <p className="mt-1 opacity-85">{error}</p>
            </div>
          </div>
        )}

        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SignalMetric
            icon={<MapPin />}
            label={isArabic ? 'نطاق القرار' : 'Decision scope'}
            value={location ? copy.deviceArea : copy.defaultArea}
            detail={
              location
                ? isArabic
                  ? `دقة ±${location.accuracyMeters} متر`
                  : `±${location.accuracyMeters} m accuracy`
                : isArabic
                  ? 'لم يتم طلب إذن الموقع بعد'
                  : 'Location permission not requested'
            }
            isLight={isLight}
          />
          <SignalMetric
            icon={<Wind />}
            label={isArabic ? 'استباق جودة الهواء' : 'Air-quality foresight'}
            value={
              airWarning
                ? isArabic
                  ? `ذروة ${airWarning.peakAqi} AQI`
                  : `Peak ${airWarning.peakAqi} AQI`
                : isArabic
                  ? 'غير متاح'
                  : 'Unavailable'
            }
            detail={
              airWarning
                ? `${isArabic ? 'خلال 24 ساعة · ثقة' : 'Next 24h · confidence'} ${airWarning.confidence}%`
                : isArabic
                  ? 'لا توجد بيانات حية'
                  : 'No live data'
            }
            isLight={isLight}
            level={airWarning?.level}
          />
          <SignalMetric
            icon={<Droplets />}
            label={isArabic ? 'مخاطر شبكة المياه' : 'Water-network risk'}
            value={`${waterRisk.score}/100`}
            detail={`${isArabic ? 'اكتمال الأدلة' : 'Evidence confidence'} ${waterRisk.confidence}%`}
            isLight={isLight}
            level={waterRisk.level}
          />
          <SignalMetric
            icon={<TimerReset />}
            label={isArabic ? 'حداثة البيانات' : 'Data freshness'}
            value={
              snapshot
                ? new Date(snapshot.fetchedAt).toLocaleTimeString(isArabic ? 'ar-EG' : 'en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '—'
            }
            detail={
              snapshot
                ? isArabic
                  ? `توقيت المصدر: ${snapshot.timezone}`
                  : `Source timezone: ${snapshot.timezone}`
                : isArabic
                  ? 'بانتظار الاتصال'
                  : 'Waiting for connection'
            }
            isLight={isLight}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-12">
          <Card
            variant="default"
            className={`overflow-hidden xl:col-span-7 ${
              isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-[#0c1815]'
            }`}
          >
            <Card.Header className="flex-row items-start justify-between gap-4 p-5 sm:p-6">
              <div>
                <div className="mb-2 flex items-center gap-2 text-emerald-500">
                  <Wind className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-[0.18em]">
                    {isArabic ? 'توقع استباقي · 24 ساعة' : 'Early forecast · 24 hours'}
                  </span>
                </div>
                <Card.Title className="text-xl font-black sm:text-2xl">
                  {isArabic ? 'جودة الهواء قبل أن يشعر بها السكان' : 'Air quality before residents feel it'}
                </Card.Title>
                <Card.Description className="mt-2 max-w-2xl leading-6">
                  {isArabic
                    ? 'نرصد اتجاه AQI وPM2.5 ونحدد وقت الذروة المتوقع لتقديم نافذة قرار مبكرة.'
                    : 'Tracks AQI and PM2.5 direction, then identifies the expected peak to create an early decision window.'}
                </Card.Description>
              </div>
              {airWarning && (
                <Chip color={levelColor[airWarning.level]} variant="soft">
                  <Chip.Label>{levelLabel(airWarning.level, isArabic)}</Chip.Label>
                </Chip>
              )}
            </Card.Header>

            <Card.Content className="px-5 pb-5 sm:px-6 sm:pb-6">
              {loadingForecast ? (
                <LoadingPanel
                  text={isArabic ? 'جارٍ بناء نافذة التوقع…' : 'Building the forecast window…'}
                />
              ) : airWarning && snapshot ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <ForecastStat
                      label={isArabic ? 'الآن' : 'Now'}
                      value={`${airWarning.currentAqi}`}
                      suffix="AQI"
                      detail={`PM2.5 ${snapshot.air.current.pm25.toFixed(1)} µg/m³`}
                    />
                    <ForecastStat
                      label={isArabic ? 'الذروة المتوقعة' : 'Expected peak'}
                      value={`${airWarning.peakAqi}`}
                      suffix="AQI"
                      detail={formatForecastTime(airWarning.peakAt, isArabic)}
                      level={airWarning.level}
                    />
                    <ForecastStat
                      label={isArabic ? 'مؤشر التدهور' : 'Deterioration index'}
                      value={`${airWarning.warningIndex}`}
                      suffix="/100"
                      detail={
                        isArabic
                          ? 'مؤشر قرار، وليس احتمالًا إحصائيًا'
                          : 'Decision index, not statistical probability'
                      }
                      level={airWarning.level}
                    />
                  </div>

                  <div className="mt-5 h-72 w-full rounded-2xl border border-black/5 bg-black/[0.02] p-3 dark:border-white/5 dark:bg-black/10">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 12, right: 8, left: -24, bottom: 0 }}>
                        <defs>
                          <linearGradient id="aqiSignal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2bd4a7" stopOpacity={0.45} />
                            <stop offset="100%" stopColor="#2bd4a7" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="4 7"
                          stroke={isLight ? '#dbe5e0' : '#1e302a'}
                        />
                        <XAxis
                          dataKey="time"
                          tick={{ fill: isLight ? '#64748b' : '#94a3b8', fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          interval={3}
                        />
                        <YAxis
                          tick={{ fill: isLight ? '#64748b' : '#94a3b8', fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <ChartTooltip
                          contentStyle={{
                            background: isLight ? '#ffffff' : '#0b1713',
                            border: `1px solid ${isLight ? '#dbe5e0' : '#20352e'}`,
                            borderRadius: '14px',
                            color: isLight ? '#10211c' : '#f4fbf8',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="AQI"
                          stroke="#2bd4a7"
                          strokeWidth={3}
                          fill="url(#aqiSignal)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    {airWarning.actions.map((action) => (
                      <ActionRow key={action} text={action} />
                    ))}
                  </div>
                </>
              ) : (
                <EmptyData
                  title={isArabic ? 'البيانات الحية غير متاحة' : 'Live data unavailable'}
                  text={
                    isArabic
                      ? 'لم نعرض قيمًا افتراضية. تحقق من الاتصال ثم أعد المحاولة.'
                      : 'No fallback values were shown. Check the connection and retry.'
                  }
                />
              )}
            </Card.Content>

            <Card.Footer className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 px-5 py-4 text-xs text-slate-500 dark:border-white/5 sm:px-6">
              <span className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Open-Meteo Air Quality Forecast
              </span>
              <span>
                {isArabic
                  ? 'حد التنبيه المستخدم: US AQI ≥ 101'
                  : 'Alert threshold: US AQI ≥ 101'}
              </span>
            </Card.Footer>
          </Card>

          <Card
            variant="default"
            className={`xl:col-span-5 ${
              isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-[#0c1815]'
            }`}
          >
            <Card.Header className="flex-row items-start justify-between gap-4 p-5 sm:p-6">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sky-500">
                  <Droplets className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-[0.18em]">
                    {isArabic ? 'فحص أولويات الصيانة' : 'Maintenance triage'}
                  </span>
                </div>
                <Card.Title className="text-xl font-black sm:text-2xl">
                  {isArabic ? 'مؤشر مخاطر تسريب المياه' : 'Water-leak risk index'}
                </Card.Title>
                <Card.Description className="mt-2 leading-6">
                  {isArabic
                    ? 'رتّب مناطق الفحص قبل العطل باستخدام الأدلة المتاحة، مع إظهار أثر كل عامل.'
                    : 'Prioritize inspection before failure using available evidence, with every factor exposed.'}
                </Card.Description>
              </div>
              <Chip color={levelColor[waterRisk.level]} variant="soft">
                <Chip.Label>{levelLabel(waterRisk.level, isArabic)}</Chip.Label>
              </Chip>
            </Card.Header>

            <Card.Content className="space-y-5 px-5 pb-5 sm:px-6 sm:pb-6">
              <div className="rounded-2xl border border-sky-400/15 bg-sky-500/[0.06] p-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                      {isArabic ? 'مؤشر المخاطر الحالي' : 'Current risk index'}
                    </div>
                    <div className={`mt-2 text-5xl font-black ${levelClass[waterRisk.level]}`}>
                      {waterRisk.score}
                      <span className="ms-1 text-base font-bold text-slate-500">/100</span>
                    </div>
                  </div>
                  <div className="text-end text-xs text-slate-500">
                    <div>{isArabic ? 'اكتمال الأدلة' : 'Evidence confidence'}</div>
                    <strong className="mt-1 block text-lg text-current">
                      {waterRisk.confidence}%
                    </strong>
                  </div>
                </div>
                <Meter
                  aria-label={isArabic ? 'مؤشر مخاطر المياه' : 'Water risk index'}
                  value={waterRisk.score}
                  minValue={0}
                  maxValue={100}
                  color={levelColor[waterRisk.level]}
                  className="mt-4"
                >
                  <Meter.Track>
                    <Meter.Fill />
                  </Meter.Track>
                </Meter>
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  {isArabic
                    ? 'هذا فرز استباقي للأولوية وليس إثباتًا لوجود تسريب. التأكيد يحتاج قياس ضغط/تدفق أو فحصًا ميدانيًا.'
                    : 'This is preventive triage, not proof of a leak. Confirmation requires pressure/flow readings or a field inspection.'}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FieldSelect
                  label={isArabic ? 'مادة الأنبوب' : 'Pipe material'}
                  value={profile.material}
                  onChange={(value) =>
                    setProfile((current) => ({ ...current, material: value as PipeMaterial }))
                  }
                  options={[
                    ['unknown', isArabic ? 'غير معروف' : 'Unknown'],
                    ['pvc', 'PVC'],
                    ['steel', isArabic ? 'صلب' : 'Steel'],
                    ['cast-iron', isArabic ? 'حديد زهر' : 'Cast iron'],
                    ['copper', isArabic ? 'نحاس' : 'Copper'],
                  ]}
                  isLight={isLight}
                />
                <FieldSelect
                  label={isArabic ? 'استقرار الضغط' : 'Pressure stability'}
                  value={profile.pressureStability}
                  onChange={(value) =>
                    setProfile((current) => ({
                      ...current,
                      pressureStability: value as PressureStability,
                    }))
                  }
                  options={[
                    ['unknown', isArabic ? 'غير معروف' : 'Unknown'],
                    ['stable', isArabic ? 'مستقر' : 'Stable'],
                    ['variable', isArabic ? 'متغير' : 'Variable'],
                    ['unstable', isArabic ? 'غير مستقر' : 'Unstable'],
                  ]}
                  isLight={isLight}
                />
              </div>

              <RangeField
                label={isArabic ? 'عمر الخط' : 'Pipe age'}
                value={profile.pipeAgeYears}
                suffix={isArabic ? ' سنة' : ' years'}
                min={0}
                max={60}
                onChange={(value) =>
                  setProfile((current) => ({ ...current, pipeAgeYears: value }))
                }
              />
              <RangeField
                label={isArabic ? 'انحراف التدفق الليلي' : 'Night-flow anomaly'}
                value={profile.nightFlowAnomaly}
                suffix="%"
                min={0}
                max={100}
                onChange={(value) =>
                  setProfile((current) => ({ ...current, nightFlowAnomaly: value }))
                }
              />
              <RangeField
                label={isArabic ? 'بلاغات سابقة في القطاع' : 'Previous sector leaks'}
                value={profile.previousLeaks}
                suffix=""
                min={0}
                max={5}
                onChange={(value) =>
                  setProfile((current) => ({ ...current, previousLeaks: value }))
                }
              />

              <div className="rounded-2xl border border-black/5 p-4 dark:border-white/8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Mic className="mt-0.5 h-5 w-5 text-emerald-500" />
                    <div>
                      <div className="text-sm font-bold">
                        {isArabic ? 'الفحص الصوتي الموضعي' : 'Local acoustic screening'}
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {isArabic
                          ? 'خاصية قادمة قيد التطوير والتحقق؛ الميكروفون غير مستخدم في حساب المؤشر الحالي.'
                          : 'Coming soon and under validation; the microphone is not used in the current score.'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    isDisabled
                  >
                    <Mic className="h-4 w-4" />
                    {isArabic ? 'قريبًا' : 'Coming soon'}
                  </Button>
                </div>
              </div>

              {waterRisk.factors.length > 0 && (
                <div>
                  <div className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                    {isArabic ? 'العوامل الأكثر تأثيرًا' : 'Leading factors'}
                  </div>
                  <div className="space-y-2">
                    {waterRisk.factors.slice(0, 4).map((factor) => (
                      <div
                        key={factor.key}
                        className="flex items-start justify-between gap-4 rounded-xl bg-black/[0.025] px-3 py-2.5 text-sm dark:bg-white/[0.035]"
                      >
                        <div>
                          <strong>{factor.label}</strong>
                          <p className="mt-0.5 text-xs text-slate-500">{factor.detail}</p>
                        </div>
                        <span className="shrink-0 font-black text-amber-500">
                          +{factor.contribution}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card.Content>
          </Card>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-12">
          <Card
            className={`xl:col-span-8 ${
              isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-[#0c1815]'
            }`}
          >
            <Card.Header className="flex-row items-center justify-between p-5 sm:p-6">
              <div>
                <Card.Title className="flex items-center gap-2 text-lg font-black">
                  <Navigation className="h-5 w-5 text-emerald-500" />
                  {isArabic ? 'خريطة نطاق القرار' : 'Decision-scope map'}
                </Card.Title>
                <Card.Description className="mt-1">
                  {location
                    ? isArabic
                      ? 'موقع الجهاز ونطاق دقته الفعلي.'
                      : 'Device location and its actual accuracy radius.'
                    : isArabic
                      ? 'القاهرة كنطاق افتراضي؛ اضغط زر الموقع للانتقال لموقع الجهاز.'
                      : 'Cairo is the default scope; use location to move to the device.'}
                </Card.Description>
              </div>
              <Chip color={location ? 'success' : 'default'} variant="soft">
                <Chip.Label>{location ? copy.deviceArea : copy.defaultArea}</Chip.Label>
              </Chip>
            </Card.Header>
            <Card.Content className="h-[430px] px-5 pb-5 sm:px-6 sm:pb-6">
              <SatelliteMap
                lat={coordinates.latitude}
                lng={coordinates.longitude}
                city={location ? copy.deviceArea : copy.defaultArea}
                accuracyMeters={location?.accuracyMeters}
                riskLevel={waterRisk.level}
              />
            </Card.Content>
          </Card>

          <Card
            className={`xl:col-span-4 ${
              isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-[#0c1815]'
            }`}
          >
            <Card.Header className="p-5 sm:p-6">
              <Card.Title className="flex items-center gap-2 text-lg font-black">
                <Smartphone className="h-5 w-5 text-emerald-500" />
                {isArabic ? 'إشارات الجهاز ذات الهدف' : 'Purposeful device signals'}
              </Card.Title>
              <Card.Description className="mt-2 leading-6">
                {isArabic
                  ? 'نستخدم فقط الإشارات التي تحسّن القرار أو سلامة جمع البيانات.'
                  : 'Only signals that improve the decision or data-collection safety are used.'}
              </Card.Description>
            </Card.Header>
            <Card.Content className="space-y-3 px-5 pb-5 sm:px-6 sm:pb-6">
              <DeviceCapability
                icon={<Crosshair />}
                title="GPS"
                state={
                  location
                    ? isArabic
                      ? `نشط · ±${location.accuracyMeters} م`
                      : `Active · ±${location.accuracyMeters} m`
                    : permissionText(deviceSignals?.geolocation.permission, isArabic)
                }
                purpose={
                  isArabic
                    ? 'ربط التنبيه بالقطاع الصحيح وإظهار دقة الموقع.'
                    : 'Bind the alert to the correct sector and expose accuracy.'
                }
                active={Boolean(location)}
              />
              <DeviceCapability
                icon={<Mic />}
                title={isArabic ? 'الميكروفون' : 'Microphone'}
                state={isArabic ? 'قريبًا · قيد التطوير' : 'Coming soon · in development'}
                purpose={
                  isArabic
                    ? 'مخطط لفحص استكشافي محلي بعد اكتمال التحقق؛ لا يدخل حاليًا في أي قرار.'
                    : 'Planned for locally processed screening after validation; not used in current decisions.'
                }
                active={false}
              />
              <DeviceCapability
                icon={<Wifi />}
                title={isArabic ? 'الشبكة' : 'Network'}
                state={
                  deviceSignals?.online
                    ? deviceSignals.network.effectiveType?.toUpperCase() ??
                      (isArabic ? 'متصل' : 'Online')
                    : isArabic
                      ? 'غير متصل'
                      : 'Offline'
                }
                purpose={
                  isArabic
                    ? 'منع قرار مبني على بيانات قديمة أو اتصال ضعيف.'
                    : 'Prevent decisions based on stale or weakly connected data.'
                }
                active={Boolean(deviceSignals?.online)}
              />
              <DeviceCapability
                icon={<BatteryCharging />}
                title={isArabic ? 'البطارية' : 'Battery'}
                state={
                  deviceSignals?.battery.level !== null &&
                  deviceSignals?.battery.level !== undefined
                    ? `${deviceSignals.battery.level}%`
                    : isArabic
                      ? 'غير متاح'
                      : 'Unavailable'
                }
                purpose={
                  isArabic
                    ? 'تقليل تكرار القياس عند انخفاض الطاقة أثناء العمل الميداني.'
                    : 'Reduce sampling frequency on low power during field work.'
                }
                active={Boolean(deviceSignals?.battery.supported)}
              />
              <DeviceCapability
                icon={<Camera />}
                title={isArabic ? 'الكاميرا' : 'Camera'}
                state={isArabic ? 'قريبًا · قيد التطوير' : 'Coming soon · in development'}
                purpose={
                  isArabic
                    ? 'مخطط لتوثيق البلاغات اختياريًا بعد اكتمال الخصوصية والتحقق؛ غير مستخدمة حاليًا.'
                    : 'Planned for optional incident evidence after privacy and validation work; not currently used.'
                }
                active={false}
              />
            </Card.Content>
          </Card>
        </section>

        <section
          className={`mt-6 rounded-[1.5rem] border p-5 sm:p-6 ${
            isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-[#0c1815]'
          }`}
        >
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr_1fr]">
            <MethodNote
              icon={<Gauge />}
              title={isArabic ? 'ما الذي يعنيه “المؤشر”؟' : 'What does “index” mean?'}
              text={
                isArabic
                  ? 'درجة ترتيب للأولوية من 0–100، وليست نسبة احتمال إحصائية معايرة. تحويلها لاحتمال حقيقي يحتاج سجل أعطال محلي وبيانات حساسات ضغط/تدفق.'
                  : 'A 0–100 prioritization score, not a calibrated statistical probability. True probability requires local failure history and pressure/flow sensor data.'
              }
            />
            <MethodNote
              icon={<CloudSun />}
              title={isArabic ? 'مصادر الهواء والطقس' : 'Air and weather sources'}
              text={
                isArabic
                  ? 'توقعات Open-Meteo لجودة الهواء والطقس حسب الإحداثيات، مع وقت تحديث ظاهر ودون نسب بيانات لمصادر غير مؤكدة.'
                  : 'Open-Meteo air-quality and weather forecasts by coordinate, with visible freshness and no unsupported source attribution.'
              }
            />
            <MethodNote
              icon={<ShieldCheck />}
              title={isArabic ? 'الخصوصية والحدود' : 'Privacy and limits'}
              text={
                isArabic
                  ? 'الموقع لا يعمل إلا بإذن ولا يُستخدم GPS وحده لإثبات تسريب. الكاميرا والميكروفون خصائص قادمة وغير مستخدمة أو مخزنة ضمن قرارات Kairo الحالية.'
                  : 'Location requires consent and GPS alone never confirms a leak. Camera and microphone are upcoming and are not used or stored in current Kairo decisions.'
              }
            />
          </div>
        </section>
      </div>
    </main>
  );
};

const TrustPill = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-slate-200">
    <span className="[&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:text-emerald-400">{icon}</span>
    {text}
  </span>
);

const SignalMetric = ({
  icon,
  label,
  value,
  detail,
  isLight,
  level,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  isLight: boolean;
  level?: WarningLevel;
}) => (
  <Card
    className={`min-h-40 ${
      isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-[#0c1815]'
    }`}
  >
    <Card.Content className="flex h-full flex-col justify-between p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
          {label}
        </div>
        <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-500 [&>svg]:h-5 [&>svg]:w-5">
          {icon}
        </div>
      </div>
      <div className="mt-5">
        <div className={`text-xl font-black ${level ? levelClass[level] : ''}`}>{value}</div>
        <div className="mt-1 text-xs leading-5 text-slate-500">{detail}</div>
      </div>
    </Card.Content>
  </Card>
);

const ForecastStat = ({
  label,
  value,
  suffix,
  detail,
  level,
}: {
  label: string;
  value: string;
  suffix: string;
  detail: string;
  level?: WarningLevel;
}) => (
  <div className="rounded-2xl border border-black/5 bg-black/[0.02] p-4 dark:border-white/5 dark:bg-white/[0.025]">
    <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</div>
    <div className={`mt-3 text-3xl font-black ${level ? levelClass[level] : ''}`}>
      {value}
      <span className="ms-1 text-xs font-bold text-slate-500">{suffix}</span>
    </div>
    <div className="mt-2 text-xs leading-5 text-slate-500">{detail}</div>
  </div>
);

const ActionRow = ({ text }: { text: string }) => (
  <div className="flex items-start gap-3 rounded-xl border border-emerald-400/10 bg-emerald-500/[0.055] p-3 text-sm leading-6">
    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
    <span>{text}</span>
  </div>
);

const FieldSelect = ({
  label,
  value,
  onChange,
  options,
  isLight,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
  isLight: boolean;
}) => (
  <label className="block text-xs font-bold text-slate-500">
    {label}
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`mt-2 h-11 w-full rounded-xl border px-3 text-sm font-semibold outline-none transition focus:border-emerald-500 ${
        isLight
          ? 'border-slate-200 bg-slate-50 text-slate-900'
          : 'border-white/10 bg-[#07110f] text-slate-100'
      }`}
    >
      {options.map(([optionValue, optionLabel]) => (
        <option key={optionValue} value={optionValue}>
          {optionLabel}
        </option>
      ))}
    </select>
  </label>
);

const RangeField = ({
  label,
  value,
  suffix,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  suffix: string;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) => (
  <label className="block">
    <span className="flex items-center justify-between gap-4 text-xs font-bold text-slate-500">
      <span>{label}</span>
      <span className="text-sm text-emerald-500">
        {value}
        {suffix}
      </span>
    </span>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="mt-3 h-1.5 w-full cursor-pointer accent-emerald-500"
    />
  </label>
);

const DeviceCapability = ({
  icon,
  title,
  state,
  purpose,
  active,
}: {
  icon: React.ReactNode;
  title: string;
  state: string;
  purpose: string;
  active: boolean;
}) => (
  <div className="flex gap-3 rounded-2xl border border-black/5 p-3.5 dark:border-white/7">
    <div
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl [&>svg]:h-4.5 [&>svg]:w-4.5 ${
        active ? 'bg-emerald-500/12 text-emerald-500' : 'bg-slate-500/10 text-slate-500'
      }`}
    >
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex items-center justify-between gap-3">
        <strong className="text-sm">{title}</strong>
        <span className={`text-[11px] font-bold ${active ? 'text-emerald-500' : 'text-slate-500'}`}>
          {state}
        </span>
      </div>
      <p className="mt-1 text-xs leading-5 text-slate-500">{purpose}</p>
    </div>
  </div>
);

const MethodNote = ({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) => (
  <div className="flex items-start gap-4">
    <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-500 [&>svg]:h-5 [&>svg]:w-5">
      {icon}
    </div>
    <div>
      <h3 className="font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
    </div>
  </div>
);

const LoadingPanel = ({ text }: { text: string }) => (
  <div className="grid min-h-[360px] place-items-center rounded-2xl border border-dashed border-emerald-400/20">
    <div className="text-center">
      <Activity className="mx-auto h-7 w-7 animate-pulse text-emerald-500" />
      <p className="mt-3 text-sm text-slate-500">{text}</p>
    </div>
  </div>
);

const EmptyData = ({ title, text }: { title: string; text: string }) => (
  <div className="grid min-h-[360px] place-items-center rounded-2xl border border-dashed border-rose-400/20 p-8 text-center">
    <div>
      <Info className="mx-auto h-7 w-7 text-rose-400" />
      <strong className="mt-3 block">{title}</strong>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{text}</p>
    </div>
  </div>
);

const levelLabel = (level: WarningLevel, isArabic: boolean) => {
  const labels: Record<WarningLevel, [string, string]> = {
    low: ['منخفض', 'Low'],
    moderate: ['متوسط', 'Moderate'],
    high: ['مرتفع', 'High'],
    critical: ['حرج', 'Critical'],
  };
  return labels[level][isArabic ? 0 : 1];
};

const permissionText = (
  permission: DeviceSignalSnapshot['geolocation']['permission'] | undefined,
  isArabic: boolean,
) => {
  if (!permission) return isArabic ? 'جارٍ الفحص' : 'Checking';
  const labels: Record<string, [string, string]> = {
    granted: ['مسموح', 'Granted'],
    denied: ['مرفوض', 'Denied'],
    prompt: ['عند الطلب', 'On request'],
    unsupported: ['غير مدعوم', 'Unsupported'],
    unknown: ['غير محدد', 'Unknown'],
  };
  return (labels[permission] ?? labels.unknown)[isArabic ? 0 : 1];
};

const formatForecastTime = (time: string, isArabic: boolean) => {
  const date = new Date(time);
  if (Number.isNaN(date.getTime())) return time.replace('T', ' ');
  return date.toLocaleString(isArabic ? 'ar-EG' : 'en-GB', {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default LiveMonitor;
