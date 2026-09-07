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

const capacityMetric = metric({ id: "capacity", label: "Booked capacity", value: "70%", change: "↗ 8%", tone: "positive", context: "28 of 40 serviceable hours", formula: "Booked serviceable hours ÷ total serviceable hours: 28h ÷ 40h = 70%." });

const baseMetrics: Metric[] = [
  capacityMetric,
  metric({ id: "appointments", label: "Appointments", value: "28", change: "+4", tone: "positive", context: "24 confirmed · 4 completed", formula: "Count of non-cancelled appointments whose start time falls in the selected week.", exclusions: "Cancelled, declined, duplicate, and test appointments are excluded." }),
  metric({ id: "rebooking", label: "Rebooking rate", value: "62%", change: "↗ 5%", tone: "positive", context: "18 of 29 eligible visits", formula: "Eligible completed appointments followed by a future booking within 45 days ÷ eligible completed appointments: 18 ÷ 29 = 62%.", period: "Trailing 90 days through Sep 6, 2026", population: "29 completed visits with enough follow-up time", exclusions: "First visits inside the 45-day observation window, cancelled follow-ups, and suppressed test clients are excluded." }),
  metric({ id: "cancellations", label: "Cancellations", value: "6", change: "2 refilled", tone: "caution", context: "4 slots remain open", formula: "Count of appointments cancelled during the selected week; refilled when a later active appointment overlaps the released slot.", exclusions: "Owner-created blocks and reschedules retaining the same service time are excluded." }),
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
  headline: "70% booked",
  subheadline: "You have 12 serviceable hours still open and two focused ways to act.",
  totalOpportunity: "$1,240",
  metrics: baseMetrics,
  capacityMetric,
  capacityPercent: 70,
  bookedHours: 28,
  openHours: 12,
  blockedHours: 6,
  returnRate: 62,
  returnChange: 5,
  days: [{ label: "Mon", booked: 82, open: 18 }, { label: "Tue", booked: 70, open: 30 }, { label: "Wed", booked: 88, open: 12 }, { label: "Thu", booked: 42, open: 58 }, { label: "Fri", booked: 68, open: 32 }, { label: "Sat", booked: 78, open: 22 }],
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
