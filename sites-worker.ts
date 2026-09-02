import {
  getAIGatewayHealth,
  requestAI,
  toPublicAIResult,
  validateGenerateRequest,
  type AIGatewayConfig,
  type GenerateRequest,
} from './aiGateway';
import {
  MAX_JSON_BODY_BYTES,
  SECURITY_HEADERS,
  createRateLimiter,
  isAllowedRequestOrigin,
  isJsonContentType,
  publicAIError,
} from './security';

interface SitesEnvironment {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
  GEMINI_API_KEY?: string;
  GEMINI_BASE_URL?: string;
  GEMINI_TEXT_MODELS?: string;
  GEMINI_JSON_MODELS?: string;
  GEMINI_VISION_MODELS?: string;
  GEMINI_TIMEOUT_MS?: string;
  GEMINI_TOTAL_TIMEOUT_MS?: string;
  GEMINI_MAX_OUTPUT_TOKENS?: string;
  GEMINI_THINKING_BUDGET?: string;
  AGENTROUTER_API_KEY?: string;
  AGENTROUTER_BASE_URL?: string;
  AGENTROUTER_MODELS?: string;
  AGENTROUTER_MODEL?: string;
  AGENTROUTER_VISION_MODELS?: string;
  AGENTROUTER_TIMEOUT_MS?: string;
  TABIAI_API_KEY?: string;
  TABIAI_BASE_URL?: string;
  TABIAI_MODELS?: string;
  TABIAI_MODEL?: string;
  TABIAI_VISION_MODELS?: string;
  TABIAI_TIMEOUT_MS?: string;
  TOKENROUTER_API_KEY?: string;
  TOKENROUTER_BASE_URL?: string;
  TOKENROUTER_MODELS?: string;
  TOKENROUTER_MODEL?: string;
  TOKENROUTER_VISION_MODELS?: string;
  TOKENROUTER_TIMEOUT_MS?: string;
  AI_ENABLE_AGENTROUTER_FALLBACK?: string;
  AI_ENABLE_TABIAI_FALLBACK?: string;
  AI_ENABLE_TOKENROUTER_FALLBACK?: string;
  AI_RATE_LIMIT_PER_MINUTE?: string;
  AI_ALLOWED_ORIGINS?: string;
}

const rateLimiters = new Map<number, ReturnType<typeof createRateLimiter>>();

const rateLimiterFor = (limit: number) => {
  let limiter = rateLimiters.get(limit);
  if (!limiter) {
    limiter = createRateLimiter(limit);
    rateLimiters.set(limit, limiter);
  }
  return limiter;
};

const DEFAULT_GEMINI_BASE_URL =
  'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_TOKENROUTER_BASE_URL = 'https://api.tokenrouter.com/v1';
const DEFAULT_AGENTROUTER_BASE_URL = 'https://agentrouter.org/v1';
const DEFAULT_TABIAI_BASE_URL = 'https://tabitoken.com/v1';
const DEFAULT_GEMINI_TEXT_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
  'gemma-4-26b-a4b-it',
  'gemma-4-31b-it',
];
const DEFAULT_GEMINI_JSON_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemma-4-31b-it',
  'gemma-4-26b-a4b-it',
];
const DEFAULT_GEMINI_VISION_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
];

