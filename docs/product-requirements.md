# SessionScape product requirements

Status: Redefined MVP
Last updated: 2026-09-06

## Product statement

SessionScape connects to a massage business's existing booking platform, reveals actionable capacity and retention opportunities, and helps the owner turn those opportunities into attributable bookings.

The connected booking platform remains the system of record. SessionScape does not provide its own calendar or booking checkout in the MVP.

## Primary user

The initial user is the owner or operator of an independent massage practice or small studio who uses a supported booking platform and is responsible for utilization, retention, and growth.

## MVP outcomes

1. An owner securely connects one supported booking-platform account.
2. The owner reaches a trustworthy weekly dashboard after synchronization.
3. The dashboard shows appointments, open capacity, estimated unused capacity, rebooking rate, overdue clients, cancellations, and identified opportunity value when source data supports them.
4. SessionScape identifies underbooked periods and overdue-client opportunities.
5. The owner can understand, refine, dismiss, or act on each recommendation.
6. A client completes booking in the existing provider's booking flow.
7. SessionScape reports later bookings and completed appointments without presenting estimates as realized revenue.

## MVP capabilities

| Area | Capability | MVP rule |
| --- | --- | --- |
| Workspace | Owner registration, login, logout, and one business workspace | Production identity and server-side authorization are required before connected data. |
| Provider connection | Connect, synchronize, inspect status, and disconnect one provider | Square is the leading candidate pending validation. |
| Normalization | Map locations, practitioners, services, customers, appointments, statuses, cancellations, and availability | Provider-specific shapes stay inside the connector. |
| Dashboard | Weekly business picture with freshness and completeness | Hide or qualify metrics unsupported by current data. |
| Opportunity detection | Underbooked periods and overdue returning clients | Use deterministic, explainable rules before model-driven ranking. |
| Recommendations | Show trigger, audience or period, estimated value, urgency, and rationale | Owner remains in control. |
| Action workflow | Review/edit a message draft, export an audience, or follow a provider-supported action | No automatic outreach in the MVP. |
| Booking handoff | Open the existing provider's booking page with available context | Do not promise availability or collect payment. |
| Outcome tracking | Associate actions with later bookings and completed appointments under documented attribution rules | Distinguish estimated, influenced, attributed, and completed value. |
| Data controls | Export, disconnect, retention, deletion, suppression, and audit controls | Exclude clinical notes, health data, intake content, and card data. |

## Dashboard behavior

The default view covers the current week and highlights no more than the highest-value actionable items. Each metric and recommendation exposes:

- definition and calculation period;
- source-data coverage;
- last successful synchronization;
- exclusions and assumptions;
- whether the value is observed, estimated, or attributed; and
- the next available action.

## Opportunity rules

### Underbooked period

An upcoming period may be recommended when usable provider availability shows open serviceable time, the lead time is sufficient to act, the period is not intentionally blocked, and the estimated value meets a business-configured threshold.

### Overdue returning client

A client may be recommended when eligible completed history establishes a return pattern or business-defined interval, the client is beyond that interval, no future active appointment exists, and the client is not suppressed or otherwise ineligible for the proposed action.

Rules must be configurable, versioned, testable, and explainable. A recommendation is not permission to contact a client.

## Functional requirements

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| PR-01 | The owner can connect and disconnect the supported provider. | Scopes are explained; connection state and last sync are visible; disconnect removes credentials and starts policy-driven cleanup. |
| PR-02 | Initial and incremental sync are safe to retry. | Duplicate API pages or webhook events do not duplicate normalized records or outcomes. |
| PR-03 | The dashboard reflects provider truth within the declared refresh interval. | Reconciliation fixtures match expected totals and stale or partial data is visibly degraded. |
| PR-04 | Metric definitions are inspectable. | The owner can view the period, population, formula, assumptions, and data limitations. |
| PR-05 | Recommendations are explainable and reversible before action. | The owner can inspect, edit, dismiss, or approve without hidden audience changes. |
| PR-06 | Booking actions return the client to the connected provider. | Links resolve to the intended business and preserve supported context. |
| PR-07 | Attribution is conservative. | The product never labels an estimate or link click as completed revenue. |
| PR-08 | Outreach eligibility is enforced independently of recommendation ranking. | Suppressed or ineligible clients cannot enter an action audience. |
| PR-09 | Workspace data is isolated. | Cross-tenant API, background-job, cache, and export tests fail closed. |
| PR-10 | The owner can export and delete supported business data. | Both workflows are documented and pass acceptance testing. |

## Out of scope

- A native scheduler, calendar, booking checkout, or payment processor.
- Direct appointment creation, update, cancellation, or rescheduling.
- Autonomous campaigns or unreviewed client messages.
- Clinical notes, health data, massage techniques, or treatment guidance.
- Session themes, client experience blueprints, editorial publishing, and provider community.
- Multiple booking providers in the first validated release.

## Success measures

- Time to first trustworthy insight after connection.
- Weekly active owners and week-four retention.
- Recommendations reviewed and acted on.
- Attributable bookings and completed appointments.
- Utilization, rebooking, and cancellation-refill change against baseline.
- Sync freshness, completeness, reconciliation accuracy, and support burden.
- Ineligible contacts, prohibited fields, and cross-workspace incidents: target 0.

See [core business requirements](business/business-requirements.md), [booking-platform integration requirements](business/booking-addon-requirements.md), and the [validation plan](business/validation-plan.md).
