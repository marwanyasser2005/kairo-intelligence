export type WarningLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface AirHour {
  time: string;
  aqi: number;
  pm25: number;
  pm10: number;
  nitrogenDioxide: number;
  ozone: number;
}

export interface WeatherHour {
  time: string;
  temperatureC: number;
  relativeHumidity: number;
  precipitationProbability: number;
  surfacePressureHpa: number;
}

export interface EnvironmentalSnapshot {
  coordinates: Coordinates;
  timezone: string;
  fetchedAt: string;
  air: {
    observedAt: string;
    current: Omit<AirHour, 'time'>;
    hourly: AirHour[];
  };
  weather: {
    observedAt: string;
    current: {
      temperatureC: number;
      relativeHumidity: number;
      surfacePressureHpa: number;
    };
    hourly: WeatherHour[];
  };
}

export interface AirEarlyWarning {
  currentAqi: number;
  peakAqi: number;
  peakAt: string;
  delta: number;
  warningIndex: number;
  level: WarningLevel;
  unhealthyHours: number;
  thresholdCrossingAt: string | null;
  confidence: number;
  actions: string[];
  hourly: AirHour[];
}

export type PipeMaterial = 'unknown' | 'pvc' | 'steel' | 'cast-iron' | 'copper';
export type PressureStability = 'unknown' | 'stable' | 'variable' | 'unstable';

export interface WaterNetworkProfile {
  pipeAgeYears: number;
  material: PipeMaterial;
  pressureStability: PressureStability;
  previousLeaks: number;
  nightFlowAnomaly: number;
  acousticScore: number | null;
}

export interface RiskFactor {
  key: string;
  label: string;
  contribution: number;
  detail: string;
}

export interface WaterLeakRisk {
  score: number;
  level: WarningLevel;
  confidence: number;
  factors: RiskFactor[];
  actions: string[];
}

interface OpenMeteoAirResponse {
  timezone?: string;
  current?: {
    time?: string;
    us_aqi?: number;
    pm2_5?: number;
    pm10?: number;
    nitrogen_dioxide?: number;
    ozone?: number;
  };
  hourly?: {
    time?: string[];
    us_aqi?: number[];
    pm2_5?: number[];
    pm10?: number[];
    nitrogen_dioxide?: number[];
    ozone?: number[];
  };
}

interface OpenMeteoWeatherResponse {
  timezone?: string;
  current?: {
    time?: string;
    temperature_2m?: number;
    relative_humidity_2m?: number;
    surface_pressure?: number;
  };
  hourly?: {
    time?: string[];
    temperature_2m?: number[];
    relative_humidity_2m?: number[];
    precipitation_probability?: number[];
    surface_pressure?: number[];
  };
}

const clamp = (value: number, minimum = 0, maximum = 100) =>
  Math.min(maximum, Math.max(minimum, value));

const finite = (value: unknown, fallback = 0) =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const nextHours = <T extends { time: string }>(
  values: T[],
  currentTime: string,
  count: number,
): T[] => {
  const startIndex = Math.max(
    0,
    values.findIndex((value) => value.time >= currentTime),
  );
  return values.slice(startIndex, startIndex + count);
};

