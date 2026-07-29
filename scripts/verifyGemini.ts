import { getGeminiConfig, requestGemini } from '../server';

const config = getGeminiConfig();

console.log(`Gemini endpoint: ${config.baseUrl}`);
console.log(`Text models: ${config.textModels.join(', ')}`);
console.log(`JSON models: ${config.jsonModels.join(', ')}`);
console.log(`Vision models: ${config.visionModels.join(', ')}`);
console.log(`API key configured: ${config.apiKey ? 'yes' : 'no'}`);

if (!config.apiKey) {
  console.error('Verification failed: GEMINI_API_KEY is missing.');
  process.exitCode = 1;
} else {
  try {
    const result = await requestGemini(
      {
        prompt: 'Return a JSON object with ok set to true.',
        schema: {
          type: 'object',
          properties: { ok: { type: 'boolean' } },
          required: ['ok'],
          additionalProperties: false,
        },
      },
      {
        ...config,
        jsonModels: [config.jsonModels[0]],
        requestTimeoutMs: Math.min(config.requestTimeoutMs, 30_000),
        totalTimeoutMs: Math.min(config.totalTimeoutMs, 30_000),
      },
    );
    const parsed = JSON.parse(result.text);
    const passed = parsed?.ok === true;
    console.log(`Provider: ${result.provider}`);
    console.log(`Model used: ${result.model}`);
    console.log(`Structured output: ${passed ? 'passed' : 'unexpected response'}`);
    if (!passed) process.exitCode = 1;

    const visionResult = await requestGemini(
      {
        prompt:
          'Inspect the image and return a JSON object with image_received set to true.',
        imageBase64:
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
        imageMimeType: 'image/png',
        schema: {
          type: 'object',
          properties: { image_received: { type: 'boolean' } },
          required: ['image_received'],
          additionalProperties: false,
        },
      },
      {
        ...config,
        visionModels: [config.visionModels[0]],
        requestTimeoutMs: Math.min(config.requestTimeoutMs, 30_000),
        totalTimeoutMs: Math.min(config.totalTimeoutMs, 30_000),
      },
    );
    const visionParsed = JSON.parse(visionResult.text);
    const visionPassed = visionParsed?.image_received === true;
    console.log(`Vision model used: ${visionResult.model}`);
    console.log(`Vision input: ${visionPassed ? 'passed' : 'unexpected response'}`);
    if (!visionPassed) process.exitCode = 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Verification failed: ${message}`);
    process.exitCode = 1;
  }
}
