export type DashboardInput = {
  status: "current" | "partial" | "stale";
  capacity:
    | { state: "unavailable" }
    | {
        state: "current" | "stale";
        bookedHours: number;
        openHours: number;
        blockedHours: number;
        previousPercent: number;
        days: { label: string; bookedHours: number; openHours: number }[];
      };
  appointments: {
    confirmed: number;
    completed: number;
    previousTotal: number;
  };
  retention: {
    returned: number;
    eligible: number;
    previousRatePercent: number;
  };
  cancellations: { total: number; refilled: number };
  opportunities: { id: string; estimatedCents: number }[];
};

export type DerivedMetric = {
  id: "capacity" | "appointments" | "rebooking" | "cancellations";
  value: string;
  change: string;
  context: string;
  formula: string;
  state: "current" | "unavailable" | "stale";
};

export type DerivedDashboard = {
  headline: string;
  subheadline: string;
  totalOpportunity: string;
  totalOpportunityCents: number;
  opportunityCount: number;
  metrics: DerivedMetric[];
  capacity: {
    state: "current" | "unavailable" | "stale";
    percent: number | null;
    bookedHours: number | null;
    openHours: number | null;
    blockedHours: number | null;
  };
  returnPulse: { rate: number; change: number };
  days: { label: string; booked: number; open: number }[];
};

const percent = (part: number, whole: number) =>
  whole === 0 ? 0 : Math.round((part / whole) * 100);

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function deriveDashboard(input: DashboardInput): DerivedDashboard {
  const capacitySource =
    input.capacity.state === "unavailable" ? null : input.capacity;
  const bookedHours = capacitySource?.bookedHours ?? null;
  const openHours = capacitySource?.openHours ?? null;
  const blockedHours = capacitySource?.blockedHours ?? null;
  const serviceableHours = capacitySource
    ? capacitySource.bookedHours + capacitySource.openHours
    : null;
  const capacityPercent = capacitySource
    ? percent(
        capacitySource.bookedHours,
        capacitySource.bookedHours + capacitySource.openHours,
      )
    : null;
  const appointmentTotal =
    input.appointments.confirmed + input.appointments.completed;
  const returnRate = percent(
    input.retention.returned,
    input.retention.eligible,
  );
  const opportunityTotal = input.opportunities.reduce(
    (total, opportunity) => total + opportunity.estimatedCents,
    0,
  );
  const stale = input.status === "stale";
  const supportedState = stale ? "stale" : "current";
  const capacityMetric: DerivedMetric = capacitySource
    ? {
        id: "capacity",
        value: `${capacityPercent}%`,
        change: `↗ ${(capacityPercent ?? 0) - capacitySource.previousPercent}%`,
        context: `${bookedHours} of ${serviceableHours} serviceable hours`,
        formula: `Booked serviceable hours ÷ total serviceable hours: ${bookedHours}h ÷ ${serviceableHours}h = ${capacityPercent}%.`,
        state: input.capacity.state,
      }
    : {
        id: "capacity",
        value: "—",
        change: "Unavailable",
        context: "Availability coverage is incomplete",
        formula:
          "Not calculated. Reliable capacity requires complete serviceable availability for every active practitioner.",
        state: "unavailable",
      };

  const headline =
    input.status === "partial"
      ? "partially available"
      : input.status === "stale"
        ? "awaiting a refresh"
        : `${capacityPercent}% booked`;
  const subheadline =
    input.status === "partial"
      ? "Appointment and retention metrics are current. Capacity estimates are hidden until coverage recovers."
      : input.status === "stale"
        ? "Use these numbers for context only. Review current bookings in Square before acting."
        : `You have ${openHours} serviceable hours still open and ${input.opportunities.length === 2 ? "two" : input.opportunities.length} focused ways to act.`;

  return {
    headline,
    subheadline,
    totalOpportunity: currency.format(opportunityTotal / 100),
    totalOpportunityCents: opportunityTotal,
    opportunityCount: input.opportunities.length,
    metrics: [
      capacityMetric,
      {
        id: "appointments",
        value: String(appointmentTotal),
        change: `+${appointmentTotal - input.appointments.previousTotal}`,
        context: `${input.appointments.confirmed} confirmed · ${input.appointments.completed} completed`,
        formula:
          "Count of non-cancelled appointments whose start time falls in the selected week.",
        state: supportedState,
      },
      {
        id: "rebooking",
        value: `${returnRate}%`,
        change: `↗ ${returnRate - input.retention.previousRatePercent}%`,
        context: `${input.retention.returned} of ${input.retention.eligible} eligible visits`,
        formula: `Eligible completed appointments followed by a future booking within 45 days ÷ eligible completed appointments: ${input.retention.returned} ÷ ${input.retention.eligible} = ${returnRate}%.`,
        state: supportedState,
      },
      {
        id: "cancellations",
        value: String(input.cancellations.total),
        change: `${input.cancellations.refilled} refilled`,
        context: `${input.cancellations.total - input.cancellations.refilled} slots remain open`,
        formula:
          "Count of appointments cancelled during the selected week; refilled when a later active appointment overlaps the released slot.",
        state: supportedState,
      },
    ],
    capacity: {
      state: input.capacity.state,
      percent: capacityPercent,
      bookedHours,
      openHours,
      blockedHours,
    },
    returnPulse: {
      rate: returnRate,
      change: returnRate - input.retention.previousRatePercent,
    },
    days: capacitySource ? capacitySource.days.map((day) => {
      const total = day.bookedHours + day.openHours;
      return {
        label: day.label,
        booked: percent(day.bookedHours, total),
        open: percent(day.openHours, total),
      };
    }) : [],
  };
}
