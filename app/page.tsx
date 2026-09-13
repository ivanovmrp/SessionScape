"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { deriveDashboard } from "../lib/dashboard-calculations";
import { DASHBOARD_FIXTURES, DASHBOARD_INPUTS, type DataScenario, type Metric, type Opportunity } from "../lib/dashboard-fixtures";
import {
  createPracticeWorkspaceRepository,
  RAW_SAMPLE_WORKSPACE,
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
type StorageAlertKey = WorkspaceSlot | "general";

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
  const [ownerWorkspace, setOwnerWorkspace] = useState(() => emptyWorkspace("owner-entered"));
  const [sampleDerivedWorkspace, setSampleDerivedWorkspace] = useState<PracticeWorkspace | null>(null);
  const [storageAlerts, setStorageAlerts] = useState<Partial<Record<StorageAlertKey, string>>>({});
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
  const fixture = DASHBOARD_FIXTURES[scenario];
  const hasCompleteReturnTrend = fixture.returnHistory.length === 6
    && fixture.returnHistory.every((point) => point.rate !== null);
  const returnChartPoints = hasCompleteReturnTrend ? fixture.returnHistory.flatMap((point, index) =>
    point.rate === null
      ? []
      : [{
          x: fixture.returnHistory.length === 1 ? 240 : index * (480 / (fixture.returnHistory.length - 1)),
          y: 140 - point.rate * 1.8,
        }],
  ) : [];
  const lastReturnPoint = returnChartPoints.at(-1);
  const opportunitySummary = useMemo(
    () => deriveDashboard(DASHBOARD_INPUTS[scenario], dismissed),
    [dismissed, scenario],
  );
  const opportunities = useMemo(() => fixture.opportunities.filter((item) => !dismissed.includes(item.id)), [dismissed, fixture.opportunities]);
  const dismissedOpportunities = useMemo(() => fixture.opportunities.filter((item) => dismissed.includes(item.id)), [dismissed, fixture.opportunities]);
  const selectedAudience = activeOpportunity?.audiences.find(
    (audience) => audience.id === audienceId,
  );
  const practiceWorkspace = practiceSource === "sample"
    ? RAW_SAMPLE_WORKSPACE
    : practiceSource === "sample-derived"
      ? sampleDerivedWorkspace ?? RAW_SAMPLE_WORKSPACE
      : ownerWorkspace;
  const practiceSourceLabel = practiceSource === "sample"
    ? "Sample data · read only"
    : practiceSource === "sample-derived"
      ? "Sample-derived data"
      : "Owner-entered data";

  useEffect(() => {
    let active = true;
    const hydrate = async () => {
      await Promise.resolve();
      if (!active) return;

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

      if (owner.ok) {
        if (owner.value) setOwnerWorkspace(owner.value);
      } else {
        alerts.owner = owner.error === "invalid-data"
          ? "Stored owner data could not be loaded. It was left unchanged so you can recover it."
          : "Browser storage could not read owner data. It was left unchanged and changes will not be saved.";
      }

      if (sampleDerived.ok) {
        if (sampleDerived.value) setSampleDerivedWorkspace(sampleDerived.value);
      } else {
        alerts["sample-derived"] = sampleDerived.error === "invalid-data"
          ? "Stored sample-derived data could not be loaded. It was left unchanged so you can recover it."
          : "Browser storage could not read sample-derived data. It was left unchanged and changes will not be saved.";
      }
      setStorageAlerts(alerts);
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
    setPracticeSource(nextSource);
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

  const copySample = () => {
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

  const clearSampleDerived = () => {
    if (!window.confirm("Clear all sample-derived practice data?")) return;
    const cleared = browserRepository().clear("sample-derived");
    if (!cleared.ok) {
      updateStorageAlert(
        "sample-derived",
        "Sample-derived data could not be cleared. The stored copy was left unchanged.",
      );
      return;
    }
    updateStorageAlert("sample-derived");
    setSampleDerivedWorkspace(emptyWorkspace("sample-derived"));
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

        <section className="practice-workspace panel">
          <div className="panel-heading">
            <div><p className="eyebrow">CURRENT SOURCE</p><h2>{practiceSourceLabel}</h2></div>
            <strong>{practiceWorkspace.appointments.length} appointment {practiceWorkspace.appointments.length === 1 ? "record" : "records"}</strong>
          </div>
          <p>{practiceWorkspace.practitioners.length} practitioner · {practiceWorkspace.services.length} service</p>

          {practiceSource === "owner" && practiceWorkspace.appointments.length === 0 && <div className="empty-state">
            <strong>No owner-entered records yet</strong>
            <p>Add practitioners, services, availability, and appointments when you are ready.</p>
          </div>}

          <div className="practice-actions">
            {practiceSource === "owner" && <button className="button-primary" onClick={() => changePracticeSource("sample")}>Explore sample data</button>}
            {practiceSource === "owner" && sampleDerivedWorkspace && <button className="button-secondary" onClick={() => changePracticeSource("sample-derived")}>Open editable sample copy</button>}
            {practiceSource === "sample" && <button className="button-primary" onClick={copySample}>Create editable sample copy</button>}
            {practiceSource === "sample-derived" && <button className="button-secondary" onClick={clearSampleDerived}>Clear sample-derived data</button>}
            {practiceSource !== "owner" && <button className="button-secondary" onClick={() => changePracticeSource("owner")}>Return to owner data</button>}
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
            <label className="scenario-control"><span>Prototype state</span><select value={scenario} onChange={(event) => { restoreMetricFocusRef.current = false; restoreOpportunityFocusRef.current = false; setScenario(event.target.value as DataScenario); setDismissed([]); setActiveMetric(null); setActiveOpportunity(null); setActionStage("evidence"); setDraft(""); setAudienceId("eligible"); setApprovalSnapshot(null); }}>{(Object.keys(scenarioLabels) as DataScenario[]).map((key) => <option value={key} key={key}>{scenarioLabels[key]}</option>)}</select></label>
            <button className="date-button"><Icon name="calendar" />Sep 7 – 13<Icon name="chevron" size={15} /></button>
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
            {opportunities.length === 0 && <div className="empty-state"><strong>You’re all caught up</strong><p>Dismissed recommendations remain available in Activity.</p></div>}
          </div>
        </section>

        <section className="activity" id="activity" aria-label="Activity">
          <div className="section-title"><div><p className="eyebrow">ACTIVITY</p><h2 id="activity-title">Dismissed recommendations</h2><p>Review recommendations you set aside in this prototype state.</p></div></div>
          {dismissedOpportunities.length === 0 ? <div className="empty-state"><strong>No dismissed recommendations</strong><p>Recommendations you dismiss will appear here.</p></div> : <div className="activity-list">{dismissedOpportunities.map((opportunity) => <article className="activity-card" key={opportunity.id}><div><span>{opportunity.type === "capacity" ? "Capacity" : "Retention"} opportunity</span><strong>{opportunity.title}</strong></div><div className="activity-actions"><strong>{opportunity.value}</strong><button onClick={() => restore(opportunity.id)}>Restore recommendation</button></div></article>)}</div>}
        </section>

        <footer><span>SessionScape uses synthetic prototype data</span><span>Metric rules v1.0 · America/New_York</span></footer>
      </main>}

      {activeMetric && <div className="modal-backdrop" onClick={() => closeMetric()}><aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="metric-title" onKeyDown={(event) => handleDialogKeyDown(event, closeMetric)} onClick={(event) => event.stopPropagation()}><button ref={metricCloseRef} className="drawer-close" onClick={() => closeMetric()} aria-label="Close"><Icon name="close" /></button><p className="eyebrow">METRIC DEFINITION</p><h2 id="metric-title">{activeMetric.label}</h2><div className="drawer-value">{activeMetric.value}</div><dl><div><dt>Period</dt><dd>{activeMetric.period}</dd></div><div><dt>Population</dt><dd>{activeMetric.population}</dd></div><div><dt>Formula</dt><dd>{activeMetric.formula}</dd></div><div><dt>Source coverage</dt><dd>{activeMetric.coverage}</dd></div><div><dt>Exclusions & assumptions</dt><dd>{activeMetric.exclusions}</dd></div></dl><div className="definition-note"><Icon name="info" /><p><strong>{activeMetric.classification}</strong>This value is {activeMetric.classification.toLowerCase()} and is not realized revenue.</p></div></aside></div>}

      {activeOpportunity && <div className="modal-backdrop" onClick={() => closeOpportunity()}>
        <aside className="drawer opportunity-drawer" role="dialog" aria-modal="true" aria-labelledby="opportunity-title" onKeyDown={(event) => handleDialogKeyDown(event, closeOpportunity)} onClick={(event) => event.stopPropagation()}>
          <button ref={opportunityCloseRef} className="drawer-close" onClick={() => closeOpportunity()} aria-label="Close"><Icon name="close" /></button>
          <div className="action-steps" aria-label="Action progress">
            {(["Evidence", "Draft", "Approve", "Handoff"] as const).map((label, index) => <span className={index === ["evidence", "draft", "approval", "handoff"].indexOf(actionStage) ? "active" : ""} key={label}>{index + 1} {label}</span>)}
          </div>
          <div className={`action-context ${opportunitySummary.actionContext.recheckRequired ? "warning" : ""}`}>
            <strong>{opportunitySummary.actionContext.freshness}</strong>
            <span>{opportunitySummary.actionContext.coverage}</span>
            <p>{opportunitySummary.actionContext.limitation}</p>
          </div>

          {actionStage === "evidence" && <>
            <p className="eyebrow">{activeOpportunity.ruleVersion} · {scenarioLabels[scenario]}</p>
            <h2 id="opportunity-title">{activeOpportunity.title}</h2>
            <div className="review-summary"><span>Estimated opportunity<strong>{activeOpportunity.value}</strong></span><span>Eligible audience<strong>{activeOpportunity.audience}</strong></span></div>
            <div className="rule-box"><span>Why this appeared</span><p>{activeOpportunity.reason}</p><small>Rule {activeOpportunity.ruleVersion}: {activeOpportunity.rule}</small></div>
            <p className="muted"><strong>Nothing has been sent.</strong> You will review the message and audience before approval.</p>
            <div className="drawer-actions"><button className="button-secondary" onClick={() => dismiss(activeOpportunity.id)}>Dismiss recommendation</button><button className="button-primary" onClick={() => setActionStage("draft")}>Continue to draft<Icon name="arrow" size={15} /></button></div>
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
