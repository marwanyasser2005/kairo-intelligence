// Browser-safe AI client. All provider requests go through the same-origin
// server gateway, so provider API keys never enter the Vite bundle or browser.

export const DEFAULT_AI_MODEL = 'kairo-intelligence';

interface GatewayMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface GatewayResponse {
    text: string;
    model: string;
}

interface GeneratePayload {
    prompt?: string;
    messages?: GatewayMessage[];
    schema?: Record<string, unknown>;
    systemInstruction?: string;
    requireJson?: boolean;
    imageBase64?: string;
    imageMimeType?: string;
}

export type KairoAIRequestStatus = 'busy' | 'ready' | 'error';

const emitAIStatus = (status: KairoAIRequestStatus, message?: string) => {
    if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return;
    window.dispatchEvent(
        new CustomEvent('kairo:ai-status', {
            detail: { status, message, timestamp: Date.now() },
        }),
    );
};

const callGateway = async (payload: GeneratePayload): Promise<GatewayResponse> => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 95_000);
    emitAIStatus('busy');

    try {
        const response = await fetch('/api/ai/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            const message =
                typeof data?.error === 'string'
                    ? data.error
                    : `AI request failed with status ${response.status}.`;
            throw new Error(message);
        }

        if (typeof data?.text !== 'string' || !data.text.trim()) {
            throw new Error('The AI provider returned an empty response.');
        }

        const result: GatewayResponse = {
            text: data.text,
            // Upstream provider and model identities intentionally remain
            // server-side; the browser only receives the KAIRO product label.
            model: DEFAULT_AI_MODEL,
        };
        emitAIStatus('ready');
        return result;
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            const timeoutError = new Error('The AI request timed out.');
            emitAIStatus('error', timeoutError.message);
            throw timeoutError;
        }
        emitAIStatus('error', error instanceof Error ? error.message : 'AI request failed.');
        throw error;
    } finally {
        window.clearTimeout(timeout);
    }
};

const extractContents = (contents: unknown) => {
    if (typeof contents === 'string') {
        return { prompt: contents };
    }

    if (!contents || typeof contents !== 'object') {
        return { prompt: String(contents ?? '') };
    }

    const record = contents as Record<string, unknown>;
    const parts = Array.isArray(record.parts) ? record.parts : [];
    let prompt = '';
    let imageBase64: string | undefined;
    let imageMimeType: string | undefined;

    for (const part of parts) {
        if (!part || typeof part !== 'object') continue;
        const item = part as Record<string, unknown>;
        if (typeof item.text === 'string') prompt += item.text;

        if (item.inlineData && typeof item.inlineData === 'object') {
            const inlineData = item.inlineData as Record<string, unknown>;
            if (typeof inlineData.data === 'string') imageBase64 = inlineData.data;
            if (typeof inlineData.mimeType === 'string') {
                imageMimeType = inlineData.mimeType;
            }
        }
    }

    return { prompt, imageBase64, imageMimeType };
};

const normalizeHistory = (history: unknown[]): GatewayMessage[] =>
    history.flatMap((entry): GatewayMessage[] => {
        if (!entry || typeof entry !== 'object') return [];
        const record = entry as Record<string, unknown>;
        const role =
            record.role === 'model' || record.role === 'assistant'
                ? 'assistant'
                : record.role === 'system'
                    ? 'system'
                    : 'user';

        if (typeof record.content === 'string') {
            return [{ role, content: record.content }];
        }

        const parts = Array.isArray(record.parts) ? record.parts : [];
        const content = parts
            .map((part) =>
                part && typeof part === 'object' &&
                typeof (part as Record<string, unknown>).text === 'string'
                    ? ((part as Record<string, unknown>).text as string)
                    : '',
            )
            .join('');
        return content ? [{ role, content }] : [];
    });

const parseJsonText = (text: string): unknown => {
    const cleaned = text
        .trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, '');

    try {
        return JSON.parse(cleaned);
    } catch {
        const firstObject = cleaned.indexOf('{');
        const lastObject = cleaned.lastIndexOf('}');
        const firstArray = cleaned.indexOf('[');
        const lastArray = cleaned.lastIndexOf(']');
        const candidates = [
            firstObject >= 0 && lastObject > firstObject
                ? cleaned.slice(firstObject, lastObject + 1)
                : '',
            firstArray >= 0 && lastArray > firstArray
                ? cleaned.slice(firstArray, lastArray + 1)
                : '',
        ].filter(Boolean);

        for (const candidate of candidates) {
            try {
                return JSON.parse(candidate);
            } catch {
                // Try the next JSON-looking segment.
            }
        }
        throw new Error('The AI provider returned invalid JSON.');
    }
};

export const generateFromAPI = async (
    prompt: string,
    schema?: Record<string, unknown>,
    systemInstruction?: string,
    imageBase64?: string,
    imageMimeType?: string,
): Promise<any> => {
    const response = await callGateway({
        prompt,
        schema,
        systemInstruction,
        requireJson: Boolean(schema),
        imageBase64,
        imageMimeType: imageBase64 ? imageMimeType || 'image/jpeg' : undefined,
    });

    return schema ? parseJsonText(response.text) : response.text;
};

export class AIClient {
    public models: {
        generateContent: (args: any) => Promise<{ text: string; model: string }>;
    };

    public chats: {
        create: (args: any) => {
            sendMessage: (messageArgs: any) => Promise<{ text: string; model: string }>;
        };
    };

    constructor() {
        this.models = {
            generateContent: async (args: any) => {
                const content = extractContents(args?.contents);
                const response = await callGateway({
                    ...content,
                    schema: args?.config?.responseSchema,
                    systemInstruction: args?.config?.systemInstruction,
                    requireJson: args?.config?.responseMimeType === 'application/json',
                });
                return { text: response.text, model: response.model };
            },
        };

        this.chats = {
            create: (args: any) => {
                const history = normalizeHistory(args?.history || []);
                const systemInstruction = args?.config?.systemInstruction;

                return {
                    sendMessage: async (messageArgs: any) => {
                        const message =
                            typeof messageArgs === 'string'
                                ? messageArgs
                                : String(messageArgs?.message ?? '');
                        const liveContext =
                            typeof messageArgs?.context === 'string'
                                ? messageArgs.context.trim()
                                : '';
                        const response = await callGateway({
                            messages: [
                                ...history,
                                ...(liveContext
                                    ? [{ role: 'system' as const, content: liveContext }]
                                    : []),
                                { role: 'user', content: message },
                            ],
                            systemInstruction,
                        });
                        history.push({ role: 'user', content: message });
                        history.push({ role: 'assistant', content: response.text });
                        return { text: response.text, model: response.model };
                    },
                };
            },
        };
    }
}
