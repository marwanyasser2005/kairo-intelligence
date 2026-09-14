
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Check, FileText, Loader2, Pencil, RefreshCw, ShieldCheck, Sparkles, UploadCloud, X, Zap } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { analyzeElectricityBill, analyzeWaterBillOCR, analyzeFoodReceiptOCR } from '../services/tokenRouterService';
import { MAX_UPLOAD_BYTES, validateImageFile } from '../utils/fileSecurity';
import {
  applyExtractionEdits,
  describeExtractionFields,
  extractionQuality,
  normalizeDigits,
  reviewBillExtraction,
  type BillType,
} from '../services/billExtraction';
import { prepareBillImage, type PreparedBillImage } from '../utils/billImage';
import { usePersistentState } from '../utils/storage';

const MotionDiv = motion.div as any;

export type BillExtractionResult = Record<string, any>;

interface BillUploaderProps {
  forceType?: BillType;
  onDataExtracted?: (type: BillType, data: BillExtractionResult) => void;
  /** Runs the module analysis immediately with the extracted (optionally corrected) values. */
  onAnalyze?: (data: BillExtractionResult) => void | Promise<void>;
  onUpload?: (base64: string, mimeType?: string) => Promise<void>;
}

const BillUploader: React.FC<BillUploaderProps> = ({ forceType, onDataExtracted, onAnalyze, onUpload }) => {
  const { t, theme, language } = useApp();
  const isLight = theme === 'light';
  const isAr = language === 'ar';

  const [billType, setBillType] = useState<BillType>(forceType || 'electricity');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prepared, setPrepared] = useState<PreparedBillImage | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzingReport, setAnalyzingReport] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BillExtractionResult | null>(null);
  const [edits, setEdits] = useState<Record<string, number>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [autoAnalyze, setAutoAnalyze] = usePersistentState<boolean>('kairo_bill_auto_analyze', true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoTriggeredRef = useRef(false);

  useEffect(() => {
    if (forceType && forceType !== billType) {
      setBillType(forceType);
    }
  }, [forceType, billType]);

  const activeResult = useMemo(
    () => (result ? applyExtractionEdits(result, edits) : null),
    [result, edits],
  );

  const fields = useMemo(
    () => (activeResult ? describeExtractionFields(billType, activeResult as any) : []),
    [activeResult, billType],
  );

  const review = useMemo(
    () => (activeResult ? reviewBillExtraction(billType, activeResult as any) : { needsReview: false, warnings: [] }),
    [activeResult, billType],
  );

  const quality = activeResult ? extractionQuality(Number(activeResult.confidence) || 0) : 'low';
  const qualityClass =
    quality === 'high'
      ? 'border-green-500 text-green-500'
      : quality === 'medium'
        ? 'border-amber-500 text-amber-500'
        : 'border-rose-500 text-rose-500';

  const runExtraction = useCallback(async (target: File) => {
    setAnalyzing(true);
    setError(null);
    try {
      const image = await prepareBillImage(target);
      setPrepared(image);

      const base64 = image.base64;
      const mime = image.mimeType;
      const data =
        billType === 'electricity'
          ? await analyzeElectricityBill(base64, language, mime)
          : billType === 'water'
            ? await analyzeWaterBillOCR(base64, language, mime)
            : await analyzeFoodReceiptOCR(base64, language, mime);

      setResult(data);
      setEdits({});
      setPreview(image.base64 ? `data:${mime};base64,${image.base64}` : null);
      onDataExtracted?.(billType, data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error);
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, [billType, language, onDataExtracted, t.common.error]);

  const processFile = async (selected: File) => {
    setError(null);
    setResult(null);
    setEdits({});
    setPrepared(null);
    autoTriggeredRef.current = false;

    if (selected.size <= 0 || selected.size > MAX_UPLOAD_BYTES) {
      setError(t.bill.errorSize);
      return;
    }
    if (!(await validateImageFile(selected))) {
      setError(t.bill.errorType);
      return;
    }

    setFile(selected);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(String(reader.result ?? ''));
    reader.readAsDataURL(selected);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (selected) void processFile(selected);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    if (onUpload && prepared) {
      await onUpload(prepared.base64, prepared.mimeType);
      return;
    }
    if (onUpload && !prepared) {
      const image = await prepareBillImage(file);
      setPrepared(image);
      await onUpload(image.base64, image.mimeType);
      return;
    }
    await runExtraction(file);
  };

  const handleRunAnalysis = async () => {
    if (!activeResult || !onAnalyze) return;
    setAnalyzingReport(true);
    try {
      await onAnalyze(activeResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setAnalyzingReport(false);
    }
  };

  // Auto-analysis turns the bill upload into a one-step flow: upload, read, analyze.
  useEffect(() => {
    if (!autoAnalyze || !result || !onAnalyze || autoTriggeredRef.current) return;
    const extracted = activeResult;
    if (!extracted) return;
    // Never auto-analyze a reading that failed the plausibility check; the user
    // must confirm or correct it first.
    if (review.needsReview) return;
    autoTriggeredRef.current = true;
    void handleRunAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoAnalyze, result, review.needsReview]);

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setPrepared(null);
    setResult(null);
    setEdits({});
    setIsEditing(false);
    setError(null);
    autoTriggeredRef.current = false;
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const bgCard = isLight ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10';
  const textMain = isLight ? 'text-gray-900' : 'text-white';
  const textSub = isLight ? 'text-gray-500' : 'text-gray-400';
  const inputStyle = `w-full rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${isLight ? 'bg-slate-50 border border-slate-200 text-slate-900' : 'bg-black/25 border border-white/10 text-white'}`;

  return (
    <div className={`rounded-3xl border p-5 sm:p-6 mb-8 transition-all ${bgCard}`}>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`font-bold ${textMain}`}>{t.bill.title}</h3>
            <p className={`text-xs ${textSub}`}>{t.bill.subtitle}</p>
          </div>
        </div>
        {!forceType && (
          <div className="flex gap-2">
            {(['electricity', 'water'] as const).map((candidate) => (
              <button
                key={candidate}
                type="button"
                onClick={() => { setBillType(candidate); handleReset(); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  billType === candidate
                    ? candidate === 'electricity'
                      ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/40'
                      : 'bg-blue-500/10 text-blue-500 border-blue-500/40'
                    : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5 text-gray-500'
                }`}
              >
                {candidate === 'electricity' ? <Zap className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                {candidate === 'electricity' ? t.bill.types.elec : t.bill.types.water}
              </button>
            ))}
          </div>
        )}
      </div>

      {!preview ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors group ${
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
          <p className={`mt-2 text-[11px] ${textSub}`}>
            {isAr ? 'ارفع الصورة فقط — والباقي علينا.' : 'Just upload the image — the rest is handled for you.'}
          </p>
          {error && (
            <div className="mt-3 text-xs text-red-500 flex items-center justify-center gap-1">
              <AlertCircle className="w-3 h-3" /> {error}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className={`relative rounded-2xl overflow-hidden border ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
            <img src={preview} alt={isAr ? 'معاينة الفاتورة' : 'Bill preview'} className="w-full h-44 object-contain bg-black/20" />
            <button
              type="button"
              onClick={handleReset}
              aria-label={isAr ? 'إزالة الصورة' : 'Remove image'}
              className="absolute top-2 end-2 p-1 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {!result && !analyzing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> {isAr ? 'استخرج البيانات' : 'Extract data'}
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

          {prepared?.resized && (
            <p className={`text-[11px] flex items-center gap-1.5 ${textSub}`}>
              <Check className="w-3 h-3 text-emerald-500" />
              {t.bill.imageOptimized}
              {' '}
              <span dir="ltr">({prepared.originalWidth}×{prepared.originalHeight} → {prepared.width}×{prepared.height})</span>
            </p>
          )}

          <AnimatePresence>
            {activeResult && (
              <MotionDiv
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`p-4 rounded-2xl border ${activeResult.isStub ? 'border-orange-500/25 bg-orange-500/5' : 'border-green-500/20 bg-green-500/5'}`}
              >
                {activeResult.isStub ? (
                  <div className="flex gap-3 text-orange-500">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <div className="space-y-2">
                      <p className="text-xs leading-relaxed">{activeResult.message || t.bill.waterStub}</p>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="text-[11px] font-bold underline underline-offset-2"
                      >
                        {t.bill.rescan}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">{t.bill.details}</div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${qualityClass}`}>
                          {t.bill.quality[quality]} · {Math.round((Number(activeResult.confidence) || 0) * 100)}%
                        </span>
                      </div>
                    </div>

                    {review.needsReview && (
                      <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3">
                        <div className="flex items-start gap-2 text-rose-500">
                          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                          <div className="space-y-1">
                            <p className="text-xs font-black">
                              {isAr ? 'القيم المستخرجة غير متسقة — راجعها قبل التحليل' : 'Extracted values are inconsistent — review before analyzing'}
                            </p>
                            {review.warnings.map((warning, index) => (
                              <p key={index} className="text-[11px] leading-5 opacity-90">
                                {warning[isAr ? 'ar' : 'en']}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                      {fields.map((field) => (
                        <div
                          key={field.key}
                          className={`rounded-xl px-3 py-2 border ${
                            field.emphasis
                              ? isLight ? 'border-indigo-200 bg-indigo-50/60' : 'border-indigo-400/20 bg-indigo-500/10'
                              : isLight ? 'border-slate-200 bg-white/60' : 'border-white/5 bg-white/[0.03]'
                          }`}
                        >
                          <div className={`text-[10px] font-bold ${textSub}`}>{field.label[isAr ? 'ar' : 'en']}</div>
                          {isEditing && field.editable ? (
                            <input
                              type="number"
                              value={edits[field.key] ?? field.raw}
                              onChange={(event) =>
                                setEdits((previous) => ({
                                  ...previous,
                                  [field.key]: Number(normalizeDigits(event.target.value)),
                                }))
                              }
                              className={`mt-1 ${inputStyle}`}
                            />
                          ) : (
                            <div className={`mt-0.5 text-sm font-black ${textMain}`} dir="ltr">
                              {field.value}
                              {field.suffix ? <span className={`ms-1 text-[10px] font-bold ${textSub}`}>{field.suffix}</span> : null}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {activeResult.evidence_note && (
                      <div className={`mb-4 rounded-xl px-3 py-2 text-[11px] leading-5 ${isLight ? 'bg-slate-50 text-slate-600' : 'bg-white/[0.04] text-slate-300'}`}>
                        <span className="font-black">{t.bill.evidence}: </span>
                        {activeResult.evidence_note}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {onAnalyze && (
                        <button
                          type="button"
                          onClick={handleRunAnalysis}
                          disabled={analyzingReport || (review.needsReview && !isEditing)}
                          className={`flex-1 min-w-[160px] py-2.5 disabled:opacity-60 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 ${
                            review.needsReview ? 'bg-rose-600 hover:bg-rose-700' : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {analyzingReport ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                          {review.needsReview
                            ? (isAr ? 'صحّح القيم أولًا لتفعيل التحليل' : 'Correct the values to enable analysis')
                            : t.bill.analyzeNow}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => (isEditing ? setEdits({}) : setIsEditing(true))}
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                          isLight ? 'border-slate-200 text-slate-600 hover:bg-slate-50' : 'border-white/10 text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        {isEditing ? t.bill.cancelEdit : t.bill.editValues}
                      </button>
                      <button
                        type="button"
                        onClick={handleReset}
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                          isLight ? 'border-slate-200 text-slate-600 hover:bg-slate-50' : 'border-white/10 text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        {t.bill.rescan}
                      </button>
                    </div>

                    <label className="mt-3 flex items-center gap-2 text-[11px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoAnalyze}
                        onChange={(event) => setAutoAnalyze(event.target.checked)}
                        className="w-3.5 h-3.5 accent-green-600"
                      />
                      <span className={textSub}>{t.bill.autoAnalyze}</span>
                    </label>
                  </>
                )}
              </MotionDiv>
            )}
          </AnimatePresence>

          {error && !analyzing && (
            <div className="text-xs text-red-500 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BillUploader;
