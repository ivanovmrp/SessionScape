# Privacy, safety, and professional boundaries

## Data minimization

The MVP stores only what it needs to personalize an experience: name or nickname, scent preference, music preference, preferred pressure, general focus/exclusion areas, and optional experience ratings. It must not ask for diagnoses, medication lists, detailed intake histories, SOAP notes, identity documents, or payment data.

## Safety guardrails

- Every aroma recommendation includes an unscented alternative, sensitivity check, and “do not ingest” notice. Topical use requires product-specific dilution and precaution guidance outside the generic recommendation.
- Sensitive-area choices (including gluteal work, hip work, or upper inner thigh proximity) require explicit consent, professional terminology, appropriate draping, and a clear option to decline or stop.
- Themes never claim to detoxify, cure, treat anxiety, or promise medical outcomes. Use “intended experience” language.
- The UI treats pressure, boundaries, and comfort as live decisions, not one-time configuration.

## Security baseline for the next build phase

- Encrypt data in transit and at rest.
- Use an established authentication provider; never implement password storage directly.
- Apply tenant isolation so one therapist/spa cannot access another’s data.
- Log access and sensitive configuration changes; give users export and deletion controls.
- Establish data-retention defaults before adding client accounts.

## Blog and community boundaries

- Published blog content is public and must distinguish owner/editor material, sources, corrections, and update dates from member discussion.
- Provider-only forum content is persistent professional publication, not private or clinically confidential communication.
- Posting forms prohibit client names, contact details, images, appointment details, diagnoses, medical histories, and other information that could identify a client.
- The first community release excludes direct messages, file uploads, anonymous posting, and client case-review workflows.
- Community profiles are minimal and professional; email, exact location, client information, and credential evidence are private by default.
- Members can report content and block other members. Moderators use documented reasons, audit trails, notices, appeals, and escalation procedures.
- Restricted Markdown or structured text, output encoding, rate limits, and server-side authorization protect user-generated content.
- Production community storage follows [Data persistence and security requirements](data-persistence-security.md), including deletion, pseudonymization, retention, backups, incident response, and privileged-access controls.

## Scope note

HIPAA does not automatically apply to every massage practice, but health-adjacent personal information deserves a high privacy standard. Legal, licensing, insurance, and professional-association review should occur before a production launch and before supporting any health information.
