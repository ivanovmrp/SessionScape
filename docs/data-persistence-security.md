# Data persistence and security requirements

Status: Architecture decision and production baseline
Last updated: 2026-07-18

## Decision summary

Use **PostgreSQL**, preferably as a managed service, for production relational data. Do not introduce MySQL unless a future hosting or organizational constraint creates a measurable advantage that outweighs migration and operational cost.

PostgreSQL fits the existing domain because SessionScape requires relational integrity across workspaces, memberships, blueprints, preferences, content revisions, discussions, reports, and audit events. It also provides row-level security for defense-in-depth tenant controls and native full-text search suitable for the initial blog and forum ([PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html), [PostgreSQL full-text search](https://www.postgresql.org/docs/current/textsearch.html)).

This decision does not mean that a database is added to the current static prototype. The prototype continues to use local sample data and clearly labeled browser storage until the private-beta backend is implemented.

## Storage architecture

| Data | Production store | Rule |
| --- | --- | --- |
| Accounts, workspaces, roles, preferences, blueprints, blog metadata, forum content, reports, and audits | Managed PostgreSQL | Source of truth with constraints, migrations, backups, and least-privilege access |
| Published images and generated exports | Private object storage plus CDN where public | Store references in PostgreSQL; use signed URLs for private objects |
| Sessions and short-lived rate-limit state | Managed ephemeral store or database-backed session store | Never rely on browser local storage for production authentication |
| Secrets and encryption keys | Cloud secret manager / key management service | Never store in source control, application tables, logs, or browser code |
| Analytics | Privacy-reviewed analytics service or isolated warehouse | No client names, contact data, preference values, forum bodies, or private profile fields |
| Search | PostgreSQL full-text search initially | Add a separate search service only after measured scale or multilingual relevance requires it |

## Core data model

Every mutable record uses an immutable identifier, `created_at`, `updated_at`, and an explicit owner or scope. User-facing deletion must not depend only on a nullable UI flag.

| Area | Primary entities | Important relationships |
| --- | --- | --- |
| Identity | User, ProviderProfile, Workspace, Membership, RoleAssignment | A user can belong to multiple workspaces; roles are scoped and time-bounded. |
| Session design | Theme, ThemeRevision, SessionBlueprint, PreferenceProfile, ConsentCheckpoint, Feedback | A blueprint snapshots its source revision and belongs to one workspace. |
| Editorial | BlogPost, BlogRevision, Topic, Bookmark, SubscriptionPreference | Publication state and revision history are separate from the public projection. |
| Community | ForumCategory, Thread, Post, Reaction, Follow, Block | Author identity and visibility state are explicit; replies form a bounded hierarchy. |
| Trust and safety | Report, ModerationAction, Appeal, ContentFlag | Actions reference policy versions and preserve minimum necessary evidence. |
| Operations | AuditEvent, OutboxEvent, IdempotencyKey, DataRequest, LegalHold | Security/audit data is separated from ordinary activity analytics. |

Client preference data and provider community content shall not share free-form fields or search indexes. The community must never become an informal clinical-record store.

## Persistence requirements

| ID | Requirement |
| --- | --- |
| DP-01 | PostgreSQL is the authoritative production store; schema changes use reviewed, versioned, reversible-forward migrations. |
| DP-02 | Foreign keys, unique constraints, check constraints, and transactions enforce business integrity in addition to application validation. |
| DP-03 | Every workspace-owned table contains a non-null workspace identifier and is protected by application authorization plus PostgreSQL row-level security where supported. |
| DP-04 | Row-level policies default deny, are forced for application paths where practical, and are covered by cross-tenant positive and negative tests. |
| DP-05 | The application connects with least-privilege roles that cannot bypass row security, modify schema, or read backup storage. |
| DP-06 | User-generated writes support idempotency where retries could duplicate registrations, posts, reports, bookings, payments, or notifications. |
| DP-07 | Published content and moderation state changes preserve revision or event history instead of destructive in-place overwrite. |
| DP-08 | Search indexes include only content the requesting user is authorized to view; provider-only content is excluded from public indexes and sitemaps. |
| DP-09 | Timestamps are stored in UTC; user and booking time zones are stored separately using IANA identifiers. |
| DP-10 | Database queries are parameterized; arbitrary SQL and user-selected table, column, or order expressions are prohibited. |
| DP-11 | Large binary data is stored outside PostgreSQL; metadata includes owner, purpose, media type, size, checksum, scan state, and retention class. |
| DP-12 | Production, staging, development, analytics, and support access use separate credentials and data boundaries. Production personal data is not copied into lower environments. |

## Availability, backup, and recovery

| ID | Requirement |
| --- | --- |
| DP-13 | The managed database uses high-availability configuration appropriate to the launch service-level objective. |
| DP-14 | Automated encrypted backups and write-ahead-log archiving support point-in-time recovery; PostgreSQL documents WAL-based recovery to a selected time or restore point ([PostgreSQL PITR](https://www.postgresql.org/docs/current/continuous-archiving.html)). |
| DP-15 | Initial private-beta objectives are RPO at most 24 hours and RTO at most 8 hours; production targets are RPO at most 15 minutes and RTO at most 4 hours. |
| DP-16 | Backup retention is at least 35 days for production unless a market-specific schedule requires otherwise. Backup access is separate, logged, and least privilege. |
| DP-17 | A full restore is tested before private beta and at least quarterly in production; results record duration, integrity checks, failures, and corrective action. |
| DP-18 | Deletion propagates to active stores promptly and expires from backups through documented rotation; backups are not used to resurrect deleted accounts except for disaster recovery followed by deletion replay. |

## Retention baseline

These are product defaults subject to legal and market review.

| Data class | Default | End-of-life behavior |
| --- | --- | --- |
| Account and provider profile | Account lifetime plus 30-day recovery period | Delete direct identifiers unless retention is required and disclosed |
| Session blueprints and preference profiles | Until user deletion or workspace closure | Export, then delete; no indefinite orphan records |
| Published blog content and revisions | Until archived by editor | Preserve stable URL and correction history where lawful |
| Forum posts and replies | Until author deletion, moderation removal, or account closure rule | Delete or pseudonymize as disclosed; remove direct profile linkage |
| Draft posts | 90 days after last edit unless user saves them | Delete automatically |
| Abuse reports, moderation actions, and appeals | 24 months after closure by default | Restrict access, then securely delete unless legal hold applies |
| Authentication and security events | 12 months by default | Aggregate only what remains useful, then delete |
| Product analytics | 14 months by default | Use de-identified aggregates where possible |
| Database backups | 35-day rolling window | Cryptographic or lifecycle deletion |

Users must be told before posting when conversation-integrity needs may cause content to be pseudonymized rather than immediately removed. Legal holds are rare, authorized, scoped, logged, and reviewed.

## Security requirements

OWASP ASVS 5.0 Level 2 is the initial web-application verification baseline; ASVS provides testable requirements for application controls and secure development ([OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/)).

### Identity and access

| ID | Requirement |
| --- | --- |
| SEC-01 | Use an established identity provider supporting email verification, passkeys or federated sign-in, secure recovery, session revocation, and MFA. SessionScape does not implement password hashing itself. |
| SEC-02 | MFA is required for administrators, editors with publish rights, moderators, support impersonation, and production access; phishing-resistant authentication is preferred for privileged roles. |
| SEC-03 | Authorization is checked server-side on every request and object, using deny-by-default role and ownership rules; hiding a control in the UI is never authorization. |
| SEC-04 | Session cookies are Secure, HttpOnly, SameSite Lax or stricter, narrowly scoped, rotated after authentication changes, and invalidated on logout or security events. |
| SEC-05 | Sensitive account changes require recent authentication and notify the user through an independent channel. |
| SEC-06 | Support cannot silently impersonate a user; time-limited audited support access requires explicit business purpose and elevated approval. |

NIST notes that passwords are not phishing resistant and recognizes cryptographic authentication methods for phishing resistance ([NIST SP 800-63B-4](https://pages.nist.gov/800-63-4/sp800-63b.html)).

### Application and content security

| ID | Requirement |
| --- | --- |
| SEC-07 | Validate input at the server boundary, apply length and semantic limits, parameterize database access, and encode output for its rendering context. |
| SEC-08 | Forum and blog authoring use a restricted structured format or sanitized Markdown. Raw HTML, scripts, iframes, inline event handlers, and unsafe URL schemes are prohibited. |
| SEC-09 | The first community release has no file uploads or direct messages. Later uploads require type/size limits, malware scanning, content-disposition controls, private storage, and authorization-tested delivery. |
| SEC-10 | CSRF defenses protect state-changing browser requests; CORS uses an explicit allowlist and never reflects arbitrary origins with credentials. |
| SEC-11 | Rate limits and abuse controls apply by account, IP risk signal, endpoint, and action to registration, login, recovery, posting, reactions, reports, search, and invitations. |
| SEC-12 | Security headers include a restrictive Content Security Policy, frame protection, MIME sniffing protection, referrer policy, and HSTS after HTTPS rollout. |
| SEC-13 | Error responses and logs do not expose secrets, tokens, SQL, stack traces, client preferences, or private community content. |
| SEC-14 | Dependencies, containers, infrastructure, and source are scanned; critical findings block release and supported versions receive timely patches. |

OWASP recommends early validation of untrusted input but treats it as one layer rather than a substitute for injection and XSS defenses ([OWASP Input Validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)).

### Data protection and operations

| ID | Requirement |
| --- | --- |
| SEC-15 | TLS protects all external and internal data in transit; managed encryption protects database, object, log, and backup data at rest. |
| SEC-16 | Secrets are generated, stored, accessed, rotated, and revoked through a secret manager; no production secret appears in Git, build output, support tools, or client code. |
| SEC-17 | Audit logs cover authentication, role changes, exports, deletions, publishing, moderation, support access, policy changes, and security configuration without storing message bodies unnecessarily. |
| SEC-18 | Alerts detect repeated access denial, credential abuse, unusual export, cross-tenant probes, moderation abuse, backup failure, and security-control disablement. |
| SEC-19 | Data export and deletion verify the requester, are rate limited, produce an audit event, and avoid including data from another workspace or blocked/private context. |
| SEC-20 | A documented incident-response plan defines severity, containment, evidence preservation, notification decision-making, recovery, and retrospective action. It is exercised before public launch and annually. |
| SEC-21 | Independent penetration testing covers identity, tenancy, community content, moderation, exports, and administrative paths before production client data is stored. |
| SEC-22 | Security and privacy acceptance criteria are part of feature definition, automated tests, release review, and vendor procurement. |

## Production readiness gate

The static export may continue for public prototype content. Production accounts or forum persistence require a server/API deployment and shall not launch until:

1. The data inventory, schema, roles, row-level policies, retention schedule, and data-flow diagram are reviewed.
2. Managed authentication, PostgreSQL, object storage, secrets, logging, backups, and monitoring are configured in isolated environments.
3. Cross-tenant, broken-object authorization, XSS, SQL injection, CSRF, session, rate-limit, and moderation-abuse tests pass.
4. Backup restoration, deletion, export, incident response, and community disablement are exercised.
5. Privacy notice, terms, community rules, moderation playbook, subprocessor list, and support procedures are published and operational.

