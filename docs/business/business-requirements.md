# Core business requirements

Status: Draft for validation
Last updated: 2026-07-18

## Executive decision

SessionScape should be positioned as a **session-design and preparation workspace for massage professionals**, not as a generic practice-management suite. Its most defensible value is helping a therapist turn client-stated preferences and a desired experience into a consistent, safe, reusable session blueprint.

The core promise is:

> Create a personalized, professional session plan in minutes, prepare the room with confidence, and remember what made the experience work - without turning SessionScape into a clinical record.

Registration must unlock continuing value. Browsing themes and trying the builder should remain available before registration; saving private work, reusing it, synchronizing it, and applying a therapist's brand should require an account.

## Business problem

Independent therapists must deliver work that feels personal while also maintaining consistency, boundaries, privacy, and a recognizable practice identity. The proof of concept demonstrates inspiration and plan generation, but it does not yet create enough durable value to justify an account or subscription.

The business must prove four assumptions:

1. Therapists spend meaningful effort planning, recalling preferences, and preparing sessions.
2. A reusable blueprint is more useful than a static theme or checklist.
3. Consent and preference prompts increase confidence without feeling like administrative burden or clinical direction.
4. The workflow improves client experience or therapist efficiency enough to support recurring payment.

These are hypotheses until validated through the [validation plan](validation-plan.md).

## Target users

### Primary segment: independent practitioner

A solo licensed, registered, certified, or otherwise lawfully practicing massage professional who designs their own services and wants to differentiate a small practice.

Primary jobs to be done:

- Turn a broad client goal into a coherent session experience.
- Recall preferences and exclusions without relying on scattered notes.
- Prepare the room, materials, timing, and client conversation consistently.
- Reuse a successful structure while adapting it for the next client.
- Explain a distinctive service professionally without making treatment claims.

### Secondary segment: small practice or spa lead

A lead therapist or owner who wants shared, approved experience standards while allowing practitioners to use professional judgment.

Primary jobs to be done:

- Create consistent service standards across staff.
- Onboard new therapists to the practice's experience and safety expectations.
- Control which templates are approved while preserving individual adaptation.
- Maintain brand consistency in client-facing descriptions.

### Not an initial target

- Consumers seeking self-treatment instructions.
- Uncredentialed people presenting themselves as regulated professionals.
- Hospitals or clinical practices requiring an electronic health record.
- Large chains needing enterprise workforce, payroll, inventory, or point-of-sale systems.

## Value proposition

| Value | Current pain addressed | Observable outcome |
| --- | --- | --- |
| Faster preparation | Planning is reconstructed from memory or separate tools. | A repeat session is prepared in under three minutes. |
| Consistent personalization | Generic protocols can feel impersonal; ad hoc work is hard to repeat. | Therapists reuse a blueprint and still change client-specific choices. |
| Safer professional workflow | Boundaries, pressure, aroma, and comfort require active communication. | Required prompts are reviewed without encouraging prohibited or clinical work. |
| Practice differentiation | Service menus often describe duration or modality, not the complete experience. | A therapist publishes or prints a clear, branded, non-medical experience description. |
| Learning loop | Useful client preferences and experience feedback are easily lost. | The next blueprint reflects prior, client-given preferences without storing clinical notes. |
| Team consistency | Small teams rely on verbal instructions or static manuals. | Approved templates are used and adapted with a visible revision history. |

Professional trust is part of the value, not only a compliance task. AMTA's Code of Ethics emphasizes privacy, professionalism, truthfulness, legal scope of practice, and avoiding harm; SessionScape should reinforce those behaviors in the workflow ([AMTA Core Documents](https://www.amtamassage.org/about/core-documents/)).

## Why a therapist would register

### Registration value exchange

SessionScape shall not require registration merely to view marketing pages, browse sample themes, or try a limited builder. Registration is justified when the therapist chooses to keep or operationalize work.

An account shall unlock:

1. A private library of saved and duplicated session blueprints.
2. Cross-device access and backup.
3. Favorites, custom themes, and reusable preparation defaults.
4. Minimal client preference profiles using client-chosen names or internal aliases.
5. Branded print and share outputs.
6. Version history for a blueprint and its source theme.
7. Optional feedback that helps improve a future session.
8. Later, connections to an existing calendar or the optional booking module.

The registration screen shall state what is stored, why it is stored, whether it is visible to clients, and how it can be exported or deleted.

### Trust conditions before registration

- Show a concise privacy summary before account creation.
- Do not imply that a saved browser-only prototype action is cloud-backed.
- Do not require client names, medical details, license documents, or payment details at registration.
- Explain that the therapist remains responsible for scope of practice, local rules, informed consent, and professional judgment.
- Provide account deletion and data export before inviting production use.

## Product packaging hypothesis

Pricing is a test range, not a launch commitment.

| Package | Intended value | Initial hypothesis |
| --- | --- | --- |
| Explorer | Browse themes and create a temporary plan; no cloud persistence. | Free, no account required |
| Professional | Save/reuse plans, preference profiles, branded outputs, cross-device access, and expanded themes. | Test USD 12-19/month or USD 120-190/year |
| Booking add-on | Connected availability, booking context, reminders, and session-preparation automation. | Test an additional USD 9-15/month plus disclosed usage/payment costs |
| Team | Shared approved templates, roles, staff workspaces, and change history. | Later, per workspace plus active practitioner seats |

