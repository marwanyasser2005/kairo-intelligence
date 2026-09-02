const DEFAULT_BASE_URL = 'https://api.tokenrouter.com/v1';
const DEFAULT_MODELS = ['z-ai/glm-5.2-free'];
const DEFAULT_RATE_LIMIT = 60;
const REQUEST_TIMEOUT_MS = 90_000;

type ChatRole = 'system' | 'user' | 'assistant';

interface ChatMessage {
  role: ChatRole;
  content: string | Array<Record<string, unknown>>;
}

interface RequestMessage {
  role: ChatRole;
  content: string;
}

export interface GenerateRequest {
  prompt?: string;
  messages?: RequestMessage[];
  systemInstruction?: string;
  schema?: Record<string, unknown>;
  requireJson?: boolean;
  imageBase64?: string;
  imageMimeType?: string;
}

export interface TokenRouterConfig {
  apiKey: string;
  baseUrl: string;
  models: string[];
  visionModels: string[];
  timeoutMs: number;
  rateLimitPerMinute: number;
}

export interface TokenRouterResult {
  text: string;
  model: string;
  usage?: Record<string, unknown>;
}

export class UpstreamError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'UpstreamError';
  }
}

const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/+$/, '');

const parseModelList = (value: string | undefined) =>
  (value || '')
    .split(',')
    .map((model) => model.trim())
    .filter(Boolean);

export const getTokenRouterConfig = (): TokenRouterConfig => {
  const configuredModels = parseModelList(
    process.env.TOKENROUTER_MODELS || process.env.TOKENROUTER_MODEL,
  );

  return {
    apiKey: process.env.TOKENROUTER_API_KEY || '',
    baseUrl: normalizeBaseUrl(
      process.env.TOKENROUTER_BASE_URL || DEFAULT_BASE_URL,
    ),
    models: configuredModels.length > 0 ? configuredModels : DEFAULT_MODELS,
    visionModels: parseModelList(process.env.TOKENROUTER_VISION_MODELS),
    timeoutMs:
      Number(process.env.TOKENROUTER_TIMEOUT_MS) || REQUEST_TIMEOUT_MS,
    rateLimitPerMinute:
      Number(process.env.AI_RATE_LIMIT_PER_MINUTE) || DEFAULT_RATE_LIMIT,
  };
};

export const normalizeJsonSchema = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(normalizeJsonSchema);
  if (!value || typeof value !== 'object') return value;

  const normalized: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(
    value as Record<string, unknown>,
  )) {
    if (key === '__proto__' || key === 'prototype' || key === 'constructor') {
      continue;
    }
    normalized[key] =
      key === 'type' && typeof child === 'string'
        ? child.toLowerCase()
        : normalizeJsonSchema(child);
  }
  return normalized;
};

const extractErrorMessage = (body: unknown, fallback: string): string => {
  if (!body || typeof body !== 'object') return fallback;
  const record = body as Record<string, unknown>;
  const error = record.error;

  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    const message = (error as Record<string, unknown>).message;
    if (typeof message === 'string') return message;
  }
  if (typeof record.message === 'string') return record.message;
  if (typeof record.msg === 'string') return record.msg;
  return fallback;
};

const getCompletionText = (payload: unknown): string => {
  if (!payload || typeof payload !== 'object') {
    throw new UpstreamError(
      'TokenRouter returned an invalid response.',
      502,
      'INVALID_RESPONSE',
    );
  }

  const choices = (payload as Record<string, unknown>).choices;
  const first = Array.isArray(choices) ? choices[0] : undefined;
  const message =
    first && typeof first === 'object'
      ? (first as Record<string, unknown>).message
      : undefined;
  const content =
    message && typeof message === 'object'
      ? (message as Record<string, unknown>).content
      : undefined;

  if (typeof content === 'string' && content.trim()) return content;
  if (Array.isArray(content)) {
    const joined = content
      .map((part) => {
        if (!part || typeof part !== 'object') return '';
        const record = part as Record<string, unknown>;
        if (typeof record.text === 'string') return record.text;
        if (typeof record.content === 'string') return record.content;
        return '';
      })
      .join('')
      .trim();
    if (joined) return joined;
  }

  throw new UpstreamError(
    'TokenRouter returned an empty completion.',
    502,
    'EMPTY_RESPONSE',
  );
};

