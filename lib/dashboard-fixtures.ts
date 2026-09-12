import {
  deriveDashboard,
  type DashboardInput,
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
  state?: "partial";
};

export type Opportunity = {
  id: string;
  type: "capacity" | "retention";
  kicker: string;
  urgency: string;
  title: string;
  summary: string;
  reason: string;
  value: string;
  valueNote: string;
  audience: number;
  ruleVersion: string;
  rule: string;
};

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
  capacityPercent: number;
  bookedHours: number;
  openHours: number;
  blockedHours: number;
  returnRate: number;
  returnChange: number;
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
  ...data,
});

export const DASHBOARD_INPUTS = {
  current: {
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
      { label: "Wed", bookedHours: 8.8, openHours: 1.2 },
      { label: "Thu", bookedHours: 4.2, openHours: 5.8 },
      { label: "Fri", bookedHours: 6.8, openHours: 3.2 },
      { label: "Sat", bookedHours: 7.8, openHours: 2.2 },
    ],
    opportunities: [
      { id: "underbooked-thursday", estimatedCents: 36_000 },
      { id: "overdue-clients", estimatedCents: 88_000 },
    ],
  },
} satisfies { current: DashboardInput };

const currentDashboard = deriveDashboard(DASHBOARD_INPUTS.current);
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

const opportunities: Opportunity[] = [
  { id: "underbooked-thursday", type: "capacity", kicker: "UNDERBOOKED PERIOD", urgency: "High priority", title: "Thursday afternoon has 3 open hours", summary: "Maya has serviceable availability from 1:00–4:00 PM with enough lead time to act.", reason: "This period is 38% below Maya’s usual Thursday occupancy and could fit two 90-minute services.", value: "$360", valueNote: "estimated · 2 bookings", audience: 11, ruleVersion: "CAP-1.2", rule: "Surface an unblocked period at least 48 hours away when open serviceable time is 2+ hours and estimated value exceeds $150." },
  { id: "overdue-clients", type: "retention", kicker: "CLIENT RETENTION", urgency: "Review this week", title: "14 returning clients are overdue", summary: "These clients have passed their expected return interval and have no future appointment.", reason: "Each client has 3+ completed visits, is 14+ days beyond their individual return pattern, and passed suppression checks.", value: "$880", valueNote: "estimated · if 4 return", audience: 14, ruleVersion: "RET-1.1", rule: "Include clients with 3+ completed visits who are at least 14 days beyond their median return interval, have no future active booking, and are outreach-eligible." },
];

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
  capacityPercent: currentDashboard.capacity.percent,
  bookedHours: currentDashboard.capacity.bookedHours,
  openHours: currentDashboard.capacity.openHours,
  blockedHours: currentDashboard.capacity.blockedHours,
  returnRate: currentDashboard.returnPulse.rate,
  returnChange: currentDashboard.returnPulse.change,
  days: currentDashboard.days,
  opportunities,
};

const partialCapacity = metric({ ...capacityMetric, value: "—", change: "Unavailable", tone: "caution", context: "Availability coverage is incomplete", state: "partial", coverage: "Appointments: 100% · practitioner availability: 58% · last sync Sep 7 at 8:42 AM", formula: "Not calculated. Reliable capacity requires complete serviceable availability for every active practitioner.", classification: "Estimated" });

export const DASHBOARD_FIXTURES: Record<DataScenario, Fixture> = {
  current: base,
  partial: {
    ...base,
    status: "partial",
    bannerTitle: "Some metrics are temporarily limited",
    bannerCopy: "Maya’s availability is missing after Wednesday · appointments remain current",
    bannerAction: "Review coverage",
    headline: "partially available",
    subheadline: "Appointment and retention metrics are current. Capacity estimates are hidden until coverage recovers.",
    totalOpportunity: "$880",
    metrics: [partialCapacity, ...baseMetrics.slice(1)],
    capacityMetric: partialCapacity,
    capacityPercent: 0,
    bookedHours: 28,
    openHours: 0,
    opportunities: opportunities.filter((item) => item.type === "retention"),
  },
  stale: {
    ...base,
    status: "stale",
    bannerTitle: "Dashboard data may be out of date",
    bannerCopy: "Last successful sync Sep 5 at 6:14 PM · new bookings may not be reflected",
    bannerAction: "Troubleshoot sync",
    headline: "awaiting a refresh",
    subheadline: "Use these numbers for context only. Review current bookings in Square before acting.",
    metrics: baseMetrics.map((item) => ({ ...item, context: `${item.context} · stale`, state: "partial" as const, coverage: "Last successful sync Sep 5 at 6:14 PM. Changes after that time are not included." })),
    capacityMetric: { ...capacityMetric, state: "partial", coverage: "Last successful sync Sep 5 at 6:14 PM. Changes after that time are not included." },
  },
};
