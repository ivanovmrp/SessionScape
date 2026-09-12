import { expect, test } from "vitest";

import {
  deriveDashboard,
  type DashboardInput,
} from "./dashboard-calculations";
import {
  DASHBOARD_DERIVED,
  DASHBOARD_FIXTURES,
  DASHBOARD_INPUTS,
} from "./dashboard-fixtures";

const currentInput = {
  status: "current",
  actionContext: {
    freshness: "Current",
    coverage: "Complete",
    limitation: "Synthetic",
    recheckRequired: false,
  },
  capacity: {
    state: "current",
    bookedHours: 28,
    openHours: 12,
    blockedHours: 6,
    previousPercent: 62,
    days: [
      { label: "Mon", bookedHours: 8.2, openHours: 1.8 },
      { label: "Tue", bookedHours: 7, openHours: 3 },
    ],
  },
  appointments: { confirmed: 24, completed: 4, previousTotal: 24 },
  retention: {
    returned: 18,
    eligible: 29,
    previousRatePercent: 57,
    history: [
      { label: "Apr", returned: 13, eligible: 24 },
      { label: "May", returned: 14, eligible: 25 },
      { label: "Jun", returned: 15, eligible: 26 },
      { label: "Jul", returned: 16, eligible: 27 },
      { label: "Aug", returned: 17, eligible: 28 },
      { label: "Sep", returned: 18, eligible: 29 },
    ],
  },
  cancellations: { total: 6, refilled: 2 },
  opportunities: [
    {
      id: "capacity", estimatedCents: 36_000, type: "capacity", kicker: "", urgency: "", title: "", summary: "", reason: "", valueNote: "", ruleVersion: "", rule: "", draft: "",
      audiences: [{ id: "eligible", label: "Eligible", count: 11 }], eligibility: "",
      providerHandoff: { provider: "Square", label: "", limitation: "" },
    },
    {
      id: "retention", estimatedCents: 88_000, type: "retention", kicker: "", urgency: "", title: "", summary: "", reason: "", valueNote: "", ruleVersion: "", rule: "", draft: "",
      audiences: [{ id: "eligible", label: "Eligible", count: 14 }], eligibility: "",
      providerHandoff: { provider: "Square", label: "", limitation: "" },
    },
  ],
} satisfies DashboardInput;

test("derives every current dashboard number from numeric source inputs", () => {
  const dashboard = deriveDashboard(currentInput);

  expect(dashboard.headline).toBe("70% booked");
  expect(dashboard.subheadline).toBe(
    "You have 12 serviceable hours still open and two focused ways to act.",
  );
  expect(dashboard.totalOpportunity).toBe("$1,240");
  expect(dashboard.totalOpportunityCents).toBe(124_000);
  expect(dashboard.opportunityCount).toBe(2);

  expect(dashboard.metrics).toEqual([
    {
      id: "capacity",
      value: "70%",
      change: "↗ 8%",
      context: "28 of 40 serviceable hours",
      formula:
        "Booked serviceable hours ÷ total serviceable hours: 28h ÷ 40h = 70%.",
      state: "current",
    },
    {
      id: "appointments",
      value: "28",
      change: "+4",
      context: "24 confirmed · 4 completed",
      formula:
        "Count of non-cancelled appointments whose start time falls in the selected week.",
      state: "current",
    },
    {
      id: "rebooking",
      value: "62%",
      change: "↗ 5%",
      context: "18 of 29 eligible visits",
      formula:
        "Eligible completed appointments followed by a future booking within 45 days ÷ eligible completed appointments: 18 ÷ 29 = 62%.",
      state: "current",
    },
    {
      id: "cancellations",
      value: "6",
      change: "2 refilled",
      context: "4 slots remain open",
      formula:
        "Count of appointments cancelled during the selected week; refilled when a later active appointment overlaps the released slot.",
      state: "current",
    },
  ]);

  expect(dashboard.capacity).toEqual({
    state: "current",
    percent: 70,
    bookedHours: 28,
    openHours: 12,
    blockedHours: 6,
  });
  expect(dashboard.returnPulse).toEqual({ rate: 62, change: 5 });
  expect(dashboard.returnHistory).toEqual([
    { label: "Apr", rate: 54 },
    { label: "May", rate: 56 },
    { label: "Jun", rate: 58 },
    { label: "Jul", rate: 59 },
    { label: "Aug", rate: 61 },
    { label: "Sep", rate: 62 },
  ]);
  expect(dashboard.returnTrendLabel).toBe(
    "Client return rate rose from 54% to 62% over six months",
  );
  expect(dashboard.days).toEqual([
    { label: "Mon", booked: 82, open: 18 },
    { label: "Tue", booked: 70, open: 30 },
  ]);
});

