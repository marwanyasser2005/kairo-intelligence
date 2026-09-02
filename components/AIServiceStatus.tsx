import React from 'react';
import { CircleAlert, Loader2, ShieldCheck } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import type { KairoAIRequestStatus } from '../services/aiClient';

interface HealthResponse {
  ok?: boolean;
  configured?: boolean;
  redundancy?: boolean;
  capabilities?: {
    text?: boolean;
    structured?: boolean;
    vision?: boolean;
  };
}

const AIServiceStatus: React.FC = () => {
  const { language } = useApp();
  const isAr = language === 'ar';
  const [status, setStatus] = React.useState<KairoAIRequestStatus>('busy');
  const [redundant, setRedundant] = React.useState(false);

  const verifyGateway = React.useCallback(async () => {
    try {
      const response = await fetch('/api/ai/health', {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      const health = (await response.json()) as HealthResponse;
      const ready = Boolean(
        response.ok &&
          health.ok &&
          health.configured &&
          health.capabilities?.text &&
          health.capabilities?.structured,
      );
      setRedundant(Boolean(health.redundancy));
      setStatus(ready ? 'ready' : 'error');
    } catch {
      setStatus('error');
      setRedundant(false);
    }
  }, []);

  React.useEffect(() => {
    void verifyGateway();
    const interval = window.setInterval(() => void verifyGateway(), 90_000);
    const onStatus = (event: Event) => {
      const detail = (event as CustomEvent<{ status?: KairoAIRequestStatus }>).detail;
      if (detail?.status) setStatus(detail.status);
    };
    window.addEventListener('kairo:ai-status', onStatus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('kairo:ai-status', onStatus);
    };
  }, [verifyGateway]);

  const copy = {
    busy: isAr ? 'يجري اتصال KAIRO AI' : 'KAIRO AI is connecting',
    ready: redundant
      ? isAr
        ? 'KAIRO AI متصل · مسارات احتياطية فعّالة'
        : 'KAIRO AI online · resilient routing'
      : isAr
        ? 'KAIRO AI متصل'
        : 'KAIRO AI online',
    error: isAr ? 'تعذر اتصال KAIRO AI · أعد المحاولة' : 'KAIRO AI unavailable · retry',
  }[status];

  const Icon = status === 'busy' ? Loader2 : status === 'ready' ? ShieldCheck : CircleAlert;

  return (
    <button
      type="button"
      onClick={() => void verifyGateway()}
      className={`kairo-ai-status fixed bottom-4 left-4 z-40 inline-flex min-h-11 max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full border px-3.5 py-2 text-[11px] font-bold shadow-2xl backdrop-blur-2xl transition-colors sm:bottom-5 sm:left-5 ${
        status === 'error'
          ? 'border-rose-500/30 bg-rose-950/75 text-rose-200'
          : 'border-emerald-400/20 bg-[#071511]/80 text-slate-200'
      }`}
      aria-live="polite"
      aria-label={`${copy}. ${isAr ? 'اضغط لإعادة الفحص' : 'Press to recheck'}`}
      title={isAr ? 'حالة بوابة الذكاء الاصطناعي الخادمية' : 'Server AI gateway status'}
    >
      <Icon className={`h-3.5 w-3.5 ${status === 'busy' ? 'animate-spin text-emerald-300' : status === 'ready' ? 'text-emerald-300' : 'text-rose-300'}`} />
      <span className="truncate">{copy}</span>
    </button>
  );
};

export default AIServiceStatus;