const buildMessages = (
  request: GenerateRequest,
  schema: Record<string, unknown> | undefined,
  responseMode: 'text' | 'json_schema' | 'json_object' | 'prompt_json',
): ChatMessage[] => {
  const messages: ChatMessage[] = [];

  if (request.systemInstruction?.trim()) {
    messages.push({
      role: 'system',
      content: request.systemInstruction.trim(),
    });
  }

  if (request.messages?.length) {
    messages.push(...request.messages);
  } else if (request.prompt?.trim()) {
    if (request.imageBase64) {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: request.prompt.trim() },
          {
            type: 'image_url',
            image_url: {
              url: `data:${request.imageMimeType || 'image/jpeg'};base64,${request.imageBase64}`,
            },
          },
        ],
      });
    } else {
      messages.push({ role: 'user', content: request.prompt.trim() });
    }
  }

  if (responseMode !== 'text') {
    const schemaInstruction = schema
      ? `Return only valid JSON matching this JSON Schema: ${JSON.stringify(schema)}`
      : 'Return only a valid JSON object. Do not use Markdown fences.';
    messages.unshift({ role: 'system', content: schemaInstruction });
  }

  return messages;
};

const isRetryableStatus = (status: number) =>
  status === 404 ||
  status === 408 ||
  status === 409 ||
  status === 429 ||
  status >= 500;

