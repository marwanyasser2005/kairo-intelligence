
import React from 'react';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Link } from 'react-router-dom';
import SdgBadge, { type SdgNumber } from './SdgBadge';
import ReportActions from './ReportActions';

interface ModuleToolbarProps {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    sdgs?: SdgNumber[];
    
    hasReport?: boolean;
    hasData?: boolean; /* Alias for hasReport */
    
    onReset?: () => void;
    
    exportTargetId?: string;
    exportFilename?: string;
    reportTitle?: string;
    reportSubtitle?: string;
    theme?: string;
}

const ModuleToolbar: React.FC<ModuleToolbarProps> = ({ 
    title, description, icon, sdgs, hasReport, hasData, onReset, 
    exportTargetId = 'report-container', exportFilename = 'Report',
    reportTitle, reportSubtitle,
}) => {
    const { t, theme, language } = useApp();
    const isLight = theme === 'light';
    const isAr = language === 'ar';
    
    const isDataReady = hasReport || hasData;

    const handleReset = () => {
        if (window.confirm(t?.common?.alert?.resetConfirm || 'Are you sure you want to reset?')) {
            if (onReset) onReset();
        }
    };

    const btnBase = `flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition-all sm:px-4`;
    const textMain = isLight ? 'text-slate-950' : 'text-white';
    const textSub = isLight ? 'text-slate-600' : 'text-slate-400';
    const border = isLight ? 'border-slate-900/[0.09]' : 'border-white/[0.09]';

    return (
        <div className="mb-8 flex w-full min-w-0 flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="flex w-full min-w-0 items-start gap-3 sm:gap-4">
                <Link
                    to="/dashboard"
                    aria-label={isAr ? 'العودة إلى لوحة المتابعة' : 'Back to the dashboard'}
                    className={`mt-1 rounded-xl border p-2 transition-colors ${border} ${
                        isLight
                            ? 'bg-white text-slate-600 hover:bg-slate-50'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                >
                    <ArrowLeft className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
                </Link>
                <div className="min-w-0">
                    <h1 className={`mb-2 flex min-w-0 items-center gap-2 break-words text-xl font-black sm:gap-3 sm:text-2xl lg:text-3xl ${textMain}`}>
                        {icon && <span className="rounded-xl bg-kairo-green/10 p-2">{icon}</span>}
                        {title}
                    </h1>
                    {description && <p className={`text-sm max-w-2xl ${textSub}`}>{description}</p>}
                    {sdgs && sdgs.length > 0 && (
                        <div className="mt-3">
                            <SdgBadge sdgs={sdgs} showTitle />
                        </div>
                    )}
                </div>
            </div>

            {isDataReady && (
                <div className="no-export flex w-full flex-wrap items-center gap-2 md:w-auto md:gap-3">
                    <ReportActions
                        targetId={exportTargetId}
                        filename={exportFilename}
                        title={reportTitle || title || exportFilename.replace(/[_-]+/g, ' ')}
                        subtitle={reportSubtitle || description}
                        sdgs={sdgs}
                    />

                    {onReset && (
                        <button
                            onClick={handleReset}
                            className={`${btnBase} border-rose-500/25 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20`}
                            title={isAr ? 'إعادة ضبط التقييم' : 'Reset assessment'}
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span className="hidden sm:inline">{isAr ? 'إعادة الضبط' : 'Reset'}</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ModuleToolbar;
