
import React, { useState } from 'react';
import { Download, RefreshCw, Save, Loader2, ArrowLeft, Image as ImageIcon, FileText } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { exportAsPdf, exportAsPng } from '../utils/export';
import { SessionStore } from '../services/SessionStore';
import { Link } from 'react-router-dom';
import SdgBadge from './SdgBadge';

interface ModuleToolbarProps {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    sdgs?: Array<2 | 6 | 7 | 11 | 12 | 13>;
    
    hasReport?: boolean;
    hasData?: boolean; /* Alias for hasReport */
    
    onReset?: () => void;
    
    exportTargetId?: string;
    exportFilename?: string;
    theme?: string;
}

const ModuleToolbar: React.FC<ModuleToolbarProps> = ({ 
    title, description, icon, sdgs, hasReport, hasData, onReset, 
    exportTargetId = 'report-container', exportFilename = 'Report' 
}) => {
    const { t, theme, language } = useApp();
    const isLight = theme === 'light';
    const isAr = language === 'ar';
    
    const [exportingPdf, setExportingPdf] = useState(false);
    const [exportingPng, setExportingPng] = useState(false);
    const [saving, setSaving] = useState(false);

    const isDataReady = hasReport || hasData;

    const handleExportPdf = async () => {
        setExportingPdf(true);
        await exportAsPdf(exportTargetId, exportFilename);
        setExportingPdf(false);
    };

    const handleExportPng = async () => {
        setExportingPng(true);
        await exportAsPng(exportTargetId, exportFilename);
        setExportingPng(false);
    };

    const handleSaveSnapshot = () => {
        setSaving(true);
        setTimeout(() => {
            const name = prompt(t?.common?.alert?.nameSnapshot || 'Snapshot Name:', `Session ${new Date().toLocaleTimeString()}`);
            if (name) {
                SessionStore.saveSession(name);
                alert(t?.common?.alert?.saveSuccess || 'Saved successfully');
            }
            setSaving(false);
        }, 500);
    };

    const handleReset = () => {
        if (window.confirm(t?.common?.alert?.resetConfirm || 'Are you sure you want to reset?')) {
            if (onReset) onReset();
        }
    };

    const btnBase = `flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold transition-all sm:px-4`;
    const btnSecondary = isLight 
        ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50' 
        : 'bg-white/5 border-white/10 text-white hover:bg-white/10';
    const btnAccent = 'bg-blue-500 text-white border-blue-600 hover:bg-blue-600';
    const textMain = isLight ? 'text-gray-900' : 'text-white';
    const textSub = isLight ? 'text-gray-600' : 'text-gray-400';

    return (
        <div className="mb-8 flex w-full min-w-0 flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="flex w-full min-w-0 items-start gap-3 sm:gap-4">
                <Link to="/dashboard" className={`mt-1 p-2 rounded-xl transition-colors ${isLight ? 'bg-white border text-gray-600 hover:bg-gray-50' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 border'}`}>
                    <ArrowLeft className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
                </Link>
                <div className="min-w-0">
                    <h1 className={`mb-2 flex min-w-0 items-center gap-2 break-words text-xl font-black sm:gap-3 sm:text-2xl lg:text-3xl ${textMain}`}>
                        {icon && <span className="p-2 bg-blue-500/10 rounded-xl">{icon}</span>}
                        {title}
                    </h1>
                    {description && <p className={`text-sm max-w-2xl ${textSub}`}>{description}</p>}
                    {sdgs && sdgs.length > 0 && (
                        <div className="mt-3">
                            <SdgBadge sdgs={sdgs} showTitle={false} />
                        </div>
                    )}
                </div>
            </div>

            {isDataReady && (
                <div className="no-export flex w-full flex-wrap items-center gap-2 md:w-auto md:gap-3">
                    <button 
                        onClick={handleSaveSnapshot} 
                        disabled={saving}
                        className={`${btnBase} ${btnSecondary}`}
                        title={isAr ? 'حفظ في لوحة التحكم' : 'Save to dashboard'}
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />}
                        <span className="hidden sm:inline">{isAr ? 'حفظ' : 'Save'}</span>
                    </button>

                    <div className="flex bg-blue-500/10 border border-blue-500/20 rounded-lg overflow-hidden">
                        <button 
                            onClick={handleExportPdf} 
                            disabled={exportingPdf || exportingPng}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all text-blue-600 hover:bg-blue-500 hover:text-white ${isLight ? 'text-blue-700' : 'text-blue-400'}`}
                        >
                            {exportingPdf ? <Loader2 className="w-4 h-4 animate-spin"/> : <FileText className="w-4 h-4" />}
                            PDF
                        </button>
                        <div className="w-[1px] bg-blue-500/20"></div>
                        <button 
                            onClick={handleExportPng} 
                            disabled={exportingPdf || exportingPng}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all text-blue-600 hover:bg-blue-500 hover:text-white ${isLight ? 'text-blue-700' : 'text-blue-400'}`}
                        >
                            {exportingPng ? <Loader2 className="w-4 h-4 animate-spin"/> : <ImageIcon className="w-4 h-4" />}
                            PNG
                        </button>
                    </div>

                    {onReset && (
                        <button 
                            onClick={handleReset} 
                            className={`${btnBase} bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20`}
                            title={isAr ? 'إعادة ضبط التقييم' : 'Reset assessment'}
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span className="hidden sm:inline">{isAr ? 'تحديث' : 'Reset'}</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ModuleToolbar;
