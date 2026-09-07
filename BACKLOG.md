# SessionScape product backlog

Last updated: 2026-09-06

This backlog starts from the redefined intelligence-layer product. Earlier session-design work is retained in [LEGACY-BACKLOG.md](LEGACY-BACKLOG.md).

## Status definitions

- **Next:** ready to refine or begin after listed dependencies.
- **Later:** accepted direction, not yet scheduled.
- **Blocked:** requires the listed decision or evidence.
- **Done:** implemented and verified.

## Backlog

| ID | Priority | Status | Item | Dependencies | Completion evidence |
| --- | --- | --- | --- | --- | --- |
| BI-001 | P0 | Next | Run owner discovery and score capacity, retention, cancellation, actionability, provider, and payment evidence. | Recruitment and synthetic research materials | Decision report satisfies the validation-plan output and selects or rejects an initial segment and provider. |
| BI-002 | P0 | Next | Build a synthetic owner-dashboard prototype with metric explanations, freshness, partial-data states, and two recommendation types. | Metric definitions and representative fixtures | Target owners complete the validation tasks and calculations reconcile with fixtures. |
| BI-003 | P0 | Next | Verify the leading provider's current production access, scopes, data coverage, webhooks, booking links, restrictions, and economics. | Provider developer access | Capability matrix and spike evidence satisfy the first-provider validation checklist. |
| BI-004 | P0 | Blocked | Implement managed identity, workspaces, roles, and tenant isolation for connected business data. | Connected-MVP decision; revised security model | Production authentication and cross-workspace tests pass. |
| BI-005 | P0 | Blocked | Implement the provider-neutral connector contract and one read-only connector. | BI-003; BI-004 | Initial/incremental sync, retries, webhooks, reconciliation, disconnect, and capability tests pass. |
| BI-006 | P0 | Blocked | Implement normalized metrics for appointments, cancellations, capacity, rebooking, overdue clients, and opportunity value. | BI-002; BI-005; approved definitions | Fixture reconciliation passes; unsupported metrics degrade explicitly. |
| BI-007 | P1 | Blocked | Implement explainable underbooked-period and overdue-client opportunities. | BI-006; configurable rules | Each recommendation shows its rule, rationale, estimate, data coverage, and owner controls. |
| BI-008 | P1 | Blocked | Add owner-reviewed action drafts or exports and provider booking-link handoff. | BI-007; privacy and eligibility model | Audience, edits, approval, suppression, link, and audit acceptance tests pass. |
| BI-009 | P1 | Blocked | Add conservative action-to-booking and completed-appointment attribution. | BI-005; BI-008; attribution policy | Tests distinguish estimates, clicks, bookings, completion, and attributable revenue. |
| BI-010 | P1 | Blocked | Run a paid four-week pilot and decide pricing and packaging. | BI-004 through BI-009; support plan | At least three representative businesses make a realistic paid commitment and projected contribution margin is positive. |
| BI-011 | P2 | Later | Evaluate direct email/SMS delivery. | Messaging gate, consent/suppression evidence, market review | Ineligible-recipient tests fail closed and delivery is auditable. |
| BI-012 | P2 | Later | Evaluate booking-provider write operations. | Direct-booking gate | Provider permissions, concurrency, idempotency, terms, support, and commercial benefit pass. |
| BI-013 | P2 | Later | Add a second booking-provider connector. | Second-provider gate | Shared contract tests pass without provider branching in business logic. |
| BI-014 | P1 | Next | Complete SessionScape naming, trademark, company, domain, app-store, and search review. | Target launch markets | Recorded recommendation confirms the name or selects a replacement before commercial launch. |

## Maintenance

Requirements belong in the linked requirements documents. Move an item to **Done** only when its completion evidence is verified. A UI mockup does not complete a connected-data, security, attribution, or commercial item.
