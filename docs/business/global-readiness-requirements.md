# Global readiness requirements

Status: Phased proposal
Last updated: 2026-07-18

## Short answer

Yes, SessionScape can be used globally as a session-design product, but it cannot responsibly launch every capability everywhere at once.

Global use must be defined as a matrix:

| Layer | Global potential | Release rule |
| --- | --- | --- |
| Public theme content and temporary builder | High | Localized, culturally reviewed, accessible, and clearly non-clinical |
| Therapist accounts and saved private blueprints | Moderate | Privacy terms, security, support, deletion, export, and data-transfer basis approved |
| Client preference profiles | Higher risk | Data-role, sensitive-data, retention, consent, and market review approved |
| Booking and transactional messages | Market dependent | Local time, consumer, messaging, and professional rules approved |
| Payments, deposits, payouts, and taxes | Strongly market dependent | Payment-provider coverage and financial/legal operations approved |
| Credential verification | Jurisdiction specific | Integrate only with authoritative registries; otherwise use clear attestation |

Language availability does not equal market readiness. The current English and Russian prototype is useful localization evidence, but production translation, local terminology, privacy notices, customer support, pricing, and professional review are separate requirements.

## Global product principles

1. **One core product, jurisdiction packs:** keep universal workflow separate from market-specific legal text, credentials, consent wording, taxes, currencies, and payment capability.
2. **Data minimization first:** avoid health and clinical data until there is a deliberate market and compliance decision.
3. **Therapist responsibility remains visible:** SessionScape organizes professional work; it does not authorize a person to practice or define a universal scope of practice.
4. **Capability-level activation:** a market may have public content without accounts, accounts without client profiles, or booking without payments.
5. **No silent cross-border assumptions:** data storage, subprocessors, transfers, and support access are documented for each activated region.
6. **Human-reviewed localization:** professional, anatomical, consent, and safety language is not released through machine translation alone.

## Market activation model

Each user workspace shall have a home market. A market configuration controls:

- Supported interface and content languages.
- Legal entity, terms, privacy notice, and data-processing addendum.
- Therapist credential labels and attestation wording.
- Allowed client fields and retention defaults.
- Currency, tax display, decimal rules, date/time formats, address formats, and units.
- Booking, email, SMS, payment, refund, and payout availability.
- Local emergency, consumer-support, and complaint information if required.
- Prohibited or restricted content and services.
- Approved subprocessors and data regions.

Changing a workspace's home market shall trigger review of affected terms, data, payment accounts, and capabilities rather than functioning as a cosmetic setting.

## Global functional requirements

### Identity, language, and locale

| ID | Requirement |
| --- | --- |
| GL-01 | A user selects a language independently from the workspace's legal home market. |
| GL-02 | The UI supports Unicode, text expansion, pluralization, locale-aware sorting, and right-to-left layout before an RTL language is released. |
| GL-03 | Dates, times, numbers, currency, names, telephone numbers, and addresses are formatted by locale without assuming US structure. |
| GL-04 | The source language and every released translation have a version, reviewer, approval state, and fallback behavior. |
| GL-05 | Professional and consent content receives human review by a qualified in-market language reviewer and a practicing or regulatory subject-matter reviewer. |
| GL-06 | Search and exported documents use the selected content language and preserve characters correctly. |

### Professional scope and credentials

| ID | Requirement |
| --- | --- |
| GL-07 | Registration asks the practitioner to identify home market and applicable professional designation using market-appropriate terms. |
| GL-08 | Initial releases use practitioner attestation and do not display a "verified" badge unless an authoritative source has been checked. |
| GL-09 | Content is tagged as universal, market approved, market restricted, or unavailable. |
| GL-10 | A therapist cannot infer that SessionScape registration grants permission to practice. |
| GL-11 | Market packs link to authoritative licensing or regulatory resources where reliable sources exist. |
| GL-12 | Technique instructions, diagnosis, treatment claims, and jurisdiction-specific clinical documentation remain outside the global core. |

