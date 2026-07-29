import {
  getGeminiConfig,
  requestGemini,
  type GeminiConfig,
  type GeminiResult,
} from './geminiGateway.js';
import {
  getTokenRouterConfig,
  requestTokenRouter,
  UpstreamError,
  validateGenerateRequest,
  type GenerateRequest,
  type TokenRouterConfig,
} from './tokenRouterGateway.js';

const DEFAULT_RATE_LIMIT = 60;

export interface AIGatewayConfig {
  gemini: GeminiConfig;
  tokenRouter: TokenRouterConfig;
  enableTokenRouterFallback: boolean;
  rateLimitPerMinute: number;
}

export interface AIResult {
  text: string;
  model: string;
  provider: 'Gemini' | 'TokenRouter';
  usage?: Record<string, unknown>;
}

export const getAIGatewayConfig = (): AIGatewayConfig => ({
  gemini: getGeminiConfig(),
  tokenRouter: getTokenRouterConfig(),
  enableTokenRouterFallback:
    process.env.AI_ENABLE_TOKENROUTER_FALLBACK === 'true',
  rateLimitPerMinute:
    Number(process.env.AI_RATE_LIMIT_PER_MINUTE) || DEFAULT_RATE_LIMIT,
});

export const requestAI = async (
  request: GenerateRequest,
  config: AIGatewayConfig = getAIGatewayConfig(),
  fetchImpl: typeof fetch = fetch,
): Promise<AIResult> => {
  if (config.gemini.apiKey) {
    try {
      return await requestGemini(request, config.gemini, fetchImpl);
    } catch (error) {
      if (
        !config.enableTokenRouterFallback ||
        !config.tokenRouter.apiKey
      ) {
        throw error;
      }
    }
  }

  if (config.tokenRouter.apiKey) {
    const result = await requestTokenRouter(
      request,
      config.tokenRouter,
      fetchImpl,
    );
    return { ...result, provider: 'TokenRouter' };
  }

  throw new UpstreamError(
    'No AI provider is configured on the server.',
    503,
    'AI_NOT_CONFIGURED',
  );
};

export const getAIGatewayHealth = (config = getAIGatewayConfig()) => {
  const activeProvider = config.gemini.apiKey
    ? 'Gemini'
    : config.tokenRouter.apiKey
      ? 'TokenRouter'
      : 'None';

  return {
    ok: true,
    provider: activeProvider,
    configured: activeProvider !== 'None',
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
  };
};

export {
  UpstreamError,
  validateGenerateRequest,
  type GenerateRequest,
  type GeminiConfig,
  type GeminiResult,
  type TokenRouterConfig,
};