The price study must compare not only willingness to pay but also the cost of replacing existing tools. Current booking competitors set a low reference point: Square offers a no-monthly-cost tier in the US and paid plans per location, while Fresha lists an independent plan at USD 19.95/month as of this document date ([Square Appointments pricing](https://squareup.com/us/en/appointments/pricing), [Fresha pricing](https://www.fresha.com/pricing)). SessionScape therefore should not charge for a generic calendar alone.

## Business requirements

| ID | Requirement | Acceptance evidence |
| --- | --- | --- |
| BR-01 | A new visitor can understand the product's job, audience, and professional boundary without registering. | At least 80% of usability participants accurately describe it after viewing the landing page. |
| BR-02 | A therapist can reach a useful first blueprint before the registration prompt. | Median time to first complete blueprint is at most five minutes in moderated testing. |
| BR-03 | Registration occurs at a durable-value moment, such as save, sync, or branded export. | The UI explains the account benefit and does not block initial exploration. |
| BR-04 | The private beta stores only the minimum account and preference data needed for the selected feature. | Data inventory maps every collected field to a purpose, retention rule, and access rule. |
| BR-05 | SessionScape never presents a blueprint as diagnosis, treatment prescription, or automatic technique instruction. | Content review finds no prohibited claims; therapist override and responsibility remain visible. |
| BR-06 | The product supports repeat use, not only one-time inspiration. | At least 40% of activated beta therapists return in week four; target to be revised after baseline data. |
| BR-07 | Every paid capability has a clear free-to-paid boundary and cancellation path. | Packaging page and in-product upgrade flow pass content and usability review. |
| BR-08 | The system can measure activation and retention without recording client names or blueprint content in analytics. | Analytics schema is reviewed for data minimization before beta. |
| BR-09 | Therapist-created content can be exported and deleted. | An authenticated user completes both workflows in acceptance testing. |
| BR-10 | Booking remains modular and can be disabled without reducing the core planning workflow. | Core acceptance tests pass for workspaces without the add-on. |
| BR-11 | Global expansion is controlled by a capability-by-market configuration. | Unsupported payment, messaging, and legal-content features cannot be enabled for an unapproved market. |
| BR-12 | Accessibility is a release requirement. | Critical journeys meet WCAG 2.2 AA through automated and manual testing. |

## North-star outcome and funnel

The proposed north-star outcome is **prepared sessions per active therapist per month**: a blueprint that is created or reused and reaches preparation mode. This measures delivered workflow value better than registrations or theme views.

Supporting funnel:

1. Visitor starts a blueprint.
2. Visitor completes a useful blueprint.
3. Therapist registers to save or reuse it.
4. Registered therapist prepares a second session within 14 days.
5. Therapist remains active in week four.
6. Therapist chooses a paid plan after experiencing repeat value.

### Guardrail measures

- Account deletion and export success rate.
- Consent/preparation prompt completion and abandonment.
- Number of support or safety reports per 100 active workspaces.
- Percentage of analytics events containing prohibited personal data: target 0%.
- Therapist-reported confidence that outputs stay within professional scope.

## Non-goals for the next validated release

- SOAP notes, diagnoses, medication histories, or treatment records.
- Insurance claims, medical billing, or clinical decision support.
- A public therapist marketplace.
- Automated credential verification across jurisdictions.
- Full point of sale, payroll, inventory, or marketing automation.
- Client accounts for minors.
- AI-generated hands-on technique or health recommendations.

## Business risks and responses

| Risk | Consequence | Required response |
| --- | --- | --- |
| The product is perceived as a collection of attractive checklists. | Low repeat use and low willingness to pay. | Test save/reuse, preference memory, and branded differentiation before expanding scope. |
| Registration is requested before value is visible. | Poor conversion and distrust. | Keep the first blueprint available without an account. |
| Booking makes the product indistinguishable from established suites. | High build cost and weak competitive position. | Build only the connected preparation workflow described in the add-on requirements. |
| Preference data drifts into health records. | Higher privacy, security, and regulatory exposure. | Enforce field-level scope, content warnings, retention controls, and no free-form clinical fields. |
| Global language availability is mistaken for legal readiness. | Regulatory and reputation risk. | Separate localization from market activation and use jurisdiction release gates. |
| Safety prompts feel like the platform is directing practice. | Scope-of-practice and liability concern. | Use reminders and client-choice language; preserve practitioner judgment and override. |

## Decision gates

1. **Private beta gate:** at least 8-12 target therapists complete discovery and prototype testing; the top three recurring jobs match the proposed value.
2. **Persistence gate:** security model, tenant isolation, deletion, export, and data inventory are reviewed before cloud saving of identifiable client preferences.
3. **Paid core gate:** at least five beta therapists independently indicate willingness to pay in a realistic checkout or deposit test, not only in an interview.
4. **Booking build gate:** the conditions in [Booking add-on requirements](booking-addon-requirements.md) are met.
5. **New-market gate:** the conditions in [Global readiness requirements](global-readiness-requirements.md) are met for that market and capability set.

## Research basis

- AMTA reports that 71% of US massage consumers in its 2025 survey used massage for a health or medical reason, reinforcing the need for careful professional claims and privacy boundaries even when SessionScape is not a clinical system ([AMTA Consumer Views & Use](https://www.amtamassage.org/publications/consumer-views-use-of-massage-therapy/)).
- AMTA's client guidance emphasizes informed explanations, pressure choice, confidentiality, appropriate draping, and the client's ability to stop or adjust a session ([What to Expect at Your Massage Session](https://www.amtamassage.org/find-massage-therapist/what-to-expect-at-massage-session/)).
- Established massage software already combines scheduling, reminders, payments, intake, notes, and follow-up, demonstrating both demand for workflow consolidation and a crowded all-in-one category ([MassageBook](https://pro.massagebook.com/)).

External facts and prices were checked on 2026-07-18 and should be rechecked before pricing or launch decisions.
