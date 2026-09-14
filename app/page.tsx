"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { deriveDashboard } from "../lib/dashboard-calculations";
import { DASHBOARD_FIXTURES, DASHBOARD_INPUTS, type DataScenario, type Metric, type Opportunity } from "../lib/dashboard-fixtures";
import { adaptPracticeWorkspaceToDashboardInput } from "../lib/practice-insights";
import {
  createPracticeWorkspaceRepository,
  getAvailabilityCoverage,
  getPracticeWeek,
  getTodayLocalDate,
  parsePracticeWorkspace,
  RAW_SAMPLE_WORKSPACE,
  resolveLocalDateTime,
  shiftPracticeWeek,
  validateAppointmentSave,
  type AppointmentRecord,
  type AppointmentStatus,
  type PracticeWorkspace,
  type WorkspaceSlot,
} from "../lib/practice-workspace";

const Icon = ({ name, size = 18 }: { name: string; size?: number }) => {
  const paths: Record<string, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
    spark: <><path d="M4 19V9m6 10V5m6 14v-7m4 7V3"/><path d="m3 11 6-6 6 7 6-9"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    action: <><circle cx="12" cy="12" r="9"/><path d="m9 12 2 2 4-5"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.12 2.12-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.55V20h-3v-.09a1.7 1.7 0 0 0-1.1-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06-2.12-2.12.06-.06A1.7 1.7 0 0 0 7 14.7a1.7 1.7 0 0 0-1.55-1H5v-3h.09A1.7 1.7 0 0 0 6.64 9.6 1.7 1.7 0 0 0 6.3 7.72l-.06-.06 2.12-2.12.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1-1.55V4h3v.09a1.7 1.7 0 0 0 1.1 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.12 2.12-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.55 1H21v3h-.09A1.7 1.7 0 0 0 19.4 15Z"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    refresh: <><path d="M20 7h-5V2"/><path d="M4 17a8 8 0 0 0 14.9-2M4 7a8 8 0 0 1 14.9 2"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    trend: <><path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/></>,
    warning: <><path d="M10.3 3.7 2.5 17.2A2 2 0 0 0 4.2 20h15.6a2 2 0 0 0 1.7-2.8L13.7 3.7a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></>,
    close: <path d="m6 6 12 12M18 6 6 18"/>,
  };
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
};

const scenarioLabels: Record<DataScenario, string> = { current: "Current data", partial: "Partial data", stale: "Stale data" };
type ActionStage = "evidence" | "draft" | "approval" | "handoff";
type ApprovalSnapshot = { draft: string; audienceLabel: string; audienceCount: number };
type Surface = "overview" | "practice-data";
type PracticeSource = "owner" | "sample" | "sample-derived";
type DashboardSource = "connected" | PracticeSource;
type StorageAlertKey = WorkspaceSlot | "general";
type CatalogEditor =
  | { kind: "practitioner"; id?: string; label: string }
  | {
      kind: "service";
      id?: string;
      label: string;
      durationMinutes: string;
      valueCents: string;
    };
type AppointmentEditor = {
  id?: string;
  date: string;
  time: string;
  practitionerId: string;
  serviceId: string;
  durationMinutes: string;
  valueCents: string;
  status: AppointmentStatus;
  anonymousClientId: string;
  repeatedTimeChoice?: "earlier" | "later";
};
type AvailabilityEditor = {
  practitionerId: string;
  localDate: string;
  closed: boolean;
  startTime: string;
  endTime: string;
};

const emptyWorkspace = (
  provenance: PracticeWorkspace["provenance"],
): PracticeWorkspace => ({
  version: 1,
  provenance,
  timezone: "America/New_York",
  practitioners: [],
  services: [],
  availability: [],
  appointments: [],
});

