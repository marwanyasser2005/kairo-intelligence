import {
  getAgentRouterConfig,
  requestAgentRouter,
  type AgentRouterConfig,
} from './agentRouterGateway.js';
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
import {
  getTaBiAIConfig,
  requestTaBiAI,
  type TaBiAIConfig,
} from './tabiGateway.js';

const DEFAULT_RATE_LIMIT = 60;

export interface AIGatewayConfig {
  gemini: GeminiConfig;
  agentRouter: AgentRouterConfig;
  tabiAI: TaBiAIConfig;
  tokenRouter: TokenRouterConfig;
  enableAgentRouterFallback: boolean;
  enableTaBiAIFallback: boolean;
  enableTokenRouterFallback: boolean;
  rateLimitPerMinute: number;
}

export interface AIResult {
  text: string;
  model: string;
  provider: 'Gemini' | 'AgentRouter' | 'TaBiAI' | 'TokenRouter';
  usage?: Record<string, unknown>;
}

export const getAIGatewayConfig = (): AIGatewayConfig => ({
  gemini: getGeminiConfig(),
  agentRouter: getAgentRouterConfig(),
  tabiAI: getTaBiAIConfig(),
  tokenRouter: getTokenRouterConfig(),
  enableAgentRouterFallback:
    process.env.AI_ENABLE_AGENTROUTER_FALLBACK === 'true',
  enableTaBiAIFallback: process.env.AI_ENABLE_TABIAI_FALLBACK === 'true',
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
        (!config.enableAgentRouterFallback || !config.agentRouter.apiKey) &&
        (!config.enableTaBiAIFallback || !config.tabiAI.apiKey) &&
        (!config.enableTokenRouterFallback || !config.tokenRouter.apiKey)
      ) {
        throw error;
      }
    }
  }

  if (config.enableAgentRouterFallback && config.agentRouter.apiKey) {
    try {
      const result = await requestAgentRouter(
        request,
        config.agentRouter,
        fetchImpl,
      );
      return { ...result, provider: 'AgentRouter' };
    } catch (error) {
      if (
        (!config.enableTaBiAIFallback || !config.tabiAI.apiKey) &&
        (!config.enableTokenRouterFallback || !config.tokenRouter.apiKey)
      ) {
        throw error;
      }
    }
  }

  if (config.enableTaBiAIFallback && config.tabiAI.apiKey) {
    try {
      const result = await requestTaBiAI(request, config.tabiAI, fetchImpl);
      return { ...result, provider: 'TaBiAI' };
    } catch (error) {
      if (!config.enableTokenRouterFallback || !config.tokenRouter.apiKey) {
        throw error;
      }
    }
  }

  if (config.enableTokenRouterFallback && config.tokenRouter.apiKey) {
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
  const configured = Boolean(
    config.gemini.apiKey ||
      (config.enableAgentRouterFallback && config.agentRouter.apiKey) ||
      (config.enableTaBiAIFallback && config.tabiAI.apiKey) ||
      (config.enableTokenRouterFallback && config.tokenRouter.apiKey),
  );
  const redundancy =
    [
      Boolean(config.gemini.apiKey),
      Boolean(config.enableAgentRouterFallback && config.agentRouter.apiKey),
      Boolean(config.enableTaBiAIFallback && config.tabiAI.apiKey),
      Boolean(config.enableTokenRouterFallback && config.tokenRouter.apiKey),
    ].filter(Boolean).length > 1;

  return {
    ok: true,
    service: 'KAIRO Intelligence',
    configured,
    redundancy,
    capabilities: {
      text: configured,
      structured: configured,
      vision: Boolean(
        config.gemini.apiKey ||
          (config.enableAgentRouterFallback &&
            config.agentRouter.apiKey &&
            config.agentRouter.visionModels.length > 0) ||
          (config.enableTaBiAIFallback &&
            config.tabiAI.apiKey &&
            config.tabiAI.visionModels.length > 0) ||
          (config.enableTokenRouterFallback &&
            config.tokenRouter.apiKey &&
            config.tokenRouter.visionModels.length > 0),
      ),
    },
  };
};

export const toPublicAIResult = (result: AIResult) => ({
  text: result.text,
  model: 'kairo-intelligence',
});

export {
  UpstreamError,
  validateGenerateRequest,
  type GenerateRequest,
  type AgentRouterConfig,
  type GeminiConfig,
  type GeminiResult,
  type TaBiAIConfig,
  type TokenRouterConfig,
};