export const fetchEnvironmentalForecast = async (
  coordinates: Coordinates,
): Promise<EnvironmentalSnapshot> => {
  const { latitude, longitude } = coordinates;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12_000);

  const airParams = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: 'us_aqi,pm10,pm2_5,nitrogen_dioxide,ozone',
    hourly: 'us_aqi,pm10,pm2_5,nitrogen_dioxide,ozone',
    forecast_days: '3',
    timezone: 'auto',
  });
  const weatherParams = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: 'temperature_2m,relative_humidity_2m,surface_pressure',
    hourly:
      'temperature_2m,relative_humidity_2m,precipitation_probability,surface_pressure',
    forecast_days: '3',
    timezone: 'auto',
  });

  try {
    const [airResponse, weatherResponse] = await Promise.all([
      fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${airParams}`, {
        signal: controller.signal,
      }),
      fetch(`https://api.open-meteo.com/v1/forecast?${weatherParams}`, {
        signal: controller.signal,
      }),
    ]);

    if (!airResponse.ok || !weatherResponse.ok) {
      throw new Error('The environmental data provider returned an error.');
    }

    const [airJson, weatherJson] = (await Promise.all([
      airResponse.json(),
      weatherResponse.json(),
    ])) as [OpenMeteoAirResponse, OpenMeteoWeatherResponse];

    if (!airJson.current?.time || !airJson.hourly?.time || !weatherJson.current?.time) {
      throw new Error('The environmental data response is incomplete.');
    }

    const airHours = airJson.hourly.time.map((time, index) => ({
      time,
      aqi: finite(airJson.hourly?.us_aqi?.[index]),
      pm25: finite(airJson.hourly?.pm2_5?.[index]),
      pm10: finite(airJson.hourly?.pm10?.[index]),
      nitrogenDioxide: finite(airJson.hourly?.nitrogen_dioxide?.[index]),
      ozone: finite(airJson.hourly?.ozone?.[index]),
    }));

    const weatherTimes = weatherJson.hourly?.time ?? [];
    const weatherHours = weatherTimes.map((time, index) => ({
      time,
      temperatureC: finite(weatherJson.hourly?.temperature_2m?.[index]),
      relativeHumidity: finite(weatherJson.hourly?.relative_humidity_2m?.[index]),
      precipitationProbability: finite(
        weatherJson.hourly?.precipitation_probability?.[index],
      ),
      surfacePressureHpa: finite(weatherJson.hourly?.surface_pressure?.[index]),
    }));

    return {
      coordinates,
      timezone: airJson.timezone ?? weatherJson.timezone ?? 'auto',
      fetchedAt: new Date().toISOString(),
      air: {
        observedAt: airJson.current.time,
        current: {
          aqi: finite(airJson.current.us_aqi),
          pm25: finite(airJson.current.pm2_5),
          pm10: finite(airJson.current.pm10),
          nitrogenDioxide: finite(airJson.current.nitrogen_dioxide),
          ozone: finite(airJson.current.ozone),
        },
        hourly: airHours,
      },
      weather: {
        observedAt: weatherJson.current.time,
        current: {
          temperatureC: finite(weatherJson.current.temperature_2m),
          relativeHumidity: finite(weatherJson.current.relative_humidity_2m),
          surfacePressureHpa: finite(weatherJson.current.surface_pressure),
        },
        hourly: weatherHours,
      },
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Environmental data request timed out.');
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
};

export const computeAirEarlyWarning = (
  snapshot: EnvironmentalSnapshot,
): AirEarlyWarning => {
  const hourly = nextHours(snapshot.air.hourly, snapshot.air.observedAt, 24);
  if (hourly.length === 0) throw new Error('No hourly air-quality forecast is available.');

  const peak = hourly.reduce((highest, hour) => (hour.aqi > highest.aqi ? hour : highest));
  const currentAqi = Math.round(snapshot.air.current.aqi);
  const peakAqi = Math.round(peak.aqi);
  const delta = peakAqi - currentAqi;
  const unhealthyHours = hourly.filter((hour) => hour.aqi >= 101).length;
  const thresholdCrossingAt =
    hourly.find((hour) => hour.aqi >= 101 && currentAqi < 101)?.time ?? null;

  const warningIndex = Math.round(
    clamp(
      peakAqi * 0.52 +
        Math.max(0, delta) * 0.85 +
        unhealthyHours * 2.2 +
        Math.max(0, snapshot.air.current.pm25 - 15) * 0.35,
    ),
  );

  const level: WarningLevel =
    peakAqi >= 151
      ? 'critical'
      : peakAqi >= 101
        ? 'high'
        : peakAqi >= 51
          ? 'moderate'
          : 'low';

  const actions =
    level === 'critical'
      ? [
          'فعّل تنبيهًا فوريًا للفئات الحساسة وقلّل الأنشطة الخارجية.',
          'راجع التهوية والترشيح في المدارس والمنشآت القريبة.',
        ]
      : level === 'high'
        ? [
            'جدول الأعمال الخارجية قبل ساعة الذروة المتوقعة.',
            'أرسل تحذيرًا استباقيًا للفئات الحساسة في النطاق.',
          ]
        : level === 'moderate'
          ? [
              'راقب نقطة الذروة القادمة وحدّث القرار كل ساعة.',
              'جهّز رسالة تنبيه إذا تجاوز المؤشر 100.',
            ]
          : ['لا يلزم تصعيد الآن؛ استمر في التحديث الدوري كل ساعة.'];

  return {
    currentAqi,
    peakAqi,
    peakAt: peak.time,
    delta,
    warningIndex,
    level,
    unhealthyHours,
    thresholdCrossingAt,
    confidence: Math.round(clamp(62 + Math.min(hourly.length, 24) * 1.25)),
    actions,
    hourly,
  };
};

const addFactor = (
  factors: RiskFactor[],
  key: string,
  label: string,
  contribution: number,
  detail: string,
) => {
  if (contribution <= 0) return;
  factors.push({
    key,
    label,
    contribution: Math.round(contribution),
    detail,
  });
};

