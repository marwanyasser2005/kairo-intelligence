# Security Policy

## Reporting a vulnerability

Please do **not** disclose suspected vulnerabilities, credentials, personal data, or exploit details in a public GitHub issue.

Send a private report to the project owner through the contact channel published on [kairo-ai.tech](https://www.kairo-ai.tech/). Include:

- the affected page, API route, or component;
- a concise impact assessment;
- reproducible steps using non-sensitive test data;
- relevant request/response metadata with secrets removed;
- a suggested mitigation, if available.

Do not access, modify, retain, or exfiltrate data that does not belong to you. Stop testing immediately if you encounter personal or confidential information.

## Scope

Security reports are especially welcome for:

- authentication or Row Level Security bypass;
- cross-user data access;
- server-side secret disclosure;
- origin, rate-limit, upload-validation, or schema-validation bypass;
- prompt injection that crosses a security boundary;
- stored or reflected script execution;
- unsafe report export or file handling.

## Public architecture guarantees

- AI credentials remain server-side.
- Public errors are redacted.
- Browser AI traffic uses a same-origin gateway.
- Cloud records are owner-isolated through Row Level Security.
- Uploads are bounded and validated by declared type and file signature.

## Supported version

Security fixes target the current production release and the **main** branch.
