"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { AROMA_OPTIONS, DURATION_OPTIONS, UI_COPY } from "../lib/translations";
import { type Locale, SESSION_THEMES } from "../lib/themes";

const icon = (symbol: string) => <span aria-hidden="true">{symbol}</span>;

const FlagIcon = ({ locale }: { locale: Locale }) => locale === "ru" ? (
  <svg className="flag-icon" viewBox="0 0 24 16" aria-hidden="true">
    <rect width="24" height="16" fill="#fff" />
    <rect y="5.33" width="24" height="5.34" fill="#1c57a7" />
    <rect y="10.67" width="24" height="5.33" fill="#d52b1e" />
  </svg>
) : (
  <svg className="flag-icon" viewBox="0 0 24 16" aria-hidden="true">
    <rect width="24" height="16" fill="#21468b" />
    <path d="M0 0l24 16M24 0L0 16" stroke="#fff" strokeWidth="4" />
    <path d="M0 0l24 16M24 0L0 16" stroke="#cf142b" strokeWidth="1.8" />
    <path d="M12 0v16M0 8h24" stroke="#fff" strokeWidth="5" />
    <path d="M12 0v16M0 8h24" stroke="#cf142b" strokeWidth="2.6" />
  </svg>
);

export default function Home() {
  const [locale, setLocale] = useState<Locale>("en");
  const [themeId, setThemeId] = useState(SESSION_THEMES[0].id);
  const [duration, setDuration] = useState("75");
  const [aroma, setAroma] = useState("lavender");
  const [saved, setSaved] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [subscriptionComplete, setSubscriptionComplete] = useState(false);

  const t = UI_COPY[locale];
  const durationOptions = DURATION_OPTIONS[locale];
  const aromaOptions = AROMA_OPTIONS[locale];
  const theme = useMemo(() => SESSION_THEMES.find((item) => item.id === themeId) ?? SESSION_THEMES[0], [themeId]);
  const themeCopy = theme.copy[locale];
  const durationLabel = durationOptions.find((item) => item.value === duration)?.label ?? durationOptions[0].label;
  const aromaLabel = aromaOptions.find((item) => item.value === aroma)?.label ?? aromaOptions[0].label;

  useEffect(() => {
    const storedLocale = window.localStorage.getItem("sessionscape-language");
    if (storedLocale === "en" || storedLocale === "ru") setLocale(storedLocale);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = t.pageTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", t.pageDescription);
  }, [locale, t.pageDescription, t.pageTitle]);

  useEffect(() => {
    if (!subscribeOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSubscribeOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [subscribeOpen]);

  const changeLanguage = (nextLocale: Locale) => {
    setLocale(nextLocale);
    window.localStorage.setItem("sessionscape-language", nextLocale);
  };

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
        <nav aria-label={t.mainNavigation}>
          <a href="#builder">{t.builderNav}</a>
          <a href="#library">{t.libraryNav}</a>
          <a href="#checklist">{t.checklistNav}</a>
        </nav>
        <div className="account-actions">
          <div className="language-switch" role="group" aria-label={t.languageSelector}>
            <button
              type="button"
              className={locale === "en" ? "active" : ""}
              aria-pressed={locale === "en"}
              aria-label={t.switchToEnglish}
              onClick={() => changeLanguage("en")}
              lang="en"
            >
              <FlagIcon locale="en" /><span className="language-label">EN</span>
            </button>
            <button
              type="button"
              className={locale === "ru" ? "active" : ""}
              aria-pressed={locale === "ru"}
              aria-label={t.switchToRussian}
              onClick={() => changeLanguage("ru")}
              lang="ru"
            >
              <FlagIcon locale="ru" /><span className="language-label">RU</span>
            </button>
          </div>
          <button className="subscribe-link" onClick={openSubscribe}>{t.subscribe}</button>
          <button className="avatar" aria-label={t.accountMenu}>IM</button>
        </div>
      </header>

      <section className="hero" id="top">
        <p className="eyebrow">{t.heroEyebrow}</p>
        <h1>{t.heroTitle} <em>{t.heroTitleAccent}</em></h1>
        <p className="hero-copy">{t.heroCopy}</p>
        <div className="hero-actions">
          <a className="button primary" href="#builder">{t.buildSession} {icon("→")}</a>
          <a className="button text" href="#library">{t.exploreThemes}</a>
        </div>
      </section>

      <section className="workspace" id="builder" aria-label={t.builderNav}>
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t.builderLabel}</p>
            <h2>{t.builderTitle}</h2>
          </div>
          <div className="status">● {t.draftSession}</div>
        </div>

        <div className="builder-grid">
          <aside className="controls">
            <label>
              {t.startingTheme}
              <select value={themeId} onChange={(event) => setThemeId(event.target.value)}>
                {SESSION_THEMES.map((item) => <option value={item.id} key={item.id}>{item.copy[locale].name}</option>)}
              </select>
            </label>
            <label>
              {t.sessionDuration}
              <select value={duration} onChange={(event) => setDuration(event.target.value)}>
                {durationOptions.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}
              </select>
            </label>
            <label>
              {t.aromaPreference}
              <select value={aroma} onChange={(event) => setAroma(event.target.value)}>
                {aromaOptions.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}
              </select>
            </label>
            <div className="client-note">
              <strong>{icon("✦")} {t.clientCheck}</strong>
              <p>{t.clientCheckCopy}</p>
            </div>
          </aside>

          <article className={`blueprint experience-${theme.id}`}>
            <div className="blueprint-title">
              <div>
                <p className="theme-type">{themeCopy.category}</p>
                <h3>{themeCopy.name}</h3>
              </div>
              <span className="duration">{durationLabel}</span>
            </div>
            <p className="summary">{themeCopy.summary}</p>
            <div className="attributes">
              <div><span>{t.pace}</span><strong>{themeCopy.pace}</strong></div>
              <div><span>{t.pressure}</span><strong>{themeCopy.pressure}</strong></div>
              <div><span>{t.flow}</span><strong>{themeCopy.flow}</strong></div>
            </div>
            <div className="sequence">
              <h4>{t.suggestedFlow}</h4>
              <ol>{themeCopy.sequence.map((step) => <li key={step}>{step}</li>)}</ol>
            </div>
            <div className="actions">
              <button className="button secondary" onClick={() => setSaved(true)}>{saved ? t.savedSession : t.saveSession}</button>
              <button className="button text" onClick={() => window.print()}>{t.printBlueprint}</button>
            </div>
          </article>
        </div>
      </section>

      <section className="preparation" id="checklist">
        <div>
          <p className="eyebrow">{t.roomPreparation}</p>
          <h2>{t.preparationTitle}</h2>
          <p>{t.preparationCopy}</p>
        </div>
        <div className="checklist">
          <label><input type="checkbox" /> {t.lightingCheck}</label>
          <label><input type="checkbox" /> {t.musicCheck(themeCopy.music)}</label>
          <label><input type="checkbox" /> {t.aromaCheck(aromaLabel)}</label>
          <label><input type="checkbox" /> {t.towelsCheck}</label>
          <label><input type="checkbox" /> {t.consentCheck}</label>
        </div>
      </section>

      <section className="library" id="library">
        <p className="eyebrow">{t.libraryLabel}</p>
        <h2>{t.libraryTitle}</h2>
        <div className="theme-grid">
          {SESSION_THEMES.map((item) => {
            const itemCopy = item.copy[locale];
            return (
              <button className={`theme-card experience-${item.id} ${item.id === themeId ? "selected" : ""}`} key={item.id} onClick={() => { setThemeId(item.id); document.getElementById("builder")?.scrollIntoView({ behavior: "smooth" }); }}>
                <span>{itemCopy.category}</span><strong>{itemCopy.name}</strong><small>{itemCopy.tagline}</small>
              </button>
            );
          })}
        </div>
      </section>

      <section className="coming-soon" id="subscribe">
        <div>
          <p className="eyebrow">{t.comingSoon}</p>
          <h2>{t.comingSoonTitle}</h2>
          <p>{t.comingSoonCopy}</p>
        </div>
        <button className="button primary" onClick={openSubscribe}>{t.registerUpdates} {icon("→")}</button>
      </section>

      <footer>{t.footer}</footer>

      {subscribeOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSubscribeOpen(false);
        }}>
          <section className="subscribe-modal" role="dialog" aria-modal="true" aria-labelledby="subscribe-title">
            <button className="modal-close" onClick={() => setSubscribeOpen(false)} aria-label={t.closeRegistration}>×</button>
            {subscriptionComplete ? (
              <div className="subscription-success" aria-live="polite">
                <span aria-hidden="true">✓</span>
                <p className="eyebrow">{t.onTheList}</p>
                <h2 id="subscribe-title">{t.successTitle}</h2>
                <p>{t.successCopy(subscriberEmail)}</p>
                <button className="button secondary" onClick={() => setSubscribeOpen(false)}>{t.backToApp}</button>
              </div>
            ) : (
              <>
                <p className="eyebrow">{t.earlyAccess}</p>
                <h2 id="subscribe-title">{t.modalTitle}</h2>
                <p>{t.modalCopy}</p>
                <form onSubmit={handleSubscribe}>
                  <label htmlFor="subscriber-email">{t.emailAddress}</label>
                  <input
                    id="subscriber-email"
                    type="email"
                    value={subscriberEmail}
                    onChange={(event) => setSubscriberEmail(event.target.value)}
                    placeholder={t.emailPlaceholder}
                    autoComplete="email"
                    autoFocus
                    required
                  />
                  <button className="button primary" type="submit">{t.registerUpdates}</button>
                </form>
                <small>{t.registrationNote}</small>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
