# Blog and provider community requirements

Status: Proposed for validation
Last updated: 2026-07-18

## Decision

SessionScape should add an editorial blog and a moderated provider community, but they serve different business jobs:

- The **blog should be public** so it can establish credibility, demonstrate the product's point of view, support search discovery, and give prospective providers value before registration.
- The **forum should require a provider account** for full thread access and participation. Registration creates accountability, safer professional discussion, saved identity and preferences, notification controls, and a durable professional network.
- Community access should be included for registered providers during beta. It should not be sold as a separate add-on until participation and moderation economics are proven.

The community is a retention and trust feature that supports the core session-design product. It must not become a substitute for professional training, clinical supervision, legal advice, or emergency support.

## Value hypothesis

Virtual communities of practice can support knowledge sharing, professional collaboration, informal learning, and reduced professional isolation. Reviews of healthcare communities also identify participation, trust, privacy, facilitation, and technical ability as important conditions rather than guaranteed outcomes ([PubMed integrated review](https://pubmed.ncbi.nlm.nih.gov/29161155/), [systematic review of healthcare communities of practice](https://pmc.ncbi.nlm.nih.gov/articles/PMC10564133/)).

SessionScape can create additional provider value through:

| Value | Provider outcome | Product outcome |
| --- | --- | --- |
| Practical inspiration | Providers learn how peers structure atmosphere, preparation, communication, and service design. | More repeat visits and blueprint experimentation. |
| Professional connection | Solo practitioners find peers by interest, market, or practice setting without exposing client data. | Higher retention and referral advocacy. |
| Feedback loop | Providers discuss SessionScape themes and workflows with the product team. | Faster discovery of useful content and product gaps. |
| Trusted editorial voice | The owner publishes reviewed, practical material with clear sources and professional boundaries. | Credibility, organic acquisition, and email subscriptions. |
| Reusable community knowledge | Valuable conversations become searchable, moderated reference material. | A differentiated knowledge layer linked to session planning. |

## Audience and access

| Capability | Visitor | Registered provider | Moderator | Administrator/editor |
| --- | --- | --- | --- | --- |
| Read published blog posts | Yes | Yes | Yes | Yes |
| Subscribe to blog digest | Yes, with separate consent | Yes, with separate consent | Yes | Yes |
| Bookmark or follow topics | No | Yes | Yes | Yes |
| See community purpose and sample topics | Yes | Yes | Yes | Yes |
| Read full forum threads | No | Yes | Yes | Yes |
| Create threads, replies, and reactions | No | Yes | Yes | Yes |
| Report content or block a member | No | Yes | Yes | Yes |
| Hide, lock, move, or remove content | No | No | Yes | Yes |
| Publish blog content and manage taxonomy | No | No | No unless assigned | Yes |
| Change roles or moderation policy | No | No | No | Yes |

Provider registration initially uses self-attestation and must not display a verified-license badge unless an authoritative credential check has actually occurred.

## Editorial requirements

| ID | Requirement |
| --- | --- |
| CM-01 | Published blog posts are readable without registration and have stable, shareable URLs. |
| CM-02 | Each post has title, slug, summary, body, author, publication date, update date, language, topics, review status, and source links where claims require support. |
| CM-03 | Draft, review, scheduled, published, corrected, and archived states are preserved with revision history. |
| CM-04 | Health, safety, regulatory, or professional-scope content receives qualified review before publication and displays its review/update date. |
| CM-05 | Blog content avoids diagnosis, treatment prescription, unsupported benefit claims, and universal statements about scope of practice. |
| CM-06 | Registered providers can bookmark posts and choose a digest frequency without being automatically enrolled in marketing. |
| CM-07 | Corrected posts show a material correction note; archived URLs remain available or redirect intentionally. |
| CM-08 | Blog search supports title, summary, topic, language, and body text. |

## Forum requirements

### Participation

| ID | Requirement |
| --- | --- |
| CM-09 | Visitors can understand the community's purpose and rules but must register as providers to read full threads or participate. |
| CM-10 | A provider can create a thread, reply, edit within a defined window, follow a topic, bookmark, react, report, and block another member. |
| CM-11 | Threads use a small, curated taxonomy such as Session design, Practice operations, Room and sensory details, Professional boundaries, and Product feedback. |
| CM-12 | Search and discovery prioritize useful, reviewed conversations rather than popularity alone. |
| CM-13 | A member can control email and in-app notifications by thread, topic, digest frequency, and mention. |
| CM-14 | The interface clearly distinguishes owner/editor articles, moderator notices, ordinary member opinions, and official product announcements. |
| CM-15 | Community profiles expose only provider-chosen professional fields; email, client information, and exact location remain private by default. |

### Safety and moderation

| ID | Requirement |
| --- | --- |
| CM-16 | Community rules prohibit client-identifying information, medical records, sexual solicitation, harassment, discrimination, doxxing, illegal practice, unsupported medical claims, spam, and instructions outside lawful professional scope. |
| CM-17 | Thread and reply forms show a concise reminder not to share client-identifying or clinical information. |
| CM-18 | Every post and profile has an accessible report action with reason, optional context, and acknowledgement. |
| CM-19 | Moderators can hide content pending review, remove it with a reason, lock a thread, suspend a member, preserve evidence, and reverse an action. |
| CM-20 | Moderation actions are recorded in an immutable audit trail with actor, target, policy reason, time, and appeal state. |
| CM-21 | Members receive a plain-language notice for material actions and can appeal through a documented channel. |
| CM-22 | Automated filters may queue or rate-limit content but shall not silently make final decisions about ambiguous professional speech. |
| CM-23 | Credible threats, exploitation, illegal content, or imminent safety concerns follow a documented escalation and evidence-preservation procedure. |
| CM-24 | Public launch requires named moderation coverage, response targets, an abuse contact, and an emergency capability-disable procedure. |

### Privacy and data handling

| ID | Requirement |
| --- | --- |
| CM-25 | Forum content is treated as persistent professional publication, not private chat; this is disclosed before posting. |
| CM-26 | Direct messaging, file uploads, client cases, and anonymous posting are excluded from the first community release. |
| CM-27 | A member can edit or delete their content subject to transparent conversation-integrity, safety, legal-hold, and audit requirements. |
| CM-28 | Account deletion removes direct profile identifiers and follows the documented rule for deleting or pseudonymizing retained discussion content. |
| CM-29 | Community analytics exclude message bodies and private profile fields. |
| CM-30 | Search engines cannot index provider-only threads, profiles, reports, drafts, or moderation records. |

## Prototype behavior

The current static website shall demonstrate the intended boundary without pretending to provide production identity or storage:

1. Blog cards and article previews are public.
2. Visitors can see the provider community's purpose and sample discussion topics.
3. Opening full community participation asks for provider preview registration.
4. Preview access and provider-created sample discussions are stored only in that browser.
5. The UI explicitly labels browser-only storage and moderation as prototype behavior.
6. No real client information, credential verification, direct messaging, uploads, or production account claims are included.

## Community launch gate

The production forum shall not launch until:

1. At least 10 target providers test the concept and at least 6 return for a second community visit within four weeks.
2. At least 5 providers contribute a useful thread or reply without staff prompting.
3. The first three topic areas have named hosts or facilitators and seeded discussions.
4. Community rules, moderation playbook, appeal path, abuse reporting, privacy notice, and retention schedule are approved.
5. Authentication, authorization, rate limiting, output encoding, audit logging, backup/restore, deletion, and incident-response tests pass.
6. Staffing and expected moderation cost remain viable at the planned free or paid access level.

## Measures

- Meaningful contributors per month: providers who create a thread or substantive reply.
- Contributor-to-reader ratio and zero-response thread rate.
- Four-week return rate for registered community members.
- Percentage of discussions connected to a SessionScape workflow or professional practice job.
- Median time to first useful reply.
- Reports per 1,000 posts, median first-response time, appeal rate, and reversed-action rate.
- Percentage of sampled posts containing client-identifying information: target 0%.
- Blog-to-registration conversion and blog-assisted activation, without making the blog registration-only.

## Risks and responses

| Risk | Response |
| --- | --- |
| Empty forum reduces trust. | Seed a small number of focused topics, recruit hosts, and delay broad launch until repeat participation exists. |
| Misinformation is treated as platform guidance. | Label member content, enable correction, involve qualified reviewers, and separate official editorial content. |
| Members share client details. | Preventive prompts, no case-upload workflow, reporting, rapid moderation, and privacy education. |
| Community displaces the core product. | Measure connection to session design and keep forum investment behind retention evidence. |
| Harassment or sexualized misuse damages professional trust. | Provider accounts, clear rules, block/report tools, trained moderation, enforcement, and appeals. |
| Registration wall reduces blog discovery. | Keep published editorial content public; reserve personalization and discussion for accounts. |

