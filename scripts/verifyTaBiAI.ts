import dotenv from 'dotenv';
import { getTaBiAIConfig, requestTaBiAI } from '../tabiGateway';

dotenv.config({ path: '.env.local', quiet: true });
dotenv.config({ path: '.env', quiet: true });

const config = getTaBiAIConfig();

console.log(`TaBiAI endpoint: ${config.baseUrl}`);
console.log(`Configured models: ${config.models.join(', ')}`);
console.log(`API key configured: ${config.apiKey ? 'yes' : 'no'}`);

if (!config.apiKey) {
  console.error('Verification failed: TABIAI_API_KEY is missing.');
  process.exitCode = 1;
} else {
  try {
    const result = await requestTaBiAI(
      { prompt: 'Reply with exactly: KAIRO_TABI_OK' },
      {
        ...config,
        models: [config.models[0]],
        timeoutMs: Math.min(config.timeoutMs, 60_000),
      },
    );
    const passed = result.text.trim().includes('KAIRO_TABI_OK');
    console.log(`Selected model: ${result.model}`);
    console.log(`Text completion: ${passed ? 'passed' : 'unexpected response'}`);
    if (!passed) process.exitCode = 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Verification failed: ${message}`);
    process.exitCode = 1;
  }
}

