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
  toPublicAIResult,
  type GenerateRequest,
  type AIGatewayConfig,
  validateGenerateRequest,
} from './aiGateway.js';
import {
  MAX_JSON_BODY_BYTES,
  applySecurityHeaders,
  createRateLimiter,
  isAllowedRequestOrigin,
  isJsonContentType,
  publicAIError,
  setRateLimitHeaders,
} from './security.js';

export {
  getAIGatewayConfig,
  getAIGatewayHealth,
  requestAI,
  type AIGatewayConfig,
} from './aiGateway.js';
export {
  getAgentRouterConfig,
  requestAgentRouter,
  type AgentRouterConfig,
} from './agentRouterGateway.js';
export {
  getTokenRouterConfig,
  normalizeJsonSchema,
  requestTokenRouter,
  type TokenRouterConfig,
} from './tokenRouterGateway.js';
export {
  getTaBiAIConfig,
  requestTaBiAI,
  type TaBiAIConfig,
} from './tabiGateway.js';
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
  const consumeRateLimit = createRateLimiter(config.rateLimitPerMinute);
  const trustProxyHops = Number(process.env.AI_TRUST_PROXY_HOPS);

  app.disable('x-powered-by');
  if (Number.isInteger(trustProxyHops) && trustProxyHops > 0) {
    app.set('trust proxy', trustProxyHops);
  }
  app.use((_request, response, next) => {
    applySecurityHeaders(response);
    next();
  });
  app.use('/api/', (_request, response, next) => {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Robots-Tag', 'noindex, nofollow, nosnippet');
    next();
  });
  app.use(express.json({ limit: MAX_JSON_BODY_BYTES, strict: true }));

  app.get('/api/ai/health', (_request, response) => {
    response.json(getAIGatewayHealth(config));
  });

  app.post('/api/ai/generate', async (request, response) => {
    if (!isJsonContentType(request.get('content-type'))) {
      response.status(415).json({
        error: 'Content-Type must be application/json.',
        code: 'UNSUPPORTED_MEDIA_TYPE',
      });
      return;
    }
    if (
      !isAllowedRequestOrigin({
        origin: request.get('origin'),
        host: request.get('host'),
        allowedOrigins: process.env.AI_ALLOWED_ORIGINS,
      })
    ) {
      response.status(403).json({
        error: 'Request origin is not allowed.',
        code: 'ORIGIN_NOT_ALLOWED',
      });
      return;
    }

    const rateLimit = consumeRateLimit(request.ip || 'unknown');
    setRateLimitHeaders(response, rateLimit);
    if (!rateLimit.allowed) {
      response.status(429).json({
        error: 'Too many AI requests. Try again shortly.',
        code: 'LOCAL_RATE_LIMIT',
      });
      return;
    }

    const validationError = validateGenerateRequest(request.body);
    if (validationError) {
      response
        .status(400)
        .json({ error: validationError, code: 'INVALID_REQUEST' });
      return;
    }

    try {
      const result = await requestAI(
        request.body as GenerateRequest,
        config,
      );
      response.json(toPublicAIResult(result));
    } catch (error) {
      const publicError = publicAIError(error);
      response.status(publicError.status).json(publicError.body);
    }
  });

  app.all('/api/ai/generate', (_request, response) => {
    response.setHeader('Allow', 'POST');
    response.status(405).json({
      error: 'Method not allowed.',
      code: 'METHOD_NOT_ALLOWED',
    });
  });

  app.all('/api/ai/health', (_request, response) => {
    response.setHeader('Allow', 'GET');
    response.status(405).json({
      error: 'Method not allowed.',
      code: 'METHOD_NOT_ALLOWED',
    });
  });

  app.use(
    (
      error: unknown,
      _request: Request,
      response: Response,
      _next: NextFunction,
    ) => {
      if (
        error &&
        typeof error === 'object' &&
        'status' in error &&
        Number((error as { status?: unknown }).status) === 413
      ) {
        response.status(413).json({
          error: 'Request body is too large.',
          code: 'BODY_TOO_LARGE',
        });
        return;
      }
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
    app.get(['/features', '/capabilities'], (_request, response) => {
      response.redirect(308, '/dashboard');
    });
    app.get(['/en/features', '/en/capabilities'], (_request, response) => {
      response.redirect(308, '/en/dashboard');
    });
    app.use(express.static(distPath, { extensions: ['html'] }));
    app.use((request, response, next) => {
      if (
        request.method !== 'GET' ||
        request.path.startsWith('/api/')
      ) {
        next();
        return;
      }
      response.status(404).sendFile(path.join(distPath, '404.html'));
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
