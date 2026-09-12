import {
  deriveDashboard,
  type DashboardInput,
  type DerivedOpportunity,
} from "./dashboard-calculations";

export type DataScenario = "current" | "partial" | "stale";

export type Metric = {
  id: string;
  label: string;
  value: string;
  change: string;
  tone: "positive" | "neutral" | "caution";
  context: string;
  period: string;
  population: string;
  formula: string;
  coverage: string;
  exclusions: string;
  classification: "Observed" | "Estimated";
  state: "current" | "unavailable" | "stale";
};

export type Opportunity = DerivedOpportunity;

type Fixture = {
  status: DataScenario;
  bannerTitle: string;
  bannerCopy: string;
  bannerAction: string;
  headline: string;
  subheadline: string;
  totalOpportunity: string;
  metrics: Metric[];
  capacityMetric: Metric;
  capacityState: "current" | "unavailable" | "stale";
  capacityPercent: number | null;
  bookedHours: number | null;
  openHours: number | null;
  blockedHours: number | null;
  returnRate: number;
  returnChange: number;
  returnHistory: { label: string; rate: number }[];
  returnTrendLabel: string;
  days: { label: string; booked: number; open: number }[];
  opportunities: Opportunity[];
};

const metric = (data: Partial<Metric> & Pick<Metric, "id" | "label" | "value" | "formula">): Metric => ({
  change: "This week",
  tone: "neutral",
  context: "Compared with last week",
  period: "Sep 7–13, 2026",
  population: "Willow & Stone · all active practitioners",
  coverage: "100% of supported appointment and availability records · synced Sep 7 at 8:42 AM",
  exclusions: "Intentionally blocked time, breaks, and appointments outside serviceable hours are excluded.",
  classification: "Observed",
  state: "current",
  ...data,
});

const currentInput = {
    status: "current",
    actionContext: {
      freshness: "Current data · synced today at 8:42 AM",
      coverage: "100% source coverage",
      limitation: "Synthetic prototype data; confirm availability in Square.",
      recheckRequired: false,
    },
    capacity: {
      state: "current",
      bookedHours: 28,
      openHours: 12,
      blockedHours: 6,
      previousPercent: 62,
      days: [
        { label: "Mon", bookedHours: 5, openHours: 1 },
        { label: "Tue", bookedHours: 4, openHours: 2 },
        { label: "Wed", bookedHours: 5, openHours: 1 },
        { label: "Thu", bookedHours: 3, openHours: 4 },
        { label: "Fri", bookedHours: 5, openHours: 2 },
        { label: "Sat", bookedHours: 6, openHours: 2 },
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
        id: "underbooked-thursday", estimatedCents: 36_000, type: "capacity", kicker: "UNDERBOOKED PERIOD", urgency: "High priority", title: "Thursday afternoon has 3 open hours",
        summary: "Maya has serviceable availability from 1:00–4:00 PM with enough lead time to act.", reason: "This period is 38% below Maya’s usual Thursday occupancy and could fit two 90-minute services.", valueNote: "estimated · 2 bookings", ruleVersion: "CAP-1.2", rule: "Surface an unblocked period at least 48 hours away when open serviceable time is 2+ hours and estimated value exceeds $150.",
        draft: "We have massage openings with Maya this Thursday afternoon. If the timing works for you, review current availability on our Square booking page.",
        audiences: [{ id: "eligible", label: "All eligible clients", count: 11 }, { id: "recent", label: "Recently active", count: 7 }, { id: "frequent", label: "Frequent clients", count: 4 }, { id: "none", label: "No matching clients", count: 0 }],
        eligibility: "Future appointments, suppressions, ineligible clients, and clients outside Maya’s prior-client group are excluded.",
        providerHandoff: { provider: "Square", label: "Square booking page", limitation: "No live availability is connected. Square remains the system of record for availability, booking, and payment." },
      },
      {
        id: "overdue-clients", estimatedCents: 88_000, type: "retention", kicker: "CLIENT RETENTION", urgency: "Review this week", title: "14 returning clients are overdue",
        summary: "These clients have passed their expected return interval and have no future appointment.", reason: "Each client has 3+ completed visits, is 14+ days beyond their individual return pattern, and passed suppression checks.", valueNote: "estimated · if 4 return", ruleVersion: "RET-1.1", rule: "Include clients with 3+ completed visits who are at least 14 days beyond their median return interval, have no future active booking, and are outreach-eligible.",
        draft: "It may be time for your next visit with Willow & Stone. If you would like to return, review current availability on our Square booking page.",
        audiences: [{ id: "eligible", label: "All eligible clients", count: 14 }, { id: "recent", label: "Recently active", count: 9 }, { id: "frequent", label: "Frequent clients", count: 5 }, { id: "none", label: "No matching clients", count: 0 }],
        eligibility: "Future appointments, suppressions, ineligible clients, and clients without enough return history are excluded.",
        providerHandoff: { provider: "Square", label: "Square booking page", limitation: "No live availability is connected. Square remains the system of record for availability, booking, and payment." },
      },
    ],
} satisfies DashboardInput;

export const DASHBOARD_INPUTS = {
  current: currentInput,
  partial: {
    ...currentInput,
    status: "partial",
    capacity: { state: "unavailable" },
    actionContext: {
      freshness: "Appointments current · availability incomplete",
      coverage: "Appointments 100% · practitioner availability 58%",
      limitation: "Capacity actions are unavailable; supported retention actions may continue.",
      recheckRequired: false,
    },
    opportunities: currentInput.opportunities.filter(
      (opportunity) => opportunity.id === "overdue-clients",
    ),
  },
  stale: {
    ...currentInput,
    status: "stale",
    capacity: { ...currentInput.capacity, state: "stale" },
    actionContext: {
      freshness: "Last successful sync Sep 5 at 6:14 PM",
      coverage: "Changes after the last sync are not included",
      limitation: "Recheck Square before approving; the estimate may have changed.",
      recheckRequired: true,
    },
  },
} satisfies Record<DataScenario, DashboardInput>;