test("suppresses unavailable capacity without erasing supported metrics", () => {
  const dashboard = deriveDashboard({
    ...currentInput,
    status: "partial",
    capacity: { state: "unavailable" },
    opportunities: [currentInput.opportunities[1]],
  });

  expect(dashboard.headline).toBe("partially available");
  expect(dashboard.subheadline).toBe(
    "Appointment and retention metrics are current. Capacity estimates are hidden until coverage recovers.",
  );
  expect(dashboard.totalOpportunity).toBe("$880");
  expect(dashboard.capacity).toEqual({
    state: "unavailable",
    percent: null,
    bookedHours: null,
    openHours: null,
    blockedHours: null,
  });
  expect(dashboard.days).toEqual([]);
  expect(dashboard.metrics[0]).toEqual({
    id: "capacity",
    value: "—",
    change: "Unavailable",
    context: "Availability coverage is incomplete",
    formula:
      "Not calculated. Reliable capacity requires complete serviceable availability for every active practitioner.",
    state: "unavailable",
  });
  expect(dashboard.metrics.slice(1).map((metric) => metric.state)).toEqual([
    "current",
    "current",
    "current",
  ]);
});

test("retains last-known stale values with an explicit stale state", () => {
  const dashboard = deriveDashboard({
    ...currentInput,
    status: "stale",
    capacity: { ...currentInput.capacity, state: "stale" },
  });

  expect(dashboard.headline).toBe("awaiting a refresh");
  expect(dashboard.subheadline).toBe(
    "Use these numbers for context only. Review current bookings in Square before acting.",
  );
  expect(dashboard.capacity).toEqual({
    state: "stale",
    percent: 70,
    bookedHours: 28,
    openHours: 12,
    blockedHours: 6,
  });
  expect(dashboard.days).toEqual([
    { label: "Mon", booked: 82, open: 18 },
    { label: "Tue", booked: 70, open: 30 },
  ]);
  expect(dashboard.metrics.map((metric) => metric.state)).toEqual([
    "stale",
    "stale",
    "stale",
    "stale",
  ]);
});

test("builds the current fixture from its inspectable numeric input", () => {
  const derived = deriveDashboard(DASHBOARD_INPUTS.current);
  const fixture = DASHBOARD_FIXTURES.current;

  expect(fixture.headline).toBe(derived.headline);
  expect(fixture.subheadline).toBe(derived.subheadline);
  expect(fixture.totalOpportunity).toBe(derived.totalOpportunity);
  expect(fixture.metrics.map(({ id, value, change, context, formula, state }) => ({
    id,
    value,
    change,
    context,
    formula,
    state,
  }))).toEqual(derived.metrics);
  expect({
    state: fixture.capacityState,
    percent: fixture.capacityPercent,
    bookedHours: fixture.bookedHours,
    openHours: fixture.openHours,
    blockedHours: fixture.blockedHours,
  }).toEqual(derived.capacity);
  expect({ rate: fixture.returnRate, change: fixture.returnChange }).toEqual(
    derived.returnPulse,
  );
  expect(fixture.days).toEqual(derived.days);
});

test("weekday capacity inputs reconcile to the weekly totals", () => {
  const capacity = DASHBOARD_INPUTS.current.capacity;

  expect(capacity.days.reduce((sum, day) => sum + day.bookedHours, 0)).toBe(
    capacity.bookedHours,
  );
  expect(capacity.days.reduce((sum, day) => sum + day.openHours, 0)).toBe(
    capacity.openHours,
  );
});

test.each(["partial", "stale"] as const)(
  "builds the %s fixture from its numeric input and explicit states",
  (scenario) => {
    const derived = deriveDashboard(DASHBOARD_INPUTS[scenario]);
    const fixture = DASHBOARD_FIXTURES[scenario];

    expect(fixture.headline).toBe(derived.headline);
    expect(fixture.subheadline).toBe(derived.subheadline);
    expect(fixture.totalOpportunity).toBe(derived.totalOpportunity);
    expect(fixture.capacityState).toBe(derived.capacity.state);
    expect(fixture.capacityPercent).toBe(derived.capacity.percent);
    expect(fixture.bookedHours).toBe(derived.capacity.bookedHours);
    expect(fixture.openHours).toBe(derived.capacity.openHours);
    expect(fixture.blockedHours).toBe(derived.capacity.blockedHours);
    expect(fixture.days).toEqual(derived.days);
    expect(fixture.metrics.map((metric) => metric.state)).toEqual(
      derived.metrics.map((metric) => metric.state),
    );
    expect(fixture.metrics.map(({ id, value, change, context, formula, state }) => ({
      id,
      value,
      change,
      context,
      formula,
      state,
    }))).toEqual(derived.metrics);
    expect({ rate: fixture.returnRate, change: fixture.returnChange }).toEqual(
      derived.returnPulse,
    );
    expect(fixture.opportunities).toBe(
      DASHBOARD_DERIVED[scenario].opportunities,
    );
  },
);

