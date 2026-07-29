import assert from 'node:assert/strict';
import test from 'node:test';
import {
  requestGemini,
  type GeminiConfig,
} from '../server';

const testConfig = (
  overrides: Partial<GeminiConfig> = {},
): GeminiConfig => ({
  apiKey: 'gemini-test-secret',
  baseUrl: 'https://generativelanguage.test/v1beta',
  textModels: ['gemini-text'],
  jsonModels: ['gemini-json-primary', 'gemini-json-backup'],
  visionModels: ['gemini-vision'],
  requestTimeoutMs: 1_000,
  totalTimeoutMs: 3_000,
  maxOutputTokens: 512,
  thinkingBudget: 0,
  ...overrides,
});

test('routes structured requests through the JSON pool and normalizes schemas', async () => {
  const attempts: Array<{
    url: string;
    headers: Headers;
    body: Record<string, any>;
  }> = [];

  const mockFetch = async (
    input: string | URL | Request,
    init?: RequestInit,
  ) => {
    const body = JSON.parse(String(init?.body));
    attempts.push({
      url: String(input),
      headers: new Headers(init?.headers),
      body,
    });

    if (String(input).includes('gemini-json-primary')) {
      return new Response(
        JSON.stringify({ error: { message: 'free tier busy' } }),
        { status: 429, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({
        modelVersion: 'gemini-json-backup-001',
        candidates: [
          { content: { parts: [{ text: '{"score":91}' }] } },
        ],
        usageMetadata: { totalTokenCount: 24 },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  };

  const result = await requestGemini(
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

  assert.equal(result.provider, 'Gemini');
  assert.equal(result.model, 'gemini-json-backup-001');
  assert.equal(result.text, '{"score":91}');
  assert.equal(attempts.length, 2);
  assert.equal(
    attempts[0].headers.get('x-goog-api-key'),
    'gemini-test-secret',
  );
  assert.equal(attempts[0].body.generationConfig.responseMimeType, 'application/json');
  assert.deepEqual(
    attempts[0].body.generationConfig.responseJsonSchema,
    {
      type: 'object',
      properties: { score: { type: 'number' } },
      required: ['score'],
    },
  );
  assert.deepEqual(
    attempts.map((attempt) => attempt.url.split('/models/')[1].split(':')[0]),
    ['gemini-json-primary', 'gemini-json-backup'],
  );
});

test('uses the vision pool and sends images as native Gemini inline data', async () => {
  let body: Record<string, any> = {};
  const mockFetch = async (_input: string | URL | Request, init?: RequestInit) => {
    body = JSON.parse(String(init?.body));
    return new Response(
      JSON.stringify({
        candidates: [
          { content: { parts: [{ text: '{"amount":120}' }] } },
        ],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  };

  await requestGemini(
    {
      prompt: 'Read this bill.',
      imageBase64: 'aGVsbG8=',
      imageMimeType: 'image/png',
      requireJson: true,
    },
    testConfig(),
    mockFetch as typeof fetch,
  );

  assert.equal(body.contents[0].parts[0].text, 'Read this bill.');
  assert.deepEqual(body.contents[0].parts[1].inlineData, {
    mimeType: 'image/png',
    data: 'aGVsbG8=',
  });
});

test('keeps the Gemini key out of error messages', async () => {
  const mockFetch = async () =>
    new Response(
      JSON.stringify({ error: { message: 'permission denied' } }),
      { status: 403, headers: { 'Content-Type': 'application/json' } },
    );

  await assert.rejects(
    () =>
      requestGemini(
        { prompt: 'Hello' },
        testConfig(),
        mockFetch as typeof fetch,
      ),
    (error: unknown) =>
      error instanceof Error &&
      error.message === 'permission denied' &&
      !error.message.includes('gemini-test-secret'),
  );
});