Even within the United States, requirements vary across jurisdictions. FSMTB lists different regulatory statuses, education hours, continuing-education rules, and renewal periods, and advises checking the relevant board for current information ([FSMTB regulated jurisdictions](https://fsmtb.org/about-fsmtb/member-boards/)). A worldwide credential rule would therefore be unsafe and inaccurate.

### Privacy and data governance

| ID | Requirement |
| --- | --- |
| GL-13 | Before account launch in a market, document whether SessionScape acts as controller, processor/service provider, or both for each data flow. |
| GL-14 | Every field has a stated purpose, legal basis or business justification, retention period, residency/transfer path, access roles, and deletion behavior. |
| GL-15 | Users can access, correct, export, and request deletion of supported personal data through a documented process. |
| GL-16 | Client preference data is segregated by tenant and encrypted in transit and at rest. |
| GL-17 | Sensitive data and free-form clinical notes are blocked from the initial global product; incident and support processes address accidental entry. |
| GL-18 | Subprocessors, storage regions, cross-border support access, and international transfer mechanisms are documented before activation. |
| GL-19 | Product analytics exclude client identifiers and preference content and respect regional consent requirements. |
| GL-20 | Privacy notices are concise, localized, versioned, and presented at collection points. |

The EU GDPR may apply to a company outside the EU when it offers goods or services, paid or free, to people in the EU ([European Commission: who GDPR applies to](https://commission.europa.eu/law/law-topic/data-protection/rules-business-and-organisations/application-regulation/who-does-data-protection-law-apply_en)). Its core principles include purpose limitation, data minimization, storage limitation, and appropriate safeguards ([European Commission: processing principles](https://commission.europa.eu/law/law-topic/data-protection/rules-business-and-organisations/principles-gdpr/overview-principles/what-data-can-we-process-and-under-which-conditions_en)). GDPR protection also continues when data is transferred outside the EU, requiring an approved transfer basis or applicable safeguard ([European Commission: transfers outside the EU](https://commission.europa.eu/law/law-topic/data-protection/rules-business-and-organisations/obligations/what-rules-apply-if-my-organisation-transfers-data-outside-eu_en)). These requirements make accidental worldwide account activation inappropriate.

### Booking, messaging, and payments

| ID | Requirement |
| --- | --- |
| GL-21 | Availability uses IANA time zones and displays the booking time zone before confirmation. |
| GL-22 | Cancellation, refund, deposit, price, tax, and consumer disclosures are versioned per market. |
| GL-23 | Transactional and marketing messages are separated; marketing is disabled until its consent and unsubscribe rules are approved. |
| GL-24 | SMS is enabled only where sender registration, consent, quiet-hours, content, delivery, and opt-out rules are implemented. |
| GL-25 | Payment onboarding, identity verification, currencies, payout methods, refunds, disputes, negative balances, and tax operations are tested per market. |
| GL-26 | SessionScape does not claim global payment coverage based only on the client's ability to use a card. Provider onboarding and payouts must also be supported. |
| GL-27 | Unsupported markets can use external booking links without being shown unavailable native payment controls. |

Payment coverage is not universal. Stripe's current availability page lists supported countries and regions and distinguishes full support, preview, and extended-network access ([Stripe global availability](https://stripe.com/global)). Provider country support, client payment method, payout country, and SessionScape's platform model must all be evaluated.

### Accessibility and support

| ID | Requirement |
| --- | --- |
| GL-28 | Core therapist and client journeys target WCAG 2.2 AA and include manual assistive-technology testing. |
| GL-29 | Support hours, language, response expectation, and emergency limitations are visible for each supported market. |
| GL-30 | Critical safety and privacy help is available in every released interface language. |
| GL-31 | The product supports low-bandwidth and mobile use and avoids relying on color, animation, audio, or fine motor precision. |

WCAG 2.2 is a W3C Recommendation and is also ISO/IEC 40500:2025, making it a suitable global baseline even though local legal standards still require review ([W3C WCAG 2 overview](https://www.w3.org/WAI/standards-guidelines/wcag/)).

## Jurisdiction readiness checklist

A capability may be activated for a new market only when the release record includes:

- Named business owner, legal reviewer, privacy reviewer, security reviewer, localization reviewer, and in-market professional reviewer.
- Intended users and whether the service is explicitly targeting people in that market.
- Applicable professional designations, scope disclaimers, and prohibited claims.
- Approved terms, privacy notice, data roles, retention schedule, and request process.
- Hosting and subprocessor locations plus transfer mechanism where needed.
- Supported languages and completed linguistic/functional QA.
- Currency, taxes, invoices/receipts, consumer cancellation/refund, and price-display rules.
- Payment and payout provider approval if payments are enabled.
- Email/SMS consent, sender, opt-out, and recordkeeping rules if messaging is enabled.
- Accessibility acceptance report.
- Incident response, support, complaint, and capability-disable procedure.
- A dated go/no-go decision and next review date.

This checklist is a product-control requirement, not legal advice. Qualified counsel and in-market professional review are required before launch.

## Recommended rollout

### Stage 1: globally viewable proof of concept

- Public informational content and temporary local builder.
- No production client records or native payments.
- Clear professional and geographic limitations.
- Analytics minimized and consent-managed where applicable.

### Stage 2: one-market private beta

- Choose one home jurisdiction based on founder access to therapists, support ability, and counsel.
- Therapist accounts, saved blueprints, deletion/export, and no clinical records.
- English first unless another language has equal support and review readiness.
- External booking links only.

### Stage 3: small English-language expansion

- Add jurisdictions individually; do not use "English-speaking" as a compliance category.
- Approve privacy, professional, tax, consumer, and support requirements for each.
- Add localized spelling, terminology, date/time, currency, and address behavior.

### Stage 4: localized accounts and booking

- Release one new language/market combination at a time.
- Use the [booking requirements](booking-addon-requirements.md) and separate booking from payment activation.
- Monitor support, abandonment, translation defects, privacy requests, and booking failures by market.

## Global success and guardrail measures

- Blueprint completion and prepared-session rate by locale and market.
- Registration and week-four retention by locale and market.
- Translation defect rate and time to correct critical content.
- Privacy request completion within the applicable deadline.
- Percentage of market-capability combinations with a current approval record: target 100%.
- Cross-tenant data incidents: target 0.
- Bookings shown in the wrong time zone or currency: target 0.
- Unsupported payment or messaging activation: target 0.

External regulatory and provider facts were checked on 2026-07-18 and require review before each market decision.