test("marks retention as unavailable when no visits are eligible", () => {
  const dashboard = deriveDashboard({
    ...currentInput,
    retention: {
      returned: 0,
      eligible: 0,
      previousRatePercent: 57,
      history: [{ label: "Sep", returned: 0, eligible: 0 }],
    },
  });

  expect(dashboard.metrics[2]).toMatchObject({
    id: "rebooking",
    value: "—",
    change: "Unavailable",
    context: "No eligible visits",
    state: "unavailable",
  });
  expect(dashboard.returnPulse).toEqual({ rate: null, change: null });
  expect(dashboard.returnHistory).toEqual([{ label: "Sep", rate: null }]);
  expect(dashboard.returnTrendLabel).toBe(
    "Client return rate is unavailable because no visits are eligible",
  );
});

test.each([
  {
    scenario: "partial" as const,
    metrics: ["—", "28", "62%", "6"],
    pulse: { rate: 62, change: 5 },
    opportunities: [{ id: "overdue-clients", value: "$880" }],
  },
  {
    scenario: "stale" as const,
    metrics: ["70%", "28", "62%", "6"],
    pulse: { rate: 62, change: 5 },
    opportunities: [
      { id: "underbooked-thursday", value: "$360" },
      { id: "overdue-clients", value: "$880" },
    ],
  },
])("derives every $scenario metric, pulse, and opportunity value", (expected) => {
  const dashboard = deriveDashboard(DASHBOARD_INPUTS[expected.scenario]);

  expect(dashboard.metrics.map((metric) => metric.value)).toEqual(expected.metrics);
  expect(dashboard.returnPulse).toEqual(expected.pulse);
  expect(
    dashboard.opportunities.map(({ id, value }) => ({ id, value })),
  ).toEqual(expected.opportunities);
  expect(dashboard.returnHistory).toEqual([
    { label: "Apr", rate: 54 },
    { label: "May", rate: 56 },
    { label: "Jun", rate: 58 },
    { label: "Jul", rate: 59 },
    { label: "Aug", rate: 61 },
    { label: "Sep", rate: 62 },
  ]);
});

test.each([
  {
    label: "one dismissed recommendation",
    dismissed: ["capacity"],
    count: 1,
    cents: 88_000,
    formatted: "$880",
  },
  {
    label: "a repeated dismissal ID",
    dismissed: ["capacity", "capacity"],
    count: 1,
    cents: 88_000,
    formatted: "$880",
  },
  {
    label: "an unknown dismissal ID",
    dismissed: ["unknown"],
    count: 2,
    cents: 124_000,
    formatted: "$1,240",
  },
  {
    label: "all recommendations dismissed",
    dismissed: ["capacity", "retention"],
    count: 0,
    cents: 0,
    formatted: "$0",
  },
])("reconciles $label", ({ dismissed, count, cents, formatted }) => {
  const dashboard = deriveDashboard(currentInput, dismissed);

  expect(dashboard.opportunityCount).toBe(count);
  expect(dashboard.totalOpportunityCents).toBe(cents);
  expect(dashboard.totalOpportunity).toBe(formatted);
});

test("preserves the representative action contract through derivation", () => {
  const dashboard = deriveDashboard(DASHBOARD_INPUTS.current);
  const capacityAction = dashboard.opportunities.find(
    (opportunity) => opportunity.id === "underbooked-thursday",
  );

  expect(capacityAction).toMatchObject({
    estimatedCents: 36_000,
    value: "$360",
    draft:
      "We have massage openings with Maya this Thursday afternoon. If the timing works for you, review current availability on our Square booking page.",
    audiences: [
      { id: "eligible", label: "All eligible clients", count: 11 },
      { id: "recent", label: "Recently active", count: 7 },
      { id: "frequent", label: "Frequent clients", count: 4 },
      { id: "none", label: "No matching clients", count: 0 },
    ],
    eligibility:
      "Future appointments, suppressions, ineligible clients, and clients outside Maya’s prior-client group are excluded.",
    providerHandoff: {
      provider: "Square",
      label: "Square booking page",
      limitation:
        "No live availability is connected. Square remains the system of record for availability, booking, and payment.",
    },
  });
  expect(DASHBOARD_FIXTURES.current.opportunities[0]).toMatchObject(
    capacityAction ?? {},
  );
});

test.each([
  {
    scenario: "current" as const,
    freshness: "Current data · synced today at 8:42 AM",
    coverage: "100% source coverage",
    limitation: "Synthetic prototype data; confirm availability in Square.",
    recheckRequired: false,
  },
  {
    scenario: "partial" as const,
    freshness: "Appointments current · availability incomplete",
    coverage: "Appointments 100% · practitioner availability 58%",
    limitation:
      "Capacity actions are unavailable; supported retention actions may continue.",
    recheckRequired: false,
  },
  {
    scenario: "stale" as const,
    freshness: "Last successful sync Sep 5 at 6:14 PM",
    coverage: "Changes after the last sync are not included",
    limitation: "Recheck Square before approving; the estimate may have changed.",
    recheckRequired: true,
  },
])("preserves $scenario action limitations", (expected) => {
  expect(deriveDashboard(DASHBOARD_INPUTS[expected.scenario]).actionContext).toEqual({
    freshness: expected.freshness,
    coverage: expected.coverage,
    limitation: expected.limitation,
    recheckRequired: expected.recheckRequired,
  });
});
