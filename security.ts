export const MAX_JSON_BODY_BYTES = 8 * 1024 * 1024;

export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://*.basemaps.cartocdn.com https://cdnjs.cloudflare.com https://lh3.googleusercontent.com https://www.transparenttextures.com",
  "connect-src 'self' https://air-quality-api.open-meteo.com https://api.open-meteo.com https://*.supabase.co wss://*.supabase.co",
  "media-src 'self' data: blob:",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
].join('; ');

export const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  'Content-Security-Policy': CONTENT_SECURITY_POLICY,
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Permissions-Policy':
    'camera=(), microphone=(self), geolocation=(self), payment=(), usb=(), browsing-topics=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

export interface HeaderWriter {
  setHeader(name: string, value: string): unknown;
}

export const applySecurityHeaders = (response: HeaderWriter) => {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    response.setHeader(name, value);
  }
};

export const isJsonContentType = (value: string | undefined): boolean =>
  typeof value === 'string' &&
  value.split(';', 1)[0].trim().toLowerCase() === 'application/json';

const normalizedOrigin = (value: string): string | null => {
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.origin.toLowerCase();
  } catch {
    return null;
  }
};

export const isAllowedRequestOrigin = ({
  origin,
  host,
  allowedOrigins,
}: {
  origin?: string;
  host?: string;
  allowedOrigins?: string;
}): boolean => {
  // Non-browser clients do not send Origin. Browser cross-site requests do,
  // so this check blocks drive-by use while preserving server-to-server calls.
  if (!origin) return true;
  const candidate = normalizedOrigin(origin);
  if (!candidate) return false;

  try {
    if (host && new URL(candidate).host === host.split(',')[0].trim().toLowerCase()) {
      return true;
    }
  } catch {
    return false;
  }

  return (allowedOrigins ?? '')
    .split(',')
    .map((value) => normalizedOrigin(value.trim()))
    .filter((value): value is string => Boolean(value))
    .includes(candidate);
};

interface RateBucket {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

export const createRateLimiter = (
  limit: number,
  windowMs = 60_000,
  maxBuckets = 10_000,
) => {
  const buckets = new Map<string, RateBucket>();

  return (key: string, now = Date.now()): RateLimitResult => {
    if (limit <= 0) {
      return { allowed: true, limit: 0, remaining: 0, resetAt: now };
    }

    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
    }
    bucket.count += 1;
    buckets.set(key, bucket);

    // Keep long-lived processes bounded even when many spoofed IPs are seen.
    if (buckets.size > maxBuckets) {
      for (const [bucketKey, value] of buckets) {
        if (value.resetAt <= now || buckets.size > maxBuckets) {
          buckets.delete(bucketKey);
        }
      }
    }

    return {
      allowed: bucket.count <= limit,
      limit,
      remaining: Math.max(0, limit - bucket.count),
      resetAt: bucket.resetAt,
    };
  };
};

export const setRateLimitHeaders = (
  response: HeaderWriter,
  result: RateLimitResult,
) => {
  if (result.limit <= 0) return;
  response.setHeader('RateLimit-Limit', String(result.limit));
  response.setHeader('RateLimit-Remaining', String(result.remaining));
  response.setHeader('RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)));
};

export const publicAIError = (error: unknown) => {
  const record = error as { code?: unknown; status?: unknown };
  const code = typeof record?.code === 'string' ? record.code : 'UPSTREAM_ERROR';
  const upstreamStatus = Number(record?.status);
  const status = [422, 429, 503, 504].includes(upstreamStatus)
    ? upstreamStatus
    : 502;

  const messages: Record<string, string> = {
    AI_NOT_CONFIGURED: 'The AI service is not configured.',
    GEMINI_NOT_CONFIGURED: 'The AI service is not configured.',
    TOKENROUTER_NOT_CONFIGURED: 'The AI service is not configured.',
    GEMINI_MODEL_POOL_EMPTY: 'No compatible AI model is available.',
    TOKENROUTER_VISION_NOT_CONFIGURED: 'Image analysis is unavailable.',
    ALL_MODELS_FAILED: 'The AI service is temporarily unavailable.',
    ALL_GEMINI_MODELS_FAILED: 'The AI service is temporarily unavailable.',
  };

  return {
    status,
    body: {
      error: messages[code] ?? 'The AI service is temporarily unavailable.',
      code,
    },
  };
};
