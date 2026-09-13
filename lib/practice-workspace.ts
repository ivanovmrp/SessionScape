export type WorkspaceProvenance = "owner-entered" | "sample-derived";
export type WorkspaceSlot = "owner" | "sample-derived";
export type AppointmentStatus =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "no-show";

export type PractitionerRecord = {
  id: string;
  label: string;
  active: boolean;
};

export type ServiceRecord = {
  id: string;
  label: string;
  defaultDurationMinutes: number;
  defaultValueCents: number;
  active: boolean;
};

export type AvailabilityRecord =
  | {
      id: string;
      practitionerId: string;
      localDate: string;
      closed: true;
    }
  | {
      id: string;
      practitionerId: string;
      localDate: string;
      closed: false;
      startMinute: number;
      endMinute: number;
    };

export type AppointmentRecord = {
  id: string;
  practitionerId: string;
  serviceId: string;
  startAt: string;
  durationMinutes: number;
  valueCents: number;
  status: AppointmentStatus;
  anonymousClientId?: string;
  createdAt: string;
  statusChangedAt: string;
  cancelledAt?: string;
};

export type PracticeWorkspace = {
  version: 1;
  provenance: WorkspaceProvenance;
  timezone: string;
  practitioners: PractitionerRecord[];
  services: ServiceRecord[];
  availability: AvailabilityRecord[];
  appointments: AppointmentRecord[];
};

export type StoragePort = Pick<Storage, "getItem" | "setItem" | "removeItem">;

type ParseResult =
  | { ok: true; value: PracticeWorkspace }
  | { ok: false; error: "invalid-data" };

type RepositoryFailure =
  | "storage-unavailable"
  | "read-failed"
  | "write-failed"
  | "clear-failed"
  | "invalid-data";

export const PRACTICE_WORKSPACE_STORAGE_KEYS: Record<WorkspaceSlot, string> = {
  owner: "sessionscape.practice-workspace.owner.v1",
  "sample-derived": "sessionscape.practice-workspace.sample-derived.v1",
};

