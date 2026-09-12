import { expect, test } from "vitest";

import {
  deriveDashboard,
  type DashboardInput,
} from "./dashboard-calculations";
import {
  DASHBOARD_FIXTURES,
  DASHBOARD_INPUTS,
} from "./dashboard-fixtures";

const currentInput = {
  status: "current",
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
  retention: { returned: 18, eligible: 29, previousRatePercent: 57 },
  cancellations: { total: 6, refilled: 2 },
  opportunities: [
    { id: "capacity", estimatedCents: 36_000 },
    { id: "retention", estimatedCents: 88_000 },
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
    opportunities: [{ id: "retention", estimatedCents: 88_000 }],
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
  },
);

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
