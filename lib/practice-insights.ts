import type { DashboardInput, DashboardOpportunityInput } from "./dashboard-calculations";
import {
  getAvailabilityCoverage,
  getPracticeWeek,
  isCancellationRefilled,
  resolveLocalDateTime,
  shiftPracticeWeek,
  type AppointmentRecord,
  type PracticeWeek,
  type PracticeWorkspace,
} from "./practice-workspace";

export type PracticeDashboardInput = DashboardInput & {
  evidence: {
    provenance: PracticeWorkspace["provenance"];
    period: string;
    activePractitioners: number;
    coveredDays: number;
    deduplicatedRecords: number;
    unavailableRecommendations: string[];
    excluded: {
      cancelled: number;
      noShow: number;
      outsideAvailability: number;
    };
  };
};

const localParts = (instant: string, timezone: string) => {
  const values = Object.fromEntries(new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(instant)).map(({ type, value }) => [type, value]));
  return {
    localDate: `${values.year}-${values.month}-${values.day}`,
    minute: Number(values.hour) * 60 + Number(values.minute),
  };
};

const activeStatus = ({ status }: AppointmentRecord) =>
  status === "scheduled" || status === "completed";

const uniqueAppointments = (appointments: AppointmentRecord[]) => {
  const byId = new Map<string, AppointmentRecord>();
  appointments.forEach((record) => {
    if (!byId.has(record.id)) byId.set(record.id, record);
  });
  return [...byId.values()];
};

