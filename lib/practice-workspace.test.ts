/// <reference types="vitest/globals" />

import { test } from "vitest";
import {
  PRACTICE_WORKSPACE_STORAGE_KEYS,
  RAW_SAMPLE_WORKSPACE,
  anonymousClientIdFromUuid,
  createPracticeWorkspaceRepository,
  parsePracticeWorkspace,
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
