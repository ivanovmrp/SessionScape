# Business validation plan

Status: Ready to run for the redefined product
Last updated: 2026-09-06

## Objective

Determine whether massage-business owners have a frequent, valuable revenue-operations problem that SessionScape can solve from existing booking data, which insights cause action, which booking provider should be supported first, and whether owners will pay for measurable outcomes.

The research must test behavior and economics. Positive reactions to a dashboard are insufficient.

## Questions to answer

1. How does the owner currently monitor open capacity, cancellations, rebooking, returning clients, and practitioner utilization?
2. When was the last preventable empty slot, and what did it cost?
3. How are overdue clients identified and contacted today?
4. Which reports, spreadsheets, exports, or manual routines are used?
5. Which actions have produced bookings, and can the business measure them?
6. Which booking platform and merchant plan does the business use?
7. What data can the owner authorize, and what data should SessionScape never import?
8. Which dashboard numbers are trusted, misunderstood, or already available elsewhere?
9. Which recommendations are specific enough to act on?
10. Is a provider booking link sufficient for MVP outreach?
11. What review and control does the owner require before contacting clients?
12. What amount would the business pay after seeing realistic recovered-revenue evidence?

## Participants

Recruit 8-12 owners or operators:

- at least four solo practices and four businesses with 2-10 practitioners;
- a mix of booking platforms, with at least four users of the leading integration candidate;
- businesses with recurring-client services and at least six months of appointment history;
- a mix of utilization levels and approaches to rebooking; and
- participants who personally control software purchasing and client outreach.

Do not collect identifiable client exports during discovery. Use synthetic or owner-redacted data until a reviewed data agreement and secure research process exist.

## Discovery interview

Use recent examples and ask to see the current workflow when possible:

1. “Walk me through the last week when you had appointment hours you wanted to fill.”
2. “When did you notice the openings, and what did you do?”
3. “What was the approximate value of the unused time?”
4. “Show me how you know whether clients are returning on schedule.”
5. “Tell me about the last cancellation you successfully refilled.”
6. “Which booking reports do you check, and how often?”
7. “What do you copy into a spreadsheet or calculate yourself?”
8. “Tell me about the last client campaign you sent and how you chose recipients.”
9. “How did you know whether it worked?”
10. “Which customer or appointment information should another tool never receive?”
11. “What would make you disconnect an analytics product?”
12. “Which software purchase most recently paid for itself?”

Record frequency, current effort, financial consequence, current workaround, ability to act, source platform, purchasing authority, and evidence of prior spending.

## Prototype test

Use a realistic synthetic dataset and an interactive dashboard. Ask the participant to:

1. Explain what happened in the business this week.
2. Identify the most important revenue problem.
3. Verify the meaning and freshness of each number used in the decision.
4. Review an underbooked-period recommendation and refine its audience.
5. Review an overdue-client recommendation and explain exclusions.
6. Approve, edit, or dismiss a message draft.
7. Follow the booking call to action into a representative provider flow.
8. Distinguish estimated opportunity, attributed booking, completed appointment, and realized revenue.
9. Respond to a stale-sync or partial-data warning.
10. Choose whether the product is worth connecting and paying for.

Measure task completion, time to first useful insight, interpretation errors, trust concerns, actions selected, and information the participant requests but cannot find.

## Data feasibility test

For the leading provider, create a field-and-capability matrix from current official documentation and a sandbox or production-access test. Verify:

- merchant eligibility and approval;
- appointments, customers, locations, services, staff, availability, status, and cancellations;
- stable identifiers and historical coverage;
- webhooks, pagination, rate limits, and reconciliation;
- provider booking links and contextual parameters;
- subscription-level restrictions;
- prohibited fields that must be blocked; and
- deletion, caching, and data-use terms.

Use synthetic fixtures to calculate every proposed metric. Reconcile results against independently calculated expected values.

## Offer and pricing test

After an owner has used the dashboard with realistic data, present a concrete paid pilot:

- one supported booking connection;
- weekly dashboard and alerts;
- underbooked-period and overdue-client recommendations;
- owner-reviewed action workflow; and
- outcome tracking where supported.

Test offers around USD 49, USD 99, and USD 199 per month with clear limits and no invented savings claim. Strong evidence is a signed pilot agreement, paid pilot, checkout authorization, or refundable deposit. A willingness score is weak evidence.

## Evidence scorecard

| Signal | 0 | 1 | 2 |
| --- | --- | --- | --- |
| Problem frequency | Rare or hypothetical | Monthly | Weekly or daily |
| Financial consequence | Unknown or immaterial | Noticeable | Repeated and quantified |
| Current effort | No action | Manual report or occasional outreach | Repeated multi-step workaround or paid tool |
| Insight value | Merely interesting | Confirms a suspicion | Changes priority or reveals a missed opportunity |
| Actionability | Cannot act | Needs substantial extra work | Can approve or act in minutes |
| Data trust | Rejects connection | Connects with reservations | Understands scopes and accepts minimum-data connection |
| Provider fit | Unsupported or insufficient data | Partial data | Core metrics supported reliably |
| Payment evidence | Verbal interest | Accepts a price in a forced choice | Enters a realistic paid pilot |

## Decision criteria

Proceed to a connected MVP when:

- at least 7 of 10 owners show weekly or financially meaningful capacity or retention problems;
- at least 6 identify and correctly explain a useful opportunity from the prototype;
- at least 5 choose and complete an action without staff intervention;
- at least 5 target businesses use the selected provider or the provider reaches a justified initial market;
- source data supports the two core opportunity types with acceptable accuracy; and
- no unresolved critical privacy, consent, or attribution misunderstanding remains.

Proceed to a paid pilot when at least three representative businesses accept a realistic paid commitment and projected contribution margin remains positive after provider, infrastructure, messaging, onboarding, and support costs.

Change the first provider when access, customer concentration, data quality, merchant-plan restrictions, or support economics fail the connector gate.

Defer direct messaging when consent and suppression data cannot be established reliably. Continue with reviewed drafts, exports, or provider-supported workflows.

Stop or reposition when owners already receive and act on equivalent insights, recommendations do not change behavior, data cannot support trustworthy metrics, or willingness to pay does not cover delivery cost.

## Four-week pilot measures

| Measure | Initial directional target |
| --- | --- |
| Connected businesses reaching a usable dashboard | 80% |
| Median time from authorization to first trustworthy insight | Under 15 minutes after initial sync |
| Owners reviewing recommendations each week | 60% |
| Qualified recommendations acted on | 30% |
| Pilot businesses with at least one attributable booking | Establish baseline; inspect every attribution manually |
| Estimated versus actual value reporting errors | 0 critical errors |
| Prohibited source fields ingested | 0 |
| Ineligible or suppressed clients contacted | 0 |
| Cross-workspace data incidents | 0 |

Targets must be reset after a reliable baseline exists.

## Research output

Produce a decision report containing:

1. Confirmed and rejected business-problem assumptions.
2. Best initial customer segment and buyer.
3. Frequency and estimated cost of the top three problems.
4. First-provider decision and capability gaps.
5. Metric accuracy and trust findings.
6. Recommendations owners acted on and ignored.
7. Link, draft/export, or direct-message delivery decision.
8. Paid-pilot evidence and viable price range.
9. Privacy, consent, security, and attribution blockers.
10. The smallest next experiment or build commitment.