export default function Home() {
  const [surface, setSurface] = useState<Surface>("overview");
  const [practiceSource, setPracticeSource] = useState<PracticeSource>("owner");
  const [dashboardSource, setDashboardSource] = useState<DashboardSource>("connected");
  const [selectedWeekDate, setSelectedWeekDate] = useState(
    RAW_SAMPLE_WORKSPACE.availability[0].localDate,
  );
  const [evaluationAt, setEvaluationAt] = useState<string | null>(null);
  const [ownerWorkspace, setOwnerWorkspace] = useState(() => emptyWorkspace("owner-entered"));
  const [sampleDerivedWorkspace, setSampleDerivedWorkspace] = useState<PracticeWorkspace | null>(null);
  const [storageAlerts, setStorageAlerts] = useState<Partial<Record<StorageAlertKey, string>>>({});
  const [invalidStorageSlots, setInvalidStorageSlots] = useState<Partial<Record<WorkspaceSlot, boolean>>>({});
  const [catalogEditor, setCatalogEditor] = useState<CatalogEditor | null>(null);
  const [catalogError, setCatalogError] = useState("");
  const [appointmentEditor, setAppointmentEditor] = useState<AppointmentEditor | null>(null);
  const [appointmentError, setAppointmentError] = useState("");
  const [outsideHoursPending, setOutsideHoursPending] = useState(false);
  const [repeatedHourPending, setRepeatedHourPending] = useState(false);
  const [practiceDataTab, setPracticeDataTab] = useState<"appointments" | "availability">("appointments");
  const [availabilityEditor, setAvailabilityEditor] = useState<AvailabilityEditor | null>(null);
  const [availabilityError, setAvailabilityError] = useState("");
  const [scenario, setScenario] = useState<DataScenario>("current");
  const [activeMetric, setActiveMetric] = useState<Metric | null>(null);
  const [activeOpportunity, setActiveOpportunity] = useState<Opportunity | null>(null);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [actionStage, setActionStage] = useState<ActionStage>("evidence");
  const [draft, setDraft] = useState("");
  const [audienceId, setAudienceId] = useState("eligible");
  const [approvalSnapshot, setApprovalSnapshot] = useState<ApprovalSnapshot | null>(null);
  const metricOpenerRef = useRef<HTMLElement | null>(null);
  const opportunityOpenerRef = useRef<HTMLElement | null>(null);
  const restoreMetricFocusRef = useRef(false);
  const restoreOpportunityFocusRef = useRef(false);
  const metricCloseRef = useRef<HTMLButtonElement>(null);
  const opportunityCloseRef = useRef<HTMLButtonElement>(null);
  const draftRef = useRef<HTMLTextAreaElement>(null);
  const approvalInitialRef = useRef<HTMLButtonElement>(null);
  const handoffRef = useRef<HTMLAnchorElement>(null);
  const practiceWorkspace = useMemo(() => practiceSource === "sample"
    ? RAW_SAMPLE_WORKSPACE
    : practiceSource === "sample-derived"
      ? sampleDerivedWorkspace ?? RAW_SAMPLE_WORKSPACE
      : ownerWorkspace, [ownerWorkspace, practiceSource, sampleDerivedWorkspace]);
  const practiceSourceLabel = practiceSource === "sample"
    ? "Sample data · read only"
    : practiceSource === "sample-derived"
      ? "Sample-derived data"
      : "Owner-entered data";
  const practiceWeek = useMemo(() => getPracticeWeek(
    practiceWorkspace.timezone,
    selectedWeekDate,
  ), [practiceWorkspace.timezone, selectedWeekDate]);
  const dashboardWorkspace = useMemo(() => dashboardSource === "sample-derived"
    ? sampleDerivedWorkspace ?? RAW_SAMPLE_WORKSPACE
    : ownerWorkspace, [dashboardSource, ownerWorkspace, sampleDerivedWorkspace]);
  const sampleDashboard = dashboardSource === "connected" || dashboardSource === "sample";
  const dashboardWeek = useMemo(() => getPracticeWeek(
    dashboardWorkspace.timezone,
    selectedWeekDate,
  ), [dashboardWorkspace.timezone, selectedWeekDate]);
  const dashboardInput = useMemo(() => sampleDashboard
    ? DASHBOARD_INPUTS[scenario]
    : adaptPracticeWorkspaceToDashboardInput(
        dashboardWorkspace,
        dashboardWeek,
        { evaluationAt: evaluationAt ?? dashboardWeek.endAt },
      ), [dashboardWeek, dashboardWorkspace, evaluationAt, sampleDashboard, scenario]);
  const allOpportunitySummary = useMemo(() => deriveDashboard(dashboardInput), [dashboardInput]);
  const opportunitySummary = useMemo(
    () => deriveDashboard(dashboardInput, dismissed),
    [dashboardInput, dismissed],
  );
  const sampleFixture = DASHBOARD_FIXTURES[scenario];
  const manualMetrics: Metric[] = useMemo(() => sampleFixture.metrics.map((template, index) => ({
    ...template,
    ...opportunitySummary.metrics[index],
    tone: opportunitySummary.metrics[index].id === "cancellations" || opportunitySummary.metrics[index].state === "unavailable" ? "caution" : "neutral",
    period: dashboardWeek.label,
    population: `${dashboardSource === "owner" ? "Owner-entered" : "Sample-derived"} records · active practitioners`,
    coverage: dashboardInput.actionContext.coverage,
    exclusions: "Cancelled, no-show, outside-availability, duplicate-ID, and inactive-catalog records are excluded where applicable.",
    classification: opportunitySummary.metrics[index].id === "capacity" ? "Estimated" : "Observed",
  })), [dashboardInput.actionContext.coverage, dashboardSource, dashboardWeek.label, opportunitySummary.metrics, sampleFixture.metrics]);
  const fixture = useMemo(() => sampleDashboard ? sampleFixture : {
    ...sampleFixture,
    status: dashboardInput.status,
    bannerTitle: dashboardSource === "owner" ? "Owner-entered practice data" : "Editable sample-derived practice data",
    bannerCopy: `${dashboardInput.actionContext.freshness} · ${dashboardInput.actionContext.coverage} · stored only in this browser`,
    bannerAction: "Review practice data",
    headline: opportunitySummary.headline,
    subheadline: opportunitySummary.subheadline,
    totalOpportunity: opportunitySummary.totalOpportunity,
    metrics: manualMetrics,
    capacityMetric: manualMetrics[0],
    capacityState: opportunitySummary.capacity.state,
    capacityPercent: opportunitySummary.capacity.percent,
    bookedHours: opportunitySummary.capacity.bookedHours,
    openHours: opportunitySummary.capacity.openHours,
    blockedHours: opportunitySummary.capacity.blockedHours,
    returnRate: opportunitySummary.returnPulse.rate,
    returnChange: opportunitySummary.returnPulse.change,
    returnHistory: opportunitySummary.returnHistory,
    returnTrendLabel: opportunitySummary.returnTrendLabel,
    days: opportunitySummary.days,
    opportunities: opportunitySummary.opportunities,
  }, [dashboardInput, dashboardSource, manualMetrics, opportunitySummary, sampleDashboard, sampleFixture]);
  const opportunities = opportunitySummary.opportunities;
  const unavailableRecommendations = "evidence" in dashboardInput
    ? dashboardInput.evidence.unavailableRecommendations
    : [];
  const dismissedOpportunities = allOpportunitySummary.opportunities.filter((item) => dismissed.includes(item.id));
  const selectedAudience = activeOpportunity?.audiences.find((audience) => audience.id === audienceId);
  const hasCompleteReturnTrend = fixture.returnHistory.length === 6
    && fixture.returnHistory.every((point) => point.rate !== null);
  const returnChartPoints = hasCompleteReturnTrend ? fixture.returnHistory.flatMap((point, index) =>
    point.rate === null ? [] : [{
      x: fixture.returnHistory.length === 1 ? 240 : index * (480 / (fixture.returnHistory.length - 1)),
      y: 140 - point.rate * 1.8,
    }],
  ) : [];
  const lastReturnPoint = returnChartPoints.at(-1);
  const availabilityCoverage = useMemo(() => getAvailabilityCoverage(
    practiceWorkspace,
    practiceWeek,
  ), [practiceWeek, practiceWorkspace]);
  const activePractitioners = useMemo(
    () => practiceWorkspace.practitioners.filter(({ active }) => active),
    [practiceWorkspace.practitioners],
  );
  const activeServices = useMemo(
    () => practiceWorkspace.services.filter(({ active }) => active),
    [practiceWorkspace.services],
  );
  const weeklyAppointments = useMemo(() => practiceWorkspace.appointments
    .filter(({ startAt }) => startAt >= practiceWeek.startAt && startAt < practiceWeek.endAt)
    .sort((left, right) => left.startAt.localeCompare(right.startAt)), [practiceWeek, practiceWorkspace.appointments]);
  const selectableAnonymousClientIds = [...new Set([
    ...practiceWorkspace.appointments.flatMap(({ anonymousClientId }) =>
      anonymousClientId ? [anonymousClientId] : [],
    ),
    ...(appointmentEditor?.anonymousClientId ? [appointmentEditor.anonymousClientId] : []),
  ])].sort();
  const weekLocalDates = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const date = new Date(`${practiceWeek.startLocalDate}T00:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() + index);
    return date.toISOString().slice(0, 10);
  }), [practiceWeek.startLocalDate]);

  useEffect(() => {
    let active = true;
    const hydrate = async () => {
      await Promise.resolve();
      if (!active) return;
      const hydratedAt = new Date(Date.now());
      setEvaluationAt(hydratedAt.toISOString());
      setSelectedWeekDate(getTodayLocalDate(RAW_SAMPLE_WORKSPACE.timezone, hydratedAt));

      let storage: Storage;
      try {
        storage = window.localStorage;
      } catch {
        setStorageAlerts({
          general: "Browser storage is unavailable. Changes will not be saved.",
        });
        return;
      }

      const repository = createPracticeWorkspaceRepository(storage);
      const owner = repository.load("owner");
      const sampleDerived = repository.load("sample-derived");
      const alerts: Partial<Record<StorageAlertKey, string>> = {};
      const invalidSlots: Partial<Record<WorkspaceSlot, boolean>> = {};

      if (owner.ok) {
        if (owner.value) {
          setOwnerWorkspace(owner.value);
          setSelectedWeekDate(getTodayLocalDate(owner.value.timezone, hydratedAt));
        }
      } else {
        if (owner.error === "invalid-data") invalidSlots.owner = true;
        alerts.owner = owner.error === "invalid-data"
          ? "Stored owner data could not be loaded. It was left unchanged so you can recover it."
          : "Browser storage could not read owner data. It was left unchanged and changes will not be saved.";
      }

      if (sampleDerived.ok) {
        if (sampleDerived.value) setSampleDerivedWorkspace(sampleDerived.value);
      } else {
        if (sampleDerived.error === "invalid-data") invalidSlots["sample-derived"] = true;
        alerts["sample-derived"] = sampleDerived.error === "invalid-data"
          ? "Stored sample-derived data could not be loaded. It was left unchanged so you can recover it."
          : "Browser storage could not read sample-derived data. It was left unchanged and changes will not be saved.";
      }
      setStorageAlerts(alerts);
      setInvalidStorageSlots(invalidSlots);
    };
    void hydrate();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (activeMetric) {
      metricCloseRef.current?.focus();
    } else if (restoreMetricFocusRef.current) {
      if (metricOpenerRef.current?.isConnected) metricOpenerRef.current.focus();
      restoreMetricFocusRef.current = false;
    }
  }, [activeMetric]);

  useEffect(() => {
    if (!activeOpportunity) {
      if (restoreOpportunityFocusRef.current && opportunityOpenerRef.current?.isConnected) {
        opportunityOpenerRef.current.focus();
      }
      restoreOpportunityFocusRef.current = false;
      return;
    }
    const target = actionStage === "evidence"
      ? opportunityCloseRef.current
      : actionStage === "draft"
        ? draftRef.current
        : actionStage === "approval"
          ? approvalInitialRef.current
          : handoffRef.current;
    target?.focus();
  }, [activeOpportunity, actionStage]);

  const closeMetric = (restoreFocus = true) => {
    restoreMetricFocusRef.current = restoreFocus;
    setActiveMetric(null);
  };

  const closeOpportunity = (restoreFocus = true) => {
    restoreOpportunityFocusRef.current = restoreFocus;
    setActiveOpportunity(null);
  };

  const showSurface = (nextSurface: Surface) => {
    restoreMetricFocusRef.current = false;
    restoreOpportunityFocusRef.current = false;
    setActiveMetric(null);
    setActiveOpportunity(null);
    setNotice("");
    setSurface(nextSurface);
  };

  const changePracticeSource = (nextSource: PracticeSource) => {
    restoreMetricFocusRef.current = false;
    restoreOpportunityFocusRef.current = false;
    setActiveMetric(null);
    setActiveOpportunity(null);
    setActionStage("evidence");
    setDraft("");
    setAudienceId("eligible");
    setApprovalSnapshot(null);
    setDismissed([]);
    setNotice("");
    setAppointmentEditor(null);
    setAppointmentError("");
    setOutsideHoursPending(false);
    setRepeatedHourPending(false);
    setAvailabilityEditor(null);
    setAvailabilityError("");
    setCatalogEditor(null);
    setCatalogError("");
    setPracticeSource(nextSource);
    if (nextSource === "sample") {
      setSelectedWeekDate(RAW_SAMPLE_WORKSPACE.availability[0].localDate);
    }
    if (dashboardSource !== "connected") setDashboardSource(nextSource);
  };

  const disconnectConnectedInsights = () => {
    if (!window.confirm("Disconnect connected data before using browser-only insights?")) return;
    setDashboardSource(practiceSource);
    setDismissed([]);
  };

  const updateStorageAlert = (key: StorageAlertKey, message?: string) => {
    setStorageAlerts((current) => {
      const next = { ...current };
      if (message) next[key] = message;
      else delete next[key];
      return next;
    });
  };

  const browserRepository = () => {
    try {
      return createPracticeWorkspaceRepository(window.localStorage);
    } catch {
      return createPracticeWorkspaceRepository(null);
    }
  };

  const generatedId = (prefix: "practitioner" | "service" | "appointment" | "availability") => {
    const values = new Uint32Array(2);
    crypto.getRandomValues(values);
    return `${prefix}_${[...values].map((value) => value.toString(16).padStart(8, "0")).join("")}`;
  };

  const saveActiveWorkspace = (workspace: PracticeWorkspace) => {
    if (practiceSource === "sample" || !parsePracticeWorkspace(workspace).ok) {
      setCatalogError("Enter a privacy-safe label and positive whole-number defaults.");
      return false;
    }
    const slot: WorkspaceSlot = practiceSource === "owner" ? "owner" : "sample-derived";
    if (invalidStorageSlots[slot]) {
      updateStorageAlert(
        slot,
        `Stored ${slot === "owner" ? "owner" : "sample-derived"} data must be cleared before editing. The invalid stored copy was left unchanged.`,
      );
      return false;
    }
    const saved = browserRepository().save(slot, workspace);
    updateStorageAlert(slot, saved.ok
      ? undefined
      : "Your change is open, but it could not be saved. This change was not persisted.");
    if (slot === "owner") setOwnerWorkspace(workspace);
    else setSampleDerivedWorkspace(workspace);
    if (dashboardSource !== "connected") setDashboardSource(practiceSource);
    setCatalogError("");
    return true;
  };

  const saveCatalogRecord = () => {
    if (!catalogEditor) return;
    if (catalogEditor.kind === "practitioner") {
      const record = catalogEditor.id
        ? practiceWorkspace.practitioners.find(({ id }) => id === catalogEditor.id)
        : undefined;
      const nextRecord = {
        id: record?.id ?? generatedId("practitioner"),
        label: catalogEditor.label.trim(),
        active: record?.active ?? true,
      };
      const practitioners = record
        ? practiceWorkspace.practitioners.map((item) => item.id === record.id ? nextRecord : item)
        : [...practiceWorkspace.practitioners, nextRecord];
      if (saveActiveWorkspace({ ...practiceWorkspace, practitioners })) setCatalogEditor(null);
      return;
    }

    const record = catalogEditor.id
      ? practiceWorkspace.services.find(({ id }) => id === catalogEditor.id)
      : undefined;
    const nextRecord = {
      id: record?.id ?? generatedId("service"),
      label: catalogEditor.label.trim(),
      defaultDurationMinutes: Number(catalogEditor.durationMinutes),
      defaultValueCents: Number(catalogEditor.valueCents),
      active: record?.active ?? true,
    };
    const services = record
      ? practiceWorkspace.services.map((item) => item.id === record.id ? nextRecord : item)
      : [...practiceWorkspace.services, nextRecord];
    if (saveActiveWorkspace({ ...practiceWorkspace, services })) setCatalogEditor(null);
  };

  const deactivateCatalogRecord = (
    kind: "practitioner" | "service",
    id: string,
  ) => {
    const next = kind === "practitioner"
      ? {
          ...practiceWorkspace,
          practitioners: practiceWorkspace.practitioners.map((record) =>
            record.id === id ? { ...record, active: false } : record,
          ),
        }
      : {
          ...practiceWorkspace,
          services: practiceWorkspace.services.map((record) =>
            record.id === id ? { ...record, active: false } : record,
          ),
        };
    saveActiveWorkspace(next);
  };

  const localAppointmentParts = (startAt: string) => {
    const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", {
      timeZone: practiceWorkspace.timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(startAt)).map(({ type, value }) => [type, value]));
    return {
      date: `${parts.year}-${parts.month}-${parts.day}`,
      time: `${parts.hour}:${parts.minute}`,
    };
  };

  const formatAppointmentTime = (startAt: string) => {
    const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", {
      timeZone: practiceWorkspace.timezone,
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).formatToParts(new Date(startAt)).map(({ type, value }) => [type, value]));
    return `${parts.weekday} ${parts.month} ${parts.day} · ${parts.hour}:${parts.minute} ${parts.dayPeriod}`;
  };

  const openNewAppointment = () => {
    const practitioner = activePractitioners[0];
    const service = activeServices[0];
    if (!practitioner || !service) return;
    setAppointmentError("");
    setOutsideHoursPending(false);
    setRepeatedHourPending(false);
    setAppointmentEditor({
      date: "",
      time: "",
      practitionerId: practitioner.id,
      serviceId: service.id,
      durationMinutes: String(service.defaultDurationMinutes),
      valueCents: String(service.defaultValueCents),
      status: "scheduled",
      anonymousClientId: "",
    });
  };

  const openExistingAppointment = (record: AppointmentRecord) => {
    setAppointmentError("");
    setOutsideHoursPending(false);
    setRepeatedHourPending(false);
    setAppointmentEditor({
      id: record.id,
      ...localAppointmentParts(record.startAt),
      practitionerId: record.practitionerId,
      serviceId: record.serviceId,
      durationMinutes: String(record.durationMinutes),
      valueCents: String(record.valueCents),
      status: record.status,
      anonymousClientId: record.anonymousClientId ?? "",
    });
  };

  const generateAnonymousClientId = () => {
    if (!appointmentEditor) return;
    const values = new Uint8Array(6);
    crypto.getRandomValues(values);
    const id = `anon_${[...values].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
    setAppointmentEditor({ ...appointmentEditor, anonymousClientId: id });
  };

  const saveAppointment = (outsideHoursOverride = false) => {
    if (!appointmentEditor) return;
    const [hour, minute] = appointmentEditor.time.split(":").map(Number);
    const resolved = resolveLocalDateTime(
      practiceWorkspace.timezone,
      appointmentEditor.date,
      hour * 60 + minute,
      appointmentEditor.repeatedTimeChoice,
    );
    if (!resolved.ok) {
      if (resolved.error === "ambiguous-local-time") {
        setRepeatedHourPending(true);
        setAppointmentError("This hour occurs twice. Choose the earlier or later occurrence.");
      } else {
        setRepeatedHourPending(false);
        setAppointmentError(resolved.error === "nonexistent-local-time"
          ? "That local time does not exist because the clock moves forward."
          : "Choose a valid local appointment date and time.");
      }
      return;
    }
    const previous = appointmentEditor.id
      ? practiceWorkspace.appointments.find(({ id }) => id === appointmentEditor.id)
      : undefined;
    const now = new Date(Date.now()).toISOString();
    const statusChangedAt = previous?.status === appointmentEditor.status
      ? previous.statusChangedAt
      : now;
    const record: AppointmentRecord = {
      id: previous?.id ?? generatedId("appointment"),
      practitionerId: appointmentEditor.practitionerId,
      serviceId: appointmentEditor.serviceId,
      startAt: resolved.value,
      durationMinutes: Number(appointmentEditor.durationMinutes),
      valueCents: Number(appointmentEditor.valueCents),
      status: appointmentEditor.status,
      ...(appointmentEditor.anonymousClientId
        ? { anonymousClientId: appointmentEditor.anonymousClientId }
        : {}),
      createdAt: previous?.createdAt ?? now,
      statusChangedAt,
      ...(appointmentEditor.status === "cancelled"
        ? { cancelledAt: previous?.status === "cancelled" ? previous.cancelledAt : statusChangedAt }
        : {}),
    };
    const validation = validateAppointmentSave(
      practiceWorkspace,
      record,
      practiceWeek,
      { outsideHoursOverride },
    );
    if (!validation.ok) {
      const messages = {
        "invalid-record": "Enter a valid duration, value, assignment, and lifecycle state.",
        "inactive-assignment": "Choose active practitioner and service assignments.",
        "outside-week": "Keep the appointment inside the selected week.",
        "cross-midnight": "Appointments cannot cross midnight.",
        overlap: "This appointment overlaps another active appointment for the practitioner.",
        "outside-availability": "This appointment is outside regular availability. Review it before saving outside hours.",
      };
      setAppointmentError(messages[validation.error]);
      setOutsideHoursPending(validation.error === "outside-availability");
      return;
    }
    const appointments = previous
      ? practiceWorkspace.appointments.map((item) => item.id === previous.id ? record : item)
      : [...practiceWorkspace.appointments, record];
    if (saveActiveWorkspace({ ...practiceWorkspace, appointments })) {
      setAppointmentEditor(null);
      setAppointmentError("");
      setOutsideHoursPending(false);
      setRepeatedHourPending(false);
    }
  };

  const deleteAppointment = () => {
    if (!appointmentEditor?.id || !window.confirm("Delete this appointment?")) return;
    const appointments = practiceWorkspace.appointments.filter(({ id }) => id !== appointmentEditor.id);
    if (saveActiveWorkspace({ ...practiceWorkspace, appointments })) {
      setAppointmentEditor(null);
      setAppointmentError("");
    }
  };

  const formatAvailabilityDate = (localDate: string) => new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${localDate}T00:00:00.000Z`)).replace(",", "");

  const minuteToTime = (minute: number) => `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
  const timeToMinute = (time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    return hour * 60 + minute;
  };
  const formatMinute = (minute: number) => new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2026, 0, 1, Math.floor(minute / 60), minute % 60)));

  const openAvailability = (practitionerId: string, localDate: string) => {
    const existing = practiceWorkspace.availability.find((record) =>
      record.practitionerId === practitionerId && record.localDate === localDate,
    );
    setAvailabilityError("");
    setAvailabilityEditor({
      practitionerId,
      localDate,
      closed: existing?.closed ?? false,
      startTime: existing && !existing.closed ? minuteToTime(existing.startMinute) : "",
      endTime: existing && !existing.closed ? minuteToTime(existing.endMinute) : "",
    });
  };

  const saveAvailability = () => {
    if (!availabilityEditor) return;
    const previous = practiceWorkspace.availability.find((record) =>
      record.practitionerId === availabilityEditor.practitionerId && record.localDate === availabilityEditor.localDate,
    );
    const record = availabilityEditor.closed
      ? {
          id: previous?.id ?? generatedId("availability"),
          practitionerId: availabilityEditor.practitionerId,
          localDate: availabilityEditor.localDate,
          closed: true as const,
        }
      : {
          id: previous?.id ?? generatedId("availability"),
          practitionerId: availabilityEditor.practitionerId,
          localDate: availabilityEditor.localDate,
          closed: false as const,
          startMinute: timeToMinute(availabilityEditor.startTime),
          endMinute: timeToMinute(availabilityEditor.endTime),
        };
    const availability = previous
      ? practiceWorkspace.availability.map((item) => item.id === previous.id ? record : item)
      : [...practiceWorkspace.availability, record];
    if (!parsePracticeWorkspace({ ...practiceWorkspace, availability }).ok) {
      setAvailabilityError("Choose valid local times with the start before the end, or mark the day closed.");
      return;
    }
    if (saveActiveWorkspace({ ...practiceWorkspace, availability })) {
      setAvailabilityEditor(null);
      setAvailabilityError("");
    }
  };

  const copySample = () => {
    if (invalidStorageSlots["sample-derived"]) {
      updateStorageAlert(
        "sample-derived",
        "Stored sample-derived data must be cleared before editing. The invalid stored copy was left unchanged.",
      );
      return;
    }
    if (sampleDerivedWorkspace && !window.confirm(
      "Replace the existing sample-derived data with a fresh sample copy?",
    )) return;
    const copy = structuredClone(RAW_SAMPLE_WORKSPACE);
    const saved = browserRepository().save("sample-derived", copy);
    updateStorageAlert("sample-derived", saved.ok
      ? undefined
      : "The editable sample copy is open, but it could not be saved. This change was not persisted.");
    setSampleDerivedWorkspace(copy);
    changePracticeSource("sample-derived");
  };

  const movePracticeWeek = (weeks: number) => {
    changePracticeSource(practiceSource);
    setSelectedWeekDate(shiftPracticeWeek(practiceWeek.startLocalDate, weeks));
  };

  const clearWorkspace = (slot: WorkspaceSlot) => {
    const label = slot === "owner" ? "owner" : "sample-derived";
    if (!window.confirm(`Clear all ${label} practice data?`)) return;
    const cleared = browserRepository().clear(slot);
    if (!cleared.ok) {
      updateStorageAlert(
        slot,
        `${label === "owner" ? "Owner" : "Sample-derived"} data could not be cleared. The stored copy was left unchanged.`,
      );
      return;
    }
    updateStorageAlert(slot);
    setInvalidStorageSlots((current) => ({ ...current, [slot]: false }));
    if (slot === "owner") setOwnerWorkspace(emptyWorkspace("owner-entered"));
    else setSampleDerivedWorkspace(emptyWorkspace("sample-derived"));
  };

  const handleDialogKeyDown = (
    event: React.KeyboardEvent<HTMLElement>,
    close: () => void,
  ) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab") return;
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ));
    const first = controls[0];
    const last = controls.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const openMetric = (metric: Metric, opener: HTMLElement) => {
    restoreOpportunityFocusRef.current = false;
    setActiveOpportunity(null);
    metricOpenerRef.current = opener;
    setActiveMetric(metric);
  };

  const startAction = (opportunity: Opportunity, opener: HTMLElement) => {
    restoreMetricFocusRef.current = false;
    setActiveMetric(null);
    opportunityOpenerRef.current = opener;
    setActiveOpportunity(opportunity);
    setActionStage("evidence");
    setDraft(opportunity.draft);
    setAudienceId(opportunity.audiences[0]?.id ?? "eligible");
    setApprovalSnapshot(null);
  };

  const dismiss = (id: string) => {
    setDismissed((items) => items.includes(id) ? items : [...items, id]);
    closeOpportunity();
    setNotice("Recommendation dismissed. You can restore it from Activity.");
  };

  const restore = (id: string) => {
    setDismissed((items) => items.filter((item) => item !== id));
    setNotice("Recommendation restored to Opportunities.");
  };

  const reviewApproval = () => {
    if (!selectedAudience || selectedAudience.count === 0) return;
    setApprovalSnapshot({
      draft,
      audienceLabel: selectedAudience.label,
      audienceCount: selectedAudience.count,
    });
    setActionStage("approval");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="wordmark" href="#top" aria-label="SessionScape home"><span className="mark">S</span><strong>SessionScape</strong></a>
        <nav aria-label="Primary navigation">
          <a className={surface === "overview" ? "active" : ""} href="#top" onClick={() => showSurface("overview")}><Icon name="grid" />Overview</a>
          <a href="#opportunities"><Icon name="spark" />Opportunities<span className="nav-count">{opportunities.length}</span></a>
          <a href="#clients"><Icon name="users" />Clients</a>
          <a href="#activity"><Icon name="action" />Activity</a>
          <a className={surface === "practice-data" ? "active" : ""} href="#practice-data" onClick={(event) => { event.preventDefault(); showSurface("practice-data"); }}><Icon name="calendar" />Practice data</a>
        </nav>
        <div className="sidebar-bottom">
          <a href="#settings"><Icon name="settings" />Settings</a>
          <div className="account-card"><span className="avatar">IM</span><span><strong>Isla Morgan</strong><small>Willow & Stone</small></span><button aria-label="Open account menu">•••</button></div>
        </div>
      </aside>

      {surface === "practice-data" ? <main id="practice-data">
        {Object.entries(storageAlerts).map(([key, message]) => <div className="storage-alert" role="alert" key={key}>{message}</div>)}
        <header className="topbar">
          <div><p>Private practice workspace</p><h1>Practice data</h1></div>
          {practiceSource === "sample" && <label className="scenario-control"><span>Prototype state</span><select value={scenario} onChange={(event) => setScenario(event.target.value as DataScenario)}>{(Object.keys(scenarioLabels) as DataScenario[]).map((key) => <option value={key} key={key}>{scenarioLabels[key]}</option>)}</select></label>}
        </header>

        <div className="week-toolbar">
          <button aria-label="Previous week" onClick={() => movePracticeWeek(-1)}>←</button>
          <strong>{practiceWeek.label}</strong>
          <button aria-label="Next week" onClick={() => movePracticeWeek(1)}>→</button>
          <button onClick={() => { changePracticeSource(practiceSource); setSelectedWeekDate(getTodayLocalDate(practiceWorkspace.timezone)); }}>Today</button>
        </div>

        <section className="practice-workspace panel">
          <div className="panel-heading">
            <div><p className="eyebrow">CURRENT SOURCE</p><h2>{practiceSourceLabel}</h2></div>
            <strong>{practiceWorkspace.appointments.length} appointment {practiceWorkspace.appointments.length === 1 ? "record" : "records"}</strong>
          </div>
          <p>{practiceWorkspace.practitioners.length} practitioner · {practiceWorkspace.services.length} service</p>
          <p>{availabilityCoverage.activePractitioners === 0
            ? "No active practitioners"
            : `Availability coverage: ${availabilityCoverage.coveredDays} of ${availabilityCoverage.totalDays} days`}</p>

          {practiceSource === "owner" && practiceWorkspace.appointments.length === 0 && <div className="empty-state">
            <strong>No owner-entered records yet</strong>
            <p>Add practitioners, services, availability, and appointments when you are ready.</p>
          </div>}

          <div className="practice-actions">
            {practiceSource !== "sample" && dashboardSource === "connected" && <button className="button-secondary" onClick={disconnectConnectedInsights}>Disconnect connected data and use browser-only insights</button>}
            {dashboardSource !== "connected" && <button className="button-secondary" onClick={() => { setDashboardSource("connected"); setDismissed([]); }}>Use connected data for insights</button>}
            {practiceSource === "owner" && <button className="button-primary" onClick={() => changePracticeSource("sample")}>Explore sample data</button>}
            {practiceSource === "owner" && sampleDerivedWorkspace && <button className="button-secondary" onClick={() => changePracticeSource("sample-derived")}>Open editable sample copy</button>}
            {practiceSource === "owner" && (invalidStorageSlots.owner || ownerWorkspace.practitioners.length > 0 || ownerWorkspace.services.length > 0 || ownerWorkspace.availability.length > 0 || ownerWorkspace.appointments.length > 0) && <button className="button-secondary" onClick={() => clearWorkspace("owner")}>Clear owner data</button>}
            {practiceSource === "sample" && <button className="button-primary" onClick={copySample}>Create editable sample copy</button>}
            {(practiceSource === "sample-derived" || invalidStorageSlots["sample-derived"]) && <button className="button-secondary" onClick={() => clearWorkspace("sample-derived")}>Clear sample-derived data</button>}
            {practiceSource !== "owner" && <button className="button-secondary" onClick={() => changePracticeSource("owner")}>Return to owner data</button>}
          </div>
        </section>

        <div className="practice-tabs" role="tablist" aria-label="Practice data views">
          <button role="tab" aria-selected={practiceDataTab === "appointments"} onClick={() => { setPracticeDataTab("appointments"); setAvailabilityEditor(null); }}>Appointments</button>
          <button role="tab" aria-selected={practiceDataTab === "availability"} onClick={() => { setPracticeDataTab("availability"); setAppointmentEditor(null); }}>Availability</button>
        </div>

        {practiceDataTab === "appointments" && <section className="panel appointment-ledger">
          <div className="panel-heading">
            <div><h2>Appointments</h2><p className="muted">{practiceWeek.label} · {practiceWorkspace.timezone}</p></div>
            {practiceSource !== "sample" && activePractitioners.length > 0 && activeServices.length > 0 && <button onClick={openNewAppointment}>Add appointment</button>}
          </div>
          {weeklyAppointments.length === 0 ? <p className="muted">No appointments in this week.</p> : <ul className="appointment-list">
            {weeklyAppointments.map((record) => {
              const practitioner = practiceWorkspace.practitioners.find(({ id }) => id === record.practitionerId);
              const service = practiceWorkspace.services.find(({ id }) => id === record.serviceId);
              return <li key={record.id}>
                <span><strong>{formatAppointmentTime(record.startAt)}</strong><small>{practitioner?.label} · {service?.label}</small></span>
                <span><strong>{record.status === "no-show" ? "No-show" : `${record.status[0].toUpperCase()}${record.status.slice(1)}`}</strong><small>{record.anonymousClientId ?? "Not linked"} · ${(record.valueCents / 100).toFixed(2)}</small></span>
                {practiceSource !== "sample" && <button aria-label={`Edit appointment ${formatAppointmentTime(record.startAt)}`} onClick={() => openExistingAppointment(record)}>Edit</button>}
              </li>;
            })}
          </ul>}

          {appointmentEditor && <form className="appointment-editor" onSubmit={(event) => { event.preventDefault(); saveAppointment(); }}>
            <label>Appointment date<input aria-label="Appointment date" type="date" value={appointmentEditor.date} onChange={(event) => { setRepeatedHourPending(false); setAppointmentEditor({ ...appointmentEditor, date: event.target.value, repeatedTimeChoice: undefined }); }} /></label>
            <label>Start time<input aria-label="Start time" type="time" value={appointmentEditor.time} onChange={(event) => { setRepeatedHourPending(false); setAppointmentEditor({ ...appointmentEditor, time: event.target.value, repeatedTimeChoice: undefined }); }} /></label>
            <label>Practitioner<select aria-label="Appointment practitioner" value={appointmentEditor.practitionerId} onChange={(event) => setAppointmentEditor({ ...appointmentEditor, practitionerId: event.target.value })}>
              {practiceWorkspace.practitioners.filter((record) => record.active || (appointmentEditor.id && record.id === appointmentEditor.practitionerId)).map((record) => <option key={record.id} value={record.id} disabled={!record.active}>{record.label}{!record.active ? " · inactive historical assignment" : ""}</option>)}
            </select></label>
            <label>Service<select aria-label="Appointment service" value={appointmentEditor.serviceId} onChange={(event) => {
              const service = practiceWorkspace.services.find(({ id }) => id === event.target.value);
              setAppointmentEditor({ ...appointmentEditor, serviceId: event.target.value, durationMinutes: service ? String(service.defaultDurationMinutes) : appointmentEditor.durationMinutes, valueCents: service ? String(service.defaultValueCents) : appointmentEditor.valueCents });
            }}>
              {practiceWorkspace.services.filter((record) => record.active || (appointmentEditor.id && record.id === appointmentEditor.serviceId)).map((record) => <option key={record.id} value={record.id} disabled={!record.active}>{record.label}{!record.active ? " · inactive historical assignment" : ""}</option>)}
            </select></label>
            <label>Duration in minutes<input aria-label="Appointment duration in minutes" type="number" min="1" step="1" value={appointmentEditor.durationMinutes} onChange={(event) => setAppointmentEditor({ ...appointmentEditor, durationMinutes: event.target.value })} /></label>
            <label>Value in cents<input aria-label="Appointment value in cents" type="number" min="0" step="1" value={appointmentEditor.valueCents} onChange={(event) => setAppointmentEditor({ ...appointmentEditor, valueCents: event.target.value })} /></label>
            <label>Appointment status<select aria-label="Appointment status" value={appointmentEditor.status} onChange={(event) => setAppointmentEditor({ ...appointmentEditor, status: event.target.value as AppointmentStatus })}>
              <option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option><option value="no-show">No-show</option>
            </select></label>
            <label>Anonymous client ID<select aria-label="Anonymous client ID" value={appointmentEditor.anonymousClientId} onChange={(event) => setAppointmentEditor({ ...appointmentEditor, anonymousClientId: event.target.value })}>
              <option value="">Not linked</option>{selectableAnonymousClientIds.map((clientId) => <option key={clientId} value={clientId}>{clientId}</option>)}
            </select></label>
            <button type="button" onClick={generateAnonymousClientId}>Generate anonymous client ID</button>
            {repeatedHourPending && <label>Repeated hour choice<select aria-label="Repeated hour choice" value={appointmentEditor.repeatedTimeChoice ?? ""} onChange={(event) => setAppointmentEditor({ ...appointmentEditor, repeatedTimeChoice: event.target.value as "earlier" | "later" })}>
              <option value="" disabled>Choose an occurrence</option><option value="earlier">Earlier occurrence</option><option value="later">Later occurrence</option>
            </select></label>}
            {appointmentError && <p className="warning" role="alert">{appointmentError}</p>}
            <div className="appointment-editor-actions">
              {appointmentEditor.id && <button type="button" onClick={deleteAppointment}>Delete appointment</button>}
              <button type="button" onClick={() => { setAppointmentEditor(null); setAppointmentError(""); }}>Cancel appointment editing</button>
              {outsideHoursPending && <button type="button" onClick={() => saveAppointment(true)}>Save outside hours</button>}
              <button className="button-primary" type="submit">Save appointment</button>
            </div>
          </form>}
        </section>}

        {practiceDataTab === "availability" && <section className="panel availability-panel">
          <div className="panel-heading">
            <div><h2>Weekly availability</h2><p className="muted">Closed days count as complete coverage.</p></div>
          </div>
          {activePractitioners.length === 0 ? <p className="muted">Add an active practitioner to enter availability.</p> : activePractitioners.map((practitioner) => <div className="practitioner-availability" key={practitioner.id}>
            <h3>{practitioner.label}</h3>
            <ul className="availability-list">
              {weekLocalDates.map((localDate) => {
                const record = practiceWorkspace.availability.find((item) => item.practitionerId === practitioner.id && item.localDate === localDate);
                return <li key={localDate}>
                  <strong>{formatAvailabilityDate(localDate)}</strong>
                  <span className="availability-value">{!record ? "Not entered" : record.closed ? "Closed" : `${formatMinute(record.startMinute)}–${formatMinute(record.endMinute)}`}</span>
                  {practiceSource !== "sample" && <button aria-label={`Edit availability ${formatAvailabilityDate(localDate)} for ${practitioner.label}`} onClick={() => openAvailability(practitioner.id, localDate)}>Edit</button>}
                </li>;
              })}
            </ul>
          </div>)}
          {availabilityEditor && <form className="availability-editor" onSubmit={(event) => { event.preventDefault(); saveAvailability(); }}>
            <strong>{formatAvailabilityDate(availabilityEditor.localDate)}</strong>
            <label className="closed-control"><input aria-label="Closed all day" type="checkbox" checked={availabilityEditor.closed} onChange={(event) => setAvailabilityEditor({ ...availabilityEditor, closed: event.target.checked })} />Closed all day</label>
            {!availabilityEditor.closed && <>
              <label>Start time<input aria-label="Availability start time" type="time" value={availabilityEditor.startTime} onChange={(event) => setAvailabilityEditor({ ...availabilityEditor, startTime: event.target.value })} /></label>
              <label>End time<input aria-label="Availability end time" type="time" value={availabilityEditor.endTime} onChange={(event) => setAvailabilityEditor({ ...availabilityEditor, endTime: event.target.value })} /></label>
            </>}
            {availabilityError && <p className="warning" role="alert">{availabilityError}</p>}
            <div><button type="button" onClick={() => { setAvailabilityEditor(null); setAvailabilityError(""); }}>Cancel availability editing</button><button className="button-primary" type="submit">Save availability</button></div>
          </form>}
        </section>}

        <section className="catalog-grid" aria-label="Practice catalogs">
          <div className="panel catalog-panel">
            <div className="panel-heading"><h2>Practitioners</h2>{practiceSource !== "sample" && <button onClick={() => { setCatalogError(""); setCatalogEditor({ kind: "practitioner", label: "" }); }}>Add practitioner</button>}</div>
            {practiceWorkspace.practitioners.length === 0 ? <p className="muted">No practitioners yet.</p> : <ul className="catalog-list">
              {practiceWorkspace.practitioners.map((record) => <li key={record.id}>
                <span><strong>{record.label}</strong>{!record.active && <small>Inactive practitioner</small>}</span>
                {practiceSource !== "sample" && <span className="catalog-actions"><button aria-label={`Edit practitioner ${record.label}`} onClick={() => { setCatalogError(""); setCatalogEditor({ kind: "practitioner", id: record.id, label: record.label }); }}>Edit</button>{record.active && <button aria-label={`Deactivate practitioner ${record.label}`} onClick={() => deactivateCatalogRecord("practitioner", record.id)}>Deactivate</button>}</span>}
              </li>)}
            </ul>}
            {catalogEditor?.kind === "practitioner" && <form className="catalog-editor" onSubmit={(event) => { event.preventDefault(); saveCatalogRecord(); }}>
              <label>Practitioner label<input aria-label="Practitioner label" value={catalogEditor.label} onChange={(event) => setCatalogEditor({ ...catalogEditor, label: event.target.value })} /></label>
              {catalogError && <p className="warning" role="alert">{catalogError}</p>}
              <div><button type="button" onClick={() => setCatalogEditor(null)}>Cancel</button><button className="button-primary" type="submit">Save practitioner</button></div>
            </form>}
          </div>

          <div className="panel catalog-panel">
            <div className="panel-heading"><h2>Services</h2>{practiceSource !== "sample" && <button onClick={() => { setCatalogError(""); setCatalogEditor({ kind: "service", label: "", durationMinutes: "", valueCents: "" }); }}>Add service</button>}</div>
            {practiceWorkspace.services.length === 0 ? <p className="muted">No services yet.</p> : <ul className="catalog-list">
              {practiceWorkspace.services.map((record) => <li key={record.id}>
                <span><strong>{record.label}</strong><small>{record.defaultDurationMinutes} minutes · ${(record.defaultValueCents / 100).toFixed(2)}</small>{!record.active && <small>Inactive service</small>}</span>
                {practiceSource !== "sample" && <span className="catalog-actions"><button aria-label={`Edit service ${record.label}`} onClick={() => { setCatalogError(""); setCatalogEditor({ kind: "service", id: record.id, label: record.label, durationMinutes: String(record.defaultDurationMinutes), valueCents: String(record.defaultValueCents) }); }}>Edit</button>{record.active && <button aria-label={`Deactivate service ${record.label}`} onClick={() => deactivateCatalogRecord("service", record.id)}>Deactivate</button>}</span>}
              </li>)}
            </ul>}
            {catalogEditor?.kind === "service" && <form className="catalog-editor" onSubmit={(event) => { event.preventDefault(); saveCatalogRecord(); }}>
              <label>Service label<input aria-label="Service label" value={catalogEditor.label} onChange={(event) => setCatalogEditor({ ...catalogEditor, label: event.target.value })} /></label>
              <label>Default duration in minutes<input aria-label="Default duration in minutes" type="number" min="1" step="1" value={catalogEditor.durationMinutes} onChange={(event) => setCatalogEditor({ ...catalogEditor, durationMinutes: event.target.value })} /></label>
              <label>Default value in cents<input aria-label="Default value in cents" type="number" min="0" step="1" value={catalogEditor.valueCents} onChange={(event) => setCatalogEditor({ ...catalogEditor, valueCents: event.target.value })} /></label>
              {catalogError && <p className="warning" role="alert">{catalogError}</p>}
              <div><button type="button" onClick={() => setCatalogEditor(null)}>Cancel</button><button className="button-primary" type="submit">Save service</button></div>
            </form>}
          </div>
        </section>

        <section className="privacy-note">
          <strong>Stored only in this browser</strong>
          <p>No names, contact details, notes, health information, or payment details belong in this workspace.</p>
        </section>
      </main> : <main id="top">
        {Object.entries(storageAlerts).map(([key, message]) => <div className="storage-alert" role="alert" key={key}>{message}</div>)}
        <header className="topbar">
          <div><p>Monday, September 7</p><h1>Good morning, Isla</h1></div>
          <div className="topbar-actions">
            {sampleDashboard && <label className="scenario-control"><span>Prototype state</span><select value={scenario} onChange={(event) => { restoreMetricFocusRef.current = false; restoreOpportunityFocusRef.current = false; setScenario(event.target.value as DataScenario); setDismissed([]); setActiveMetric(null); setActiveOpportunity(null); setActionStage("evidence"); setDraft(""); setAudienceId("eligible"); setApprovalSnapshot(null); }}>{(Object.keys(scenarioLabels) as DataScenario[]).map((key) => <option value={key} key={key}>{scenarioLabels[key]}</option>)}</select></label>}
            <button className="date-button" onClick={() => showSurface("practice-data")}><Icon name="calendar" />{fixture.capacityMetric.period}<Icon name="chevron" size={15} /></button>
          </div>
        </header>

        <section className={`data-banner ${fixture.status}`} aria-live="polite">
          <span className="status-icon"><Icon name={fixture.status === "current" ? "refresh" : "warning"} /></span>
          <div><strong>{fixture.bannerTitle}</strong><p>{fixture.bannerCopy}</p></div>
          <button onClick={() => setNotice("Data source details opened for this prototype.")}>{fixture.bannerAction}<Icon name="arrow" size={15} /></button>
        </section>

        {notice && <div className="toast" role="status"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss notification"><Icon name="close" size={16} /></button></div>}

        <section className="summary-heading">
          <div><p className="eyebrow">THIS WEEK AT A GLANCE</p><h2>Your business is <em>{fixture.headline}</em></h2><p>{opportunitySummary.subheadline}</p></div>
          <div className="opportunity-total"><span>Identified opportunity</span><strong>{opportunitySummary.totalOpportunity}</strong><small><Icon name="trend" size={14} /> across {opportunitySummary.opportunityCount} actions</small></div>
        </section>

        <section className="metric-grid" aria-label="Weekly metrics">
          {fixture.metrics.map((metric) => (
            <button className={`metric-card ${metric.state !== "current" ? "metric-partial" : ""}`} key={metric.id} onClick={(event) => openMetric(metric, event.currentTarget)}>
              <span className="metric-label">{metric.label}<Icon name="info" size={16} /></span><strong>{metric.value}</strong>
              <span className={`metric-change ${metric.tone}`}>{metric.change}</span><small>{metric.context}</small>
              {metric.state !== "current" && <span className="partial-label"><Icon name="warning" size={13} />{metric.state === "unavailable" ? "Unavailable" : "Stale data"}</span>}
            </button>
          ))}
        </section>

        <section className="dashboard-grid">
          <div className="panel capacity-panel">
            <div className="panel-heading"><div><p className="eyebrow">CAPACITY</p><h3>Where the week stands</h3></div><button onClick={(event) => openMetric(fixture.capacityMetric, event.currentTarget)}>View calculation<Icon name="chevron" size={14} /></button></div>
            {fixture.capacityState === "unavailable" ? (
              <div className="empty-state"><strong>Capacity is unavailable</strong><p>Availability coverage must recover before these totals and weekday bars can be calculated.</p></div>
            ) : <>
              <div className="capacity-visual">
                <div className="donut" style={{ "--percentage": `${(fixture.capacityPercent ?? 0) * 3.6}deg` } as React.CSSProperties}><span><strong>{fixture.capacityPercent !== null ? `${fixture.capacityPercent}%` : "—"}</strong><small>booked</small></span></div>
                <div className="capacity-key"><div><span className="key-dot booked"/><p><strong>{fixture.bookedHours}h</strong> booked</p></div><div><span className="key-dot open"/><p><strong>{fixture.openHours}h</strong> still open</p></div><div><span className="key-dot blocked"/><p><strong>{fixture.blockedHours}h</strong> unavailable</p></div></div>
              </div>
              <div className="week-bars" aria-label="Capacity by weekday">{fixture.days.map((day) => <div className="day" key={day.label}>{day.booked === null || day.open === null ? <div className="bar-unavailable" aria-label={`${day.label} capacity unavailable`}>â€”</div> : <div className="bar-track"><span style={{ height: `${day.booked}%` }} /><i style={{ height: `${day.open}%` }} /></div>}<small>{day.label}</small></div>)}</div>
            </>}
          </div>

          <div className="panel pulse-panel" id="clients">
            <div className="panel-heading"><div><p className="eyebrow">CLIENT PULSE</p><h3>Return health</h3></div><button><span className="legend-dot"/>6-month trend</button></div>
            <div className="pulse-stat"><span><strong>{fixture.returnRate === null ? "—" : `${fixture.returnRate}%`}</strong><small>{fixture.returnRate === null ? "No eligible visits" : "of eligible clients returned"}</small></span><span className="change-positive">{fixture.returnChange === null ? "Unavailable" : `↗ ${fixture.returnChange}%`}</span></div>
            {hasCompleteReturnTrend ? <><svg className="line-chart" viewBox="0 0 480 150" role="img" aria-label={fixture.returnTrendLabel}><polyline className="chart-line" points={returnChartPoints.map((point) => `${point.x},${point.y}`).join(" ")} />{lastReturnPoint && <circle cx={lastReturnPoint.x} cy={lastReturnPoint.y} r="5" />}</svg><div className="chart-labels">{fixture.returnHistory.map((point) => <span key={point.label}>{point.label}</span>)}</div></> : <div className="chart-unavailable" role="img" aria-label={fixture.returnTrendLabel}>Trend unavailable</div>}
          </div>
        </section>

        <section className="opportunities" id="opportunities">
          <div className="section-title"><div><p className="eyebrow">PRIORITY ACTIONS</p><h2>Opportunities worth your attention</h2><p>Based on your availability, client patterns, and business rules.</p></div><button>View all <Icon name="arrow" size={16} /></button></div>
          <div className="opportunity-list">
            {opportunities.map((opportunity) => (
              <article className="opportunity-card" key={opportunity.id}>
                <div className={`opportunity-icon ${opportunity.type}`}><Icon name={opportunity.type === "capacity" ? "calendar" : "users"} size={22} /></div>
                <div className="opportunity-main"><div className="opportunity-meta"><span>{opportunity.kicker}</span><i className={opportunity.urgency === "High priority" ? "high" : ""}>{opportunity.urgency}</i></div><h3>{opportunity.title}</h3><p>{opportunity.summary}</p><div className="reason"><span>Why this appeared</span><p>{opportunity.reason}</p></div></div>
                <div className="opportunity-value"><span>Estimated value</span><strong>{opportunity.value}</strong><small>{opportunity.valueNote}</small><button onClick={(event) => startAction(opportunity, event.currentTarget)}>Review action<Icon name="arrow" size={15} /></button></div>
              </article>
            ))}
            {unavailableRecommendations.length > 0 && <div className="empty-state"><strong>Some recommendations are unavailable</strong><ul>{unavailableRecommendations.map((reason) => <li key={reason}>{reason}</li>)}</ul></div>}
            {opportunities.length === 0 && unavailableRecommendations.length === 0 && <div className="empty-state"><strong>No opportunities meet the documented rules</strong><p>Dismissed recommendations remain available in Activity.</p></div>}
          </div>
        </section>

        <section className="activity" id="activity" aria-label="Activity">
          <div className="section-title"><div><p className="eyebrow">ACTIVITY</p><h2 id="activity-title">Dismissed recommendations</h2><p>Review recommendations you set aside in this prototype state.</p></div></div>
          {dismissedOpportunities.length === 0 ? <div className="empty-state"><strong>No dismissed recommendations</strong><p>Recommendations you dismiss will appear here.</p></div> : <div className="activity-list">{dismissedOpportunities.map((opportunity) => <article className="activity-card" key={opportunity.id}><div><span>{opportunity.type === "capacity" ? "Capacity" : "Retention"} opportunity</span><strong>{opportunity.title}</strong></div><div className="activity-actions"><strong>{opportunity.value}</strong><button onClick={() => restore(opportunity.id)}>Restore recommendation</button></div></article>)}</div>}
        </section>

        <footer><span>{sampleDashboard ? "SessionScape uses synthetic prototype data" : "SessionScape is using browser-local practice records"}</span><span>Metric rules v1.0 · {dashboardWorkspace.timezone}</span></footer>
      </main>}

      {activeMetric && <div className="modal-backdrop" onClick={() => closeMetric()}><aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="metric-title" onKeyDown={(event) => handleDialogKeyDown(event, closeMetric)} onClick={(event) => event.stopPropagation()}><button ref={metricCloseRef} className="drawer-close" onClick={() => closeMetric()} aria-label="Close"><Icon name="close" /></button><p className="eyebrow">METRIC DEFINITION</p><h2 id="metric-title">{activeMetric.label}</h2><div className="drawer-value">{activeMetric.value}</div><dl><div><dt>Period</dt><dd>{activeMetric.period}</dd></div><div><dt>Population</dt><dd>{activeMetric.population}</dd></div><div><dt>Formula</dt><dd>{activeMetric.formula}</dd></div><div><dt>Source coverage</dt><dd>{activeMetric.coverage}</dd></div><div><dt>Exclusions & assumptions</dt><dd>{activeMetric.exclusions}</dd></div></dl><div className="definition-note"><Icon name="info" /><p><strong>{activeMetric.classification}</strong>This value is {activeMetric.classification.toLowerCase()} and is not realized revenue.</p></div></aside></div>}

      {activeOpportunity && <div className="modal-backdrop" onClick={() => closeOpportunity()}>
        <aside className="drawer opportunity-drawer" role="dialog" aria-modal="true" aria-labelledby="opportunity-title" onKeyDown={(event) => handleDialogKeyDown(event, closeOpportunity)} onClick={(event) => event.stopPropagation()}>
          <button ref={opportunityCloseRef} className="drawer-close" onClick={() => closeOpportunity()} aria-label="Close"><Icon name="close" /></button>
          {sampleDashboard && <div className="action-steps" aria-label="Action progress">
            {(["Evidence", "Draft", "Approve", "Handoff"] as const).map((label, index) => <span className={index === ["evidence", "draft", "approval", "handoff"].indexOf(actionStage) ? "active" : ""} key={label}>{index + 1} {label}</span>)}
          </div>}
          <div className={`action-context ${opportunitySummary.actionContext.recheckRequired ? "warning" : ""}`}>
            <strong>{opportunitySummary.actionContext.freshness}</strong>
            <span>{opportunitySummary.actionContext.coverage}</span>
            <p>{opportunitySummary.actionContext.limitation}</p>
            {!sampleDashboard && "evidence" in dashboardInput && <>
              <span>Period {dashboardInput.evidence.period}</span>
              <p>Excluded records: {dashboardInput.evidence.excluded.cancelled} cancelled, {dashboardInput.evidence.excluded.noShow} no-show, {dashboardInput.evidence.excluded.outsideAvailability} outside availability, {dashboardInput.evidence.deduplicatedRecords} duplicate IDs.</p>
            </>}
          </div>

          {actionStage === "evidence" && <>
            <p className="eyebrow">{activeOpportunity.ruleVersion} · {sampleDashboard ? scenarioLabels[scenario] : dashboardSource === "owner" ? "Owner-entered data" : "Sample-derived data"}</p>
            <h2 id="opportunity-title">{activeOpportunity.title}</h2>
            <div className="review-summary"><span>Estimated opportunity<strong>{activeOpportunity.value}</strong></span>{sampleDashboard && <span>Eligible audience<strong>{activeOpportunity.audience}</strong></span>}</div>
            <div className="rule-box"><span>Why this appeared</span><p>{activeOpportunity.reason}</p><small>Rule {activeOpportunity.ruleVersion}: {activeOpportunity.rule}</small></div>
            <p className="muted"><strong>Nothing has been sent.</strong> {sampleDashboard ? "You will review the message and audience before approval." : "Manual records support evidence review only; they do not prove consent or suppression status."}</p>
            <div className="drawer-actions"><button className="button-secondary" onClick={() => dismiss(activeOpportunity.id)}>{sampleDashboard ? "Dismiss recommendation" : "Mark reviewed"}</button>{sampleDashboard && <button className="button-primary" onClick={() => setActionStage("draft")}>Continue to draft<Icon name="arrow" size={15} /></button>}</div>
          </>}

          {actionStage === "draft" && <>
            <p className="eyebrow">OWNER REVIEW</p>
            <h2 id="opportunity-title">Prepare a representative draft</h2>
            <label className="audience-control">Message draft<textarea ref={draftRef} value={draft} onChange={(event) => setDraft(event.target.value)} /></label>
            <label className="audience-control">Audience<select value={audienceId} onChange={(event) => setAudienceId(event.target.value)}>{activeOpportunity.audiences.map((audience) => <option value={audience.id} key={audience.id}>{audience.count} · {audience.label}</option>)}</select></label>
            <div className="rule-box"><span>Audience rules</span><p>{activeOpportunity.eligibility}</p></div>
            {selectedAudience?.count === 0 && <p className="warning">No eligible recipients match this preset.</p>}
            <p className="muted">Representative prototype only. SessionScape will not send or export this message.</p>
            <div className="drawer-actions"><button onClick={() => setActionStage("evidence")}>Back</button><button className="button-secondary" onClick={() => dismiss(activeOpportunity.id)}>Dismiss recommendation</button><button className="button-primary" disabled={!selectedAudience || selectedAudience.count === 0} onClick={reviewApproval}>Review approval</button></div>
          </>}

          {actionStage === "approval" && approvalSnapshot && <>
            <p className="eyebrow">FINAL OWNER CONTROL</p>
            <h2 id="opportunity-title">Approve this action draft?</h2>
            <div className="rule-box"><strong>Audience snapshot · {approvalSnapshot.audienceLabel} · {approvalSnapshot.audienceCount} eligible clients</strong><p>{activeOpportunity.eligibility}</p></div>
            <div className="rule-box"><strong>Content snapshot</strong><p>{approvalSnapshot.draft}</p></div>
            <p className="warning"><strong>Approval does not send a message or create a booking.</strong></p>
            <div className="drawer-actions"><button ref={approvalInitialRef} onClick={() => setActionStage("draft")}>Edit</button><button className="button-secondary" onClick={() => dismiss(activeOpportunity.id)}>Dismiss</button><button className="button-primary" onClick={() => { setNotice("Draft approved in this synthetic prototype. No message has been sent."); setActionStage("handoff"); }}>Approve draft</button></div>
          </>}

          {actionStage === "handoff" && <>
            <p className="eyebrow">REPRESENTATIVE PROVIDER HANDOFF</p>
            <h2 id="opportunity-title">Continue in {activeOpportunity.providerHandoff.provider}</h2>
            <div className="rule-box">
              <strong>{activeOpportunity.providerHandoff.label}</strong>
              <p>{activeOpportunity.providerHandoff.limitation}</p>
              <a ref={handoffRef} className="button-primary" href="#provider-handoff" onClick={() => setNotice("Representative provider page selected. No booking or payment was created.")}>Open representative {activeOpportunity.providerHandoff.label}</a>
            </div>
            <h3>What the value means</h3>
            <div className="value-ladder">
              <div className="value-row current"><strong>Estimated opportunity</strong><span>Current · {activeOpportunity.value}</span></div>
              <div className="value-row"><strong>Attributed booking</strong><span>Not observed</span></div>
              <div className="value-row"><strong>Completed appointment</strong><span>Not observed</span></div>
              <div className="value-row"><strong>Realized revenue</strong><span>Not observed</span></div>
            </div>
            <p className="muted">Approval records only the owner-controlled snapshot in this synthetic prototype. It does not send, book, or collect payment.</p>
          </>}
        </aside>
      </div>}
    </div>
  );
}
