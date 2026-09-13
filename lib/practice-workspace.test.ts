/// <reference types="vitest/globals" />

import { test } from "vitest";
import {
  PRACTICE_WORKSPACE_STORAGE_KEYS,
  RAW_SAMPLE_WORKSPACE,
  anonymousClientIdFromUuid,
  createPracticeWorkspaceRepository,
  getPracticeWeek,
  isCancellationRefilled,
  parsePracticeWorkspace,
  resolveLocalDateTime,
  shiftPracticeWeek,
  validateAppointmentSave,
  type PracticeWorkspace,
  type StoragePort,
} from "./practice-workspace";

const validWorkspace = (): PracticeWorkspace => ({
  version: 1,
  provenance: "owner-entered",
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
    {
      id: "availability_sep13000001",
      practitionerId: "practitioner_maya00000001",
      localDate: "2026-09-13",
      closed: true,
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
});

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

test("accepts the exact provider-neutral workspace and canonical raw sample", () => {
  expect(parsePracticeWorkspace(validWorkspace())).toEqual({
    ok: true,
    value: validWorkspace(),
  });

  const sample = parsePracticeWorkspace(RAW_SAMPLE_WORKSPACE);
  expect(sample.ok).toBe(true);
  expect(RAW_SAMPLE_WORKSPACE.provenance).toBe("sample-derived");
  expect(RAW_SAMPLE_WORKSPACE.appointments.length).toBeGreaterThan(0);
});

test("accepts historical appointments that reference inactive catalog entries", () => {
  const workspace = validWorkspace();
  workspace.practitioners[0].active = false;
  workspace.services[0].active = false;

  expect(parsePracticeWorkspace(workspace).ok).toBe(true);
});

test("rejects unknown or prohibited fields at every persisted boundary", () => {
  const withClientName = clone(validWorkspace()) as PracticeWorkspace & {
    clientName?: string;
  };
  withClientName.clientName = "A client";
  expect(parsePracticeWorkspace(withClientName)).toMatchObject({ ok: false });

  const withNotes = clone(validWorkspace()) as PracticeWorkspace;
  (withNotes.appointments[0] as PracticeWorkspace["appointments"][number] & {
    notes?: string;
  }).notes = "Should never be stored";
  expect(parsePracticeWorkspace(withNotes)).toMatchObject({ ok: false });
});

test("rejects free-form anonymous identifiers and dangling catalog references", () => {
  const freeForm = clone(validWorkspace());
  freeForm.appointments[0].anonymousClientId = "jane@example.com";
  expect(parsePracticeWorkspace(freeForm)).toMatchObject({ ok: false });

  const dangling = clone(validWorkspace());
  dangling.appointments[0].serviceId = "service_missing000001";
  expect(parsePracticeWorkspace(dangling)).toMatchObject({ ok: false });
});

test("rejects invalid money, identifiers, timezones, and lifecycle order", () => {
  const fractionalCents = clone(validWorkspace());
  fractionalCents.appointments[0].valueCents = 145.5;
  expect(parsePracticeWorkspace(fractionalCents)).toMatchObject({ ok: false });

  const invalidId = clone(validWorkspace());
  invalidId.appointments[0].id = "appointment user supplied";
  expect(parsePracticeWorkspace(invalidId)).toMatchObject({ ok: false });

  const invalidTimezone = clone(validWorkspace());
  invalidTimezone.timezone = "Somewhere/Imaginary";
  expect(parsePracticeWorkspace(invalidTimezone)).toMatchObject({ ok: false });

  const reversedLifecycle = clone(validWorkspace());
  reversedLifecycle.appointments[0].statusChangedAt =
    "2026-08-01T00:00:00.000Z";
  expect(parsePracticeWorkspace(reversedLifecycle)).toMatchObject({ ok: false });
});

test("requires cancellation metadata only for cancelled appointments", () => {
  const cancelled = clone(validWorkspace());
  cancelled.appointments[0].status = "cancelled";
  expect(parsePracticeWorkspace(cancelled)).toMatchObject({ ok: false });

  cancelled.appointments[0].cancelledAt =
    cancelled.appointments[0].statusChangedAt;
  expect(parsePracticeWorkspace(cancelled).ok).toBe(true);

  cancelled.appointments[0].status = "scheduled";
  expect(parsePracticeWorkspace(cancelled)).toMatchObject({ ok: false });
});

test("derives a format-constrained anonymous identifier from a UUID", () => {
  expect(
    anonymousClientIdFromUuid("7f3a91c2-d4e6-4fab-8cab-0123456789ab"),
  ).toBe("anon_7f3a91c2d4e6");
  expect(() => anonymousClientIdFromUuid("not-a-uuid")).toThrow();
});

class MemoryStorage implements StoragePort {
  values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

test("keeps owner and sample-derived workspaces in separate storage slots", () => {
  const storage = new MemoryStorage();
  const repository = createPracticeWorkspaceRepository(storage);
  const owner = validWorkspace();
  const sampleDerived = {
    ...validWorkspace(),
    provenance: "sample-derived" as const,
  };

  expect(repository.save("owner", owner)).toEqual({ ok: true });
  expect(repository.save("sample-derived", sampleDerived)).toEqual({ ok: true });
  expect(repository.load("owner")).toEqual({ ok: true, value: owner });
  expect(repository.load("sample-derived")).toEqual({
    ok: true,
    value: sampleDerived,
  });

  expect(repository.clear("sample-derived")).toEqual({ ok: true });
  expect(repository.load("sample-derived")).toEqual({ ok: true, value: null });
  expect(repository.load("owner")).toEqual({ ok: true, value: owner });
});

test("reports invalid stored data without overwriting the source value", () => {
  const storage = new MemoryStorage();
  const raw = '{"version":99,"clientName":"unsafe"}';
  storage.setItem(PRACTICE_WORKSPACE_STORAGE_KEYS.owner, raw);
  const repository = createPracticeWorkspaceRepository(storage);

  expect(repository.load("owner")).toMatchObject({
    ok: false,
    error: "invalid-data",
    raw,
  });
  expect(storage.getItem(PRACTICE_WORKSPACE_STORAGE_KEYS.owner)).toBe(raw);
});

test("reports unavailable and failing storage without claiming persistence", () => {
  const unavailable = createPracticeWorkspaceRepository(null);
  expect(unavailable.load("owner")).toEqual({
    ok: false,
    error: "storage-unavailable",
  });
  expect(unavailable.save("owner", validWorkspace())).toEqual({
    ok: false,
    error: "storage-unavailable",
  });

  const failing: StoragePort = {
    getItem: () => {
      throw new Error("blocked");
    },
    setItem: () => {
      throw new Error("quota");
    },
    removeItem: () => {
      throw new Error("blocked");
    },
  };
  const repository = createPracticeWorkspaceRepository(failing);
  expect(repository.load("owner")).toEqual({ ok: false, error: "read-failed" });
  expect(repository.save("owner", validWorkspace())).toEqual({
    ok: false,
    error: "write-failed",
  });
  expect(repository.clear("owner")).toEqual({
    ok: false,
    error: "clear-failed",
  });
});

test("resolves ordinary local appointment times to UTC instants", () => {
  expect(
    resolveLocalDateTime("America/New_York", "2026-09-07", 9 * 60),
  ).toEqual({ ok: true, value: "2026-09-07T13:00:00.000Z" });
});

test("rejects a daylight-saving gap and requires a repeated-hour choice", () => {
  expect(
    resolveLocalDateTime("America/New_York", "2026-03-08", 2 * 60 + 30),
  ).toEqual({ ok: false, error: "nonexistent-local-time" });

  const repeated = resolveLocalDateTime(
    "America/New_York",
    "2026-11-01",
    1 * 60 + 30,
  );
  expect(repeated).toEqual({
    ok: false,
    error: "ambiguous-local-time",
    candidates: ["2026-11-01T05:30:00.000Z", "2026-11-01T06:30:00.000Z"],
  });
  expect(
    resolveLocalDateTime(
      "America/New_York",
      "2026-11-01",
      1 * 60 + 30,
      "earlier",
    ),
  ).toEqual({ ok: true, value: "2026-11-01T05:30:00.000Z" });
  expect(
    resolveLocalDateTime(
      "America/New_York",
      "2026-11-01",
      1 * 60 + 30,
      "later",
    ),
  ).toEqual({ ok: true, value: "2026-11-01T06:30:00.000Z" });
});

test("builds Monday-through-Sunday practice weeks across clock changes", () => {
  expect(getPracticeWeek("America/New_York", "2026-09-09")).toEqual({
    startLocalDate: "2026-09-07",
    endLocalDate: "2026-09-13",
    startAt: "2026-09-07T04:00:00.000Z",
    endAt: "2026-09-14T04:00:00.000Z",
    label: "Sep 7–13, 2026",
  });

  const springWeek = getPracticeWeek("America/New_York", "2026-03-08");
  expect(springWeek.startAt).toBe("2026-03-02T05:00:00.000Z");
  expect(springWeek.endAt).toBe("2026-03-09T04:00:00.000Z");
  expect(
    (Date.parse(springWeek.endAt) - Date.parse(springWeek.startAt)) / 3_600_000,
  ).toBe(167);
});

test("moves practice weeks without drifting across month boundaries", () => {
  expect(shiftPracticeWeek("2026-09-07", -1)).toBe("2026-08-31");
  expect(shiftPracticeWeek("2026-09-07", 1)).toBe("2026-09-14");
});

test("counts a cancellation as refilled only by a later-created overlapping active appointment", () => {
  const cancelled = {
    ...validWorkspace().appointments[0],
    status: "cancelled" as const,
    startAt: "2026-09-07T13:00:00.000Z",
    durationMinutes: 60,
    cancelledAt: "2026-09-01T12:00:00.000Z",
    statusChangedAt: "2026-09-01T12:00:00.000Z",
  };
  const replacement = {
    ...validWorkspace().appointments[0],
    id: "appointment_replacement01",
    status: "scheduled" as const,
    startAt: "2026-09-07T13:30:00.000Z",
    durationMinutes: 60,
    createdAt: "2026-09-02T12:00:00.000Z",
    statusChangedAt: "2026-09-02T12:00:00.000Z",
  };

  expect(isCancellationRefilled(cancelled, [cancelled, replacement])).toBe(true);
  expect(isCancellationRefilled(cancelled, [
    cancelled,
    { ...replacement, createdAt: "2026-08-31T12:00:00.000Z" },
  ])).toBe(false);
  expect(isCancellationRefilled(cancelled, [
    cancelled,
    { ...replacement, startAt: "2026-09-07T14:00:00.000Z" },
  ])).toBe(false);
  expect(isCancellationRefilled(cancelled, [
    cancelled,
    { ...replacement, status: "no-show" },
  ])).toBe(false);
});

test("validates appointment week, overlap, active assignment, and regular hours", () => {
  const workspace = validWorkspace();
  const week = getPracticeWeek(workspace.timezone, "2026-09-09");
  const candidate = {
    ...workspace.appointments[0],
    id: "appointment_candidate001",
    status: "scheduled" as const,
    startAt: "2026-09-07T15:00:00.000Z",
    durationMinutes: 60,
    createdAt: "2026-09-01T13:00:00.000Z",
    statusChangedAt: "2026-09-01T13:00:00.000Z",
  };

  expect(validateAppointmentSave(workspace, candidate, week)).toEqual({ ok: true });
  expect(validateAppointmentSave(workspace, {
    ...candidate,
    startAt: "2026-09-07T13:30:00.000Z",
  }, week)).toEqual({ ok: false, error: "overlap" });
  expect(validateAppointmentSave(workspace, {
    ...candidate,
    startAt: "2026-09-07T14:30:00.000Z",
  }, week)).toEqual({ ok: true });
  expect(validateAppointmentSave({
    ...workspace,
    appointments: [{ ...workspace.appointments[0], status: "cancelled", cancelledAt: workspace.appointments[0].statusChangedAt }],
  }, { ...candidate, startAt: "2026-09-07T13:30:00.000Z" }, week)).toEqual({ ok: true });
  expect(validateAppointmentSave({
    ...workspace,
    appointments: [{ ...workspace.appointments[0], status: "no-show" }],
  }, { ...candidate, startAt: "2026-09-07T13:30:00.000Z" }, week)).toEqual({ ok: true });
  expect(validateAppointmentSave(workspace, workspace.appointments[0], week)).toEqual({ ok: true });

  expect(validateAppointmentSave(workspace, {
    ...candidate,
    startAt: "2026-09-07T21:00:00.000Z",
  }, week)).toEqual({ ok: false, error: "outside-availability" });
  expect(validateAppointmentSave(workspace, {
    ...candidate,
    startAt: "2026-09-07T21:00:00.000Z",
  }, week, { outsideHoursOverride: true })).toEqual({ ok: true });
  expect(validateAppointmentSave(workspace, {
    ...candidate,
    startAt: "2026-09-08T03:30:00.000Z",
    durationMinutes: 90,
  }, week, { outsideHoursOverride: true })).toEqual({ ok: false, error: "cross-midnight" });
  expect(validateAppointmentSave(workspace, {
    ...candidate,
    startAt: week.endAt,
  }, week, { outsideHoursOverride: true })).toEqual({ ok: false, error: "outside-week" });

  const inactive = clone(workspace);
  inactive.practitioners[0].active = false;
  expect(validateAppointmentSave(inactive, candidate, week)).toEqual({ ok: false, error: "inactive-assignment" });
  expect(validateAppointmentSave(inactive, inactive.appointments[0], week)).toEqual({ ok: true });
});
