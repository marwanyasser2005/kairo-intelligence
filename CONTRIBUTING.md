# Contributing to KAIRO Intelligence

Thank you for helping improve KAIRO. Changes should make environmental decisions clearer, safer, more measurable, or more accessible.

## Before opening a pull request

1. Create a focused branch from **main**.
2. Keep credentials and local environment files out of Git.
3. Preserve Arabic and English layout direction and meaning.
4. Distinguish measurements, user inputs, calculations, estimates, and forecasts.
5. Do not replace deterministic calculations with generated values.
6. Add or update tests for behavior, security boundaries, and responsive UI.
7. Run the quality gates:

~~~bash
npm run lint
npm test
npm run build
npm run verify:seo
~~~

## Product standards

- Recommendations must include an actionable next step and a way to measure the outcome.
- Health and engineering content must be framed as decision support, not diagnosis or certification.
- AI output must remain bounded by provided evidence and declared assumptions.
- New UI must follow the KAIRO Apple Glass design tokens, accessible contrast, keyboard navigation, reduced-motion behavior, and mobile safe areas.
- Upstream provider and model identities must not appear in public UI or API errors.

## Pull request format

Describe:

- the problem and target audience;
- the decision or workflow improved;
- screenshots for visual changes at desktop and mobile sizes;
- tests performed;
- security, privacy, and data implications;
- any migration or environment-variable changes.

By contributing, you confirm that you have the right to submit the work and that it contains no private data or credentials.
