export type ActionContext = {
  freshness: string;
  coverage: string;
  limitation: string;
  recheckRequired: boolean;
};

export type DashboardOpportunityInput = {
  id: string;
  estimatedCents: number | null;
  type: "capacity" | "retention";
  kicker: string;
  urgency: string;
  title: string;
  summary: string;
  reason: string;
  valueNote: string;
  ruleVersion: string;
  rule: string;
  draft: string;
  audiences: { id: string; label: string; count: number }[];
  eligibility: string;
  providerHandoff: {
    provider: string;
    label: string;
    limitation: string;
  };
};

export type DerivedOpportunity = DashboardOpportunityInput & {
  value: string;
  audience: number;
};

export type DashboardInput = {
  status: "current" | "partial" | "stale";
  actionContext: ActionContext;
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
    history: { label: string; returned: number; eligible: number }[];
  };
  cancellations: { total: number; refilled: number };
  opportunities: DashboardOpportunityInput[];
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
  totalOpportunityCents: number | null;
  opportunityCount: number;
  opportunities: DerivedOpportunity[];
  actionContext: ActionContext;
  metrics: DerivedMetric[];
  capacity: {
    state: "current" | "unavailable" | "stale";
    percent: number | null;
    bookedHours: number | null;
    openHours: number | null;
    blockedHours: number | null;
  };
  returnPulse: { rate: number | null; change: number | null };
  returnHistory: { label: string; rate: number | null }[];
  returnTrendLabel: string;
  days: { label: string; booked: number | null; open: number | null }[];
};

const percent = (part: number, whole: number) =>
  whole === 0 ? null : Math.round((part / whole) * 100);

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function deriveDashboard(
  input: DashboardInput,
  dismissedIds: readonly string[] = [],
): DerivedDashboard {
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
  const returnRate = input.retention.eligible === 0
    ? null
    : percent(input.retention.returned, input.retention.eligible);
  const returnHistory = input.retention.history.map((point) => ({
    label: point.label,
    rate: point.eligible === 0 ? null : percent(point.returned, point.eligible),
  }));
  const historyComplete = returnHistory.length === 6
    && returnHistory.every((point) => point.rate !== null);
  const firstReturnRate = historyComplete ? returnHistory[0].rate : null;
  const lastReturnRate = historyComplete ? returnHistory.at(-1)?.rate ?? null : null;
  const returnDirection = firstReturnRate !== null && lastReturnRate !== null
    ? lastReturnRate > firstReturnRate
      ? "rose"
      : lastReturnRate < firstReturnRate
        ? "fell"
        : "held steady"
    : null;
  const dismissed = new Set(dismissedIds);
  const visibleOpportunities = input.opportunities
    .filter((opportunity) => !dismissed.has(opportunity.id))
    .map((opportunity) => ({
      ...opportunity,
      value: opportunity.estimatedCents === null
        ? "Unavailable"
        : currency.format(opportunity.estimatedCents / 100),
      audience: opportunity.audiences[0]?.count ?? 0,
    }));
  const opportunityTotal = visibleOpportunities.some(({ estimatedCents }) => estimatedCents === null)
    ? null
    : visibleOpportunities.reduce(
        (total, opportunity) => total + (opportunity.estimatedCents ?? 0),
        0,
      );
  const stale = input.status === "stale";
  const supportedState = stale ? "stale" : "current";
  const capacityMetric: DerivedMetric = capacitySource && capacityPercent !== null
    ? {
        id: "capacity",
        value: `${capacityPercent}%`,
        change: `↗ ${(capacityPercent ?? 0) - capacitySource.previousPercent}%`,
        context: `${bookedHours} of ${serviceableHours} serviceable hours${stale ? " · stale" : ""}`,
        formula: `Booked serviceable hours ÷ total serviceable hours: ${bookedHours}h ÷ ${serviceableHours}h = ${capacityPercent}%.`,
        state: input.capacity.state,
      }
    : {
        id: "capacity",
        value: "—",
        change: "Unavailable",
        context: capacitySource
          ? "No serviceable hours are available"
          : "Availability coverage is incomplete",
        formula:
          capacitySource
            ? "Not calculated. Capacity requires at least one serviceable hour."
            : "Not calculated. Reliable capacity requires complete serviceable availability for every active practitioner.",
        state: "unavailable",
      };

  const headline =
    input.status === "partial"
      ? "partially available"
      : input.status === "stale"
        ? "awaiting a refresh"
        : capacityPercent === null
          ? "capacity unavailable"
          : `${capacityPercent}% booked`;
  const subheadline =
    input.status === "partial"
      ? "Appointment and retention metrics are current. Capacity estimates are hidden until coverage recovers."
      : input.status === "stale"
        ? "Use these numbers for context only. Review current bookings in Square before acting."
        : capacityPercent === null
          ? "Capacity requires at least one serviceable hour before it can be calculated."
          : `You have ${openHours} serviceable hours still open and ${visibleOpportunities.length === 1 ? "one" : visibleOpportunities.length === 2 ? "two" : visibleOpportunities.length} focused ways to act.`;

  return {
    headline,
    subheadline,
    totalOpportunity: opportunityTotal === null
      ? "Unavailable"
      : currency.format(opportunityTotal / 100),
    totalOpportunityCents: opportunityTotal,
    opportunityCount: visibleOpportunities.length,
    opportunities: visibleOpportunities,
    actionContext: input.actionContext,
    metrics: [
      capacityMetric,
      {
        id: "appointments",
        value: String(appointmentTotal),
        change: `+${appointmentTotal - input.appointments.previousTotal}`,
        context: `${input.appointments.confirmed} confirmed · ${input.appointments.completed} completed${stale ? " · stale" : ""}`,
        formula:
          "Count of scheduled and completed appointments whose start time falls in the selected week; cancelled and no-show records are excluded.",
        state: supportedState,
      },
      {
        id: "rebooking",
        value: returnRate === null ? "—" : `${returnRate}%`,
        change: returnRate === null ? "Unavailable" : `↗ ${returnRate - input.retention.previousRatePercent}%`,
        context: returnRate === null ? "No eligible visits" : `${input.retention.returned} of ${input.retention.eligible} eligible visits${stale ? " · stale" : ""}`,
        formula: returnRate === null ? "Not calculated. Rebooking rate requires at least one eligible completed visit." : `Eligible completed appointments followed by a future booking within 45 days ÷ eligible completed appointments: ${input.retention.returned} ÷ ${input.retention.eligible} = ${returnRate}%.`,
        state: returnRate === null ? "unavailable" : supportedState,
      },
      {
        id: "cancellations",
        value: String(input.cancellations.total),
        change: `${input.cancellations.refilled} refilled`,
        context: `${input.cancellations.total - input.cancellations.refilled} slots remain open${stale ? " · stale" : ""}`,
        formula:
          "Count of appointments cancelled during the selected week; refilled when a later active appointment overlaps the released slot.",
        state: supportedState,
      },
    ],
    capacity: {
      state: capacityPercent === null ? "unavailable" : input.capacity.state,
      percent: capacityPercent,
      bookedHours,
      openHours,
      blockedHours,
    },
    returnPulse: {
      rate: returnRate,
      change: returnRate === null ? null : returnRate - input.retention.previousRatePercent,
    },
    returnHistory,
    returnTrendLabel: returnRate === null
      ? "Client return rate is unavailable because no visits are eligible"
      : returnDirection === null
        ? "Client return trend is unavailable because history is incomplete"
      : `Client return rate ${returnDirection} from ${firstReturnRate}% to ${lastReturnRate}% over six months`,
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
