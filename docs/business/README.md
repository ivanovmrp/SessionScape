# SessionScape business requirements

Status: Draft for therapist discovery
Last updated: 2026-07-18

This folder turns the current proof of concept into a set of testable business decisions and requirements. It does not authorize production collection of client health information, native payments, or a worldwide launch.

## Documents

| Document | Purpose |
| --- | --- |
| [Core business requirements](business-requirements.md) | Defines target users, value, registration reasons, packaging, outcomes, and business requirements. |
| [Booking add-on requirements](booking-addon-requirements.md) | Evaluates whether booking should exist, what makes it valuable, and the gates for a paid add-on. |
| [Blog and provider community requirements](community-requirements.md) | Defines public editorial content, registered-provider discussion, moderation, access, and launch gates. |
| [Global readiness requirements](global-readiness-requirements.md) | Defines how the service can expand globally without treating legal, payment, and professional rules as universal. |
| [Validation plan](validation-plan.md) | Provides interviews, prototype tests, pricing tests, metrics, and go/no-go criteria. |
| [Data persistence and security](../data-persistence-security.md) | Selects PostgreSQL and defines storage, tenancy, retention, backup, authentication, and application-security requirements. |

## Current recommendation

1. Keep session design and preparation as the product's core identity.
2. Let visitors explore themes without an account. Ask them to register when they want durable value: save, reuse, synchronize, brand, and improve their work.
3. Add a free external booking link or lightweight calendar connection before building a booking engine.
4. Treat native booking as an optional paid module only if therapists demonstrate demand for the connected booking-to-blueprint workflow.
5. Make the planning product globally adaptable, but activate booking, payments, messaging, and client-data features market by market.
6. Keep the owner-run blog public; offer a moderated discussion community to registered providers and validate participation before treating it as paid-plan value.

## Decision status

| Decision | Status |
| --- | --- |
| Core value proposition | Hypothesis ready for therapist validation |
| Registration value exchange | Recommended for private beta |
| Native booking | Conditional; not approved for build yet |
| Public blog | Recommended; owner/editor published content |
| Provider forum | Conditional beta; registration and moderation required |
| Booking price | Experiment range only; not a published price |
| Global availability | Conditional, phased by capability and jurisdiction |
| Clinical records / SOAP notes | Out of scope |
