import {
  requestTokenRouter,
  UpstreamError,
  type GenerateRequest,
  type TokenRouterConfig,
  type TokenRouterResult,
} from './tokenRouterGateway.js';

const DEFAULT_BASE_URL = 'https://tabitoken.com/v1';
const DEFAULT_MODELS = [
  'claude-opus-5-thinking',
  'claude-opus-5',
  'claude-opus-4-8-thinking',
  'claude-opus-4-8',
];
const REQUEST_TIMEOUT_MS = 60_000;

export type TaBiAIConfig = TokenRouterConfig;
export type TaBiAIResult = TokenRouterResult;

const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/+$/, '');

const parseModelList = (value: string | undefined) =>
  (value || '')
    .split(',')
    .map((model) => model.trim())
    .filter(Boolean);

export const getTaBiAIConfig = (): TaBiAIConfig => {
  const configuredModels = parseModelList(
    process.env.TABIAI_MODELS || process.env.TABIAI_MODEL,
  );

  return {
    apiKey: process.env.TABIAI_API_KEY || '',
    baseUrl: normalizeBaseUrl(process.env.TABIAI_BASE_URL || DEFAULT_BASE_URL),
    models: configuredModels.length > 0 ? configuredModels : DEFAULT_MODELS,
    // The enabled TaBiAI catalogue currently exposes chat models only.
    visionModels: parseModelList(process.env.TABIAI_VISION_MODELS),
    timeoutMs: Number(process.env.TABIAI_TIMEOUT_MS) || REQUEST_TIMEOUT_MS,
    rateLimitPerMinute:
      Number(process.env.AI_RATE_LIMIT_PER_MINUTE) || 60,
  };
};

export const requestTaBiAI = async (
  request: GenerateRequest,
  config: TaBiAIConfig = getTaBiAIConfig(),
  fetchImpl: typeof fetch = fetch,
): Promise<TaBiAIResult> => {
  try {
    return await requestTokenRouter(request, config, fetchImpl);
  } catch (error) {
    if (error instanceof UpstreamError) {
      throw new UpstreamError(
        error.message.replaceAll('TokenRouter', 'TaBiAI'),
        error.status,
        error.code.replaceAll('TOKENROUTER', 'TABIAI'),
      );
    }
    throw error;
  }
};

