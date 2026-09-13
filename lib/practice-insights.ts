import type { DashboardInput } from "./dashboard-calculations";
import {
  getAvailabilityCoverage,
  isCancellationRefilled,
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

export function adaptPracticeWorkspaceToDashboardInput(
  workspace: PracticeWorkspace,
  week: PracticeWeek,
): PracticeDashboardInput {
  const appointments = uniqueAppointments(workspace.appointments);
  const deduplicatedRecords = workspace.appointments.length - appointments.length;
  const start = Date.parse(week.startAt);
  const end = Date.parse(week.endAt);
  const previousStart = start - 7 * 24 * 60 * 60_000;
  const selected = appointments.filter(({ startAt }) => {
    const instant = Date.parse(startAt);
    return instant >= start && instant < end;
  });
  const activeSelected = selected.filter(activeStatus);
  const coverage = getAvailabilityCoverage(workspace, week);
  const dates = localDatesForWeek(week);

  const availabilityHoursByDate = new Map(dates.map((localDate) => [
    localDate,
    workspace.availability
      .filter((record) => record.localDate === localDate)
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
      .filter((record) => localParts(record.startAt, workspace.timezone).localDate === localDate && insideAvailability(record))
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
    return instant >= previousStart && instant < start && activeStatus(record);
  }).length;

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
    opportunities: [],
    evidence: {
      provenance: workspace.provenance,
      period: week.label,
      activePractitioners: coverage.activePractitioners,
      coveredDays: coverage.coveredDays,
      deduplicatedRecords,
      excluded: {
        cancelled: selected.filter(({ status }) => status === "cancelled").length,
        noShow: selected.filter(({ status }) => status === "no-show").length,
        outsideAvailability: activeSelected.filter((record) => !insideAvailability(record)).length,
      },
    },
  };
}
