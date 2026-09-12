import React from 'react';
import { Card } from '@heroui/react';
import { Activity, CheckCircle2, Info } from 'lucide-react';
import type { WarningLevel, WaterNetworkProfile } from '../../services/earlyWarningEngine';
import type { DeviceSignalSnapshot } from '../../services/deviceSignals';

export const CAIRO_COORDINATES = {
  latitude: 30.0444,
  longitude: 31.2357,
};

export const DEFAULT_PROFILE: WaterNetworkProfile = {
  pipeAgeYears: 15,
  material: 'unknown',
  pressureStability: 'unknown',
  previousLeaks: 0,
  nightFlowAnomaly: 0,
  acousticScore: null,
};

export const levelColor: Record<WarningLevel, 'success' | 'warning' | 'danger'> = {
  low: 'success',
  moderate: 'warning',
  high: 'danger',
  critical: 'danger',
};

export const levelClass: Record<WarningLevel, string> = {
  low: 'text-emerald-400',
  moderate: 'text-amber-400',
  high: 'text-orange-400',
  critical: 'text-rose-400',
};

export const TrustPill = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-slate-200">
    <span className="[&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:text-emerald-400">{icon}</span>
    {text}
  </span>
);

export const SignalMetric = ({
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

export const ForecastStat = ({
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

export const ActionRow = ({ text }: { text: string }) => (
  <div className="flex items-start gap-3 rounded-xl border border-emerald-400/10 bg-emerald-500/[0.055] p-3 text-sm leading-6">
    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
    <span>{text}</span>
  </div>
);

export const FieldSelect = ({
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

export const RangeField = ({
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

export const DeviceCapability = ({
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

export const MethodNote = ({
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

export const LoadingPanel = ({ text }: { text: string }) => (
  <div className="grid min-h-[360px] place-items-center rounded-2xl border border-dashed border-emerald-400/20">
    <div className="text-center">
      <Activity className="mx-auto h-7 w-7 animate-pulse text-emerald-500" />
      <p className="mt-3 text-sm text-slate-500">{text}</p>
    </div>
  </div>
);

export const EmptyData = ({ title, text }: { title: string; text: string }) => (
  <div className="grid min-h-[360px] place-items-center rounded-2xl border border-dashed border-rose-400/20 p-8 text-center">
    <div>
      <Info className="mx-auto h-7 w-7 text-rose-400" />
      <strong className="mt-3 block">{title}</strong>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{text}</p>
    </div>
  </div>
);

export const levelLabel = (level: WarningLevel, isArabic: boolean) => {
  const labels: Record<WarningLevel, [string, string]> = {
    low: ['منخفض', 'Low'],
    moderate: ['متوسط', 'Moderate'],
    high: ['مرتفع', 'High'],
    critical: ['حرج', 'Critical'],
  };
  return labels[level][isArabic ? 0 : 1];
};

export const permissionText = (
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

export const formatForecastTime = (time: string, isArabic: boolean) => {
  const date = new Date(time);
  if (Number.isNaN(date.getTime())) return time.replace('T', ' ');
  return date.toLocaleString(isArabic ? 'ar-EG' : 'en-GB', {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};