export const requestTokenRouter = async (
  request: GenerateRequest,
  config: TokenRouterConfig = getTokenRouterConfig(),
  fetchImpl: typeof fetch = fetch,
): Promise<TokenRouterResult> => {
  if (!config.apiKey) {
    throw new UpstreamError(
      'TokenRouter is not configured on the server.',
      503,
      'TOKENROUTER_NOT_CONFIGURED',
    );
  }

  const selectedModels = request.imageBase64
    ? config.visionModels
    : config.models;
  if (selectedModels.length === 0) {
    throw new UpstreamError(
      'TokenRouter vision is not configured. Add a multimodal model to TOKENROUTER_VISION_MODELS.',
      422,
      'TOKENROUTER_VISION_NOT_CONFIGURED',
    );
  }

  const schema = request.schema
    ? (normalizeJsonSchema(request.schema) as Record<string, unknown>)
    : undefined;
  const requireJson = Boolean(schema || request.requireJson);
  const responseModes: Array<
    'text' | 'json_schema' | 'json_object' | 'prompt_json'
  > = schema
    ? ['json_schema', 'json_object', 'prompt_json']
    : requireJson
      ? ['json_object', 'prompt_json']
      : ['text'];

  let lastError: UpstreamError | undefined;

  for (const model of selectedModels) {
    for (const responseMode of responseModes) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
      const body: Record<string, unknown> = {
        model,
        messages: buildMessages(request, schema, responseMode),
        stream: false,
      };

      if (responseMode === 'json_schema' && schema) {
        body.response_format = {
          type: 'json_schema',
          json_schema: {
            name: 'kairo_response',
            strict: false,
            schema,
          },
        };
      } else if (responseMode === 'json_object') {
        body.response_format = { type: 'json_object' };
      }

      try {
        const response = await fetchImpl(`${config.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'Kairo/6.0 (server-side AI gateway)',
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        const rawBody = await response.text();
        let payload: unknown;
        try {
          payload = rawBody ? JSON.parse(rawBody) : {};
        } catch {
          payload = {};
        }

        if (response.ok) {
          const record = payload as Record<string, unknown>;
          return {
            text: getCompletionText(payload),
            model: typeof record.model === 'string' ? record.model : model,
            usage:
              record.usage && typeof record.usage === 'object'
                ? (record.usage as Record<string, unknown>)
                : undefined,
          };
        }

        const upstreamMessage = extractErrorMessage(
          payload,
          `TokenRouter request failed with status ${response.status}.`,
        );
        const code =
          response.status === 401 || response.status === 403
            ? 'TOKENROUTER_AUTH_FAILED'
            : response.status === 429
              ? 'TOKENROUTER_RATE_LIMITED'
              : 'TOKENROUTER_REQUEST_FAILED';
        lastError = new UpstreamError(
          upstreamMessage,
          response.status,
          code,
        );

        if (
          response.status === 400 &&
          responseMode !== responseModes.at(-1)
        ) {
          continue;
        }
        break;
      } catch (error) {
        if (error instanceof UpstreamError) throw error;
        const isTimeout =
          error instanceof Error && error.name === 'AbortError';
        lastError = new UpstreamError(
          isTimeout
            ? 'TokenRouter request timed out.'
            : 'Could not reach TokenRouter.',
          isTimeout ? 504 : 502,
          isTimeout ? 'TOKENROUTER_TIMEOUT' : 'TOKENROUTER_UNREACHABLE',
        );
        break;
      } finally {
        clearTimeout(timeout);
      }
    }

    if (lastError && !isRetryableStatus(lastError.status)) break;
  }

  throw (
    lastError ||
    new UpstreamError(
      'All TokenRouter models failed.',
      502,
      'ALL_MODELS_FAILED',
    )
  );
};

export const MAX_PROMPT_CHARS = 30_000;
export const MAX_SYSTEM_INSTRUCTION_CHARS = 20_000;
export const MAX_MESSAGE_COUNT = 40;
export const MAX_TOTAL_MESSAGE_CHARS = 60_000;
export const MAX_SCHEMA_CHARS = 50_000;
export const MAX_ENCODED_IMAGE_CHARS = 7_000_000;
const MAX_SCHEMA_DEPTH = 16;
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const isValidMessage = (value: unknown): value is RequestMessage => {
  if (!value || typeof value !== 'object') return false;
  const message = value as Record<string, unknown>;
  return (
    (message.role === 'system' ||
      message.role === 'user' ||
      message.role === 'assistant') &&
    typeof message.content === 'string' &&
    message.content.trim().length > 0 &&
    message.content.length <= MAX_PROMPT_CHARS
  );
};

const hasSafeSchemaShape = (
  value: unknown,
  depth = 0,
  seen = new WeakSet<object>(),
): boolean => {
  if (depth > MAX_SCHEMA_DEPTH) return false;
  if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) {
    return true;
  }
  if (typeof value !== 'object') return false;
  if (seen.has(value)) return false;
  seen.add(value);

  if (Array.isArray(value)) {
    return value.every((child) => hasSafeSchemaShape(child, depth + 1, seen));
  }

  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return false;
  return Object.entries(value as Record<string, unknown>).every(
    ([key, child]) =>
      key !== '__proto__' &&
      key !== 'prototype' &&
      key !== 'constructor' &&
      hasSafeSchemaShape(child, depth + 1, seen),
  );
};

const isValidBase64 = (value: string) =>
  value.length > 0 &&
  value.length % 4 === 0 &&
  /^[A-Za-z0-9+/]+={0,2}$/.test(value);

export const validateGenerateRequest = (body: unknown): string | null => {
  if (!body || typeof body !== 'object') {
    return 'A JSON request body is required.';
  }
  const request = body as GenerateRequest;
  const hasPrompt =
    typeof request.prompt === 'string' && request.prompt.trim().length > 0;
  const hasMessages =
    Array.isArray(request.messages) &&
    request.messages.length > 0 &&
    request.messages.every(isValidMessage);

  if (!hasPrompt && !hasMessages) {
    return 'Provide a non-empty prompt or a valid messages array.';
  }
  if (hasPrompt && request.prompt!.length > MAX_PROMPT_CHARS) {
    return `The prompt is too long. Maximum length is ${MAX_PROMPT_CHARS} characters.`;
  }
  if (Array.isArray(request.messages)) {
    if (request.messages.length > MAX_MESSAGE_COUNT) {
      return `Too many messages. Maximum count is ${MAX_MESSAGE_COUNT}.`;
    }
    if (!request.messages.every(isValidMessage)) {
      return 'Each message must have a valid role and non-empty text content.';
    }
    const totalMessageChars = request.messages.reduce(
      (total, message) => total + message.content.length,
      0,
    );
    if (totalMessageChars > MAX_TOTAL_MESSAGE_CHARS) {
      return 'The combined message history is too long.';
    }
  }
  if (
    request.systemInstruction !== undefined &&
    (typeof request.systemInstruction !== 'string' ||
      request.systemInstruction.length > MAX_SYSTEM_INSTRUCTION_CHARS)
  ) {
    return 'The system instruction is invalid or too long.';
  }
  if (request.requireJson !== undefined && typeof request.requireJson !== 'boolean') {
    return 'requireJson must be a boolean.';
  }
  if (request.schema !== undefined) {
    if (!hasSafeSchemaShape(request.schema)) {
      return 'The response schema is invalid or too deeply nested.';
    }
    let encodedSchema = '';
    try {
      encodedSchema = JSON.stringify(request.schema);
    } catch {
      return 'The response schema must be JSON serializable.';
    }
    if (encodedSchema.length > MAX_SCHEMA_CHARS) {
      return 'The response schema is too large.';
    }
  }
  if (request.imageBase64 !== undefined) {
    if (typeof request.imageBase64 !== 'string' || !isValidBase64(request.imageBase64)) {
      return 'The image must be valid base64 data.';
    }
    if (request.imageBase64.length > MAX_ENCODED_IMAGE_CHARS) {
      return 'The image is too large. Maximum file size is approximately 5 MB.';
    }
    if (
      typeof request.imageMimeType !== 'string' ||
      !ALLOWED_IMAGE_MIME_TYPES.has(request.imageMimeType.toLowerCase())
    ) {
      return 'The image type must be JPEG, PNG, or WebP.';
    }
    if (hasMessages) {
      return 'Image requests must use a prompt instead of a messages array.';
    }
  } else if (request.imageMimeType !== undefined) {
    return 'imageMimeType requires imageBase64.';
  }
  return null;
};
