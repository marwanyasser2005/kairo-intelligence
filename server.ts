import express, {
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  getAIGatewayConfig,
  getAIGatewayHealth,
  requestAI,
  type GenerateRequest,
  type AIGatewayConfig,
  UpstreamError,
  validateGenerateRequest,
} from './aiGateway.js';

export {
  getAIGatewayConfig,
  getAIGatewayHealth,
  requestAI,
  type AIGatewayConfig,
} from './aiGateway.js';
export {
  getTokenRouterConfig,
  normalizeJsonSchema,
  requestTokenRouter,
  type TokenRouterConfig,
} from './tokenRouterGateway.js';
export {
  getGeminiConfig,
  requestGemini,
  type GeminiConfig,
} from './geminiGateway.js';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(projectRoot, '.env.local'), quiet: true });
dotenv.config({ path: path.join(projectRoot, '.env'), quiet: true });

export const createApp = (
  config: AIGatewayConfig = getAIGatewayConfig(),
) => {
  const app = express();
  const rateBuckets = new Map<
    string,
    { count: number; resetAt: number }
  >();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '15mb' }));
  app.use((_request, response, next) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'same-origin');
    next();
  });

  app.get('/api/ai/health', (_request, response) => {
    response.json(getAIGatewayHealth(config));
  });

  app.post('/api/ai/generate', async (request, response) => {
    const validationError = validateGenerateRequest(request.body);
    if (validationError) {
      response
        .status(400)
        .json({ error: validationError, code: 'INVALID_REQUEST' });
      return;
    }

    if (config.rateLimitPerMinute > 0) {
      const now = Date.now();
      const key = request.ip || 'unknown';
      const current = rateBuckets.get(key);
      const bucket =
        !current || current.resetAt <= now
          ? { count: 0, resetAt: now + 60_000 }
          : current;
      bucket.count += 1;
      rateBuckets.set(key, bucket);

      if (bucket.count > config.rateLimitPerMinute) {
        response.status(429).json({
          error: 'Too many AI requests. Try again shortly.',
          code: 'LOCAL_RATE_LIMIT',
        });
        return;
      }
    }

    try {
      const result = await requestAI(
        request.body as GenerateRequest,
        config,
      );
      response.json(result);
    } catch (error) {
      const upstream =
        error instanceof UpstreamError
          ? error
          : new UpstreamError(
              'Unexpected AI gateway error.',
              500,
              'INTERNAL_ERROR',
            );
      const status =
        upstream.status === 422 || upstream.status === 429
          ? upstream.status
          : upstream.status === 503 || upstream.status === 504
            ? upstream.status
            : 502;
      response.status(status).json({
        error: upstream.message,
        code: upstream.code,
      });
    }
  });

  app.use(
    (
      error: unknown,
      _request: Request,
      response: Response,
      _next: NextFunction,
    ) => {
      if (error instanceof SyntaxError) {
        response
          .status(400)
          .json({ error: 'Invalid JSON body.', code: 'INVALID_JSON' });
        return;
      }
      response
        .status(500)
        .json({ error: 'Internal server error.', code: 'INTERNAL_ERROR' });
    },
  );

  return app;
};

export const startServer = async () => {
  const app = createApp();
  const isProduction =
    process.argv.includes('--prod') ||
    process.env.NODE_ENV === 'production';

  if (isProduction) {
    const distPath = path.join(projectRoot, 'dist');
    app.use(express.static(distPath));
    app.use((request, response, next) => {
      if (
        request.method !== 'GET' ||
        request.path.startsWith('/api/')
      ) {
        next();
        return;
      }
      response.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      root: projectRoot,
      configLoader: 'runner',
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const port = Number(process.env.PORT) || 3000;
  return app.listen(port, '0.0.0.0', () => {
    console.log(`Kairo is running on http://localhost:${port}`);
  });
};

const isDirectRun =
  Boolean(process.argv[1]) &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isDirectRun) {
  await startServer();
}
