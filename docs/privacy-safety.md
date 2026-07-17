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

## Scope note

HIPAA does not automatically apply to every massage practice, but health-adjacent personal information deserves a high privacy standard. Legal, licensing, insurance, and professional-association review should occur before a production launch and before supporting any health information.

