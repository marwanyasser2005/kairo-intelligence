# Kairo TokenRouter migration and audit

**Audit date:** 2026-07-24  
**Provider:** TokenRouter OpenAI-compatible API  
**Security model:** same-origin server gateway; provider credentials are server-only

## Executive result

All Kairo AI features now use a shared browser-safe client and Express gateway.
The gateway translates text, chat, structured JSON, and optional vision
requests into OpenAI-compatible chat completions. The TokenRouter secret is
read only by the server from `.env.local` or the deployment environment and is
never injected into the Vite browser bundle.

## AI feature coverage

- Exposure, water, food, energy, transport, e-waste, and context agents
- Kairo chat with multi-turn history
- Live Monitor insight generation
- Scenario comparison, decision narration, weekly review, and session story
- Climate plan and CSR claim verification
- Optional electricity, water, receipt, and e-waste image analysis when a
  compatible vision model is configured

All runtime paths use `services/tokenRouterClient.ts` and
`services/tokenRouterService.ts`.

## Reliability and security controls

- Base URL, text models, vision models, and timeouts are server-configurable.
- Text and vision model lists are separated to prevent sending images to a
  text-only model.
- Transient 404/408/409/429/5xx responses advance to the next eligible model.
- Structured calls try `json_schema`, then `json_object`, then prompt-enforced
  JSON for compatibility.
- Legacy uppercase schema types are normalized to standard JSON Schema types.
- Requests have input limits, timeouts, local per-IP rate limits, and
  secret-safe error responses.
- The health endpoint reports configuration and model names without returning
  credentials.

## Live TokenRouter verification

The supplied key was checked directly without printing it:

- Model-list request: HTTP 200.
- Text completion with `z-ai/glm-5.2-free`: HTTP 200 and the exact requested
  sentinel response.
- JSON Schema completion: HTTP 200 with valid structured JSON.
- The free GLM model rejected image input because it is text-only.
- The alternate free multimodal-looking model exposed to this key rejected the
  request because the account had no available credit.

Kairo therefore enables all text and structured-analysis workflows with the
free GLM model. Image OCR stays intentionally unconfigured and returns a clear
local error until an account-accessible multimodal model is placed in
`TOKENROUTER_VISION_MODELS`.

## Verification checklist

- TypeScript typecheck: passed with zero diagnostics.
- Automated gateway tests: 6/6 passed.
- Production Vite build: passed; 2,939 modules transformed.
- Live TokenRouter completion: passed using the configured free model.
- Production server smoke test: page HTTP 200 and end-to-end completion passed.
- Bundle scan: zero provider-secret matches.
- Legacy provider scan: zero source, bundle, or filename matches.
- npm dependency audit: zero known vulnerabilities.
