"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { BLOG_ARTICLES, COMMUNITY_COPY, COMMUNITY_THREADS, type LocalCommunityThread } from "../lib/community";
import { AROMA_OPTIONS, DURATION_OPTIONS, UI_COPY } from "../lib/translations";
import { type Locale, SESSION_THEMES } from "../lib/themes";

const icon = (symbol: string) => <span aria-hidden="true">{symbol}</span>;

type LocalAccount = {
  name: string;
  email: string;
};

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [subscriptionComplete, setSubscriptionComplete] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountMode, setAccountMode] = useState<"login" | "register">("login");
  const [accountName, setAccountName] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [accountError, setAccountError] = useState("");
  const [accountDestination, setAccountDestination] = useState<"app" | "community">("app");
  const [currentUser, setCurrentUser] = useState<LocalAccount | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [localThreads, setLocalThreads] = useState<LocalCommunityThread[]>([]);
  const [discussionTitle, setDiscussionTitle] = useState("");
  const [discussionBody, setDiscussionBody] = useState("");
  const [discussionTopic, setDiscussionTopic] = useState("");

  const t = UI_COPY[locale];
  const c = COMMUNITY_COPY[locale];
  const durationOptions = DURATION_OPTIONS[locale];
  const aromaOptions = AROMA_OPTIONS[locale];
  const theme = useMemo(() => SESSION_THEMES.find((item) => item.id === themeId) ?? SESSION_THEMES[0], [themeId]);
  const themeCopy = theme.copy[locale];
  const durationLabel = durationOptions.find((item) => item.value === duration)?.label ?? durationOptions[0].label;
  const aromaLabel = aromaOptions.find((item) => item.value === aroma)?.label ?? aromaOptions[0].label;
  const selectedArticle = BLOG_ARTICLES.find((article) => article.id === selectedArticleId) ?? null;
  const providerAccess = currentUser !== null;
  const userInitials = currentUser?.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() ?? "";

  useEffect(() => {
    const storedLocale = window.localStorage.getItem("sessionscape-language");
    if (storedLocale === "en" || storedLocale === "ru") setLocale(storedLocale);

    setSubscriberEmail(window.localStorage.getItem("sessionscape-early-access-email") ?? "");
    try {
      const storedAccount = window.localStorage.getItem("sessionscape-preview-account");
      const activeEmail = window.localStorage.getItem("sessionscape-preview-session");
      if (storedAccount) {
        const account = JSON.parse(storedAccount) as LocalAccount;
        if (account.email === activeEmail) setCurrentUser(account);
      }
    } catch {
      window.localStorage.removeItem("sessionscape-preview-account");
      window.localStorage.removeItem("sessionscape-preview-session");
    }
    try {
      const storedThreads = window.localStorage.getItem("sessionscape-community-threads");
      if (storedThreads) setLocalThreads(JSON.parse(storedThreads) as LocalCommunityThread[]);
    } catch {
      window.localStorage.removeItem("sessionscape-community-threads");
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = t.pageTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", t.pageDescription);
  }, [locale, t.pageDescription, t.pageTitle]);

  useEffect(() => {
    if (!subscribeOpen && !accountOpen && !selectedArticleId && !mobileMenuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSubscribeOpen(false);
        setAccountOpen(false);
        setSelectedArticleId(null);
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [accountOpen, mobileMenuOpen, selectedArticleId, subscribeOpen]);

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

  const openAccount = (mode: "login" | "register", destination: "app" | "community" = "app") => {
    setAccountMode(mode);
    setAccountDestination(destination);
    setAccountError("");
    setAccountOpen(true);
    try {
      const storedAccount = window.localStorage.getItem("sessionscape-preview-account");
      if (storedAccount) {
        const account = JSON.parse(storedAccount) as LocalAccount;
        setAccountEmail(account.email);
        if (mode === "register") setAccountName(account.name);
      }
    } catch {
      window.localStorage.removeItem("sessionscape-preview-account");
    }
  };

  const handleAccount = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAccountError("");

    if (accountMode === "register") {
      const account = { name: accountName.trim(), email: accountEmail.trim().toLowerCase() };
      window.localStorage.setItem("sessionscape-preview-account", JSON.stringify(account));
      window.localStorage.setItem("sessionscape-preview-session", account.email);
      setCurrentUser(account);
      setAccountOpen(false);
      if (accountDestination === "community") {
        window.setTimeout(() => document.getElementById("community")?.scrollIntoView({ behavior: "smooth" }), 0);
      }
      return;
    }

    try {
      const storedAccount = window.localStorage.getItem("sessionscape-preview-account");
      const account = storedAccount ? JSON.parse(storedAccount) as LocalAccount : null;
      if (!account || account.email !== accountEmail.trim().toLowerCase()) {
        setAccountError(t.loginError);
        return;
      }
      window.localStorage.setItem("sessionscape-preview-session", account.email);
      setCurrentUser(account);
      setAccountOpen(false);
      if (accountDestination === "community") {
        window.setTimeout(() => document.getElementById("community")?.scrollIntoView({ behavior: "smooth" }), 0);
      }
    } catch {
      setAccountError(t.loginError);
    }
  };

  const logOut = () => {
    window.localStorage.removeItem("sessionscape-preview-session");
    setCurrentUser(null);
  };

  const handleDiscussion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextThread: LocalCommunityThread = {
      id: `local-${Date.now()}`,
      topic: discussionTopic || c.topicOptions[0],
      title: discussionTitle.trim(),
      body: discussionBody.trim()
    };
    const nextThreads = [nextThread, ...localThreads];
    setLocalThreads(nextThreads);
    window.localStorage.setItem("sessionscape-community-threads", JSON.stringify(nextThreads));
    setDiscussionTitle("");
    setDiscussionBody("");
    setDiscussionTopic("");
  };

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top">Session<span>Scape</span></a>
        <nav id="main-navigation" className={mobileMenuOpen ? "open" : ""} aria-label={t.mainNavigation}>
          <a href="#builder" onClick={() => setMobileMenuOpen(false)}>{t.builderNav}</a>
          <a href="#library" onClick={() => setMobileMenuOpen(false)}>{t.libraryNav}</a>
          <a href="#checklist" onClick={() => setMobileMenuOpen(false)}>{t.checklistNav}</a>
          <a href="#journal" onClick={() => setMobileMenuOpen(false)}>{c.insightsNav}</a>
          <a href="#community" onClick={() => setMobileMenuOpen(false)}>{c.communityNav}</a>
        </nav>
        <div className="account-actions">
          <button
            className="mobile-menu-toggle"
            type="button"
            aria-controls="main-navigation"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? t.closeMenu : t.openMenu}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <span /><span /><span />
          </button>
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
          <div className="account-profile" aria-label={t.accountMenu}>
            <div className="account-identity">
              <span className="avatar" aria-hidden="true">{userInitials || "IM"}</span>
            </div>
            <div className="account-links">
              {currentUser ? (
                <button className="logout-link" type="button" onClick={logOut}>{t.logOut}</button>
              ) : (
                <button className="login-link" type="button" onClick={() => openAccount("login")}>{t.logIn}</button>
              )}
            </div>
          </div>
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

      <section className="journal" id="journal">
        <div className="content-heading">
          <div>
            <p className="eyebrow">{c.journalEyebrow}</p>
            <h2>{c.journalTitle}</h2>
          </div>
          <p>{c.journalIntro}</p>
        </div>
        <div className="article-grid">
          {BLOG_ARTICLES.map((article, index) => (
            <article className={`article-card ${index === 0 ? "featured" : ""}`} key={article.id}>
              <div className="article-meta">
                <span>{article.category[locale]}</span>
                <span>{article.readTime[locale]}</span>
              </div>
              <h3>{article.title[locale]}</h3>
              <p>{article.excerpt[locale]}</p>
              <div className="article-footer">
                <small>{article.published[locale]}</small>
                <button type="button" className="button text" onClick={() => setSelectedArticleId(article.id)}>
                  {c.readArticle} {icon("→")}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={`community ${providerAccess ? "member" : "preview"}`} id="community">
        <div className="community-heading">
          <div>
            <p className="eyebrow">{c.communityEyebrow}</p>
            <h2>{c.communityTitle}</h2>
            <p>{c.communityIntro}</p>
          </div>
          <span className="community-access">{providerAccess ? c.memberBadge : c.previewAccess}</span>
        </div>

        <div className="community-layout">
          <aside className="community-rules">
            <span className="rule-icon" aria-hidden="true">◎</span>
            <h3>{c.communityPrinciples}</h3>
            <ul>{c.principles.map((principle) => <li key={principle}>{principle}</li>)}</ul>
            <p>{c.privacyRule}</p>
          </aside>

          <div className="discussion-panel">
            {providerAccess && (
              <form className="discussion-form" onSubmit={handleDiscussion}>
                <div className="discussion-form-heading">
                  <div>
                    <span>{c.providerAccess}</span>
                    <h3>{c.startDiscussion}</h3>
                  </div>
                  <span className="moderation-state">{c.localPostStatus}</span>
                </div>
                <div className="discussion-fields">
                  <label>
                    {c.topic}
                    <select value={discussionTopic} onChange={(event) => setDiscussionTopic(event.target.value)} required>
                      <option value="">{c.selectTopic}</option>
                      {c.topicOptions.map((topic) => <option value={topic} key={topic}>{topic}</option>)}
                    </select>
                  </label>
                  <label>
                    {c.discussionTitle}
                    <input value={discussionTitle} onChange={(event) => setDiscussionTitle(event.target.value)} placeholder={c.discussionPlaceholder} maxLength={120} required />
                  </label>
                </div>
                <label>
                  {c.discussionBody}
                  <textarea value={discussionBody} onChange={(event) => setDiscussionBody(event.target.value)} placeholder={c.bodyPlaceholder} maxLength={600} rows={3} required />
                </label>
                <button type="submit" className="button primary">{c.publishDiscussion}</button>
              </form>
            )}

            <div className="discussion-list-heading">
              <h3>{c.sampleDiscussions}</h3>
              <span>{providerAccess ? c.providerAccess : c.previewAccess}</span>
            </div>

            {providerAccess && localThreads.map((thread) => (
              <article className="discussion-card local" key={thread.id}>
                <div className="discussion-meta"><span>{thread.topic}</span><small>{c.localPostStatus}</small></div>
                <h4>{thread.title}</h4>
                <p>{thread.body}</p>
                <div className="discussion-author"><span className="mini-avatar">{userInitials}</span><div><strong>{currentUser?.name}</strong><small>{c.providerAccess}</small></div></div>
              </article>
            ))}

            {COMMUNITY_THREADS.slice(0, providerAccess ? COMMUNITY_THREADS.length : 2).map((thread) => (
              <article className="discussion-card" key={thread.id}>
                <div className="discussion-meta"><span>{thread.topic[locale]}</span><small>{thread.posted[locale]}</small></div>
                <h4>{thread.title[locale]}</h4>
                <p>{thread.excerpt[locale]}</p>
                <div className="discussion-footer">
                  <div className="discussion-author"><span className="mini-avatar">{thread.author.split(" ").map((part) => part[0]).join("")}</span><div><strong>{thread.author}</strong><small>{thread.role[locale]}</small></div></div>
                  <span>{c.replies(String(thread.replies))}</span>
                </div>
              </article>
            ))}

            {!providerAccess && (
              <div className="community-lock">
                <span aria-hidden="true">◇</span>
                <div><h3>{c.joinTitle}</h3><p>{c.joinCopy}</p></div>
                <button type="button" className="button primary" onClick={() => openAccount("register", "community")}>{c.joinButton}</button>
              </div>
            )}
          </div>
        </div>
        <p className="prototype-note">{c.prototypeNote}</p>
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

      {selectedArticle && (
        <div className="modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelectedArticleId(null);
        }}>
          <article className="article-modal" role="dialog" aria-modal="true" aria-labelledby="article-title">
            <button className="modal-close" onClick={() => setSelectedArticleId(null)} aria-label={c.closeArticle}>×</button>
            <div className="article-meta"><span>{selectedArticle.category[locale]}</span><span>{selectedArticle.readTime[locale]}</span></div>
            <h2 id="article-title">{selectedArticle.title[locale]}</h2>
            <p className="article-deck">{selectedArticle.excerpt[locale]}</p>
            <div className="article-body">{selectedArticle.body[locale].map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
            <footer className="article-review"><span>{selectedArticle.published[locale]}</span><span>{c.reviewedNote}</span></footer>
          </article>
        </div>
      )}

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

      {accountOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setAccountOpen(false);
        }}>
          <section className="subscribe-modal account-modal" role="dialog" aria-modal="true" aria-labelledby="account-title">
            <button className="modal-close" onClick={() => setAccountOpen(false)} aria-label={t.closeAccount}>×</button>
            <p className="eyebrow">{accountMode === "register" ? t.createAccountEyebrow : t.welcomeBackEyebrow}</p>
            <h2 id="account-title">{accountMode === "register" ? t.createAccountTitle : t.logInTitle}</h2>
            <p>{accountMode === "register" ? t.createAccountCopy : t.logInCopy}</p>
            <form onSubmit={handleAccount}>
              {accountMode === "register" && (
                <>
                  <label htmlFor="account-name">{t.displayName}</label>
                  <input
                    id="account-name"
                    value={accountName}
                    onChange={(event) => setAccountName(event.target.value)}
                    placeholder={t.namePlaceholder}
                    autoComplete="name"
                    autoFocus
                    required
                  />
                </>
              )}
              <label htmlFor="account-email">{t.emailAddress}</label>
              <input
                id="account-email"
                type="email"
                value={accountEmail}
                onChange={(event) => setAccountEmail(event.target.value)}
                placeholder={t.emailPlaceholder}
                autoComplete="email"
                autoFocus={accountMode === "login"}
                required
              />
              {accountError && <p className="form-error" role="alert">{accountError}</p>}
              <button className="button primary" type="submit">{accountMode === "register" ? t.createAccount : t.logIn}</button>
            </form>
            <button className="account-mode-switch" type="button" onClick={() => {
              setAccountMode(accountMode === "register" ? "login" : "register");
              setAccountError("");
            }}>
              {accountMode === "register" ? t.haveAccount : t.needAccount}
            </button>
            <small>{t.accountPrototypeNote}</small>
          </section>
        </div>
      )}
    </main>
  );
}
