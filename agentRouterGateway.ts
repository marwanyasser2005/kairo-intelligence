import {
  requestTokenRouter,
  type GenerateRequest,
  type TokenRouterConfig,
  type TokenRouterResult,
} from './tokenRouterGateway.js';

const DEFAULT_BASE_URL = 'https://co.agentrouter.org/v1';
const DEFAULT_MODELS = ['gpt-5.5', 'glm-5.1'];
const REQUEST_TIMEOUT_MS = 45_000;

export type AgentRouterConfig = TokenRouterConfig;
export type AgentRouterResult = TokenRouterResult;

const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/+$/, '');

const parseModelList = (value: string | undefined) =>
  (value || '')
    .split(',')
    .map((model) => model.trim())
    .filter(Boolean);

export const getAgentRouterConfig = (): AgentRouterConfig => {
  const configuredModels = parseModelList(
    process.env.AGENTROUTER_MODELS || process.env.AGENTROUTER_MODEL,
  );

  return {
    apiKey: process.env.AGENTROUTER_API_KEY || '',
    baseUrl: normalizeBaseUrl(
      process.env.AGENTROUTER_BASE_URL || DEFAULT_BASE_URL,
    ),
    models: configuredModels.length > 0 ? configuredModels : DEFAULT_MODELS,
    visionModels: parseModelList(process.env.AGENTROUTER_VISION_MODELS),
    timeoutMs:
      Number(process.env.AGENTROUTER_TIMEOUT_MS) || REQUEST_TIMEOUT_MS,
    rateLimitPerMinute:
      Number(process.env.AI_RATE_LIMIT_PER_MINUTE) || 60,
  };
};

// AgentRouter exposes an OpenAI-compatible chat-completions surface, so the
// hardened request builder and structured-output downgrade logic are shared
// with the existing compatible-provider adapter.
export const requestAgentRouter = (
  request: GenerateRequest,
  config: AgentRouterConfig = getAgentRouterConfig(),
  fetchImpl: typeof fetch = fetch,
): Promise<AgentRouterResult> =>
  requestTokenRouter(request, config, fetchImpl);
