export type DashboardInput = {
  status: "current" | "partial" | "stale";
  bookedHours: number;
  openHours: number;
  blockedHours: number;
  previousCapacityPercent: number;
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
  days: { label: string; bookedHours: number; openHours: number }[];
  opportunities: { id: string; estimatedCents: number }[];
};

export type DerivedMetric = {
  id: "capacity" | "appointments" | "rebooking" | "cancellations";
  value: string;
  change: string;
  context: string;
  formula: string;
};

export type DerivedDashboard = {
  headline: string;
  subheadline: string;
  totalOpportunity: string;
  totalOpportunityCents: number;
  opportunityCount: number;
  metrics: DerivedMetric[];
  capacity: {
    percent: number;
    bookedHours: number;
    openHours: number;
    blockedHours: number;
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
  const serviceableHours = input.bookedHours + input.openHours;
  const capacityPercent = percent(input.bookedHours, serviceableHours);
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

  return {
    headline: `${capacityPercent}% booked`,
    subheadline: `You have ${input.openHours} serviceable hours still open and ${input.opportunities.length === 2 ? "two" : input.opportunities.length} focused ways to act.`,
    totalOpportunity: currency.format(opportunityTotal / 100),
    totalOpportunityCents: opportunityTotal,
    opportunityCount: input.opportunities.length,
    metrics: [
      {
        id: "capacity",
        value: `${capacityPercent}%`,
        change: `↗ ${capacityPercent - input.previousCapacityPercent}%`,
        context: `${input.bookedHours} of ${serviceableHours} serviceable hours`,
        formula: `Booked serviceable hours ÷ total serviceable hours: ${input.bookedHours}h ÷ ${serviceableHours}h = ${capacityPercent}%.`,
      },
      {
        id: "appointments",
        value: String(appointmentTotal),
        change: `+${appointmentTotal - input.appointments.previousTotal}`,
        context: `${input.appointments.confirmed} confirmed · ${input.appointments.completed} completed`,
        formula:
          "Count of non-cancelled appointments whose start time falls in the selected week.",
      },
      {
        id: "rebooking",
        value: `${returnRate}%`,
        change: `↗ ${returnRate - input.retention.previousRatePercent}%`,
        context: `${input.retention.returned} of ${input.retention.eligible} eligible visits`,
        formula: `Eligible completed appointments followed by a future booking within 45 days ÷ eligible completed appointments: ${input.retention.returned} ÷ ${input.retention.eligible} = ${returnRate}%.`,
      },
      {
        id: "cancellations",
        value: String(input.cancellations.total),
        change: `${input.cancellations.refilled} refilled`,
        context: `${input.cancellations.total - input.cancellations.refilled} slots remain open`,
        formula:
          "Count of appointments cancelled during the selected week; refilled when a later active appointment overlaps the released slot.",
      },
    ],
    capacity: {
      percent: capacityPercent,
      bookedHours: input.bookedHours,
      openHours: input.openHours,
      blockedHours: input.blockedHours,
    },
    returnPulse: {
      rate: returnRate,
      change: returnRate - input.retention.previousRatePercent,
    },
    days: input.days.map((day) => {
      const total = day.bookedHours + day.openHours;
      return {
        label: day.label,
        booked: percent(day.bookedHours, total),
        open: percent(day.openHours, total),
      };
    }),
  };
}
