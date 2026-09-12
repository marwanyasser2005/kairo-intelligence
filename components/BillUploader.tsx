
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Zap, Droplet, Check, AlertCircle, X, Loader2, FileText } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { analyzeElectricityBill, analyzeWaterBillOCR, analyzeFoodReceiptOCR } from '../services/tokenRouterService';
import { MAX_UPLOAD_BYTES, validateImageFile } from '../utils/fileSecurity';

// Type casting to bypass strict environment checks
const MotionDiv = motion.div as any;

interface BillUploaderProps {
    onDataExtracted?: (type: 'electricity' | 'water' | 'food', data: any) => void;
    onUpload?: (base64: string, mimeType?: string) => Promise<void>;
    forceType?: 'electricity' | 'water' | 'food';
}

const BillUploader: React.FC<BillUploaderProps> = ({ onDataExtracted, onUpload, forceType }) => {
    const { t, theme, language } = useApp();
    const isLight = theme === 'light';
    
    const [billType, setBillType] = useState<'electricity' | 'water' | 'food'>(forceType || 'electricity');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<any | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = async (file: File) => {
        setError(null);
        setResult(null);
        
        // Validation
        if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
            setError(t.bill.errorSize);
            return;
        }
        if (!(await validateImageFile(file))) {
            setError(t.bill.errorType);
            return;
        }

        setFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleAnalyze = async () => {
        if (!preview) return;
        setAnalyzing(true);
        
        try {
            const base64Data = preview.split(',')[1];
            if (onUpload) {
                await onUpload(base64Data, file?.type);
                return;
            }
            if (billType === 'electricity') {
                const data = await analyzeElectricityBill(base64Data, language, file?.type);
                setResult(data);
            } else if (billType === 'water') {
                const data = await analyzeWaterBillOCR(base64Data, language, file?.type);
                setResult(data);
            } else if (billType === 'food') {
                const data = await analyzeFoodReceiptOCR(base64Data, language, file?.type);
                setResult(data);
            }
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : t.common.error);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleApply = () => {
        if (result && !result.isStub && onDataExtracted) {
            onDataExtracted(billType, result);
            setFile(null);
            setPreview(null);
            setResult(null);
        }
    };

    const handleRemove = () => {
        setFile(null);
        setPreview(null);
        setResult(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const bgCard = isLight ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10';
    const textMain = isLight ? 'text-gray-900' : 'text-white';

    return (
        <div className={`rounded-3xl border p-6 mb-8 transition-all ${bgCard}`}>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                    <FileText className="w-5 h-5" />
                </div>
                <div>
                    <h3 className={`font-bold ${textMain}`}>{t.bill.title}</h3>
                    <p className="text-xs text-gray-500">{t.bill.subtitle}</p>
                </div>
            </div>

            {/* Type Selector */}
            {!forceType && (
                <div className="flex gap-2 mb-6">
                    <button 
                        onClick={() => { setBillType('electricity'); setResult(null); }}
                        className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                            billType === 'electricity' 
                            ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/50' 
                            : 'border-transparent hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500'
                        }`}
                    >
                        <Zap className="w-4 h-4" /> {t.bill.types.elec}
                    </button>
                    <button 
                        onClick={() => { setBillType('water'); setResult(null); }}
                        className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                            billType === 'water' 
                            ? 'bg-blue-500/10 text-blue-500 border-blue-500/50' 
                            : 'border-transparent hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500'
                        }`}
                    >
                        <Droplet className="w-4 h-4" /> {t.bill.types.water}
                    </button>
                </div>
            )}

            {/* Drop Zone */}
            {!preview ? (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors group ${
                        isLight ? 'border-gray-300 hover:border-indigo-500 hover:bg-indigo-50' : 'border-white/10 hover:border-indigo-500 hover:bg-indigo-500/5'
                    }`}
                >
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        className="hidden" 
                        accept="image/png, image/jpeg, image/jpg"
                    />
                    <UploadCloud className="w-8 h-8 mx-auto mb-3 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                    <p className="text-sm text-gray-500 font-medium group-hover:text-indigo-500 transition-colors">
                        {t.bill.dropzone}
                    </p>
                    {error && (
                        <div className="mt-3 text-xs text-red-500 flex items-center justify-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {error}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Preview Card */}
                    <div className={`relative rounded-xl overflow-hidden border ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
                        <img src={preview} alt="Bill Preview" className="w-full h-48 object-cover opacity-80" />
                        <button 
                            onClick={handleRemove}
                            className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        
                        {!result && !analyzing && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <button 
                                    onClick={handleAnalyze}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                                >
                                    <Zap className="w-4 h-4" /> Analyze
                                </button>
                            </div>
                        )}

                        {analyzing && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm text-white flex-col gap-2">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                                <span className="text-xs font-bold uppercase tracking-wider">{t.bill.analyzing}</span>
                            </div>
                        )}
                    </div>

                    {/* Result Card */}
                    <AnimatePresence>
                        {result && (
                            <MotionDiv 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-4 rounded-xl border ${result.isStub ? 'border-orange-500/20 bg-orange-500/5' : 'border-green-500/20 bg-green-500/5'}`}
                            >
                                {result.isStub ? (
                                    <div className="flex gap-3 text-orange-500">
                                        <AlertCircle className="w-5 h-5 shrink-0" />
                                        <p className="text-xs leading-relaxed">{result.message}</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t.bill.detected}</div>
                                            <div className={`text-[10px] px-2 py-0.5 rounded border ${
                                                result.confidence > 0.8 ? 'border-green-500 text-green-500' : 'border-yellow-500 text-yellow-500'
                                            }`}>
                                                {t.bill.confidence}: {Math.round(result.confidence * 100)}%
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <div className="text-[10px] text-gray-400 mb-1">{t.bill.consumption}</div>
                                                <div className={`text-xl font-bold ${textMain}`}>{billType === 'water' ? result.total_consumption_m3 : result.kwh} <span className="text-xs text-gray-500">{billType === 'water' ? (language === 'ar' ? 'متر مكعب' : 'm³') : 'kWh'}</span></div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-gray-400 mb-1">{t.bill.cost}</div>
                                                <div className={`text-xl font-bold ${textMain}`}>{billType === 'water' ? result.total_amount : result.totalAmount} <span className="text-xs text-gray-500">{result.currency}</span></div>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={handleApply}
                                            className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                                        >
                                            <Check className="w-3 h-3" /> {t.bill.useThis}
                                        </button>
                                    </>
                                )}
                            </MotionDiv>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default BillUploader;
