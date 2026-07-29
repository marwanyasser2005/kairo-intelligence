import {
  normalizeJsonSchema,
  UpstreamError,
  type GenerateRequest,
} from './tokenRouterGateway.js';

const DEFAULT_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

// Every default below is listed in the attached Google free-tier pricing page
// and was verified against the configured account on 2026-07-24.
const DEFAULT_TEXT_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemma-4-26b-a4b-it',
  'gemma-4-31b-it',
];
const DEFAULT_JSON_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemma-4-31b-it',
  'gemma-4-26b-a4b-it',
];
const DEFAULT_VISION_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
];

const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;
const DEFAULT_TOTAL_TIMEOUT_MS = 80_000;
const DEFAULT_MAX_OUTPUT_TOKENS = 8_192;

export interface GeminiConfig {
  apiKey: string;
  baseUrl: string;
  textModels: string[];
  jsonModels: string[];
  visionModels: string[];
  requestTimeoutMs: number;
  totalTimeoutMs: number;
  maxOutputTokens: number;
  thinkingBudget: number;
}

export interface GeminiResult {
  text: string;
  model: string;
  provider: 'Gemini';
  usage?: Record<string, unknown>;
}

interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/+$/, '');

const parseModelList = (value: string | undefined) =>
  (value || '')
    .split(',')
    .map((model) => model.trim())
    .filter(Boolean);

const positiveNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const getGeminiConfig = (): GeminiConfig => {
  const textModels = parseModelList(process.env.GEMINI_TEXT_MODELS);
  const jsonModels = parseModelList(process.env.GEMINI_JSON_MODELS);
  const visionModels = parseModelList(process.env.GEMINI_VISION_MODELS);
  const thinkingBudget = Number(process.env.GEMINI_THINKING_BUDGET);

  return {
    apiKey: process.env.GEMINI_API_KEY || '',
    baseUrl: normalizeBaseUrl(
      process.env.GEMINI_BASE_URL || DEFAULT_BASE_URL,
    ),
    textModels:
      textModels.length > 0 ? textModels : [...DEFAULT_TEXT_MODELS],
    jsonModels:
      jsonModels.length > 0 ? jsonModels : [...DEFAULT_JSON_MODELS],
    visionModels:
      visionModels.length > 0 ? visionModels : [...DEFAULT_VISION_MODELS],
    requestTimeoutMs: positiveNumber(
      process.env.GEMINI_TIMEOUT_MS,
      DEFAULT_REQUEST_TIMEOUT_MS,
    ),
    totalTimeoutMs: positiveNumber(
      process.env.GEMINI_TOTAL_TIMEOUT_MS,
      DEFAULT_TOTAL_TIMEOUT_MS,
    ),
    maxOutputTokens: positiveNumber(
      process.env.GEMINI_MAX_OUTPUT_TOKENS,
      DEFAULT_MAX_OUTPUT_TOKENS,
    ),
    thinkingBudget: Number.isFinite(thinkingBudget) ? thinkingBudget : 0,
  };
};

const textFromMessageContent = (content: unknown): string => {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';

  return content
    .map((part) => {
      if (!part || typeof part !== 'object') return '';
      const record = part as Record<string, unknown>;
      if (typeof record.text === 'string') return record.text;
      if (typeof record.content === 'string') return record.content;
      return '';
    })
    .join('');
};

const buildGeminiContents = (request: GenerateRequest) => {
  const contents: GeminiContent[] = [];
  const systemParts: string[] = [];

  if (request.systemInstruction?.trim()) {
    systemParts.push(request.systemInstruction.trim());
  }

  if (request.messages?.length) {
    for (const message of request.messages) {
      const text = textFromMessageContent(message.content).trim();
      if (!text) continue;
      if (message.role === 'system') {
        systemParts.push(text);
        continue;
      }
      contents.push({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text }],
      });
    }
  } else if (request.prompt?.trim()) {
    const parts: GeminiPart[] = [{ text: request.prompt.trim() }];
    if (request.imageBase64) {
      parts.push({
        inlineData: {
          mimeType: request.imageMimeType || 'image/jpeg',
          data: request.imageBase64,
        },
      });
    }
    contents.push({ role: 'user', parts });
  }

  return {
    contents,
    systemInstruction:
      systemParts.length > 0
        ? { parts: [{ text: systemParts.join('\n\n') }] }
        : undefined,
  };
};

const extractErrorMessage = (body: unknown, fallback: string): string => {
  if (!body || typeof body !== 'object') return fallback;
  const record = body as Record<string, unknown>;
  const error = record.error;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    const message = (error as Record<string, unknown>).message;
    if (typeof message === 'string') return message;
  }
  return fallback;
};

