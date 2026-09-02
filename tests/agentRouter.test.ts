import assert from 'node:assert/strict';
import test from 'node:test';
import {
  requestAI,
  toPublicAIResult,
  type AIGatewayConfig,
} from '../aiGateway';

const config = (): AIGatewayConfig => ({
  gemini: {
    apiKey: 'gemini-secret',
    baseUrl: 'https://gemini.test/v1beta',
    textModels: ['gemini-primary'],
    jsonModels: ['gemini-primary'],
    visionModels: ['gemini-primary'],
    requestTimeoutMs: 1_000,
    totalTimeoutMs: 2_000,
    maxOutputTokens: 128,
    thinkingBudget: 0,
  },
  agentRouter: {
    apiKey: 'agent-router-secret',
    baseUrl: 'https://agent-router.test/v1',
    models: ['agent-fallback'],
    visionModels: [],
    timeoutMs: 1_000,
    rateLimitPerMinute: 0,
  },
  tabiAI: {
    apiKey: '',
    baseUrl: 'https://tabi.test/v1',
    models: ['tabi-fallback'],
    visionModels: [],
    timeoutMs: 1_000,
    rateLimitPerMinute: 0,
  },
  tokenRouter: {
    apiKey: '',
    baseUrl: 'https://legacy-router.test/v1',
    models: ['legacy'],
    visionModels: [],
    timeoutMs: 1_000,
    rateLimitPerMinute: 0,
  },
  enableAgentRouterFallback: true,
  enableTaBiAIFallback: false,
  enableTokenRouterFallback: false,
  rateLimitPerMinute: 0,
});

test('falls back from Gemini to AgentRouter without exposing routing metadata', async () => {
  const requests: Array<{ url: string; authorization: string | null }> = [];
  const mockFetch = async (
    input: string | URL | Request,
    init?: RequestInit,
  ) => {
    const url = String(input);
    requests.push({
      url,
      authorization: new Headers(init?.headers).get('authorization'),
    });

    if (url.startsWith('https://gemini.test/')) {
      return new Response(
        JSON.stringify({ error: { message: 'temporary upstream failure' } }),
        { status: 503, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({
        model: 'private-upstream-model',
        choices: [{ message: { content: 'KAIRO response' } }],
        usage: { total_tokens: 9 },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  };

  const internal = await requestAI(
    { prompt: 'Reply briefly.' },
    config(),
    mockFetch as typeof fetch,
  );
  const publicResult = toPublicAIResult(internal);

  assert.equal(internal.provider, 'AgentRouter');
  assert.equal(internal.model, 'private-upstream-model');
  assert.equal(requests.length, 2);
  assert.equal(
    requests[1].url,
    'https://agent-router.test/v1/chat/completions',
  );
  assert.equal(requests[1].authorization, 'Bearer agent-router-secret');
  assert.deepEqual(publicResult, {
    text: 'KAIRO response',
    model: 'kairo-intelligence',
  });
  assert.equal(JSON.stringify(publicResult).includes('AgentRouter'), false);
  assert.equal(JSON.stringify(publicResult).includes('private-upstream-model'), false);
  assert.equal(JSON.stringify(publicResult).includes('agent-router-secret'), false);
});

test('does not call AgentRouter when the fallback feature flag is disabled', async () => {
  const disabled = config();
  disabled.enableAgentRouterFallback = false;
  let calls = 0;
  const mockFetch = async () => {
    calls += 1;
    return new Response(
      JSON.stringify({ error: { message: 'upstream unavailable' } }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    );
  };

  await assert.rejects(() =>
    requestAI(
      { prompt: 'Do not route.' },
      disabled,
      mockFetch as typeof fetch,
    ),
  );
  assert.equal(calls, 1);
});

test('does not silently activate a disabled legacy provider', async () => {
  const disabled = config();
  disabled.gemini.apiKey = '';
  disabled.agentRouter.apiKey = '';
  disabled.tokenRouter.apiKey = 'legacy-secret';
  disabled.enableTokenRouterFallback = false;
  let calls = 0;

  const mockFetch = async () => {
    calls += 1;
    return new Response('{}', { status: 200 });
  };
  await assert.rejects(() =>
    requestAI({ prompt: 'Do not route.' }, disabled, mockFetch as typeof fetch),
  );
  assert.equal(calls, 0);
});