const parseList = (value: string | undefined, fallback: string[] = []) => {
  const values = (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return values.length > 0 ? values : [...fallback];
};

const positiveNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const configFromEnvironment = (env: SitesEnvironment): AIGatewayConfig => ({
  gemini: {
    apiKey: env.GEMINI_API_KEY ?? '',
    baseUrl: (env.GEMINI_BASE_URL ?? DEFAULT_GEMINI_BASE_URL).replace(/\/+$/, ''),
    textModels: parseList(env.GEMINI_TEXT_MODELS, DEFAULT_GEMINI_TEXT_MODELS),
    jsonModels: parseList(env.GEMINI_JSON_MODELS, DEFAULT_GEMINI_JSON_MODELS),
    visionModels: parseList(env.GEMINI_VISION_MODELS, DEFAULT_GEMINI_VISION_MODELS),
    requestTimeoutMs: positiveNumber(env.GEMINI_TIMEOUT_MS, 30_000),
    totalTimeoutMs: positiveNumber(env.GEMINI_TOTAL_TIMEOUT_MS, 80_000),
    maxOutputTokens: positiveNumber(env.GEMINI_MAX_OUTPUT_TOKENS, 8_192),
    thinkingBudget: Number.isFinite(Number(env.GEMINI_THINKING_BUDGET))
      ? Number(env.GEMINI_THINKING_BUDGET)
      : 0,
  },
  agentRouter: {
    apiKey: env.AGENTROUTER_API_KEY ?? '',
    baseUrl: (env.AGENTROUTER_BASE_URL ?? DEFAULT_AGENTROUTER_BASE_URL).replace(
      /\/+$/,
      '',
    ),
    models: parseList(env.AGENTROUTER_MODELS ?? env.AGENTROUTER_MODEL, [
      'glm-5.1',
      'kimi-k2.6',
    ]),
    visionModels: parseList(env.AGENTROUTER_VISION_MODELS),
    timeoutMs: positiveNumber(env.AGENTROUTER_TIMEOUT_MS, 45_000),
    rateLimitPerMinute: positiveNumber(env.AI_RATE_LIMIT_PER_MINUTE, 60),
  },
  tabiAI: {
    apiKey: env.TABIAI_API_KEY ?? '',
    baseUrl: (env.TABIAI_BASE_URL ?? DEFAULT_TABIAI_BASE_URL).replace(/\/+$/, ''),
    models: parseList(env.TABIAI_MODELS ?? env.TABIAI_MODEL, [
      'claude-opus-5-thinking',
      'claude-opus-5',
      'claude-opus-4-8-thinking',
      'claude-opus-4-8',
    ]),
    visionModels: parseList(env.TABIAI_VISION_MODELS),
    timeoutMs: positiveNumber(env.TABIAI_TIMEOUT_MS, 60_000),
    rateLimitPerMinute: positiveNumber(env.AI_RATE_LIMIT_PER_MINUTE, 60),
  },
  tokenRouter: {
    apiKey: env.TOKENROUTER_API_KEY ?? '',
    baseUrl: (env.TOKENROUTER_BASE_URL ?? DEFAULT_TOKENROUTER_BASE_URL).replace(
      /\/+$/,
      '',
    ),
    models: parseList(env.TOKENROUTER_MODELS ?? env.TOKENROUTER_MODEL, [
      'z-ai/glm-5.2-free',
    ]),
    visionModels: parseList(env.TOKENROUTER_VISION_MODELS),
    timeoutMs: positiveNumber(env.TOKENROUTER_TIMEOUT_MS, 90_000),
    rateLimitPerMinute: positiveNumber(env.AI_RATE_LIMIT_PER_MINUTE, 60),
  },
  enableAgentRouterFallback: env.AI_ENABLE_AGENTROUTER_FALLBACK === 'true',
  enableTaBiAIFallback: env.AI_ENABLE_TABIAI_FALLBACK === 'true',
  enableTokenRouterFallback: env.AI_ENABLE_TOKENROUTER_FALLBACK === 'true',
  rateLimitPerMinute: positiveNumber(env.AI_RATE_LIMIT_PER_MINUTE, 60),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...Object.fromEntries(
        Object.entries(SECURITY_HEADERS).map(([key, value]) => [key.toLowerCase(), value]),
      ),
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex, nofollow, nosnippet',
    },
  });

const handleHealth = (env: SitesEnvironment) => {
  const config = configFromEnvironment(env);
  return json(getAIGatewayHealth(config));
};

const readLimitedJson = async (request: Request): Promise<unknown> => {
  if (!request.body) return {};
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_JSON_BODY_BYTES) {
      await reader.cancel();
      throw new RangeError('BODY_TOO_LARGE');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const raw = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  return raw ? JSON.parse(raw) : {};
};

const handleGenerate = async (request: Request, env: SitesEnvironment) => {
  if (!isJsonContentType(request.headers.get('content-type') ?? undefined)) {
    return json(
      { error: 'Content-Type must be application/json.', code: 'UNSUPPORTED_MEDIA_TYPE' },
      415,
    );
  }
  const url = new URL(request.url);
  if (
    !isAllowedRequestOrigin({
      origin: request.headers.get('origin') ?? undefined,
      host: url.host,
      allowedOrigins: env.AI_ALLOWED_ORIGINS,
    })
  ) {
    return json({ error: 'Request origin is not allowed.', code: 'ORIGIN_NOT_ALLOWED' }, 403);
  }

  const config = configFromEnvironment(env);
  const rateLimit = rateLimiterFor(config.rateLimitPerMinute)(
    request.headers.get('cf-connecting-ip') ?? 'unknown',
  );
  if (!rateLimit.allowed) {
    return json(
      { error: 'Too many AI requests. Try again shortly.', code: 'LOCAL_RATE_LIMIT' },
      429,
    );
  }

  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > MAX_JSON_BODY_BYTES) {
    return json({ error: 'Request body is too large.', code: 'BODY_TOO_LARGE' }, 413);
  }

  let body: GenerateRequest;
  try {
    body = (await readLimitedJson(request)) as GenerateRequest;
  } catch (error) {
    if (error instanceof RangeError && error.message === 'BODY_TOO_LARGE') {
      return json({ error: 'Request body is too large.', code: 'BODY_TOO_LARGE' }, 413);
    }
    return json({ error: 'Invalid JSON body.', code: 'INVALID_JSON' }, 400);
  }

  const validationError = validateGenerateRequest(body);
  if (validationError) {
    return json({ error: validationError, code: 'INVALID_REQUEST' }, 400);
  }

  try {
    return json(toPublicAIResult(await requestAI(body, config)));
  } catch (error) {
    const publicError = publicAIError(error);
    return json(publicError.body, publicError.status);
  }
};

export default {
  async fetch(request: Request, env: SitesEnvironment): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/api/ai/health') {
      return handleHealth(env);
    }
    if (request.method === 'POST' && url.pathname === '/api/ai/generate') {
      return handleGenerate(request, env);
    }
    if (url.pathname.startsWith('/api/')) {
      return json({ error: 'API route not found.', code: 'NOT_FOUND' }, 404);
    }

    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
      headers.set(name, value);
    }
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
