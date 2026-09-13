/// <reference types="vitest/globals" />

import { test } from "vitest";
import { getPracticeWeek, type PracticeWorkspace } from "./practice-workspace";
import { adaptPracticeWorkspaceToDashboardInput } from "./practice-insights";

const workspaceForWeek = (): PracticeWorkspace => {
  const practitionerId = "practitioner_maya00000001";
  const serviceId = "service_deeptissue01";
  const dates = ["07", "08", "09", "10", "11", "12", "13"];
  return {
    version: 1,
    provenance: "owner-entered",
    timezone: "America/New_York",
    practitioners: [{ id: practitionerId, label: "Maya", active: true }],
    services: [{ id: serviceId, label: "Deep tissue", defaultDurationMinutes: 60, defaultValueCents: 12_000, active: true }],
    availability: dates.map((day) => ({
      id: `availability_sep${day}000001`,
      practitionerId,
      localDate: `2026-09-${day}`,
      closed: false as const,
      startMinute: 540,
      endMinute: 1020,
    })),
    appointments: [
      {
        id: "appointment_scheduled001",
        practitionerId,
        serviceId,
        startAt: "2026-09-07T13:00:00.000Z",
        durationMinutes: 60,
        valueCents: 12_000,
        status: "scheduled",
        createdAt: "2026-09-01T12:00:00.000Z",
        statusChangedAt: "2026-09-01T12:00:00.000Z",
      },
      {
        id: "appointment_completed01",
        practitionerId,
        serviceId,
        startAt: "2026-09-08T14:00:00.000Z",
        durationMinutes: 90,
        valueCents: 18_000,
        status: "completed",
        createdAt: "2026-09-01T12:00:00.000Z",
        statusChangedAt: "2026-09-08T15:30:00.000Z",
      },
      {
        id: "appointment_cancelled01",
        practitionerId,
        serviceId,
        startAt: "2026-09-09T15:00:00.000Z",
        durationMinutes: 60,
        valueCents: 12_000,
        status: "cancelled",
        createdAt: "2026-09-01T12:00:00.000Z",
        statusChangedAt: "2026-09-07T16:00:00.000Z",
        cancelledAt: "2026-09-07T16:00:00.000Z",
      },
      {
        id: "appointment_replacement1",
        practitionerId,
        serviceId,
        startAt: "2026-09-09T15:30:00.000Z",
        durationMinutes: 60,
        valueCents: 12_000,
        status: "scheduled",
        createdAt: "2026-09-07T17:00:00.000Z",
        statusChangedAt: "2026-09-07T17:00:00.000Z",
      },
      {
        id: "appointment_noshow0001",
        practitionerId,
        serviceId,
        startAt: "2026-09-10T14:00:00.000Z",
        durationMinutes: 60,
        valueCents: 12_000,
        status: "no-show",
        createdAt: "2026-09-01T12:00:00.000Z",
        statusChangedAt: "2026-09-10T15:00:00.000Z",
      },
      {
        id: "appointment_outside001",
        practitionerId,
        serviceId,
        startAt: "2026-09-11T22:00:00.000Z",
        durationMinutes: 60,
        valueCents: 12_000,
        status: "scheduled",
        createdAt: "2026-09-01T12:00:00.000Z",
        statusChangedAt: "2026-09-01T12:00:00.000Z",
      },
      {
        id: "appointment_previous01",
        practitionerId,
        serviceId,
        startAt: "2026-09-01T14:00:00.000Z",
        durationMinutes: 60,
        valueCents: 12_000,
        status: "completed",
        createdAt: "2026-08-20T12:00:00.000Z",
        statusChangedAt: "2026-09-01T15:00:00.000Z",
      },
    ],
  };
};

test("adapts a selected local week into reconciled dashboard inputs", () => {
  const workspace = workspaceForWeek();
  const week = getPracticeWeek(workspace.timezone, "2026-09-09");
  const input = adaptPracticeWorkspaceToDashboardInput(workspace, week);

  expect(input.status).toBe("current");
  expect(input.appointments).toEqual({ confirmed: 3, completed: 1, previousTotal: 1 });
  expect(input.cancellations).toEqual({ total: 1, refilled: 1 });
  expect(input.capacity).toMatchObject({
    state: "current",
    bookedHours: 3.5,
    openHours: 52.5,
    blockedHours: 0,
  });
  expect(input.evidence).toMatchObject({
    provenance: "owner-entered",
    period: week.label,
    activePractitioners: 1,
    coveredDays: 7,
    excluded: { cancelled: 1, noShow: 1, outsideAvailability: 1 },
  });
});

test("deduplicates stable IDs and suppresses capacity when active coverage is incomplete", () => {
  const workspace = workspaceForWeek();
  workspace.appointments.push({ ...workspace.appointments[0] });
  workspace.availability.pop();
  const week = getPracticeWeek(workspace.timezone, "2026-09-09");
  const input = adaptPracticeWorkspaceToDashboardInput(workspace, week);

  expect(input.status).toBe("partial");
  expect(input.capacity).toEqual({ state: "unavailable" });
  expect(input.appointments.confirmed).toBe(3);
  expect(input.evidence).toMatchObject({ coveredDays: 6, deduplicatedRecords: 1 });
});
