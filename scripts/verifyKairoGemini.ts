import type { AddressInfo } from 'node:net';
import { createApp } from '../server';

const remoteBaseUrl = process.env.KAIRO_VERIFY_BASE_URL?.replace(/\/+$/, '');

if (!remoteBaseUrl && !process.env.GEMINI_API_KEY) {
  console.error('Verification failed: GEMINI_API_KEY is missing.');
  process.exit(1);
}

const server = remoteBaseUrl
  ? undefined
  : createApp().listen(0, '127.0.0.1');
if (server) {
  await new Promise<void>((resolve) => server.once('listening', resolve));
}

const address = server?.address() as AddressInfo | undefined;
const baseUrl =
  remoteBaseUrl ||
  `http://127.0.0.1:${address?.port}`;
const nativeFetch = globalThis.fetch;
const startedAt = Date.now();

Object.defineProperty(globalThis, 'window', {
  configurable: true,
  value: {
    setTimeout,
    clearTimeout,
    dispatchEvent: () => true,
  },
});
Object.defineProperty(globalThis, 'CustomEvent', {
  configurable: true,
  value: class CustomEvent {
    constructor(
      public readonly type: string,
      public readonly init?: { detail?: unknown },
    ) {}
  },
});

globalThis.fetch = ((input: string | URL | Request, init?: RequestInit) => {
  const url =
    typeof input === 'string' && input.startsWith('/')
      ? `${baseUrl}${input}`
      : input;
  return nativeFetch(url, init);
}) as typeof fetch;

try {
  const { runEnergyAnalysis } = await import(
    '../services/tokenRouterService'
  );
  const report = await runEnergyAnalysis(
    {
      type: 'residential',
      property_type: 'apartment',
      occupants: 4,
      area_m2: 120,
      monthly_bill: 500,
      bill_increased: 'yes',
      ac_count: 2,
      ac_hours_daily: 6,
      fridge_count: 1,
      has_electric_heater: 'yes',
      lighting_type: 'mixed',
      has_solar_panels: 'no',
    },
    'en',
  );

  const passed =
    Number.isFinite(report?.metrics?.estimated_consumption_kwh) &&
    Boolean(report?.scenario_simulation?.ac_to_24);

  console.log(`Energy workflow: ${passed ? 'passed' : 'invalid response'}`);
  console.log(`Target: ${baseUrl}`);
  console.log(`Elapsed: ${Date.now() - startedAt} ms`);
  console.log(
    `Estimated consumption: ${report?.metrics?.estimated_consumption_kwh ?? 'missing'} kWh`,
  );
  console.log(
    `Scenario groups: ${Object.keys(report?.scenario_simulation || {}).length}`,
  );

  if (!passed) process.exitCode = 1;
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`Energy workflow failed: ${message}`);
  process.exitCode = 1;
} finally {
  globalThis.fetch = nativeFetch;
  if (server) {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
}
