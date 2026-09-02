import assert from 'node:assert/strict';
import test from 'node:test';
import { requestAI, toPublicAIResult, type AIGatewayConfig } from '../aiGateway';
import { requestTaBiAI, type TaBiAIConfig } from '../tabiGateway';

const tabiConfig = (overrides: Partial<TaBiAIConfig> = {}): TaBiAIConfig => ({
  apiKey: 'tabi-secret',
  baseUrl: 'https://tabi.test/v1',
  models: ['claude-opus-test'],
  visionModels: [],
  timeoutMs: 1_000,
  rateLimitPerMinute: 0,
  ...overrides,
});

test('uses the OpenAI-compatible TaBiAI chat endpoint without leaking its key', async () => {
  let requestUrl = '';
  let authorization = '';
  let body: Record<string, unknown> = {};
  const mockFetch = async (input: string | URL | Request, init?: RequestInit) => {
    requestUrl = String(input);
    authorization = new Headers(init?.headers).get('authorization') ?? '';
    body = JSON.parse(String(init?.body));
    return new Response(
      JSON.stringify({
        model: 'private-tabi-model',
        choices: [{ message: { content: 'KAIRO_TABI_OK' } }],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  };

  const result = await requestTaBiAI(
    { prompt: 'Verify the route.' },
    tabiConfig(),
    mockFetch as typeof fetch,
  );
  assert.equal(requestUrl, 'https://tabi.test/v1/chat/completions');
  assert.equal(authorization, 'Bearer tabi-secret');
  assert.equal(body.model, 'claude-opus-test');
  assert.equal(result.text, 'KAIRO_TABI_OK');
  assert.equal(JSON.stringify(result).includes('tabi-secret'), false);
});

test('routes to TaBiAI after Gemini and AgentRouter fail and keeps it private publicly', async () => {
  const config: AIGatewayConfig = {
    gemini: {
      apiKey: 'gemini-secret', baseUrl: 'https://gemini.test/v1beta',
      textModels: ['gemini'], jsonModels: ['gemini'], visionModels: ['gemini'],
      requestTimeoutMs: 1_000, totalTimeoutMs: 2_000, maxOutputTokens: 64, thinkingBudget: 0,
    },
    agentRouter: {
      apiKey: 'agent-secret', baseUrl: 'https://agent.test/v1', models: ['agent'],
      visionModels: [], timeoutMs: 1_000, rateLimitPerMinute: 0,
    },
    tabiAI: tabiConfig(),
    tokenRouter: {
      apiKey: '', baseUrl: 'https://legacy.test/v1', models: ['legacy'],
      visionModels: [], timeoutMs: 1_000, rateLimitPerMinute: 0,
    },
    enableAgentRouterFallback: true,
    enableTaBiAIFallback: true,
    enableTokenRouterFallback: false,
    rateLimitPerMinute: 0,
  };
  const calls: string[] = [];
  const mockFetch = async (input: string | URL | Request) => {
    const url = String(input);
    calls.push(url);
    if (!url.startsWith('https://tabi.test/')) {
      return new Response(JSON.stringify({ error: { message: 'unavailable' } }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(
      JSON.stringify({ model: 'hidden-opus', choices: [{ message: { content: 'KAIRO answer' } }] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  };

  const internal = await requestAI({ prompt: 'Hello' }, config, mockFetch as typeof fetch);
  const publicResult = toPublicAIResult(internal);
  assert.equal(internal.provider, 'TaBiAI');
  assert.equal(calls.length, 3);
  assert.deepEqual(publicResult, { text: 'KAIRO answer', model: 'kairo-intelligence' });
  assert.equal(JSON.stringify(publicResult).includes('TaBiAI'), false);
  assert.equal(JSON.stringify(publicResult).includes('hidden-opus'), false);
});

