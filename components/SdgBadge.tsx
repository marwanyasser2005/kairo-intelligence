import React from 'react';
import { useApp } from '../contexts/AppContext';

export type SdgNumber = 2 | 3 | 6 | 7 | 11 | 12 | 13;

interface SdgBadgeProps {
  sdgs: SdgNumber[];
  compact?: boolean;
  showTitle?: boolean;
}

const SDG_COLORS: Record<number, { bg: string; border: string; text: string }> = {
  2:  { bg: 'bg-amber-500/10',  border: 'border-amber-500/30',  text: 'text-amber-400' },
  3:  { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  6:  { bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   text: 'text-blue-400' },
  7:  { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  11: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
  12: { bg: 'bg-amber-600/10',  border: 'border-amber-600/30',  text: 'text-amber-500' },
  13: { bg: 'bg-green-500/10',  border: 'border-green-500/30',  text: 'text-green-400' },
};

const SdgBadge: React.FC<SdgBadgeProps> = ({ sdgs, compact = false, showTitle = true }) => {
  const { t, language } = useApp();
  const isRtl = language === 'ar';
  
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {!compact && (
        <span className="text-xs text-slate-500 self-center me-1">
          {t.sdg.serves}:
        </span>
      )}
      {sdgs.map((num) => {
        const colors = SDG_COLORS[num] || SDG_COLORS[6];
        const sdgKey = `sdg${num}` as keyof typeof t.sdg;
        const sdgData = t.sdg[sdgKey] as { num: string; title: string; short: string };
        return (
          <div
            key={num}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${colors.bg} ${colors.border} ${colors.text}`}
            title={sdgData.title}
          >
            <span className="font-black">{t.sdg.badge} {sdgData.num}</span>
            {showTitle && <span className="opacity-85">· {sdgData.short}</span>}
          </div>
        );
      })}
    </div>
  );
};

export default SdgBadge;
