import React, { useState } from 'react';
import {
  Check,
  FileText,
  Image as ImageIcon,
  Loader2,
  Save,
  TriangleAlert,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { SessionStore } from '../services/SessionStore';
import {
  exportAsPdf,
  exportAsPng,
  type KairoExportOptions,
} from '../utils/export';
import type { SdgNumber } from './SdgBadge';

interface ReportActionsProps {
  targetId: string;
  filename: string;
  title: string;
  subtitle?: string;
  sdgs?: SdgNumber[];
  disabled?: boolean;
  className?: string;
  onSave?: () => void | Promise<void>;
}

type ActionState = 'idle' | 'saving' | 'saved' | 'pdf' | 'png' | 'error';

const ReportActions: React.FC<ReportActionsProps> = ({
  targetId,
  filename,
  title,
  subtitle,
  sdgs = [],
  disabled = false,
  className = '',
  onSave,
}) => {
  const { language, theme } = useApp();
  const isAr = language === 'ar';
  const isLight = theme === 'light';
  const [state, setState] = useState<ActionState>('idle');

  const exportOptions: KairoExportOptions = {
    title,
    subtitle,
    sdgs,
    language,
  };

  const finishState = (nextState: ActionState) => {
    setState(nextState);
    window.setTimeout(() => setState('idle'), nextState === 'error' ? 3200 : 1800);
  };

  const handleSave = async () => {
    setState('saving');
    try {
      if (onSave) {
        await onSave();
      } else {
        const stamp = new Intl.DateTimeFormat(isAr ? 'ar-EG' : 'en-GB', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(new Date());
        const snapshot = SessionStore.saveSession(`${title} · ${stamp}`);
        window.dispatchEvent(
          new CustomEvent('kairo-report-saved', {
            detail: { snapshotId: snapshot.id, title },
          }),
        );
      }
      finishState('saved');
    } catch (error) {
      console.error('Kairo report save failed:', error);
      finishState('error');
    }
  };

  const handlePdf = async () => {
    setState('pdf');
    const succeeded = await exportAsPdf(targetId, filename, exportOptions);
    finishState(succeeded ? 'idle' : 'error');
  };

  const handlePng = async () => {
    setState('png');
    const succeeded = await exportAsPng(targetId, filename, exportOptions);
    finishState(succeeded ? 'idle' : 'error');
  };

  const isBusy = ['saving', 'pdf', 'png'].includes(state);
  const buttonBase =
    'inline-flex min-h-10 items-center justify-center gap-2 px-3.5 py-2 text-xs font-black transition-colors disabled:cursor-not-allowed disabled:opacity-50';
  const surface = isLight
    ? 'border-slate-200 bg-white text-slate-700 shadow-sm'
    : 'border-white/10 bg-white/[0.055] text-slate-200';

  return (
    <div
      className={`no-export flex flex-wrap items-center gap-2 ${className}`}
      aria-label={isAr ? 'إجراءات التقرير' : 'Report actions'}
      aria-live="polite"
    >
      <div className={`flex overflow-hidden rounded-xl border ${surface}`}>
        <button
          type="button"
          onClick={handleSave}
          disabled={disabled || isBusy}
          className={`${buttonBase} border-e ${isLight ? 'border-slate-200 hover:bg-emerald-50 hover:text-emerald-700' : 'border-white/10 hover:bg-emerald-400/10 hover:text-emerald-300'}`}
          title={isAr ? 'حفظ نسخة في لوحة المتابعة' : 'Save a copy to the dashboard'}
        >
          {state === 'saving' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : state === 'saved' ? (
            <Check className="h-4 w-4 text-emerald-500" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {state === 'saved' ? (isAr ? 'تم الحفظ' : 'Saved') : isAr ? 'حفظ' : 'Save'}
        </button>
        <button
          type="button"
          onClick={handlePdf}
          disabled={disabled || isBusy}
          className={`${buttonBase} border-e ${isLight ? 'border-slate-200 hover:bg-blue-50 hover:text-blue-700' : 'border-white/10 hover:bg-blue-400/10 hover:text-blue-300'}`}
          title={isAr ? 'تحميل تقرير PDF احترافي' : 'Download a professional PDF report'}
        >
          {state === 'pdf' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          PDF
        </button>
        <button
          type="button"
          onClick={handlePng}
          disabled={disabled || isBusy}
          className={`${buttonBase} ${isLight ? 'hover:bg-violet-50 hover:text-violet-700' : 'hover:bg-violet-400/10 hover:text-violet-300'}`}
          title={isAr ? 'تحميل لقطة PNG عالية الدقة' : 'Download a high-resolution PNG snapshot'}
        >
          {state === 'png' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImageIcon className="h-4 w-4" />
          )}
          PNG
        </button>
      </div>

      {state === 'error' && (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/10 px-2.5 py-2 text-[10px] font-bold text-rose-500">
          <TriangleAlert className="h-3.5 w-3.5" />
          {isAr
            ? 'تعذّر تجهيز الملف. جرّب مرة تانية بعد اكتمال تحميل الصفحة.'
            : 'The file could not be prepared. Retry after the page finishes loading.'}
        </span>
      )}
    </div>
  );
};

export default ReportActions;
