import { getTokenRouterConfig, requestTokenRouter } from '../server';

const config = getTokenRouterConfig();

console.log(`TokenRouter endpoint: ${config.baseUrl}`);
console.log(`Configured models: ${config.models.join(', ')}`);
console.log(
  `Configured vision models: ${config.visionModels.join(', ') || 'none'}`,
);
console.log(`API key configured: ${config.apiKey ? 'yes' : 'no'}`);

if (!config.apiKey) {
  console.error('Verification failed: TOKENROUTER_API_KEY is missing.');
  process.exitCode = 1;
} else {
  try {
    const result = await requestTokenRouter(
      {
        prompt: 'Reply with exactly: KAIRO_TOKEN_ROUTER_OK',
      },
      {
        ...config,
        models: [config.models[0]],
        timeoutMs: Math.min(config.timeoutMs, 30_000),
      },
    );
    const passed = result.text.trim().includes('KAIRO_TOKEN_ROUTER_OK');
    console.log(`Model used: ${result.model}`);
    console.log(`Completion check: ${passed ? 'passed' : 'unexpected response'}`);
    if (!passed) process.exitCode = 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Verification failed: ${message}`);
    process.exitCode = 1;
  }
}
