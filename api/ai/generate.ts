import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  getAIGatewayConfig,
  requestAI,
  toPublicAIResult,
  validateGenerateRequest,
  type GenerateRequest,
} from '../../aiGateway.js';
import {
  MAX_JSON_BODY_BYTES,
  applySecurityHeaders,
  createRateLimiter,
  isAllowedRequestOrigin,
  isJsonContentType,
  publicAIError,
  setRateLimitHeaders,
} from '../../security.js';

type VercelRequest = IncomingMessage & { body?: unknown };
const consumeRateLimit = createRateLimiter(
  Number(process.env.AI_RATE_LIMIT_PER_MINUTE) || 60,
);

class BodyTooLargeError extends Error {}

const sendJson = (
  response: ServerResponse,
  status: number,
  body: unknown,
) => {
  applySecurityHeaders(response);
  response.setHeader('Cache-Control', 'no-store');
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(body));
};

const readJsonBody = async (request: VercelRequest): Promise<unknown> => {
  if (request.body !== undefined) {
    const serialized =
      typeof request.body === 'string'
        ? request.body
        : JSON.stringify(request.body);
    if (Buffer.byteLength(serialized, 'utf8') > MAX_JSON_BODY_BYTES) {
      throw new BodyTooLargeError();
    }
    if (typeof request.body === 'string') return JSON.parse(request.body);
    return request.body;
  }

  const chunks: Buffer[] = [];
  let receivedBytes = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    receivedBytes += buffer.length;
    if (receivedBytes > MAX_JSON_BODY_BYTES) {
      throw new BodyTooLargeError();
    }
    chunks.push(buffer);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
};

export default async function handler(
  request: VercelRequest,
  response: ServerResponse,
): Promise<void> {
  applySecurityHeaders(response);
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    sendJson(
      response,
      405,
      { error: 'Method not allowed.', code: 'METHOD_NOT_ALLOWED' },
    );
    return;
  }

  const contentType = Array.isArray(request.headers['content-type'])
    ? request.headers['content-type'][0]
    : request.headers['content-type'];
  if (!isJsonContentType(contentType)) {
    sendJson(response, 415, {
      error: 'Content-Type must be application/json.',
      code: 'UNSUPPORTED_MEDIA_TYPE',
    });
    return;
  }

  const origin = Array.isArray(request.headers.origin)
    ? request.headers.origin[0]
    : request.headers.origin;
  const host = Array.isArray(request.headers.host)
    ? request.headers.host[0]
    : request.headers.host;
  if (
    !isAllowedRequestOrigin({
      origin,
      host,
      allowedOrigins: process.env.AI_ALLOWED_ORIGINS,
    })
  ) {
    sendJson(response, 403, {
      error: 'Request origin is not allowed.',
      code: 'ORIGIN_NOT_ALLOWED',
    });
    return;
  }

  const forwardedFor = request.headers['x-vercel-forwarded-for'] ??
    request.headers['x-forwarded-for'];
  const clientIp = (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor)
    ?.split(',')[0]
    .trim() || request.socket.remoteAddress || 'unknown';
  const rateLimit = consumeRateLimit(clientIp);
  setRateLimitHeaders(response, rateLimit);
  if (!rateLimit.allowed) {
    sendJson(response, 429, {
      error: 'Too many AI requests. Try again shortly.',
      code: 'LOCAL_RATE_LIMIT',
    });
    return;
  }

  const declaredLength = Number(request.headers['content-length'] ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_JSON_BODY_BYTES) {
    sendJson(response, 413, {
      error: 'Request body is too large.',
      code: 'BODY_TOO_LARGE',
    });
    return;
  }

  let body: unknown;
  try {
    body = await readJsonBody(request);
  } catch (error) {
    if (error instanceof BodyTooLargeError) {
      sendJson(response, 413, {
        error: 'Request body is too large.',
        code: 'BODY_TOO_LARGE',
      });
      return;
    }
    sendJson(
      response,
      400,
      { error: 'Invalid JSON body.', code: 'INVALID_JSON' },
    );
    return;
  }

  const validationError = validateGenerateRequest(body);
  if (validationError) {
    sendJson(
      response,
      400,
      { error: validationError, code: 'INVALID_REQUEST' },
    );
    return;
  }

  try {
    const result = await requestAI(
      body as GenerateRequest,
      getAIGatewayConfig(),
    );
    sendJson(response, 200, toPublicAIResult(result));
  } catch (error) {
    const publicError = publicAIError(error);
    sendJson(response, publicError.status, publicError.body);
  }
}
