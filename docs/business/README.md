# SessionScape business requirements

Status: Redefined product direction; ready for customer discovery
Last updated: 2026-09-06

SessionScape is being redefined as the intelligence and action layer for massage businesses. It connects to an existing booking platform, detects unused capacity and retention opportunities, recommends focused actions, and measures booking outcomes. The connected booking platform remains the system of record.

## Documents

| Document | Purpose |
| --- | --- |
| [Core business requirements](business-requirements.md) | Defines the customer, problem, MVP, dashboard, value, scope, metrics, pricing hypotheses, and decision gates. |
| [Booking-platform integration requirements](booking-addon-requirements.md) | Defines the connector model, provider selection, source-data rules, link-based booking, and gates for future write capabilities. |
| [Validation plan](validation-plan.md) | Tests the revenue problem, dashboard usefulness, data trust, provider selection, actions, and willingness to pay. |
| [Blog and provider community requirements](community-requirements.md) | Historical expansion proposal; outside the redefined MVP. |
| [Global readiness requirements](global-readiness-requirements.md) | Requirements for activating data, messaging, and commercial capabilities by market. |
| [Data persistence and security](../data-persistence-security.md) | Storage, tenancy, retention, backup, authentication, and security baseline; must be revised against the connected-data model before production. |

## Current decisions

| Decision | Status |
| --- | --- |
| Product role | Intelligence and action layer for massage businesses |
| Booking strategy | Integrate with existing platforms; no MVP scheduler |
| Initial provider | One provider; Square is the leading candidate pending validation |
| Initial buyer | Owner/operator of an independent practice or small studio |
| Core outcomes | Fill capacity, improve retention, recover cancellations, grow attributable revenue |
| Initial booking action | Return clients to the existing provider's booking flow |
| Client outreach | Owner-reviewed; direct delivery gated by consent and market controls |
| Clinical and health data | Out of scope |
| Session-theme builder | Earlier prototype; outside the redefined MVP |
| Community and editorial | Outside the redefined MVP |
| Name | Working name pending availability review |

## Historical documents

The previous session-design direction is retained for traceability:

- [Legacy session-design business requirements](legacy-session-design-business-requirements.md)
- [Legacy booking add-on requirements](legacy-booking-addon-requirements.md)
- [Legacy session-design validation plan](legacy-session-design-validation-plan.md)
- [Legacy business requirements index](legacy-business-requirements-index.md)
