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
  workspace.appointments.push(...[0, 1, 2].map((index) => ({
    ...workspace.appointments[1],
    id: `appointment_ratehistory${index}`,
    startAt: `2026-08-0${index + 1}T14:00:00.000Z`,
    createdAt: "2026-07-01T12:00:00.000Z",
    statusChangedAt: `2026-08-0${index + 1}T15:30:00.000Z`,
  })));
  const week = getPracticeWeek(workspace.timezone, "2026-09-09");
  const input = adaptPracticeWorkspaceToDashboardInput(workspace, week);

  expect(input.status).toBe("partial");
  expect(input.capacity).toEqual({ state: "unavailable" });
  expect(input.appointments.confirmed).toBe(3);
  expect(input.evidence).toMatchObject({ coveredDays: 6, deduplicatedRecords: 1 });
  expect(input.opportunities.some(({ type }) => type === "capacity")).toBe(false);
});

test("excludes inactive practitioners from capacity hours and recommendations", () => {
  const workspace = workspaceForWeek();
  workspace.practitioners.push({ id: "practitioner_inactive0001", label: "Inactive", active: false });
  workspace.availability.push(...workspace.availability.map((record, index) => ({
    ...record,
    id: `availability_inactive00${index}`,
    practitionerId: "practitioner_inactive0001",
  })));
  const week = getPracticeWeek(workspace.timezone, "2026-09-09");
  const input = adaptPracticeWorkspaceToDashboardInput(workspace, week);

  expect(input.capacity).toMatchObject({ bookedHours: 3.5, openHours: 52.5 });
  expect(input.evidence.activePractitioners).toBe(1);
});

test.each([
  { hourlyValueCents: 7438, endMinute: 901, estimatedCents: 14999, surfaced: false },
  { hourlyValueCents: 7500, endMinute: 900, estimatedCents: 15000, surfaced: false },
  { hourlyValueCents: 7439, endMinute: 901, estimatedCents: 15001, surfaced: true },
])("applies the strict capacity value gate at $estimatedCents cents", ({ hourlyValueCents, endMinute, estimatedCents, surfaced }) => {
  const workspace = workspaceForWeek();
  workspace.availability = workspace.availability.map((record, index) => index === 3
    ? { ...record, startMinute: 780, endMinute }
    : { id: record.id, practitionerId: record.practitionerId, localDate: record.localDate, closed: true as const });
  workspace.appointments = [0, 1, 2].map((index) => ({
    id: `appointment_history000${index}`,
    practitionerId: workspace.practitioners[0].id,
    serviceId: workspace.services[0].id,
    startAt: `2026-08-${String(index + 1).padStart(2, "0")}T14:00:00.000Z`,
    durationMinutes: 60,
    valueCents: hourlyValueCents,
    status: "completed" as const,
    createdAt: "2026-07-01T12:00:00.000Z",
    statusChangedAt: `2026-08-${String(index + 1).padStart(2, "0")}T15:00:00.000Z`,
  }));
  const week = getPracticeWeek(workspace.timezone, "2026-09-09");
  const input = adaptPracticeWorkspaceToDashboardInput(workspace, week, {
    evaluationAt: "2026-09-07T12:00:00.000Z",
  });
  const capacity = input.opportunities.find(({ type }) => type === "capacity");

  if (surfaced) expect(capacity?.estimatedCents).toBe(estimatedCents);
  else expect(capacity).toBeUndefined();
});

test("surfaces only evidence-backed overdue anonymous clients without outreach claims", () => {
  const workspace = workspaceForWeek();
  const clientId = "anon_abcdef123456";
  workspace.appointments = [0, 14, 28].map((day, index) => ({
    id: `appointment_return000${index}`,
    practitionerId: workspace.practitioners[0].id,
    serviceId: workspace.services[0].id,
    startAt: new Date(Date.UTC(2026, 5, 1 + day, 14)).toISOString(),
    durationMinutes: 60,
    valueCents: 12_000,
    status: "completed" as const,
    anonymousClientId: clientId,
    createdAt: "2026-05-01T12:00:00.000Z",
    statusChangedAt: new Date(Date.UTC(2026, 5, 1 + day, 15)).toISOString(),
  }));
  const week = getPracticeWeek(workspace.timezone, "2026-09-09");
  const input = adaptPracticeWorkspaceToDashboardInput(workspace, week, {
    evaluationAt: "2026-09-07T12:00:00.000Z",
  });
  const retention = input.opportunities.find(({ type }) => type === "retention");

  expect(retention).toMatchObject({ estimatedCents: 0, audiences: [], draft: "" });
  expect(retention?.title).toContain("1 anonymous client");

  workspace.appointments.push({
    ...workspace.appointments[0],
    id: "appointment_future0001",
    status: "scheduled",
    startAt: "2026-09-10T14:00:00.000Z",
    createdAt: "2026-09-01T12:00:00.000Z",
    statusChangedAt: "2026-09-01T12:00:00.000Z",
  });
  expect(adaptPracticeWorkspaceToDashboardInput(workspace, week, {
    evaluationAt: "2026-09-07T12:00:00.000Z",
  }).opportunities.some(({ type }) => type === "retention")).toBe(false);

  workspace.appointments = workspace.appointments.slice(0, 2);
  expect(adaptPracticeWorkspaceToDashboardInput(workspace, week, {
    evaluationAt: "2026-09-07T12:00:00.000Z",
  }).opportunities.some(({ type }) => type === "retention")).toBe(false);
});

test("ignores anonymous visit history older than the trailing six-month window", () => {
  const workspace = workspaceForWeek();
  workspace.appointments = [0, 14, 28].map((day, index) => ({
    ...workspace.appointments[1],
    id: `appointment_oldreturn${index}`,
    anonymousClientId: "anon_abcdef123456",
    startAt: new Date(Date.UTC(2025, 0, 1 + day, 14)).toISOString(),
    statusChangedAt: new Date(Date.UTC(2025, 0, 1 + day, 15)).toISOString(),
  }));
  const week = getPracticeWeek(workspace.timezone, "2026-09-09");

  expect(adaptPracticeWorkspaceToDashboardInput(workspace, week, {
    evaluationAt: "2026-09-07T12:00:00.000Z",
  }).opportunities.some(({ type }) => type === "retention")).toBe(false);
});
