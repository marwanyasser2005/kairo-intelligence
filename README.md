# Kairo

Kairo is a React/Vite sustainability-intelligence platform with a server-side,
multi-provider AI gateway. Provider keys and upstream model identities stay on
the server and never enter the browser bundle or public API responses.

## Requirements

- Node.js 20.19+ or 22.12+
- A Google AI Studio API key with Gemini Developer API access

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and set:

   ```dotenv
   GEMINI_API_KEY=your-google-ai-studio-key
   ```

   The defaults route workloads across free models that were verified for this
   project:

   - text/chat: `gemini-3.5-flash`, then `gemini-3.1-flash-lite`, then Gemma 4;
   - structured JSON: `gemini-3.5-flash`, then `gemini-3.1-flash-lite`, then
     Gemma 4;
   - image/OCR: `gemini-3.5-flash`, then `gemini-3.1-flash-lite`.

   `gemini-2.5-flash` and `gemini-2.5-flash-lite` are intentionally not in the
   defaults. Google currently returns `404` for both on new accounts and asks
   clients to use newer models.

3. Start the frontend and API gateway together:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000`.

## Verification

```bash
npm run typecheck
npm test
npm run build
npm run verify:gemini
```

The final command makes one small structured-output request. It reports only
the endpoint, configured model names, and result; it never prints the API key.

## Production

```bash
npm run build
npm start
```

Add `GEMINI_API_KEY` as a server environment variable in Vercel. Do not use a
`VITE_` prefix for secrets.

## AI request path

`React feature -> services/aiClient.ts -> /api/ai/generate -> aiGateway.ts -> provider pool`

The gateway supports:

- text, multi-turn chat, and Arabic responses;
- native image input for bill and receipt analysis;
- JSON Schema structured output;
- capability-aware text, JSON, and vision model pools;
- automatic model fallback on quota limits, unavailable models, timeouts, and
  transient provider errors;
- a shared 80-second total deadline so fallback remains inside Vercel's
  function duration;
- disabled reasoning budget by default for predictable interactive latency;
- input limits, local rate limiting, and secret-safe health/error responses.
- product-branded public responses that do not disclose upstream provider or
  model identifiers.

## Proof of Impact

`/proof` converts KAIRO recommendations into a reviewable before/after record:

- action, owner, date, fixed comparison scope, and confounders;
- period-normalised energy, water, food-waste, carbon, and cost measurements;
- baseline and follow-up evidence references plus deterministic savings;
- an exportable JSON evidence pack;
- an AI evidence review that is constrained to the calculated data and may not
  invent measurements, causality, certification, or independent verification.

### Security controls

- AI requests are accepted only as bounded JSON and same-origin browser calls.
- Prompts, histories, schemas, images, MIME types, and uploaded file signatures
  are validated before any provider request.
- CSP, clickjacking protection, restrictive permissions, no-store API responses,
  bounded in-memory rate limiting, and public error redaction are applied across
  Express, Vercel, and the Cloudflare worker.
- Supabase data is owner-isolated with forced RLS and bounded JSON payloads.
- `AI_ALLOWED_ORIGINS` may list trusted preview origins. Configure
  `AI_TRUST_PROXY_HOPS` only for a known reverse-proxy topology.
- UI copy blocking is deterrence, not DRM: browser-delivered content can still be
  recovered through developer tools, screenshots, or network inspection.

TokenRouter remains available as an optional legacy fallback. To enable it,
configure its environment variables and set:

```dotenv
AI_ENABLE_TOKENROUTER_FALLBACK=true
```

It is disabled by default because the current TokenRouter free model exceeded
Kairo's production timeout on large structured reports.

AgentRouter is available as the preferred optional OpenAI-compatible fallback.
Its key is server-only and its models are selected through environment values:

```dotenv
AI_ENABLE_AGENTROUTER_FALLBACK=true
AGENTROUTER_API_KEY=server-side-secret
AGENTROUTER_BASE_URL=https://agentrouter.org/v1
AGENTROUTER_MODELS=glm-5.1,kimi-k2.6
```

TaBiAI is supported as another server-only OpenAI-compatible fallback after
AgentRouter and before the legacy TokenRouter route:

```dotenv
AI_ENABLE_TABIAI_FALLBACK=true
TABIAI_API_KEY=server-side-secret
TABIAI_BASE_URL=https://tabitoken.com/v1
TABIAI_MODELS=claude-opus-5-thinking,claude-opus-5,claude-opus-4-8-thinking,claude-opus-4-8
TABIAI_TIMEOUT_MS=60000
```

The current TaBiAI catalogue is treated as text and structured-output only
unless `TABIAI_VISION_MODELS` is explicitly configured with a verified
multimodal model. Run `npm run verify:tabiai` to verify one live text request.
