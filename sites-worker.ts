import {
  requestAI,
  UpstreamError,
  validateGenerateRequest,
  type AIGatewayConfig,
  type GenerateRequest,
} from './aiGateway';

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
  TOKENROUTER_API_KEY?: string;
  TOKENROUTER_BASE_URL?: string;
  TOKENROUTER_MODELS?: string;
  TOKENROUTER_MODEL?: string;
  TOKENROUTER_VISION_MODELS?: string;
  TOKENROUTER_TIMEOUT_MS?: string;
  AI_ENABLE_TOKENROUTER_FALLBACK?: string;
  AI_RATE_LIMIT_PER_MINUTE?: string;
}

const DEFAULT_GEMINI_BASE_URL =
  'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_TOKENROUTER_BASE_URL = 'https://api.tokenrouter.com/v1';
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
  enableTokenRouterFallback: env.AI_ENABLE_TOKENROUTER_FALLBACK === 'true',
  rateLimitPerMinute: positiveNumber(env.AI_RATE_LIMIT_PER_MINUTE, 60),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'same-origin',
    },
  });

const handleHealth = (env: SitesEnvironment) => {
  const config = configFromEnvironment(env);
  const provider = config.gemini.apiKey
    ? 'Gemini'
    : config.tokenRouter.apiKey
      ? 'TokenRouter'
      : 'None';

  return json({
    ok: true,
    provider,
    configured: provider !== 'None',
    fallbackEnabled: config.enableTokenRouterFallback,
    providers: {
      gemini: {
        configured: Boolean(config.gemini.apiKey),
        baseUrl: config.gemini.baseUrl,
        textModels: config.gemini.textModels,
        jsonModels: config.gemini.jsonModels,
        visionModels: config.gemini.visionModels,
      },
      tokenRouter: {
        configured: Boolean(config.tokenRouter.apiKey),
        enabledAsFallback: config.enableTokenRouterFallback,
        baseUrl: config.tokenRouter.baseUrl,
        models: config.tokenRouter.models,
        visionModels: config.tokenRouter.visionModels,
      },
    },
  });
};

const handleGenerate = async (request: Request, env: SitesEnvironment) => {
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > 15 * 1024 * 1024) {
    return json({ error: 'Request body is too large.', code: 'BODY_TOO_LARGE' }, 413);
  }

  let body: GenerateRequest;
  try {
    body = (await request.json()) as GenerateRequest;
  } catch {
    return json({ error: 'Invalid JSON body.', code: 'INVALID_JSON' }, 400);
  }

  const validationError = validateGenerateRequest(body);
  if (validationError) {
    return json({ error: validationError, code: 'INVALID_REQUEST' }, 400);
  }

  try {
    return json(await requestAI(body, configFromEnvironment(env)));
  } catch (error) {
    const upstream =
      error instanceof UpstreamError
        ? error
        : new UpstreamError('Unexpected AI gateway error.', 500, 'INTERNAL_ERROR');
    const status = [422, 429, 503, 504].includes(upstream.status)
      ? upstream.status
      : 502;
    return json({ error: upstream.message, code: upstream.code }, status);
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
    headers.set('x-content-type-options', 'nosniff');
    headers.set('referrer-policy', 'strict-origin-when-cross-origin');
    headers.set('x-frame-options', 'SAMEORIGIN');
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
