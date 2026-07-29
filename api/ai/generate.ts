import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  getAIGatewayConfig,
  requestAI,
  validateGenerateRequest,
  type GenerateRequest,
} from '../../aiGateway.js';

type VercelRequest = IncomingMessage & { body?: unknown };

const sendJson = (
  response: ServerResponse,
  status: number,
  body: unknown,
) => {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(body));
};

const readJsonBody = async (request: VercelRequest): Promise<unknown> => {
  if (request.body !== undefined) {
    if (typeof request.body === 'string') return JSON.parse(request.body);
    return request.body;
  }

  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
};

export default async function handler(
  request: VercelRequest,
  response: ServerResponse,
): Promise<void> {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    sendJson(
      response,
      405,
      { error: 'Method not allowed.', code: 'METHOD_NOT_ALLOWED' },
    );
    return;
  }

  let body: unknown;
  try {
    body = await readJsonBody(request);
  } catch {
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
    sendJson(response, 200, result);
  } catch (error) {
    const upstream = error as {
      message?: string;
      status?: number;
      code?: string;
    };
    const upstreamStatus = Number(upstream?.status);
    const status =
      upstreamStatus === 422 || upstreamStatus === 429 ||
      upstreamStatus === 503 || upstreamStatus === 504
        ? upstreamStatus
        : 502;

    sendJson(
      response,
      status,
      {
        error:
          typeof upstream?.message === 'string'
            ? upstream.message
            : 'Unexpected AI gateway error.',
        code:
          typeof upstream?.code === 'string'
            ? upstream.code
            : 'INTERNAL_ERROR',
      }
    );
  }
}
