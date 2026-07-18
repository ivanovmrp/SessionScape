"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { SESSION_THEMES } from "../lib/themes";

const icon = (symbol: string) => <span aria-hidden="true">{symbol}</span>;

export default function Home() {
  const [themeId, setThemeId] = useState(SESSION_THEMES[0].id);
  const [duration, setDuration] = useState("75 minutes");
  const [aroma, setAroma] = useState("Lavender");
  const [saved, setSaved] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [subscriptionComplete, setSubscriptionComplete] = useState(false);
  const theme = useMemo(() => SESSION_THEMES.find((item) => item.id === themeId) ?? SESSION_THEMES[0], [themeId]);

  useEffect(() => {
    if (!subscribeOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSubscribeOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [subscribeOpen]);

  const openSubscribe = () => {
    setSubscriptionComplete(false);
    setSubscribeOpen(true);
  };

  const handleSubscribe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.localStorage.setItem("sessionscape-early-access-email", subscriberEmail);
    setSubscriptionComplete(true);
  };

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top">Session<span>Scape</span></a>
        <nav aria-label="Main navigation">
          <a href="#builder">Builder</a>
          <a href="#library">Theme library</a>
          <a href="#checklist">Room checklist</a>
        </nav>
        <div className="account-actions">
          <button className="subscribe-link" onClick={openSubscribe}>Subscribe</button>
          <button className="avatar" aria-label="Open account menu">IM</button>
        </div>
      </header>

      <section className="hero" id="top">
        <p className="eyebrow">YOUR SESSION-DESIGN WORKSPACE</p>
        <h1>Make every massage feel <em>intentionally yours.</em></h1>
        <p className="hero-copy">Build a complete, professional experience around the client—not just a sequence of techniques.</p>
        <div className="hero-actions">
          <a className="button primary" href="#builder">Build a session {icon("→")}</a>
          <a className="button text" href="#library">Explore themes</a>
        </div>
      </section>

      <section className="workspace" id="builder" aria-label="Session Builder">
        <div className="section-heading">
          <div>
            <p className="eyebrow">SESSION BUILDER</p>
            <h2>Shape today&apos;s experience</h2>
          </div>
          <div className="status">● Draft session</div>
        </div>

        <div className="builder-grid">
          <aside className="controls">
            <label>
              Starting theme
              <select value={themeId} onChange={(event) => setThemeId(event.target.value)}>
                {SESSION_THEMES.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
              </select>
            </label>
            <label>
              Session duration
              <select value={duration} onChange={(event) => setDuration(event.target.value)}>
                <option>60 minutes</option><option>75 minutes</option><option>90 minutes</option>
              </select>
            </label>
            <label>
              Aroma preference
              <select value={aroma} onChange={(event) => setAroma(event.target.value)}>
                <option>Lavender</option><option>Jasmine</option><option>Fresh citrus</option><option>Unscented</option><option>Client&apos;s choice</option>
              </select>
            </label>
            <div className="client-note">
              <strong>{icon("✦")} Client preference check</strong>
              <p>Confirm scent, pressure, focus areas, and any boundaries before beginning.</p>
            </div>
          </aside>

          <article className={`blueprint experience-${theme.id}`}>
            <div className="blueprint-title">
              <div>
                <p className="theme-type">{theme.category}</p>
                <h3>{theme.name}</h3>
              </div>
              <span className="duration">{duration}</span>
            </div>
            <p className="summary">{theme.summary}</p>
            <div className="attributes">
              <div><span>PACE</span><strong>{theme.pace}</strong></div>
              <div><span>PRESSURE</span><strong>{theme.pressure}</strong></div>
              <div><span>FLOW</span><strong>{theme.flow}</strong></div>
            </div>
            <div className="sequence">
              <h4>Suggested flow</h4>
              <ol>{theme.sequence.map((step) => <li key={step}>{step}</li>)}</ol>
            </div>
            <div className="actions">
              <button className="button secondary" onClick={() => setSaved(true)}>{saved ? "Saved to your sessions" : "Save session"}</button>
              <button className="button text" onClick={() => window.print()}>Print blueprint</button>
            </div>
          </article>
        </div>
      </section>

      <section className="preparation" id="checklist">
        <div>
          <p className="eyebrow">ROOM PREPARATION</p>
          <h2>Details that make the feeling.</h2>
          <p>Use this as a starting point, then adjust to the client&apos;s preferences and your professional judgment.</p>
        </div>
        <div className="checklist">
          <label><input type="checkbox" /> Warm, low lighting prepared</label>
          <label><input type="checkbox" /> Music queued: {theme.music}</label>
          <label><input type="checkbox" /> {aroma} option offered and approved</label>
          <label><input type="checkbox" /> Bolsters and warm towels ready</label>
          <label><input type="checkbox" /> Consent and comfort check planned</label>
        </div>
      </section>

      <section className="library" id="library">
        <p className="eyebrow">THEME LIBRARY</p>
        <h2>Professional foundations, made personal.</h2>
        <div className="theme-grid">
          {SESSION_THEMES.map((item) => (
            <button className={`theme-card experience-${item.id} ${item.id === themeId ? "selected" : ""}`} key={item.id} onClick={() => { setThemeId(item.id); document.getElementById("builder")?.scrollIntoView({ behavior: "smooth" }); }}>
              <span>{item.category}</span><strong>{item.name}</strong><small>{item.tagline}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="coming-soon" id="subscribe">
        <div>
          <p className="eyebrow">MORE EXPERIENCES, COMING SOON</p>
          <h2>Stay close to what&apos;s next.</h2>
          <p>Register for early access to new session themes, sensory pairings, and planning tools as they arrive.</p>
        </div>
        <button className="button primary" onClick={openSubscribe}>Register for updates {icon("→")}</button>
      </section>

      <footer>SessionScape is an experience-design tool, not medical advice. Always practice within your training, local regulations, and professional standards.</footer>

      {subscribeOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSubscribeOpen(false);
        }}>
          <section className="subscribe-modal" role="dialog" aria-modal="true" aria-labelledby="subscribe-title">
            <button className="modal-close" onClick={() => setSubscribeOpen(false)} aria-label="Close registration">×</button>
            {subscriptionComplete ? (
              <div className="subscription-success" aria-live="polite">
                <span aria-hidden="true">✓</span>
                <p className="eyebrow">YOU&apos;RE ON THE LIST</p>
                <h2 id="subscribe-title">More experiences are on the way.</h2>
                <p>We saved <strong>{subscriberEmail}</strong> for early-access updates on this device.</p>
                <button className="button secondary" onClick={() => setSubscribeOpen(false)}>Back to SessionScape</button>
              </div>
            ) : (
              <>
                <p className="eyebrow">EARLY ACCESS</p>
                <h2 id="subscribe-title">Be first to explore what&apos;s next.</h2>
                <p>Register for updates when we add new themes, sensory details, and experience-building tools.</p>
                <form onSubmit={handleSubscribe}>
                  <label htmlFor="subscriber-email">Email address</label>
                  <input
                    id="subscriber-email"
                    type="email"
                    value={subscriberEmail}
                    onChange={(event) => setSubscriberEmail(event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    autoFocus
                    required
                  />
                  <button className="button primary" type="submit">Register for updates</button>
                </form>
                <small>This preview keeps your registration only in this browser until the full service launches.</small>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
