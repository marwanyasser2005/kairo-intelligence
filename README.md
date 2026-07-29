# Kairo

Kairo is a React/Vite sustainability-intelligence platform with a server-side
Gemini multi-model gateway. Provider keys stay on the server and never enter
the browser bundle.

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

   - text/chat: `gemini-3.1-flash-lite`, then `gemini-3.5-flash`, then Gemma 4;
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

`React feature -> services/aiClient.ts -> /api/ai/generate -> aiGateway.ts -> Gemini`

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

TokenRouter remains available as an optional legacy fallback. To enable it,
configure its environment variables and set:

```dotenv
AI_ENABLE_TOKENROUTER_FALLBACK=true
```

It is disabled by default because the current TokenRouter free model exceeded
Kairo's production timeout on large structured reports.