export const computeWaterLeakRisk = (
  profile: WaterNetworkProfile,
  snapshot: EnvironmentalSnapshot | null,
): WaterLeakRisk => {
  const factors: RiskFactor[] = [];
  const ageContribution = clamp(profile.pipeAgeYears / 40, 0, 1) * 22;
  addFactor(
    factors,
    'age',
    'عمر خط المياه',
    ageContribution,
    `${profile.pipeAgeYears} سنة من العمر التشغيلي المدخل.`,
  );

  const materialWeights: Record<PipeMaterial, number> = {
    unknown: 6,
    pvc: 4,
    steel: 12,
    'cast-iron': 18,
    copper: 8,
  };
  addFactor(
    factors,
    'material',
    'مادة الأنبوب',
    materialWeights[profile.material],
    profile.material === 'unknown'
      ? 'نوع الأنبوب غير معروف؛ أضيف هامش احتياطي.'
      : `تم تطبيق معامل مادة ${profile.material}.`,
  );

  const pressureWeights: Record<PressureStability, number> = {
    unknown: 8,
    stable: 2,
    variable: 12,
    unstable: 20,
  };
  addFactor(
    factors,
    'pressure',
    'استقرار الضغط',
    pressureWeights[profile.pressureStability],
    `حالة الضغط المسجلة: ${profile.pressureStability}.`,
  );

  addFactor(
    factors,
    'history',
    'سجل الأعطال',
    clamp(profile.previousLeaks * 5, 0, 16),
    `${profile.previousLeaks} بلاغات تسريب سابقة في هذا القطاع.`,
  );
  addFactor(
    factors,
    'night-flow',
    'انحراف التدفق الليلي',
    clamp(profile.nightFlowAnomaly, 0, 100) * 0.2,
    `قيمة الانحراف المدخلة ${Math.round(profile.nightFlowAnomaly)}%.`,
  );

  if (profile.acousticScore !== null) {
    addFactor(
      factors,
      'acoustic',
      'فحص الضوضاء الموضعي',
      clamp(profile.acousticScore, 0, 100) * 0.18,
      `إشارة صوتية استكشافية ${Math.round(profile.acousticScore)}/100؛ ليست تشخيصًا للتسريب.`,
    );
  }

  if (snapshot) {
    const weather = nextHours(snapshot.weather.hourly, snapshot.weather.observedAt, 24);
    if (weather.length > 0) {
      const temperatures = weather.map((hour) => hour.temperatureC);
      const temperatureSwing = Math.max(...temperatures) - Math.min(...temperatures);
      const precipitationPeak = Math.max(
        ...weather.map((hour) => hour.precipitationProbability),
      );
      addFactor(
        factors,
        'temperature',
        'تغير الحرارة خلال 24 ساعة',
        clamp((temperatureSwing - 8) * 0.6, 0, 8),
        `مدى حراري متوقع ${temperatureSwing.toFixed(1)}°م.`,
      );
      addFactor(
        factors,
        'precipitation',
        'احتمال الأمطار',
        clamp((precipitationPeak - 50) * 0.12, 0, 6),
        `ذروة احتمال الأمطار ${Math.round(precipitationPeak)}%.`,
      );
    }
  }

  const score = Math.round(clamp(factors.reduce((total, factor) => total + factor.contribution, 0)));
  const level: WarningLevel =
    score >= 76 ? 'critical' : score >= 56 ? 'high' : score >= 31 ? 'moderate' : 'low';

  let evidencePoints = 1;
  if (profile.material !== 'unknown') evidencePoints += 1;
  if (profile.pressureStability !== 'unknown') evidencePoints += 1;
  if (profile.previousLeaks > 0) evidencePoints += 1;
  if (profile.nightFlowAnomaly > 0) evidencePoints += 1;
  if (profile.acousticScore !== null) evidencePoints += 1;
  if (snapshot) evidencePoints += 1;
  const confidence = Math.round(clamp(28 + evidencePoints * 9, 0, 91));

  const actions =
    level === 'critical'
      ? [
          'أنشئ أمر فحص ميداني عاجل وحدد القطاع بدقة على الخريطة.',
          'قارن التدفق الليلي والضغط مع القطاع المجاور قبل العزل.',
        ]
      : level === 'high'
        ? [
            'جدول فحص ضغط وصوت ميداني خلال 24 ساعة.',
            'راقب العداد أو التدفق الليلي لرفع دقة القرار.',
          ]
        : level === 'moderate'
          ? [
              'اجمع قراءة ضغط أو تدفق إضافية قبل التصعيد.',
              'أعد التقييم بعد الفحص الصوتي الموضعي.',
            ]
          : ['لا يوجد تصعيد حالي؛ احتفظ بالموقع ضمن المراقبة الدورية.'];

  return {
    score,
    level,
    confidence,
    factors: factors.sort((left, right) => right.contribution - left.contribution),
    actions,
  };
};