const localDatesForWeek = (week: PracticeWeek) => Array.from(
  { length: 7 },
  (_, index) => {
    const date = new Date(`${week.startLocalDate}T00:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() + index);
    return date.toISOString().slice(0, 10);
  },
);

const median = (values: number[]) => {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[middle]
    : Math.floor((sorted[middle - 1] + sorted[middle]) / 2);
};

const removeBookedIntervals = (
  interval: { start: number; end: number },
  booked: { start: number; end: number }[],
) => booked
  .sort((left, right) => left.start - right.start)
  .reduce((open, blocked) => open.flatMap((candidate) => {
    if (blocked.end <= candidate.start || blocked.start >= candidate.end) return [candidate];
    return [
      ...(blocked.start > candidate.start ? [{ start: candidate.start, end: blocked.start }] : []),
      ...(blocked.end < candidate.end ? [{ start: blocked.end, end: candidate.end }] : []),
    ];
  }), [interval]);

const ownerReviewOpportunity = (
  opportunity: Omit<DashboardOpportunityInput, "draft" | "audiences" | "eligibility" | "providerHandoff">,
): DashboardOpportunityInput => ({
  ...opportunity,
  draft: "",
  audiences: [],
  eligibility: "Manual records do not include consent or suppression evidence; review only.",
  providerHandoff: {
    provider: "Owner-entered",
    label: "Review practice data",
    limitation: "No booking, messaging, payment, or provider action is available from manual records.",
  },
});

export function adaptPracticeWorkspaceToDashboardInput(
  workspace: PracticeWorkspace,
  week: PracticeWeek,
  options: { evaluationAt?: string } = {},
): PracticeDashboardInput {
  const appointments = uniqueAppointments(workspace.appointments);
  const deduplicatedRecords = workspace.appointments.length - appointments.length;
  const start = Date.parse(week.startAt);
  const end = Date.parse(week.endAt);
  const previousWeek = getPracticeWeek(
    workspace.timezone,
    shiftPracticeWeek(week.startLocalDate, -1),
  );
  const previousStart = Date.parse(previousWeek.startAt);
  const previousEnd = Date.parse(previousWeek.endAt);
  const selected = appointments.filter(({ startAt }) => {
    const instant = Date.parse(startAt);
    return instant >= start && instant < end;
  });
  const activeSelected = selected.filter(activeStatus);
  const coverage = getAvailabilityCoverage(workspace, week);
  const dates = localDatesForWeek(week);
  const activePractitionerIds = new Set(
    workspace.practitioners.filter(({ active }) => active).map(({ id }) => id),
  );

  const availabilityHoursByDate = new Map(dates.map((localDate) => [
    localDate,
    workspace.availability
      .filter((record) =>
        record.localDate === localDate && activePractitionerIds.has(record.practitionerId),
      )
      .reduce((total, record) => record.closed
        ? total
        : total + (record.endMinute - record.startMinute) / 60, 0),
  ]));
  const insideAvailability = (record: AppointmentRecord) => {
    const startLocal = localParts(record.startAt, workspace.timezone);
    const endLocal = localParts(
      new Date(Date.parse(record.startAt) + record.durationMinutes * 60_000).toISOString(),
      workspace.timezone,
    );
    return startLocal.localDate === endLocal.localDate && workspace.availability.some((availability) =>
      !availability.closed &&
      availability.practitionerId === record.practitionerId &&
      availability.localDate === startLocal.localDate &&
      availability.startMinute <= startLocal.minute &&
      availability.endMinute >= endLocal.minute,
    );
  };
  const bookedByDate = new Map(dates.map((localDate) => [
    localDate,
    activeSelected
      .filter((record) =>
        activePractitionerIds.has(record.practitionerId) &&
        localParts(record.startAt, workspace.timezone).localDate === localDate &&
        insideAvailability(record),
      )
      .reduce((total, record) => total + record.durationMinutes / 60, 0),
  ]));
  const bookedHours = [...bookedByDate.values()].reduce((total, hours) => total + hours, 0);
  const availabilityHours = [...availabilityHoursByDate.values()].reduce((total, hours) => total + hours, 0);
  const capacityComplete = coverage.activePractitioners > 0 && coverage.coveredDays === 7;

  const cancelledThisWeek = appointments.filter(({ cancelledAt }) => {
    if (!cancelledAt) return false;
    const instant = Date.parse(cancelledAt);
    return instant >= start && instant < end;
  });
  const previousTotal = appointments.filter((record) => {
    const instant = Date.parse(record.startAt);
    return instant >= previousStart && instant < previousEnd && activeStatus(record);
  }).length;
  const evaluationAt = Date.parse(options.evaluationAt ?? week.startAt);
  const sixMonthsAgo = Date.parse(week.endAt) - 183 * 24 * 60 * 60_000;
  const completedRatesForPractitioner = (practitionerId: string) => appointments
    .filter((record) =>
      record.practitionerId === practitionerId &&
      record.status === "completed" &&
      Date.parse(record.startAt) >= sixMonthsAgo &&
      Date.parse(record.startAt) < Date.parse(week.endAt),
    )
    .map((record) => Math.floor(record.valueCents * 60 / record.durationMinutes));
  const capacityOpportunities = capacityComplete ? workspace.practitioners.flatMap((practitioner) => {
    if (!practitioner.active) return [];
    const rates = completedRatesForPractitioner(practitioner.id);
    if (rates.length < 3) return [];
    const hourlyValueCents = median(rates);
    return workspace.availability.flatMap((availability) => {
      if (availability.closed || availability.practitionerId !== practitioner.id || !dates.includes(availability.localDate)) return [];
      const booked = activeSelected
        .filter((record) => record.practitionerId === practitioner.id)
        .flatMap((record) => {
          const recordStart = localParts(record.startAt, workspace.timezone);
          const recordEnd = localParts(new Date(Date.parse(record.startAt) + record.durationMinutes * 60_000).toISOString(), workspace.timezone);
          return recordStart.localDate === availability.localDate && recordEnd.localDate === availability.localDate
            ? [{ start: recordStart.minute, end: recordEnd.minute }]
            : [];
        });
      return removeBookedIntervals(
        { start: availability.startMinute, end: availability.endMinute },
        booked,
      ).flatMap((open) => {
        const durationMinutes = open.end - open.start;
        const resolved = resolveLocalDateTime(workspace.timezone, availability.localDate, open.start, "earlier");
        const estimatedCents = Math.floor(hourlyValueCents * durationMinutes / 60);
        if (!resolved.ok || durationMinutes < 120 || Date.parse(resolved.value) < evaluationAt + 48 * 60 * 60_000 || estimatedCents <= 15_000) return [];
        const serviceHours = Number((durationMinutes / 60).toFixed(2));
        return [ownerReviewOpportunity({
          id: `capacity-${practitioner.id}-${availability.localDate}-${open.start}`,
          estimatedCents,
          type: "capacity",
          kicker: "OPEN CAPACITY",
          urgency: "Review this week",
          title: `${practitioner.label} has ${serviceHours} open service hours`,
          summary: `${availability.localDate} has a continuous owner-entered opening at least 48 hours away.`,
          reason: `Three or more completed appointments support a median value of ${hourlyValueCents} cents per service hour.`,
          valueNote: "estimated from completed manual records",
          ruleVersion: "CAP-MANUAL-1",
          rule: "Surface a continuous opening of at least two hours, at least 48 hours away, when estimated value is more than $150.",
        })];
      });
    });
  }) : [];

  const completedByClient = new Map<string, AppointmentRecord[]>();
  appointments.filter((record) =>
    record.status === "completed" &&
    record.anonymousClientId &&
    Date.parse(record.startAt) >= sixMonthsAgo &&
    Date.parse(record.startAt) < Date.parse(week.endAt),
  ).forEach((record) => {
    const records = completedByClient.get(record.anonymousClientId as string) ?? [];
    records.push(record);
    completedByClient.set(record.anonymousClientId as string, records);
  });
  const overdueClients = [...completedByClient.entries()].filter(([clientId, records]) => {
    const sorted = records.sort((left, right) => left.startAt.localeCompare(right.startAt));
    if (sorted.length < 3) return false;
    const intervals = sorted.slice(1).map((record, index) => Date.parse(record.startAt) - Date.parse(sorted[index].startAt));
    const overdueAt = Date.parse(sorted.at(-1)?.startAt ?? "") + median(intervals) + 14 * 24 * 60 * 60_000;
    const futureScheduled = appointments.some((record) =>
      record.anonymousClientId === clientId &&
      record.status === "scheduled" &&
      Date.parse(record.startAt) > evaluationAt,
    );
    return evaluationAt >= overdueAt && !futureScheduled;
  });
  const retentionOpportunities = overdueClients.length === 0 ? [] : [ownerReviewOpportunity({
    id: "retention-owner-review",
    estimatedCents: null,
    type: "retention",
    kicker: "RETURN PATTERN",
    urgency: "Owner review",
    title: `${overdueClients.length} anonymous client${overdueClients.length === 1 ? "" : "s"} may be overdue`,
    summary: "Anonymous visit history shows a gap beyond the client’s usual return interval.",
    reason: "Each signal has at least three completed visits, is 14 or more days beyond its median interval, and has no future scheduled appointment.",
    valueNote: "No outreach value estimated",
    ruleVersion: "RET-MANUAL-1",
    rule: "Flag anonymous records with three completed visits, a 14-day overdue gap, and no future scheduled appointment.",
  })];

  return {
    status: capacityComplete ? "current" : "partial",
    actionContext: {
      freshness: "Owner-entered records in this browser",
      coverage: `Availability ${coverage.coveredDays} of ${coverage.totalDays} days`,
      limitation: "Manual records cannot prove outreach eligibility, consent, or suppressions.",
      recheckRequired: false,
    },
    capacity: capacityComplete
      ? {
          state: "current",
          bookedHours,
          openHours: Math.max(0, availabilityHours - bookedHours),
          blockedHours: 0,
          previousPercent: 0,
          days: dates.map((localDate) => ({
            label: new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" }).format(new Date(`${localDate}T00:00:00.000Z`)),
            bookedHours: bookedByDate.get(localDate) ?? 0,
            openHours: Math.max(0, (availabilityHoursByDate.get(localDate) ?? 0) - (bookedByDate.get(localDate) ?? 0)),
          })),
        }
      : { state: "unavailable" },
    appointments: {
      confirmed: selected.filter(({ status }) => status === "scheduled").length,
      completed: selected.filter(({ status }) => status === "completed").length,
      previousTotal,
    },
    retention: {
      returned: 0,
      eligible: 0,
      previousRatePercent: 0,
      history: [],
    },
    cancellations: {
      total: cancelledThisWeek.length,
      refilled: cancelledThisWeek.filter((record) => isCancellationRefilled(record, appointments)).length,
    },
    opportunities: [...capacityOpportunities, ...retentionOpportunities],
    evidence: {
      provenance: workspace.provenance,
      period: week.label,
      activePractitioners: coverage.activePractitioners,
      coveredDays: coverage.coveredDays,
      deduplicatedRecords,
      unavailableRecommendations: [
        ...(!capacityComplete
          ? ["Capacity recommendations require complete availability for every active practitioner."]
          : workspace.practitioners.some(({ id, active }) =>
              active && completedRatesForPractitioner(id).length < 3,
            )
            ? ["Capacity recommendations require at least three completed appointments per active practitioner."]
            : []),
        ...([...completedByClient.values()].some((records) => records.length >= 3)
          ? []
          : ["Retention recommendations require at least three completed visits linked to one anonymous client ID."]),
      ],
      excluded: {
        cancelled: selected.filter(({ status }) => status === "cancelled").length,
        noShow: selected.filter(({ status }) => status === "no-show").length,
        outsideAvailability: activeSelected.filter((record) => !insideAvailability(record)).length,
      },
    },
  };
}
