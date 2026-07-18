# SessionScape product backlog

Last updated: 2026-07-18

This document tracks work that is approved for discovery or implementation but is not complete. Keep requirements in the relevant requirements document and use this backlog to track delivery status, priority, dependencies, and acceptance.

## Status definitions

- **Next:** ready to refine or begin after its listed dependencies are available.
- **Later:** accepted direction, but not yet scheduled.
- **Blocked:** cannot begin until the stated decision or dependency is resolved.
- **Done:** implemented and verified; retain briefly for release traceability, then archive.

## Backlog

| ID | Priority | Status | Item | Dependencies | Completion evidence |
| --- | --- | --- | --- | --- | --- |
| BL-001 | P0 | Next | Replace the browser-local account preview with managed registration, login, logout, email verification, recovery, and server-side session revocation. | Server/API deployment; identity-provider selection; production privacy notice | Identity requirements ID-01 through ID-04 and security requirements SEC-01 through SEC-06 pass automated and manual acceptance tests. |
| BL-002 | P0 | Next | Enforce account and workspace authorization for saved sessions and full provider-community access. | BL-001; PostgreSQL tenancy model; row-level authorization policy | Anonymous and cross-workspace access tests fail closed; logout and revoked sessions immediately lose protected access. |
| BL-003 | P1 | Blocked | Add paid registration for the Professional plan using provider-hosted checkout; show price, renewal, cancellation, refund, tax, and privacy terms before purchase. | Paid-core validation gate; pricing decision; approved payment provider and launch market; BL-001 | PAY-01/PAY-02 and BR-07/BR-20 pass; successful checkout grants the correct entitlement, while failed, canceled, refunded, or expired payments do not. |
| BL-004 | P1 | Later | Add subscription self-service for plan changes, cancellation, invoices/receipts, failed-payment recovery, and entitlement reconciliation. | BL-003; customer-support and refund policies | Users can manage billing without support intervention; webhook retries are idempotent and audited. |
| BL-005 | P1 | Later | Gate save, sync, branded export, and expanded themes by plan while preserving free public articles and limited builder exploration. | BL-002; BL-003; finalized packaging | Entitlement tests cover every free-to-paid boundary and downgrade behavior without deleting user-owned work. |

## Backlog maintenance

When work starts, update its status and link the implementing issue or pull request in the item text. A backlog item is moved to **Done** only after its completion evidence is verified; completing a browser-only prototype does not complete a production identity or payment item.