const currentDashboard = deriveDashboard(DASHBOARD_INPUTS.current);
const partialDashboard = deriveDashboard(DASHBOARD_INPUTS.partial);
const staleDashboard = deriveDashboard(DASHBOARD_INPUTS.stale);
const currentMetrics = Object.fromEntries(
  currentDashboard.metrics.map((item) => [item.id, item]),
) as Record<(typeof currentDashboard.metrics)[number]["id"], (typeof currentDashboard.metrics)[number]>;

const capacityMetric = metric({ ...currentMetrics.capacity, label: "Booked capacity", tone: "positive" });

const baseMetrics: Metric[] = [
  capacityMetric,
  metric({ ...currentMetrics.appointments, label: "Appointments", tone: "positive", exclusions: "Cancelled, declined, duplicate, and test appointments are excluded." }),
  metric({ ...currentMetrics.rebooking, label: "Rebooking rate", tone: "positive", period: "Trailing 90 days through Sep 6, 2026", population: "29 completed visits with enough follow-up time", exclusions: "First visits inside the 45-day observation window, cancelled follow-ups, and suppressed test clients are excluded." }),
  metric({ ...currentMetrics.cancellations, label: "Cancellations", tone: "caution", exclusions: "Owner-created blocks and reschedules retaining the same service time are excluded." }),
];

const opportunities: Opportunity[] = currentDashboard.opportunities;

const base: Fixture = {
  status: "current",
  bannerTitle: "Square data is up to date",
  bannerCopy: "Last successful sync today at 8:42 AM · 100% source coverage",
  bannerAction: "View data health",
  headline: currentDashboard.headline,
  subheadline: currentDashboard.subheadline,
  totalOpportunity: currentDashboard.totalOpportunity,
  metrics: baseMetrics,
  capacityMetric,
  capacityState: currentDashboard.capacity.state,
  capacityPercent: currentDashboard.capacity.percent,
  bookedHours: currentDashboard.capacity.bookedHours,
  openHours: currentDashboard.capacity.openHours,
  blockedHours: currentDashboard.capacity.blockedHours,
  returnRate: currentDashboard.returnPulse.rate,
  returnChange: currentDashboard.returnPulse.change,
  returnHistory: currentDashboard.returnHistory,
  returnTrendLabel: currentDashboard.returnTrendLabel,
  days: currentDashboard.days,
  opportunities,
};

const partialMetrics = baseMetrics.map((item, index) =>
  metric({
    ...item,
    ...partialDashboard.metrics[index],
    ...(index === 0
      ? {
          tone: "caution" as const,
          coverage:
            "Appointments: 100% · practitioner availability: 58% · last sync Sep 7 at 8:42 AM",
          classification: "Estimated" as const,
        }
      : {}),
  }),
);
const partialCapacity = partialMetrics[0];
const staleMetrics = baseMetrics.map((item, index) =>
  metric({
    ...item,
    ...staleDashboard.metrics[index],
    context: `${staleDashboard.metrics[index].context} · stale`,
    coverage:
      "Last successful sync Sep 5 at 6:14 PM. Changes after that time are not included.",
  }),
);

export const DASHBOARD_FIXTURES: Record<DataScenario, Fixture> = {
  current: base,
  partial: {
    ...base,
    status: "partial",
    bannerTitle: "Some metrics are temporarily limited",
    bannerCopy: "Maya’s availability is missing after Wednesday · appointments remain current",
    bannerAction: "Review coverage",
    headline: partialDashboard.headline,
    subheadline: partialDashboard.subheadline,
    totalOpportunity: partialDashboard.totalOpportunity,
    metrics: partialMetrics,
    capacityMetric: partialCapacity,
    capacityState: partialDashboard.capacity.state,
    capacityPercent: partialDashboard.capacity.percent,
    bookedHours: partialDashboard.capacity.bookedHours,
    openHours: partialDashboard.capacity.openHours,
    blockedHours: partialDashboard.capacity.blockedHours,
    returnRate: partialDashboard.returnPulse.rate,
    returnChange: partialDashboard.returnPulse.change,
    returnHistory: partialDashboard.returnHistory,
    returnTrendLabel: partialDashboard.returnTrendLabel,
    days: partialDashboard.days,
    opportunities: opportunities.filter((item) => item.type === "retention"),
  },
  stale: {
    ...base,
    status: "stale",
    bannerTitle: "Dashboard data may be out of date",
    bannerCopy: "Last successful sync Sep 5 at 6:14 PM · new bookings may not be reflected",
    bannerAction: "Troubleshoot sync",
    headline: staleDashboard.headline,
    subheadline: staleDashboard.subheadline,
    totalOpportunity: staleDashboard.totalOpportunity,
    metrics: staleMetrics,
    capacityMetric: staleMetrics[0],
    capacityState: staleDashboard.capacity.state,
    capacityPercent: staleDashboard.capacity.percent,
    bookedHours: staleDashboard.capacity.bookedHours,
    openHours: staleDashboard.capacity.openHours,
    blockedHours: staleDashboard.capacity.blockedHours,
    returnRate: staleDashboard.returnPulse.rate,
    returnChange: staleDashboard.returnPulse.change,
    returnHistory: staleDashboard.returnHistory,
    returnTrendLabel: staleDashboard.returnTrendLabel,
    days: staleDashboard.days,
  },
};
