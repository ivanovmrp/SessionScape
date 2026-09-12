import { expect, test } from "vitest";

import {
  deriveDashboard,
  type DashboardInput,
} from "./dashboard-calculations";
import {
  DASHBOARD_FIXTURES,
  DASHBOARD_INPUTS,
} from "./dashboard-fixtures";

const currentInput: DashboardInput = {
  status: "current",
  bookedHours: 28,
  openHours: 12,
  blockedHours: 6,
  previousCapacityPercent: 62,
  appointments: { confirmed: 24, completed: 4, previousTotal: 24 },
  retention: { returned: 18, eligible: 29, previousRatePercent: 57 },
  cancellations: { total: 6, refilled: 2 },
  days: [
    { label: "Mon", bookedHours: 8.2, openHours: 1.8 },
    { label: "Tue", bookedHours: 7, openHours: 3 },
  ],
  opportunities: [
    { id: "capacity", estimatedCents: 36_000 },
    { id: "retention", estimatedCents: 88_000 },
  ],
};

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
    },
    {
      id: "appointments",
      value: "28",
      change: "+4",
      context: "24 confirmed · 4 completed",
      formula:
        "Count of non-cancelled appointments whose start time falls in the selected week.",
    },
    {
      id: "rebooking",
      value: "62%",
      change: "↗ 5%",
      context: "18 of 29 eligible visits",
      formula:
        "Eligible completed appointments followed by a future booking within 45 days ÷ eligible completed appointments: 18 ÷ 29 = 62%.",
    },
    {
      id: "cancellations",
      value: "6",
      change: "2 refilled",
      context: "4 slots remain open",
      formula:
        "Count of appointments cancelled during the selected week; refilled when a later active appointment overlaps the released slot.",
    },
  ]);

  expect(dashboard.capacity).toEqual({
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

test("builds the current fixture from its inspectable numeric input", () => {
  const derived = deriveDashboard(DASHBOARD_INPUTS.current);
  const fixture = DASHBOARD_FIXTURES.current;

  expect(fixture.headline).toBe(derived.headline);
  expect(fixture.subheadline).toBe(derived.subheadline);
  expect(fixture.totalOpportunity).toBe(derived.totalOpportunity);
  expect(fixture.metrics.map(({ id, value, change, context, formula }) => ({
    id,
    value,
    change,
    context,
    formula,
  }))).toEqual(derived.metrics);
  expect({
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
