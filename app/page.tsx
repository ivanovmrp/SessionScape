"use client";

import { useMemo, useState } from "react";
import { DASHBOARD_FIXTURES, type DataScenario, type Metric, type Opportunity } from "../lib/dashboard-fixtures";

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

export default function Home() {
  const [scenario, setScenario] = useState<DataScenario>("current");
  const [activeMetric, setActiveMetric] = useState<Metric | null>(null);
  const [activeOpportunity, setActiveOpportunity] = useState<Opportunity | null>(null);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const fixture = DASHBOARD_FIXTURES[scenario];
  const opportunities = useMemo(() => fixture.opportunities.filter((item) => !dismissed.includes(item.id)), [dismissed, fixture.opportunities]);

  const dismiss = (id: string) => {
    setDismissed((items) => [...items, id]);
    setActiveOpportunity(null);
    setNotice("Recommendation dismissed. You can restore it from Activity.");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="wordmark" href="#top" aria-label="SessionScape home"><span className="mark">S</span><strong>SessionScape</strong></a>
        <nav aria-label="Primary navigation">
          <a className="active" href="#top"><Icon name="grid" />Overview</a>
          <a href="#opportunities"><Icon name="spark" />Opportunities<span className="nav-count">{opportunities.length}</span></a>
          <a href="#clients"><Icon name="users" />Clients</a>
          <a href="#activity"><Icon name="action" />Activity</a>
        </nav>
        <div className="sidebar-bottom">
          <a href="#settings"><Icon name="settings" />Settings</a>
          <div className="account-card"><span className="avatar">IM</span><span><strong>Isla Morgan</strong><small>Willow & Stone</small></span><button aria-label="Open account menu">•••</button></div>
        </div>
      </aside>

      <main id="top">
        <header className="topbar">
          <div><p>Monday, September 7</p><h1>Good morning, Isla</h1></div>
          <div className="topbar-actions">
            <label className="scenario-control"><span>Prototype state</span><select value={scenario} onChange={(event) => { setScenario(event.target.value as DataScenario); setDismissed([]); }}>{(Object.keys(scenarioLabels) as DataScenario[]).map((key) => <option value={key} key={key}>{scenarioLabels[key]}</option>)}</select></label>
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
          <div><p className="eyebrow">THIS WEEK AT A GLANCE</p><h2>Your business is <em>{fixture.headline}</em></h2><p>{fixture.subheadline}</p></div>
          <div className="opportunity-total"><span>Identified opportunity</span><strong>{fixture.totalOpportunity}</strong><small><Icon name="trend" size={14} /> across {opportunities.length} actions</small></div>
        </section>

        <section className="metric-grid" aria-label="Weekly metrics">
          {fixture.metrics.map((metric) => (
            <button className={`metric-card ${metric.state === "partial" ? "metric-partial" : ""}`} key={metric.id} onClick={() => setActiveMetric(metric)}>
              <span className="metric-label">{metric.label}<Icon name="info" size={16} /></span><strong>{metric.value}</strong>
              <span className={`metric-change ${metric.tone}`}>{metric.change}</span><small>{metric.context}</small>
              {metric.state === "partial" && <span className="partial-label"><Icon name="warning" size={13} />Partial coverage</span>}
            </button>
          ))}
        </section>

        <section className="dashboard-grid">
          <div className="panel capacity-panel">
            <div className="panel-heading"><div><p className="eyebrow">CAPACITY</p><h3>Where the week stands</h3></div><button onClick={() => setActiveMetric(fixture.capacityMetric)}>View calculation<Icon name="chevron" size={14} /></button></div>
            <div className="capacity-visual">
              <div className="donut" style={{ "--percentage": `${fixture.capacityPercent * 3.6}deg` } as React.CSSProperties}><span><strong>{fixture.capacityPercent ? `${fixture.capacityPercent}%` : "—"}</strong><small>booked</small></span></div>
              <div className="capacity-key"><div><span className="key-dot booked"/><p><strong>{fixture.bookedHours}h</strong> booked</p></div><div><span className="key-dot open"/><p><strong>{fixture.openHours || "—"}h</strong> still open</p></div><div><span className="key-dot blocked"/><p><strong>{fixture.blockedHours}h</strong> unavailable</p></div></div>
            </div>
            <div className="week-bars" aria-label="Capacity by weekday">{fixture.days.map((day) => <div className="day" key={day.label}><div className="bar-track"><span style={{ height: `${day.booked}%` }} /><i style={{ height: `${day.open}%` }} /></div><small>{day.label}</small></div>)}</div>
          </div>

          <div className="panel pulse-panel" id="clients">
            <div className="panel-heading"><div><p className="eyebrow">CLIENT PULSE</p><h3>Return health</h3></div><button><span className="legend-dot"/>6-month trend</button></div>
            <div className="pulse-stat"><span><strong>{fixture.returnRate}%</strong><small>of eligible clients returned</small></span><span className="change-positive">↗ {fixture.returnChange}%</span></div>
            <svg className="line-chart" viewBox="0 0 480 150" role="img" aria-label="Client return rate rose over six months"><defs><linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1b856f" stopOpacity=".22"/><stop offset="1" stopColor="#1b856f" stopOpacity="0"/></linearGradient></defs><path className="chart-area" d="M0 127 C50 120 65 100 112 105 S170 75 215 87 S280 60 322 67 S385 34 480 27 L480 150 L0 150Z" /><path className="chart-line" d="M0 127 C50 120 65 100 112 105 S170 75 215 87 S280 60 322 67 S385 34 480 27" /><circle cx="480" cy="27" r="5" /></svg>
            <div className="chart-labels"><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span></div>
          </div>
        </section>

        <section className="opportunities" id="opportunities">
          <div className="section-title"><div><p className="eyebrow">PRIORITY ACTIONS</p><h2>Opportunities worth your attention</h2><p>Based on your availability, client patterns, and business rules.</p></div><button>View all <Icon name="arrow" size={16} /></button></div>
          <div className="opportunity-list">
            {opportunities.map((opportunity) => (
              <article className="opportunity-card" key={opportunity.id}>
                <div className={`opportunity-icon ${opportunity.type}`}><Icon name={opportunity.type === "capacity" ? "calendar" : "users"} size={22} /></div>
                <div className="opportunity-main"><div className="opportunity-meta"><span>{opportunity.kicker}</span><i className={opportunity.urgency === "High priority" ? "high" : ""}>{opportunity.urgency}</i></div><h3>{opportunity.title}</h3><p>{opportunity.summary}</p><div className="reason"><span>Why this appeared</span><p>{opportunity.reason}</p></div></div>
                <div className="opportunity-value"><span>Estimated value</span><strong>{opportunity.value}</strong><small>{opportunity.valueNote}</small><button onClick={() => setActiveOpportunity(opportunity)}>Review action<Icon name="arrow" size={15} /></button></div>
              </article>
            ))}
            {opportunities.length === 0 && <div className="empty-state"><strong>You’re all caught up</strong><p>Dismissed recommendations remain available in Activity.</p></div>}
          </div>
        </section>

        <footer id="activity"><span>SessionScape uses synthetic prototype data</span><span>Metric rules v1.0 · America/New_York</span></footer>
      </main>

      {activeMetric && <div className="modal-backdrop" onMouseDown={() => setActiveMetric(null)}><aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="metric-title" onMouseDown={(event) => event.stopPropagation()}><button className="drawer-close" onClick={() => setActiveMetric(null)} aria-label="Close"><Icon name="close" /></button><p className="eyebrow">METRIC DEFINITION</p><h2 id="metric-title">{activeMetric.label}</h2><div className="drawer-value">{activeMetric.value}</div><dl><div><dt>Period</dt><dd>{activeMetric.period}</dd></div><div><dt>Population</dt><dd>{activeMetric.population}</dd></div><div><dt>Formula</dt><dd>{activeMetric.formula}</dd></div><div><dt>Source coverage</dt><dd>{activeMetric.coverage}</dd></div><div><dt>Exclusions & assumptions</dt><dd>{activeMetric.exclusions}</dd></div></dl><div className="definition-note"><Icon name="info" /><p><strong>{activeMetric.classification}</strong>This value is {activeMetric.classification.toLowerCase()} and is not realized revenue.</p></div></aside></div>}

      {activeOpportunity && <div className="modal-backdrop" onMouseDown={() => setActiveOpportunity(null)}><aside className="drawer opportunity-drawer" role="dialog" aria-modal="true" aria-labelledby="opportunity-title" onMouseDown={(event) => event.stopPropagation()}><button className="drawer-close" onClick={() => setActiveOpportunity(null)} aria-label="Close"><Icon name="close" /></button><p className="eyebrow">REVIEW RECOMMENDATION</p><h2 id="opportunity-title">{activeOpportunity.title}</h2><div className="review-summary"><span>Estimated value<strong>{activeOpportunity.value}</strong></span><span>Eligible audience<strong>{activeOpportunity.audience}</strong></span></div><div className="rule-box"><span>Rule {activeOpportunity.ruleVersion}</span><p>{activeOpportunity.rule}</p></div><h3>Owner controls</h3><p className="muted">Nothing is sent automatically. Review the suggested audience and draft before taking action.</p><label className="audience-control">Audience<select defaultValue="eligible"><option value="eligible">{activeOpportunity.audience} eligible clients</option><option value="recent">Recently active only</option><option value="vip">Frequent clients only</option></select></label><div className="drawer-actions"><button className="button-secondary" onClick={() => dismiss(activeOpportunity.id)}>Dismiss</button><button className="button-primary" onClick={() => { setNotice("Draft opened for owner review. No message has been sent."); setActiveOpportunity(null); }}>Review draft<Icon name="arrow" size={15} /></button></div></aside></div>}
    </div>
  );
}
