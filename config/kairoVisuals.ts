import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  Building2,
  Droplets,
  FlaskConical,
  GraduationCap,
  HeartHandshake,
  MapPinned,
  Recycle,
  Truck,
  Users,
  Utensils,
  Wind,
  Zap,
} from 'lucide-react';
import type { AudienceId, CapabilityId, CapabilityTier, LocalizedText } from './kairoCapabilities';
import { TIER_LABELS } from './kairoCapabilities';

/**
 * Single source of truth for capability and audience iconography. Every page
 * (home, dashboard, module toolbars) renders from here so a capability always
 * looks like itself, everywhere.
 */
export const kairoCapabilityIcons: Record<CapabilityId, LucideIcon> = {
  foresight: Activity,
  water: Droplets,
  food: Utensils,
  energy: Zap,
  mobility: Truck,
  exposure: Wind,
  ewaste: Recycle,
  scenarios: FlaskConical,
};

export const kairoAudienceIcons: Record<AudienceId, LucideIcon> = {
  individual: Users,
  community: HeartHandshake,
  education: GraduationCap,
  business: Building2,
  government: MapPinned,
};

export type KairoAccent = 'emerald' | 'blue' | 'amber' | 'violet' | 'cyan';

export interface KairoAccentTokens {
  /** Icon tile background + icon color, e.g. for a 12x12 rounded tile. */
  tile: string;
  /** Softer tile used inside dense lists. */
  soft: string;
  /** Text-only accent color. */
  text: string;
  /** Chip / badge combination (border + background + text). */
  chip: string;
  /** Top gradient accent bar for feature cards. */
  accentBar: string;
  /** Hover border tint for cards. */
  hoverBorder: string;
}

export const kairoAccents: Record<KairoAccent, KairoAccentTokens> = {
  emerald: {
    tile: 'bg-emerald-500/10 text-emerald-500',
    soft: 'bg-emerald-500/10',
    text: 'text-emerald-500',
    chip: 'border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-500',
    accentBar: 'from-emerald-400/70 via-emerald-300/35',
    hoverBorder: 'group-hover:border-emerald-500/30',
  },
  blue: {
    tile: 'bg-sky-500/10 text-sky-500',
    soft: 'bg-sky-500/10',
    text: 'text-sky-500',
    chip: 'border-sky-500/20 bg-sky-500/[0.07] text-sky-500',
    accentBar: 'from-sky-400/70 via-sky-300/35',
    hoverBorder: 'group-hover:border-sky-500/30',
  },
  amber: {
    tile: 'bg-amber-500/10 text-amber-500',
    soft: 'bg-amber-500/10',
    text: 'text-amber-500',
    chip: 'border-amber-500/20 bg-amber-500/[0.07] text-amber-500',
    accentBar: 'from-amber-400/70 via-amber-300/35',
    hoverBorder: 'group-hover:border-amber-500/30',
  },
  violet: {
    tile: 'bg-violet-500/10 text-violet-500',
    soft: 'bg-violet-500/10',
    text: 'text-violet-500',
    chip: 'border-violet-500/20 bg-violet-500/[0.07] text-violet-500',
    accentBar: 'from-violet-400/70 via-violet-300/35',
    hoverBorder: 'group-hover:border-violet-500/30',
  },
  cyan: {
    tile: 'bg-cyan-500/10 text-cyan-500',
    soft: 'bg-cyan-500/10',
    text: 'text-cyan-500',
    chip: 'border-cyan-500/20 bg-cyan-500/[0.07] text-cyan-500',
    accentBar: 'from-cyan-400/70 via-cyan-300/35',
    hoverBorder: 'group-hover:border-cyan-500/30',
  },
};

/** Canonical chart palette — matches the accent system above. */
export const KAIRO_CHART_COLORS = {
  primary: '#2bd4a7',
  blue: '#38bdf8',
  amber: '#f5b942',
  violet: '#8b5cf6',
  cyan: '#22d3ee',
  slate: '#94a3b8',
  danger: '#ef4444',
} as const;

export const kairoTierBadgeClasses: Record<CapabilityTier, string> = {
  core: 'border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-600 dark:text-emerald-400',
  support: 'border-sky-500/25 bg-sky-500/[0.08] text-sky-600 dark:text-sky-400',
  tool: 'border-violet-500/25 bg-violet-500/[0.08] text-violet-600 dark:text-violet-400',
};

export const tierBadgeLabel = (tier: CapabilityTier, language: 'ar' | 'en'): string =>
  TIER_LABELS[tier][language];

export type { AudienceId, CapabilityId, CapabilityTier, LocalizedText };
