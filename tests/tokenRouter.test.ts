import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import test from 'node:test';
import {
  createApp,
  normalizeJsonSchema,
  requestTokenRouter,
  type AIGatewayConfig,
  type TokenRouterConfig,
} from '../server';

const testConfig = (overrides: Partial<TokenRouterConfig> = {}): TokenRouterConfig => ({
  apiKey: 'test-secret-key',
  baseUrl: 'https://router.test/v1',
  models: ['primary-model'],
  visionModels: [],
  timeoutMs: 1_000,
  rateLimitPerMinute: 0,
  ...overrides,
});

const testAIConfig = (
  tokenRouter: TokenRouterConfig = testConfig(),
): AIGatewayConfig => ({
  gemini: {
    apiKey: '',
    baseUrl: 'https://generativelanguage.test/v1beta',
    textModels: ['gemini-test'],
    jsonModels: ['gemini-test'],
    visionModels: ['gemini-test'],
    requestTimeoutMs: 1_000,
    totalTimeoutMs: 2_000,
    maxOutputTokens: 256,
    thinkingBudget: 0,
  },
  tokenRouter,
  enableTokenRouterFallback: false,
  rateLimitPerMinute: 0,
});

test('normalizes legacy uppercase schema types for OpenAI-compatible JSON Schema', () => {
  const normalized = normalizeJsonSchema({
    type: 'OBJECT',
    properties: {
      score: { type: 'NUMBER' },
      labels: { type: 'ARRAY', items: { type: 'STRING' } },
    },
  });

  assert.deepEqual(normalized, {
    type: 'object',
    properties: {
      score: { type: 'number' },
      labels: { type: 'array', items: { type: 'string' } },
    },
  });
});

test('downgrades structured-output mode when a model rejects json_schema', async () => {
  const requests: Array<{ headers: Headers; body: Record<string, unknown> }> = [];
  const mockFetch = async (_input: string | URL | Request, init?: RequestInit) => {
    requests.push({
      headers: new Headers(init?.headers),
      body: JSON.parse(String(init?.body)),
    });

    if (requests.length === 1) {
      return new Response(
        JSON.stringify({ error: { message: 'response_format is unsupported' } }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({
        model: 'primary-model',
        choices: [{ message: { content: '{"score":91}' } }],
        usage: { total_tokens: 12 },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  };

  const result = await requestTokenRouter(
    {
      prompt: 'Score this input.',
      schema: {
        type: 'OBJECT',
        properties: { score: { type: 'NUMBER' } },
        required: ['score'],
      },
    },
    testConfig(),
    mockFetch as typeof fetch,
  );

  assert.equal(result.text, '{"score":91}');
  assert.equal(result.model, 'primary-model');
  assert.equal(requests.length, 2);
  assert.equal(
    requests[0].headers.get('authorization'),
    'Bearer test-secret-key',
  );
  assert.deepEqual(requests[0].body.response_format, {
    type: 'json_schema',
    json_schema: {
      name: 'kairo_response',
      strict: false,
      schema: {
        type: 'object',
        properties: { score: { type: 'number' } },
        required: ['score'],
      },
    },
  });
  assert.deepEqual(requests[1].body.response_format, { type: 'json_object' });
});

test('falls back to the next configured model on rate limiting', async () => {
  const attemptedModels: string[] = [];
  const mockFetch = async (_input: string | URL | Request, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body));
    attemptedModels.push(body.model);

    if (body.model === 'busy-model') {
      return new Response(
        JSON.stringify({ error: { message: 'rate limited' } }),
        { status: 429, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({
        model: 'backup-model',
        choices: [{ message: { content: 'OK' } }],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  };

  const result = await requestTokenRouter(
    { prompt: 'Reply OK.' },
    testConfig({ models: ['busy-model', 'backup-model'] }),
    mockFetch as typeof fetch,
  );

  assert.equal(result.text, 'OK');
  assert.deepEqual(attemptedModels, ['busy-model', 'backup-model']);
});

test('sends vision input as an OpenAI-compatible data URL with the real MIME type', async () => {
  let requestBody: Record<string, any> = {};
  const mockFetch = async (_input: string | URL | Request, init?: RequestInit) => {
    requestBody = JSON.parse(String(init?.body));
    return new Response(
      JSON.stringify({
        model: 'vision-model',
        choices: [{ message: { content: 'image received' } }],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  };

  await requestTokenRouter(
    {
      prompt: 'Read this receipt.',
      imageBase64: 'aGVsbG8=',
      imageMimeType: 'image/png',
    },
    testConfig({ models: ['text-model'], visionModels: ['vision-model'] }),
    mockFetch as typeof fetch,
  );

  const userMessage = requestBody.messages.find(
    (message: { role: string }) => message.role === 'user',
  );
  assert.equal(userMessage.content[0].text, 'Read this receipt.');
  assert.equal(
    userMessage.content[1].image_url.url,
    'data:image/png;base64,aGVsbG8=',
  );
});

test('rejects vision locally when no multimodal model is configured', async () => {
  await assert.rejects(
    () =>
      requestTokenRouter(
        {
          prompt: 'Read this receipt.',
          imageBase64: 'aGVsbG8=',
          imageMimeType: 'image/png',
        },
        testConfig(),
      ),
    (error: unknown) =>
      error instanceof Error &&
      (error as Error & { status?: number; code?: string }).status === 422 &&
      (error as Error & { status?: number; code?: string }).code ===
        'TOKENROUTER_VISION_NOT_CONFIGURED',
  );
});

test('gateway health is secret-free and invalid requests are rejected locally', async () => {
  const app = createApp(testAIConfig());
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const healthResponse = await fetch(`${baseUrl}/api/ai/health`);
    const healthText = await healthResponse.text();
    const health = JSON.parse(healthText);
    assert.equal(healthResponse.status, 200);
    assert.equal(health.configured, true);
    assert.equal(health.provider, 'TokenRouter');
    assert.equal(healthText.includes('test-secret-key'), false);

    const invalidResponse = await fetch(`${baseUrl}/api/ai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: '   ' }),
    });
    const invalid = await invalidResponse.json();
    assert.equal(invalidResponse.status, 400);
    assert.equal(invalid.code, 'INVALID_REQUEST');
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
