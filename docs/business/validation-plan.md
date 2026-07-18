# Business validation plan

Status: Ready to run
Last updated: 2026-07-18

## Objective

Determine whether SessionScape solves a recurring, valuable problem for massage professionals; which outcomes justify registration; and whether a connected booking add-on deserves investment.

The goal is evidence for decisions, not favorable comments about the visual prototype.

## Questions to answer

1. How do therapists currently design, remember, and prepare individualized sessions?
2. Which parts of that work are frequent, slow, inconsistent, risky, or frustrating?
3. Does SessionScape save time, improve confidence, support professional boundaries, or differentiate a practice?
4. What would therapists trust SessionScape to store?
5. What specific outcome makes account creation worthwhile?
6. Which booking tool do they use, what does it cost, and what do they dislike about it?
7. Is appointment-to-preparation handoff a real problem?
8. Would they replace a scheduler, connect it, or prefer an external link?
9. What would they pay for the core and booking add-on after using them?
10. What local terminology, rules, and expectations affect global use?

## Participants

Recruit 8-12 participants for the first round:

- At least 6 solo practitioners.
- At least 2 owners or leads from a 2-10 practitioner business.
- A mix of therapists who currently use dedicated booking software, a general calendar, and manual scheduling.
- At least 2 newer practitioners and 2 with more than five years in practice.
- At least 2 who deliberately offer branded or sensory experiences.
- Include one or more participants outside the intended first launch jurisdiction for global discovery, but do not treat that as market approval.

Avoid recruiting only friends or enthusiastic early supporters. Compensate participants consistently and do not ask them to reveal identifiable client information.

## Discovery interview

Use past behavior before opinions:

1. "Walk me through the last time you prepared for a returning client."
2. "What did you check, remember, write down, or set up?"
3. "Where did that information live?"
4. "What has gone wrong or been forgotten in the last month?"
5. "How do you decide whether to repeat or adjust a session?"
6. "How do you describe a signature service to a new client?"
7. "Show me how appointments reach your calendar today."
8. "What happens between a booking and the moment the client arrives?"
9. "What do reminders, cancellations, and no-shows require from you?"
10. "Which information would you never store in this product?"
11. "What software did you last pay for, and what made it worth paying for?"

Do not lead with "Would you use this?" Record workflow frequency, current workaround, time/cost, consequence, and evidence of prior attempts to solve it.

## Prototype tasks

Give the participant a fictional client scenario containing only non-clinical preferences.

1. Find or create an appropriate session blueprint.
2. Adjust duration, pace, pressure range, atmosphere, focus, and exclusions.
3. Prepare the room and identify the consent conversation.
4. Save or print the plan and explain what they expect registration to do.
5. Return to the fictional client and reuse the plan with one changed preference.
6. Use a clickable booking-to-blueprint concept and compare it with their current process.

Observe completion, errors, hesitation, language concerns, perceived scope, and whether the user invents value not shown in the interface.

## Registration experiments

Test three value messages at the save moment:

| Message | Hypothesis |
| --- | --- |
| "Save and reuse this blueprint" | Repeat efficiency is the main registration driver. |
| "Keep client preferences private and ready for next time" | Continuity and personalization drive registration. |
| "Create your branded session library" | Practice differentiation drives registration. |

Measure registration start, completion, stated concern, and successful second-session reuse. Do not optimize only email capture; an account that never returns is not validation.

## Pricing experiments

### Core plan

After a participant completes both an initial and repeat workflow, show a real choice:

- Continue with Explorer.
- Start a time-limited Professional trial that will convert at USD 12, USD 15, or USD 19 per month.
- Choose an annual option with a visible discount.

Use randomized or sequential price cohorts when sample size allows. A checkout click, trial with payment authorization, or refundable deposit is stronger evidence than a 1-10 willingness score.

### Booking add-on

Compare:

1. Free external booking link.
2. Existing calendar connection included with Professional.
3. Native Booking Lite at an additional USD 9, USD 12, or USD 15 per month.

Ask users to choose while viewing exact features and any message or payment fees. Record whether they would replace, connect, or keep their current scheduler.

No price should be published as final until unit costs for authentication, storage, email/SMS, support, payment disputes, taxes, and privacy operations are modeled.

## Evidence scorecard

Score each interview separately before discussing themes.

| Signal | 0 | 1 | 2 |
| --- | --- | --- | --- |
| Problem frequency | Rare or hypothetical | Monthly | Weekly/daily |
| Current effort | No workaround | Minor workaround | Multiple tools, repeated effort, or paid workaround |
| Consequence | No meaningful effect | Irritation or small delay | Lost time/revenue, inconsistency, or client experience risk |
| Core prototype value | Cosmetic | Helpful | Changes preparation or repeat workflow |
| Registration value | No reason | Would save for later | Creates account to save/reuse during test |
| Payment evidence | Says maybe | Chooses a price | Starts realistic checkout/deposit/trial |
| Booking handoff | No problem | Convenient | Recurring pain with active workaround |

## Decision criteria

### Proceed with persistent core beta when

- At least 7 of 10 representative participants score 2 on core prototype value.
- At least 6 complete a second-session reuse task without prompting.
- At least 5 register at a durable-value moment in the test.
- No unresolved critical privacy, boundary, or scope misunderstanding remains.

### Iterate the positioning when

- Users like themes but do not return to reuse a plan.
- The strongest value is consistently branding, team standards, or another segment rather than solo preparation.
- Participants interpret blueprints as clinical advice or rigid protocols.

### Proceed with Booking Lite discovery/build gate when

- The quantitative conditions in [Booking add-on requirements](booking-addon-requirements.md) are met.
- The connected workflow is preferred over a generic scheduling feature.
- Integration and partner alternatives have been costed before a custom build.

### Stop or defer native booking when

- Most therapists prefer their existing scheduler plus a link or integration.
- Price willingness does not cover support, messaging, payment, and reliability costs.
- The feature distracts from proving repeat value in session design.

## Four-week beta measures

| Measure | Definition | Initial directional target |
| --- | --- | --- |
| Activation | Registered therapist saves a complete blueprint within 24 hours. | 60% |
| Repeat preparation | Activated therapist reuses or creates another prepared session within 14 days. | 50% |
| Week-four retention | Activated therapist has a prepared session in days 22-28. | 40% |
| Time to repeat plan | Median active time to reuse and prepare a blueprint. | Under 3 minutes |
| Registration completion | Completed accounts / registration starts. | Establish baseline; investigate every major drop-off |
| Booking-to-preparation | Confirmed pilot appointments that reach preparation mode. | 60% if tested |
| Safety guardrail | Critical scope, consent, privacy, or cross-tenant incident. | 0 |

Targets are hypotheses for a small beta and must be reset after observing a reliable baseline.

## Research artifacts

For every session retain only:

- Participant code and segment attributes.
- Consent to research and recording status.
- Workflow observations and non-identifying quotes.
- Task completion, time, errors, scorecard, and decisions.
- Product changes or assumptions invalidated.

Do not place real client records, names, medical histories, or identifiable booking screenshots in research notes.

## Output after the first round

Produce a one-page decision report containing:

1. Confirmed and rejected assumptions.
2. Top three recurring jobs and their frequency.
3. Registration trigger that performed best.
4. Core pricing evidence.
5. Booking build, integration, or defer decision.
6. Privacy/safety findings.
7. Segment and first-market recommendation.
8. The next smallest product change to test.