const getGeminiText = (payload: unknown): string => {
  if (!payload || typeof payload !== 'object') return '';
  const candidates = (payload as Record<string, unknown>).candidates;
  const first = Array.isArray(candidates) ? candidates[0] : undefined;
  const content =
    first && typeof first === 'object'
      ? (first as Record<string, unknown>).content
      : undefined;
  const parts =
    content && typeof content === 'object'
      ? (content as Record<string, unknown>).parts
      : undefined;

  if (!Array.isArray(parts)) return '';
  return parts
    .map((part) => {
      if (!part || typeof part !== 'object') return '';
      const text = (part as Record<string, unknown>).text;
      return typeof text === 'string' ? text : '';
    })
    .join('')
    .trim();
};

const isRetryableStatus = (status: number) =>
  status === 404 ||
  status === 408 ||
  status === 409 ||
  status === 429 ||
  status >= 500;

const modelPoolFor = (request: GenerateRequest, config: GeminiConfig) => {
  if (request.imageBase64) return config.visionModels;
  if (request.schema || request.requireJson) return config.jsonModels;
  return config.textModels;
};

export const requestGemini = async (
  request: GenerateRequest,
  config: GeminiConfig = getGeminiConfig(),
  fetchImpl: typeof fetch = fetch,
): Promise<GeminiResult> => {
  if (!config.apiKey) {
    throw new UpstreamError(
      'Gemini is not configured on the server.',
      503,
      'GEMINI_NOT_CONFIGURED',
    );
  }

  const models = modelPoolFor(request, config);
  if (models.length === 0) {
    throw new UpstreamError(
      'No compatible Gemini model is configured for this request.',
      422,
      'GEMINI_MODEL_POOL_EMPTY',
    );
  }

  const { contents, systemInstruction } = buildGeminiContents(request);
  const schema = request.schema
    ? (normalizeJsonSchema(request.schema) as Record<string, unknown>)
    : undefined;
  const requireJson = Boolean(schema || request.requireJson);
  const deadline = Date.now() + config.totalTimeoutMs;
  let lastError: UpstreamError | undefined;

  for (const model of models) {
    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) break;

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      Math.min(config.requestTimeoutMs, remainingMs),
    );
    const generationConfig: Record<string, unknown> = {
      temperature: requireJson ? 0.15 : 0.35,
      maxOutputTokens: config.maxOutputTokens,
    };

    if (requireJson) {
      generationConfig.responseMimeType = 'application/json';
      if (schema) generationConfig.responseJsonSchema = schema;
    }

    // Gemini reasoning defaults can consume the entire response budget on
    // small requests. A zero budget keeps Kairo's interactive routes fast.
    if (model.startsWith('gemini-')) {
      generationConfig.thinkingConfig = {
        thinkingBudget: config.thinkingBudget,
      };
    }

    const body: Record<string, unknown> = {
      contents,
      generationConfig,
    };
    if (systemInstruction) body.systemInstruction = systemInstruction;

    try {
      const response = await fetchImpl(
        `${config.baseUrl}/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'x-goog-api-key': config.apiKey,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        },
      );

      const rawBody = await response.text();
      let payload: unknown;
      try {
        payload = rawBody ? JSON.parse(rawBody) : {};
      } catch {
        payload = {};
      }

      if (response.ok) {
        const text = getGeminiText(payload);
        if (text) {
          const record = payload as Record<string, unknown>;
          return {
            text,
            model:
              typeof record.modelVersion === 'string'
                ? record.modelVersion
                : model,
            provider: 'Gemini',
            usage:
              record.usageMetadata &&
              typeof record.usageMetadata === 'object'
                ? (record.usageMetadata as Record<string, unknown>)
                : undefined,
          };
        }

        lastError = new UpstreamError(
          `Gemini model ${model} returned an empty response.`,
          502,
          'GEMINI_EMPTY_RESPONSE',
        );
        continue;
      }

      const message = extractErrorMessage(
        payload,
        `Gemini request failed with status ${response.status}.`,
      );
      const code =
        response.status === 401 || response.status === 403
          ? 'GEMINI_AUTH_FAILED'
          : response.status === 429
            ? 'GEMINI_RATE_LIMITED'
            : response.status === 404
              ? 'GEMINI_MODEL_UNAVAILABLE'
              : 'GEMINI_REQUEST_FAILED';
      lastError = new UpstreamError(message, response.status, code);
      if (!isRetryableStatus(response.status)) break;
    } catch (error) {
      const isTimeout =
        error instanceof Error && error.name === 'AbortError';
      lastError = new UpstreamError(
        isTimeout
          ? `Gemini model ${model} timed out.`
          : 'Could not reach Gemini.',
        isTimeout ? 504 : 502,
        isTimeout ? 'GEMINI_TIMEOUT' : 'GEMINI_UNREACHABLE',
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  throw (
    lastError ||
    new UpstreamError(
      'All configured Gemini models failed.',
      502,
      'ALL_GEMINI_MODELS_FAILED',
    )
  );
};
