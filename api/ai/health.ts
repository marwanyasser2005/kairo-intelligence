import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  getAIGatewayConfig,
  getAIGatewayHealth,
} from '../../aiGateway.js';

const sendJson = (
  response: ServerResponse,
  status: number,
  body: unknown,
) => {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(body));
};

export default function handler(
  request: IncomingMessage,
  response: ServerResponse,
): void {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    sendJson(
      response,
      405,
      { error: 'Method not allowed.', code: 'METHOD_NOT_ALLOWED' },
    );
    return;
  }

  sendJson(response, 200, getAIGatewayHealth(getAIGatewayConfig()));
}