export const RAW_SAMPLE_WORKSPACE: PracticeWorkspace = {
  version: 1,
  provenance: "sample-derived",
  timezone: "America/New_York",
  practitioners: [
    { id: "practitioner_maya00000001", label: "Maya", active: true },
  ],
  services: [
    {
      id: "service_deeptissue01",
      label: "Deep tissue",
      defaultDurationMinutes: 90,
      defaultValueCents: 14_500,
      active: true,
    },
  ],
  availability: [
    {
      id: "availability_sep07000001",
      practitionerId: "practitioner_maya00000001",
      localDate: "2026-09-07",
      closed: false,
      startMinute: 540,
      endMinute: 1020,
    },
  ],
  appointments: [
    {
      id: "appointment_sep07000001",
      practitionerId: "practitioner_maya00000001",
      serviceId: "service_deeptissue01",
      startAt: "2026-09-07T13:00:00.000Z",
      durationMinutes: 90,
      valueCents: 14_500,
      status: "completed",
      anonymousClientId: "anon_7f3a91c2d4e6",
      createdAt: "2026-08-31T13:00:00.000Z",
      statusChangedAt: "2026-09-07T14:30:00.000Z",
    },
  ],
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const hasExactKeys = (
  value: Record<string, unknown>,
  required: string[],
  optional: string[] = [],
) => {
  const keys = Object.keys(value);
  const allowed = new Set([...required, ...optional]);
  return required.every((key) => key in value) && keys.every((key) => allowed.has(key));
};

const isOpaqueId = (value: unknown, prefix: string) =>
  typeof value === "string" &&
  new RegExp(`^${prefix}_[a-z0-9]{8,32}$`).test(value);

const isAnonymousClientId = (value: unknown) =>
  typeof value === "string" && /^anon_[a-z0-9]{12}$/.test(value);

const isSafeLabel = (value: unknown) =>
  typeof value === "string" &&
  value.length > 0 &&
  value.length <= 80 &&
  value.trim() === value &&
  !value.includes("@") &&
  !/[\r\n]/.test(value) &&
  !/\d{7,}/.test(value);

const isPositiveInteger = (value: unknown) =>
  Number.isInteger(value) && (value as number) > 0;

const isNonNegativeInteger = (value: unknown) =>
  Number.isInteger(value) && (value as number) >= 0;

const isLocalDate = (value: unknown) =>
  typeof value === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`));

const isUtcInstant = (value: unknown): value is string =>
  typeof value === "string" &&
  value.endsWith("Z") &&
  !Number.isNaN(Date.parse(value)) &&
  new Date(value).toISOString() === value;

const isTimezone = (value: unknown) => {
  if (typeof value !== "string") return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
};

const hasUniqueIds = (records: { id: string }[]) =>
  new Set(records.map(({ id }) => id)).size === records.length;

const isPractitioner = (value: unknown): value is PractitionerRecord =>
  isRecord(value) &&
  hasExactKeys(value, ["id", "label", "active"]) &&
  isOpaqueId(value.id, "practitioner") &&
  isSafeLabel(value.label) &&
  typeof value.active === "boolean";

const isService = (value: unknown): value is ServiceRecord =>
  isRecord(value) &&
  hasExactKeys(value, [
    "id",
    "label",
    "defaultDurationMinutes",
    "defaultValueCents",
    "active",
  ]) &&
  isOpaqueId(value.id, "service") &&
  isSafeLabel(value.label) &&
  isPositiveInteger(value.defaultDurationMinutes) &&
  isNonNegativeInteger(value.defaultValueCents) &&
  typeof value.active === "boolean";

const isAvailability = (value: unknown): value is AvailabilityRecord => {
  if (!isRecord(value) || typeof value.closed !== "boolean") return false;
  const required = ["id", "practitionerId", "localDate", "closed"];
  if (
    !isOpaqueId(value.id, "availability") ||
    !isOpaqueId(value.practitionerId, "practitioner") ||
    !isLocalDate(value.localDate)
  ) {
    return false;
  }
  if (value.closed) return hasExactKeys(value, required);
  return (
    hasExactKeys(value, [...required, "startMinute", "endMinute"]) &&
    isNonNegativeInteger(value.startMinute) &&
    isPositiveInteger(value.endMinute) &&
    (value.endMinute as number) <= 1440 &&
    (value.startMinute as number) < (value.endMinute as number)
  );
};

const appointmentStatuses: AppointmentStatus[] = [
  "scheduled",
  "completed",
  "cancelled",
  "no-show",
];

const isAppointment = (value: unknown): value is AppointmentRecord => {
  if (!isRecord(value)) return false;
  const required = [
    "id",
    "practitionerId",
    "serviceId",
    "startAt",
    "durationMinutes",
    "valueCents",
    "status",
    "createdAt",
    "statusChangedAt",
  ];
  if (
    !hasExactKeys(value, required, ["anonymousClientId", "cancelledAt"]) ||
    !isOpaqueId(value.id, "appointment") ||
    !isOpaqueId(value.practitionerId, "practitioner") ||
    !isOpaqueId(value.serviceId, "service") ||
    !isUtcInstant(value.startAt) ||
    !isPositiveInteger(value.durationMinutes) ||
    !isNonNegativeInteger(value.valueCents) ||
    !appointmentStatuses.includes(value.status as AppointmentStatus) ||
    !isUtcInstant(value.createdAt) ||
    !isUtcInstant(value.statusChangedAt) ||
    Date.parse(value.createdAt) > Date.parse(value.statusChangedAt) ||
    (value.anonymousClientId !== undefined &&
      !isAnonymousClientId(value.anonymousClientId))
  ) {
    return false;
  }

  if (value.status === "cancelled") {
    return (
      isUtcInstant(value.cancelledAt) &&
      Date.parse(value.cancelledAt) >= Date.parse(value.createdAt) &&
      Date.parse(value.cancelledAt) <= Date.parse(value.statusChangedAt)
    );
  }
  return value.cancelledAt === undefined;
};

export function parsePracticeWorkspace(value: unknown): ParseResult {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "version",
      "provenance",
      "timezone",
      "practitioners",
      "services",
      "availability",
      "appointments",
    ]) ||
    value.version !== 1 ||
    (value.provenance !== "owner-entered" &&
      value.provenance !== "sample-derived") ||
    !isTimezone(value.timezone) ||
    !Array.isArray(value.practitioners) ||
    !value.practitioners.every(isPractitioner) ||
    !Array.isArray(value.services) ||
    !value.services.every(isService) ||
    !Array.isArray(value.availability) ||
    !value.availability.every(isAvailability) ||
    !Array.isArray(value.appointments) ||
    !value.appointments.every(isAppointment)
  ) {
    return { ok: false, error: "invalid-data" };
  }

  const practitioners = value.practitioners as PractitionerRecord[];
  const services = value.services as ServiceRecord[];
  const availability = value.availability as AvailabilityRecord[];
  const appointments = value.appointments as AppointmentRecord[];
  const practitionerIds = new Set(practitioners.map(({ id }) => id));
  const serviceIds = new Set(services.map(({ id }) => id));
  if (
    !hasUniqueIds(practitioners) ||
    !hasUniqueIds(services) ||
    !hasUniqueIds(availability) ||
    !hasUniqueIds(appointments) ||
    availability.some(({ practitionerId }) => !practitionerIds.has(practitionerId)) ||
    appointments.some(
      ({ practitionerId, serviceId }) =>
        !practitionerIds.has(practitionerId) || !serviceIds.has(serviceId),
    )
  ) {
    return { ok: false, error: "invalid-data" };
  }

  return { ok: true, value: value as PracticeWorkspace };
}

type RepeatedTimeChoice = "earlier" | "later";

type LocalTimeResolution =
  | { ok: true; value: string }
  | { ok: false; error: "invalid-local-time" | "nonexistent-local-time" }
  | {
      ok: false;
      error: "ambiguous-local-time";
      candidates: [string, string];
    };

export type PracticeWeek = {
  startLocalDate: string;
  endLocalDate: string;
  startAt: string;
  endAt: string;
  label: string;
};

const parseExactLocalDate = (localDate: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(localDate);
  if (!match) return null;
  const parts = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  return date.toISOString().slice(0, 10) === localDate ? parts : null;
};

const localPartsAt = (instant: number, timezone: string) => {
  const values = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(instant).map(({ type, value }) => [type, value]),
  );
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
  };
};

export function resolveLocalDateTime(
  timezone: string,
  localDate: string,
  minuteOfDay: number,
  repeatedTimeChoice?: RepeatedTimeChoice,
): LocalTimeResolution {
  const date = parseExactLocalDate(localDate);
  if (
    !date ||
    !isTimezone(timezone) ||
    !Number.isInteger(minuteOfDay) ||
    minuteOfDay < 0 ||
    minuteOfDay >= 24 * 60
  ) {
    return { ok: false, error: "invalid-local-time" };
  }

  const hour = Math.floor(minuteOfDay / 60);
  const minute = minuteOfDay % 60;
  const localAsUtc = Date.UTC(date.year, date.month - 1, date.day, hour, minute);
  const offsets = new Set<number>();
  for (let deltaHours = -36; deltaHours <= 36; deltaHours += 6) {
    const sample = localAsUtc + deltaHours * 3_600_000;
    const parts = localPartsAt(sample, timezone);
    const formattedAsUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
    );
    offsets.add(formattedAsUtc - sample);
  }

  const candidates = [...offsets]
    .map((offset) => localAsUtc - offset)
    .filter((instant) => {
      const parts = localPartsAt(instant, timezone);
      return parts.year === date.year &&
        parts.month === date.month &&
        parts.day === date.day &&
        parts.hour === hour &&
        parts.minute === minute;
    })
    .sort((left, right) => left - right)
    .map((instant) => new Date(instant).toISOString());

  if (candidates.length === 0) {
    return { ok: false, error: "nonexistent-local-time" };
  }
  if (candidates.length === 1) {
    return { ok: true, value: candidates[0] };
  }
  const repeatedCandidates: [string, string] = [candidates[0], candidates[1]];
  if (!repeatedTimeChoice) {
    return {
      ok: false,
      error: "ambiguous-local-time",
      candidates: repeatedCandidates,
    };
  }
  return {
    ok: true,
    value: repeatedTimeChoice === "earlier"
      ? repeatedCandidates[0]
      : repeatedCandidates[1],
  };
}

const shiftLocalDate = (localDate: string, days: number) => {
  const date = parseExactLocalDate(localDate);
  if (!date || !Number.isInteger(days)) throw new Error("A valid local date and whole-day shift are required");
  return new Date(Date.UTC(date.year, date.month - 1, date.day + days))
    .toISOString()
    .slice(0, 10);
};

export function shiftPracticeWeek(localDate: string, weeks: number) {
  if (!Number.isInteger(weeks)) throw new Error("A whole-week shift is required");
  return shiftLocalDate(localDate, weeks * 7);
}

const formatWeekLabel = (startLocalDate: string, endLocalDate: string) => {
  const start = new Date(`${startLocalDate}T00:00:00.000Z`);
  const end = new Date(`${endLocalDate}T00:00:00.000Z`);
  const month = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
  const startMonth = month.format(start);
  const endMonth = month.format(end);
  const startYear = start.getUTCFullYear();
  const endYear = end.getUTCFullYear();
  if (startYear !== endYear) {
    return `${startMonth} ${start.getUTCDate()}, ${startYear}–${endMonth} ${end.getUTCDate()}, ${endYear}`;
  }
  if (startMonth !== endMonth) {
    return `${startMonth} ${start.getUTCDate()}–${endMonth} ${end.getUTCDate()}, ${endYear}`;
  }
  return `${startMonth} ${start.getUTCDate()}–${end.getUTCDate()}, ${endYear}`;
};

export function getPracticeWeek(timezone: string, localDate: string): PracticeWeek {
  const date = parseExactLocalDate(localDate);
  if (!date || !isTimezone(timezone)) throw new Error("A valid timezone and local date are required");
  const day = new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay();
  const startLocalDate = shiftLocalDate(localDate, -((day + 6) % 7));
  const endLocalDate = shiftLocalDate(startLocalDate, 6);
  const nextStartLocalDate = shiftLocalDate(startLocalDate, 7);
  const start = resolveLocalDateTime(timezone, startLocalDate, 0, "earlier");
  const end = resolveLocalDateTime(timezone, nextStartLocalDate, 0, "earlier");
  if (!start.ok || !end.ok) throw new Error("The practice week boundary is not resolvable");
  return {
    startLocalDate,
    endLocalDate,
    startAt: start.value,
    endAt: end.value,
    label: formatWeekLabel(startLocalDate, endLocalDate),
  };
}

export function getAvailabilityCoverage(
  workspace: PracticeWorkspace,
  week: PracticeWeek,
) {
  const activePractitionerIds = workspace.practitioners
    .filter(({ active }) => active)
    .map(({ id }) => id);
  if (activePractitionerIds.length === 0) {
    return { activePractitioners: 0, coveredDays: 0, totalDays: 7 };
  }
  const coveredDays = Array.from({ length: 7 }, (_, index) =>
    shiftLocalDate(week.startLocalDate, index),
  ).filter((localDate) => activePractitionerIds.every((practitionerId) =>
    workspace.availability.some((record) =>
      record.practitionerId === practitionerId && record.localDate === localDate,
    ),
  )).length;
  return {
    activePractitioners: activePractitionerIds.length,
    coveredDays,
    totalDays: 7,
  };
}

export function anonymousClientIdFromUuid(uuid: string) {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      uuid,
    )
  ) {
    throw new Error("A valid UUID is required");
  }
  return `anon_${uuid.replaceAll("-", "").slice(0, 12).toLowerCase()}`;
}

export function createPracticeWorkspaceRepository(storage: StoragePort | null) {
  const unavailable = (): { ok: false; error: RepositoryFailure } => ({
    ok: false,
    error: "storage-unavailable",
  });

  return {
    load(slot: WorkspaceSlot) {
      if (!storage) return unavailable();
      let raw: string | null;
      try {
        raw = storage.getItem(PRACTICE_WORKSPACE_STORAGE_KEYS[slot]);
      } catch {
        return { ok: false as const, error: "read-failed" as const };
      }
      if (raw === null) return { ok: true as const, value: null };
      try {
        const parsed = parsePracticeWorkspace(JSON.parse(raw));
        if (parsed.ok) return parsed;
      } catch {
        // The raw value remains untouched for visible recovery.
      }
      return {
        ok: false as const,
        error: "invalid-data" as const,
        raw,
      };
    },
    save(slot: WorkspaceSlot, workspace: PracticeWorkspace) {
      if (!storage) return unavailable();
      if (!parsePracticeWorkspace(workspace).ok) {
        return { ok: false as const, error: "invalid-data" as const };
      }
      try {
        storage.setItem(
          PRACTICE_WORKSPACE_STORAGE_KEYS[slot],
          JSON.stringify(workspace),
        );
        return { ok: true as const };
      } catch {
        return { ok: false as const, error: "write-failed" as const };
      }
    },
    clear(slot: WorkspaceSlot) {
      if (!storage) return unavailable();
      try {
        storage.removeItem(PRACTICE_WORKSPACE_STORAGE_KEYS[slot]);
        return { ok: true as const };
      } catch {
        return { ok: false as const, error: "clear-failed" as const };
      }
    },
  };
}
