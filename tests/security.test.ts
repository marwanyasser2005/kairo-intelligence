import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import test from 'node:test';
import { createApp, type AIGatewayConfig } from '../server';
import {
  MAX_PROMPT_CHARS,
  validateGenerateRequest,
} from '../tokenRouterGateway';
import {
  CONTENT_SECURITY_POLICY,
  createRateLimiter,
  isAllowedRequestOrigin,
  publicAIError,
} from '../security';
import { hasExpectedImageSignature } from '../utils/fileSecurity';

const gatewayConfig = (rateLimitPerMinute = 0): AIGatewayConfig => ({
  gemini: {
    apiKey: '',
    baseUrl: 'https://generativelanguage.test/v1beta',
    textModels: ['test'],
    jsonModels: ['test'],
    visionModels: ['test'],
    requestTimeoutMs: 100,
    totalTimeoutMs: 200,
    maxOutputTokens: 64,
    thinkingBudget: 0,
  },
  agentRouter: {
    apiKey: '',
    baseUrl: 'https://agent-router.test/v1',
    models: ['test'],
    visionModels: [],
    timeoutMs: 100,
    rateLimitPerMinute,
  },
  tabiAI: {
    apiKey: '',
    baseUrl: 'https://tabi.test/v1',
    models: ['test'],
    visionModels: [],
    timeoutMs: 100,
    rateLimitPerMinute,
  },
  tokenRouter: {
    apiKey: '',
    baseUrl: 'https://router.test/v1',
    models: ['test'],
    visionModels: [],
    timeoutMs: 100,
    rateLimitPerMinute,
  },
  enableAgentRouterFallback: false,
  enableTaBiAIFallback: false,
  enableTokenRouterFallback: false,
  rateLimitPerMinute,
});

test('AI request validation bounds every attacker-controlled complex field', () => {
  assert.equal(validateGenerateRequest({ prompt: 'safe request' }), null);
  assert.match(
    validateGenerateRequest({ prompt: 'x'.repeat(MAX_PROMPT_CHARS + 1) }) ?? '',
    /too long/i,
  );
  assert.match(
    validateGenerateRequest({
      messages: [{ role: 'user', content: [{ text: 'not allowed' }] }],
    }) ?? '',
    /valid messages|text content/i,
  );
  assert.match(
    validateGenerateRequest({
      prompt: 'image',
      imageBase64: 'not-base64',
      imageMimeType: 'image/svg+xml',
    }) ?? '',
    /base64/i,
  );
  assert.match(
    validateGenerateRequest({
      prompt: 'image',
      imageBase64: 'aGVsbG8=',
      imageMimeType: 'image/svg+xml',
    }) ?? '',
    /JPEG, PNG, or WebP/i,
  );

  const pollutedSchema = JSON.parse('{"__proto__":{"polluted":true}}');
  assert.match(
    validateGenerateRequest({ prompt: 'schema', schema: pollutedSchema }) ?? '',
    /schema is invalid/i,
  );
  assert.equal(({} as { polluted?: boolean }).polluted, undefined);
});

test('rate limiting is bounded by window and returns standards-friendly metadata', () => {
  const consume = createRateLimiter(2, 1_000);
  assert.equal(consume('client', 10).allowed, true);
  assert.equal(consume('client', 11).remaining, 0);
  assert.equal(consume('client', 12).allowed, false);
  assert.equal(consume('client', 1_011).allowed, true);
});

test('origin checks allow same-origin and explicit deployments only', () => {
  assert.equal(
    isAllowedRequestOrigin({ origin: 'https://kairo.test', host: 'kairo.test' }),
    true,
  );
  assert.equal(
    isAllowedRequestOrigin({
      origin: 'https://preview.kairo.test',
      host: 'kairo.test',
      allowedOrigins: 'https://preview.kairo.test',
    }),
    true,
  );
  assert.equal(
    isAllowedRequestOrigin({ origin: 'https://attacker.test', host: 'kairo.test' }),
    false,
  );
});

test('provider error details are redacted before reaching browsers', () => {
  const result = publicAIError({
    status: 500,
    code: 'UPSTREAM_FAILURE',
    message: 'secret-key and internal provider URL',
  });
  assert.equal(result.status, 502);
  assert.equal(JSON.stringify(result.body).includes('secret-key'), false);
  assert.equal(JSON.stringify(result.body).includes('provider URL'), false);
});

test('upload validation checks file signatures instead of trusting MIME labels', () => {
  assert.equal(
    hasExpectedImageSignature(
      new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      'image/png',
    ),
    true,
  );
  assert.equal(
    hasExpectedImageSignature(new TextEncoder().encode('<svg><script>'), 'image/png'),
    false,
  );
});

test('HTTP gateway rejects cross-site and non-JSON requests and emits hardening headers', async () => {
  const app = createApp(gatewayConfig(1));
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const health = await fetch(`${baseUrl}/api/ai/health`);
    assert.equal(health.headers.get('x-frame-options'), 'DENY');
    assert.equal(
      health.headers.get('content-security-policy'),
      CONTENT_SECURITY_POLICY,
    );
    assert.equal(health.headers.get('cache-control'), 'no-store');

    const nonJson = await fetch(`${baseUrl}/api/ai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'hello',
    });
    assert.equal(nonJson.status, 415);

    const crossSite = await fetch(`${baseUrl}/api/ai/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://attacker.test',
      },
      body: JSON.stringify({ prompt: 'hello' }),
    });
    assert.equal(crossSite.status, 403);

    const first = await fetch(`${baseUrl}/api/ai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'hello' }),
    });
    assert.equal(first.status, 503);
    assert.equal(first.headers.get('ratelimit-remaining'), '0');

    const limited = await fetch(`${baseUrl}/api/ai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'hello again' }),
    });
    assert.equal(limited.status, 429);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
