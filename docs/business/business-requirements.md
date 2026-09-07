# Core business requirements

Status: Redefined product direction; ready for customer discovery
Last updated: 2026-09-06

## Executive decision

SessionScape will be the **intelligence and action layer for massage businesses**. It will connect to the scheduling platform a business already uses, turn appointment and customer activity into a clear operating picture, and recommend actions that help fill unused capacity, bring clients back, and grow revenue.

The booking platform remains the system of record for appointments, availability, services, staff, and payments. SessionScape will not build a competing scheduler for the MVP.

The working positioning is:

> **SessionScape — The intelligence layer for massage businesses.**
> Connect your existing booking system. Find empty capacity. Bring clients back. Grow revenue.

The current session-theme and blueprint prototype is useful research history, but it does not define the new MVP.

## Business problem

Massage-business owners already have scheduling data, but they must interpret it manually. Empty hours, overdue clients, cancellation patterns, underused practitioners, and review opportunities are spread across reports or remain unnoticed. Owners often lack the time and analytical skill to translate that data into timely action.

SessionScape must prove these assumptions:

1. Owners experience unused appointment capacity and preventable client attrition often enough to pay for help.
2. Existing booking products do not make the most valuable revenue opportunities obvious or easy to act on.
3. Recommendations based on a business's own appointment history produce measurable results.
4. Owners will trust a connected product with the minimum customer and appointment data required for analysis.
5. One initial booking-platform integration can reach a viable customer segment without requiring a scheduler migration.

These are hypotheses until they pass the [validation plan](validation-plan.md).

## Target customer

### Primary segment

An owner or operator of an independent massage practice, massage studio, or small wellness business that:

- uses a supported digital booking platform;
- has one or more practitioners and meaningful recurring-client activity;
- has unused capacity, cancellations, or inconsistent rebooking;
- is responsible for both service delivery and business growth; and
- lacks dedicated operations or marketing analysts.

The initial research should include solo practices and small teams. The first paid segment will be chosen using evidence about lost capacity, data volume, purchasing authority, and willingness to act on recommendations.

### Primary jobs to be done

- See how much capacity is booked, open, canceled, or likely to go unused.
- Identify clients whose return pattern suggests they are overdue.
- Prioritize revenue opportunities without building spreadsheets or reading several reports.
- Launch a focused action, such as a fill campaign or rebooking reminder, with review and control.
- Measure whether the action produced bookings and completed appointments.
- Compare performance over time, across practitioners, services, and locations where the source data supports it.

### Not an initial target

- Consumers looking for massage providers.
- Businesses without a supported booking platform or usable exports.
- Large chains requiring enterprise data warehousing or custom analytics.
- Clinical practices seeking records, treatment recommendations, or health-data analysis.
- Businesses seeking a replacement calendar, point of sale, payroll, or payment processor.

## Value proposition

| Outcome | Current problem | SessionScape value | Observable evidence |
| --- | --- | --- | --- |
| Fill empty hours | Open capacity is noticed too late or marketed broadly. | Detect specific weak periods and identify relevant prior clients. | Additional completed appointments in previously open slots. |
| Improve retention | Owners cannot easily see which clients have broken their normal return pattern. | Rank overdue clients using appointment history and business-defined rules. | Higher rebooking and returning-client rates. |
| Recover from cancellations | Newly open time is hard to refill quickly. | Surface cancellations and prepare a targeted fill action. | Cancellation slots rebooked before their start time. |
| Focus owner attention | Reports show data without prioritizing action. | Present a short, explainable list of opportunities by expected value and urgency. | Owners review and act in minutes, once or twice per week. |
| Learn what works | Marketing activity is disconnected from appointment outcomes. | Attribute sent actions to subsequent bookings where technically and legally possible. | Revenue and bookings attributable to each campaign. |

## Product model

```text
Existing booking platform
        ↓
Provider connector and normalized data
        ↓
Capacity, retention, cancellation, and client-pattern analysis
        ↓
Owner dashboard and prioritized recommendations
        ↓
Owner-approved campaigns or booking-provider links
        ↓
Booking and completed-appointment outcomes
```

SessionScape should operate continuously in the background. The owner should receive value from a brief weekly review and timely alerts, rather than having to manage another daily operational system.

## MVP definition

The MVP will support one booking platform. Square is the leading candidate because its bookings, customers, team, locations, catalog, availability, and webhook capabilities align with the product model. Final selection requires technical verification, partner-access verification, and customer evidence.

The MVP must:

