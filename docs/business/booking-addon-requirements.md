# Booking-platform integration requirements

Status: Core MVP proposal; provider selection pending validation
Last updated: 2026-09-06

## Decision

SessionScape will integrate with existing booking platforms. It will not build a booking engine for the MVP. The connected platform remains the system of record and owns availability, appointments, client booking, rescheduling, cancellation, payments, and transactional booking messages.

The first connector should target one provider. Square is the leading candidate, subject to customer concentration, production API access, merchant-plan constraints, and technical validation. Vagaro and Mindbody are candidates for later connectors. Boulevard is a later-stage possibility where enterprise access makes commercial sense.

## Connector contract

Provider integrations must map into a stable internal model. Business logic must not depend directly on a provider's field names or status codes.

```text
BookingProvider
  connect()
  disconnect()
  syncLocations()
  syncStaff()
  syncServices()
  syncCustomers()
  syncAppointments()
  syncAvailability()
  subscribeToChanges()
  buildBookingLink(context)
```

Write operations such as `createBooking`, `updateBooking`, and `cancelBooking` are outside the MVP contract. They may be added as optional provider capabilities after the direct-booking gate passes.

## Functional requirements

| ID | Requirement |
| --- | --- |
| INT-01 | A workspace connects through provider-supported OAuth or an equivalent approved authorization flow. |
| INT-02 | The consent screen explains every requested scope and the SessionScape feature that needs it. |
| INT-03 | The connector requests the minimum scopes and fields required for enabled metrics and actions. |
| INT-04 | Source identifiers are namespaced by provider and tenant; retries and webhook replays are idempotent. |
| INT-05 | Provider locations, staff, services, customers, appointments, status changes, cancellations, and availability are normalized where accessible. |
| INT-06 | Free-form notes, intake answers, health details, card data, and unrelated provider records are excluded from ingestion. |
| INT-07 | Initial historical import and incremental synchronization expose progress, last success, errors, freshness, and partial-data conditions. |
| INT-08 | Webhook signatures are verified, secrets are protected, duplicate events are safe, and missed events are reconciled. |
| INT-09 | Provider status values map to documented internal states without treating requested, canceled, no-show, and completed appointments as equivalent. |
| INT-10 | Availability-derived metrics are disabled when availability is inaccessible, stale, or cannot account for staff and service constraints. |
| INT-11 | A booking call to action uses a provider-supported URL and preserves available location, service, practitioner, or time context without promising a slot. |
| INT-12 | Disconnecting revokes or deletes credentials, stops synchronization, marks data stale, and begins the approved retention/deletion process. |
| INT-13 | Connector access failures, rate limits, provider outages, and merchant-plan restrictions are visible to the owner and operations team. |
| INT-14 | Sync and analytical processing preserve tenant isolation and are covered by cross-workspace authorization tests. |
| INT-15 | A connector capability manifest declares which data, webhooks, booking links, and write operations are supported for that merchant. |

## Metric data dependencies

| Product metric or action | Minimum source data | Fallback behavior |
| --- | --- | --- |
| Appointments and cancellations | Appointment identifier, time, status, service/location/staff references | Show only periods covered by a successful sync. |
| Open appointment hours | Staff/service availability plus active appointments and buffers | Mark unavailable; do not infer from business hours alone. |
| Estimated unused capacity | Open capacity plus price or expected-value rule | Show hours only if a defensible value is unavailable. |
| Rebooking rate | Completed appointments and stable customer reference | Exclude records without reliable customer or completion state. |
| Overdue clients | Customer reference, eligible completed dates, configurable interval | Use business-defined intervals when history is insufficient. |
| Cancellation recovery | Cancellation time, original slot, later appointment occupying the slot | Report unknown when provider data cannot establish refill. |
| Campaign attribution | Eligible audience, action timestamp, later booking and completion | Label as influenced or attributed only under documented rules. |

## First-provider validation

Before implementation commitment, verify with current official provider documentation and a production-access test:

- application approval and partner requirements;
- OAuth scopes and merchant consent;
- read access by merchant subscription level;
- historical range, pagination, rate limits, and data latency;
- appointment, customer, catalog, team, location, availability, and webhook coverage;
- stable booking-link options;
- sandbox fidelity and production review requirements;
- data-use, caching, deletion, branding, and marketplace terms; and
- expected per-merchant infrastructure and support cost.

## Direct-booking gate

Creating or changing appointments through an API is a later capability. It requires all of the following:

1. Owners demonstrate that provider links materially limit conversion or workflow value.
2. The provider supports reliable seller-level write access for the target merchant plans.
3. Availability, concurrency, idempotency, time zones, service/staff constraints, cancellations, and audit behavior pass acceptance testing.
4. The business can support appointment failures and disputes.
5. Clients see and accept the connected provider's price, policy, location, time zone, and booking terms.
6. The feature has a measurable commercial benefit beyond the link-based experience.

Payments remain with the booking provider. SessionScape must not receive raw card data.

## Second-provider gate

A second connector may begin only when:

- the first connector has stable production sync and an acceptable support burden;
- normalized metrics and actions operate without provider-specific branching outside the connector;
- customer evidence shows the new provider materially expands the paid market;
- its access terms and economics are viable; and
- automated contract tests can be reused against both connectors.

## Success measures

- Successful initial connections and time to first usable insight.
- Sync success, latency, freshness, and reconciliation mismatch rate.
- Percentage of connected merchants with sufficient data for each core metric.
- Connector-related support contacts per 100 connected businesses.
- Booking-link clicks that produce attributable bookings and completed appointments.
- Duplicate or cross-tenant source records: target 0.
- Prohibited fields ingested: target 0.

Provider facts must be checked again against current official documentation before implementation or launch.