1. Connect a business account through provider-approved authorization.
2. Import and normalize the minimum customers, appointments, services, practitioners, locations, cancellations, and availability data permitted by the provider and merchant plan.
3. Show a weekly owner dashboard with appointments, open capacity, estimated unused capacity, rebooking rate, overdue clients, cancellations, and identified revenue opportunity.
4. Detect at least two actionable opportunity types: underbooked periods and overdue returning clients.
5. Explain why each opportunity was identified and which data was used.
6. Let the owner review, refine, dismiss, or act on a recommendation.
7. For the first release, send clients to the existing booking flow. Directly creating or modifying appointments is a later capability that depends on provider permissions and validation.
8. Measure whether an action results in a booking and completed appointment when attribution is available.

Campaign delivery may begin as reviewed message drafts, exports, or provider-supported links before direct email or SMS. Direct marketing delivery requires consent, opt-out, quiet-hours, sender, privacy, and jurisdiction controls.

## Business requirements

| ID | Requirement | Acceptance evidence |
| --- | --- | --- |
| BR-01 | A target owner can understand within one minute that SessionScape connects to an existing booking platform and helps fill capacity, retain clients, and grow revenue. | At least 8 of 10 representative participants accurately describe the product after viewing the landing page. |
| BR-02 | SessionScape does not require a business to replace its scheduler for MVP value. | A connected or representative data workflow reaches the dashboard without creating a SessionScape calendar. |
| BR-03 | The MVP supports one booking provider through a replaceable connector boundary. | Provider-specific behavior is isolated; normalized analytics do not depend on provider response shapes. |
| BR-04 | Connection uses provider-approved authorization, least privilege, clear requested scopes, revocation, and deletion behavior. | Security review and connect/disconnect acceptance tests pass. |
| BR-05 | Dashboard metrics have documented definitions, source fields, refresh time, exclusions, and confidence or completeness status. | Test fixtures produce expected results and owners can inspect metric definitions. |
| BR-06 | Every recommendation is explainable and remains under owner control. | The UI shows the trigger, affected period or client set, expected outcome, and review/dismiss/action controls. |
| BR-07 | The MVP identifies underbooked periods early enough for the owner to act. | For supported data, open capacity is shown by date, time, practitioner, service, and estimated value. |
| BR-08 | The MVP identifies potentially overdue clients using transparent, configurable return-pattern rules. | A test dataset distinguishes active, overdue, one-time, and excluded clients without using health data. |
| BR-09 | Client outreach is never sent solely because an AI model generated it. | The initial release requires explicit owner approval; message content, audience, timestamp, consent basis, and outcome are auditable. |
| BR-10 | Clients always complete MVP booking in the connected provider's booking flow. | Every booking call to action resolves to the correct provider/location/service context; SessionScape stores no payment card data. |
| BR-11 | SessionScape measures action outcomes without claiming revenue it cannot attribute. | Attribution rules and windows are documented; unattributed and estimated values are visibly distinguished from completed revenue. |
| BR-12 | The product minimizes imported and retained personal data. | A data inventory maps every source field to purpose, access, retention, export, deletion, and provider-sync behavior. |
| BR-13 | The product excludes clinical notes, diagnoses, treatment plans, detailed health histories, and massage-technique recommendations. | Connector field allowlists and product forms reject or omit prohibited categories. |
| BR-14 | Workspace and role controls prevent cross-business data access. | Automated tenant-isolation and authorization tests fail closed for every connected-data resource. |
| BR-15 | A business can disconnect a provider and request deletion without silently breaking required security or consent evidence. | Disconnect, export, retention, and deletion acceptance tests pass against the approved policy. |
| BR-16 | Marketing actions are disabled until consent, opt-out, sender, suppression, and market rules are configured. | Attempts to contact an ineligible or suppressed client fail closed and are auditable. |
| BR-17 | Critical owner journeys meet WCAG 2.2 AA and work on mobile and desktop. | Automated checks and manual keyboard and screen-reader tests pass. |
| BR-18 | Provider failures and stale data cannot be presented as current business truth. | The dashboard displays last successful sync, completeness, errors, and degraded states. |
| BR-19 | Plans and pricing correspond to measurable business value and sustainable integration costs. | A paid pilot demonstrates willingness to pay and positive contribution margin before public pricing is fixed. |
| BR-20 | The product name is not treated as final until a naming and availability review is complete. | Trademark, company, domain, app-store, and search checks are recorded before commercial launch. |

## Dashboard requirements

The first dashboard should answer “What needs my attention, why, and what can I do?” It should contain no more than the metrics and actions needed for that decision.

| Metric | Initial definition |
| --- | --- |
| Appointments | Appointments in the selected period, separated by relevant status. |
| Open appointment hours | Serviceable hours not occupied by active appointments, based on provider availability where accessible. |
| Estimated unused capacity | Open serviceable time multiplied by an explainable expected-value rule; always labeled as an estimate. |
| Rebooking rate | Eligible completed appointments followed by another booking within the defined window. |
| Clients overdue for return | Eligible clients beyond their observed or business-defined return interval. |
| Cancellations | Appointments canceled in the selected period, separated by whether the slot was refilled. |
| Revenue opportunity identified | Estimated value of distinct current opportunities, with double counting prevented. |

The dashboard must disclose when provider limitations make a metric partial or unavailable.

## Packaging hypothesis

Pricing remains a discovery question. Test a simple progression around the value delivered:

| Package | Intended value |
| --- | --- |
| Trial | Connect one location, inspect a limited historical dashboard, and validate data quality. |
| Solo | Weekly insights and owner-approved actions for one practitioner or location. |
| Studio | Multiple practitioners, comparisons, more frequent sync, campaigns, and outcome tracking. |
| Multi-location | Consolidated reporting, roles, location comparison, and advanced controls; later. |

Research may test price points near USD 49, USD 99, and USD 199 per month, but package boundaries, data-provider costs, messaging costs, support, and demonstrated recovered revenue must inform the final price.

## Success measures

The long-term north-star outcome is **incremental completed appointments attributable to SessionScape actions**. During discovery, before reliable attribution exists, use **qualified revenue opportunities acted on per active business per week**.

Supporting measures:

- Time from connection to first trustworthy insight.
- Weekly active owner rate and week-four retention.
- Percentage of recommendations reviewed, dismissed, and acted on.
- Bookings and completed appointments following an action.
- Rebooking-rate and utilization change against an appropriate baseline.
- Refilled cancellation slots.
- Estimated opportunity value versus attributable completed revenue.
- Connector sync success, freshness, completeness, and support burden.
- Messages sent to ineligible or suppressed recipients: target 0.
- Cross-workspace data incidents: target 0.

## Non-goals for the MVP

- Building a calendar, scheduler, booking marketplace, point of sale, or payment processor.
- Creating, rescheduling, or canceling appointments inside SessionScape.
- Payroll, inventory, commissions, room management, or practitioner credentialing.
- Clinical records, intake forms, SOAP notes, diagnoses, or treatment recommendations.
- AI guidance about how to perform massage.
- A client-facing SessionScape account or mobile app.
- A broad provider community, content library, or session-theme builder.
- Supporting multiple booking platforms before one connector and the normalized model are validated.
- Fully autonomous client outreach.

## Decision gates

1. **Problem gate:** at least 8-12 target owners provide behavioral evidence that capacity, retention, or cancellation recovery is a frequent and financially meaningful problem.
2. **Data gate:** representative provider data can calculate useful, accurate, explainable metrics without prohibited data.
3. **Connector gate:** the initial provider's production access, merchant-plan constraints, rate limits, webhooks, support burden, and unit cost are acceptable.
4. **Action gate:** at least five pilot businesses act on recommendations and can connect those actions to bookings or operational decisions.
5. **Paid gate:** at least three representative businesses enter a realistic paid pilot at a tested price, with projected positive contribution margin.
6. **Messaging gate:** direct outreach remains disabled until consent, suppression, sender, privacy, and market controls pass review and acceptance testing.
7. **Second-provider gate:** add another connector only after the normalized model works, the first connector is supportable, and the second provider materially expands the reachable paid market.

## Key risks and responses

| Risk | Consequence | Required response |
| --- | --- | --- |
| Metrics are inaccurate because availability or status data is incomplete. | Owners lose trust and may act on bad information. | Show freshness and completeness, reconcile with provider reports, and suppress unsupported metrics. |
| Booking providers restrict API access or merchant plans. | MVP reach or functionality is smaller than expected. | Verify production access before commitment and preserve import/connector alternatives. |
| Recommendations feel like generic reports. | Low willingness to pay. | Test actionability and attributable outcomes, not dashboard preference alone. |
| Outreach creates spam or legal exposure. | Client harm, account suspension, and reputational damage. | Require eligibility checks, approval, suppression, consent records, and market controls. |
| Estimated opportunity is presented as realized revenue. | Misleading claims and lost credibility. | Separate estimates, bookings, completed appointments, and attributable revenue. |
| Provider data contains sensitive information. | Higher privacy and security exposure. | Use field allowlists, minimize retention, exclude notes, and audit connector changes. |
| The product becomes a generic scheduler or BI tool. | High cost and weak differentiation. | Keep scope on massage-business revenue opportunities and provider-integrated actions. |

## Naming decision

“SessionScape” still fits the broader view across sessions, clients, capacity, and revenue. Because the name does not explain the product by itself, descriptive positioning must accompany it. Commercial use remains conditional on the naming and availability review in BR-20.
