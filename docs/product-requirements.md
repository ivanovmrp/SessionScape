# SessionScape product requirements

## Product statement

SessionScape lets licensed massage therapists design individualized, repeatable massage experiences by combining a session goal, room atmosphere, movement style, and a client’s stated preferences—within clear professional boundaries.

## Audience

The initial user is a solo licensed massage therapist who wants to deliver a distinctive and consistent experience. A later team plan supports spa managers who need shared, approved protocols.

## MVP outcomes

1. A therapist can choose a curated theme and see a session blueprint.
2. A therapist can adapt duration, intensity, atmosphere, client exclusions, and focus areas.
3. A therapist can save a private custom session and use a room-preparation checklist.
4. The product reminds the therapist to confirm consent, pressure, aroma, and sensitive-area boundaries.
5. The therapist can record simple, client-given experience feedback.
6. A visitor can read owner-published professional articles, while a registered provider can preview a moderated peer community.
7. A provider can register, log in, see their display name after authentication, and log out.

## MVP capabilities

| Area | Capability | MVP rule |
| --- | --- | --- |
| Theme library | Browse/search reviewed themes | Start with 12–20 themes; no sexualized naming or positioning. |
| Session Builder | Combine goal, pace, pressure, focus, atmosphere, duration | Output an editable, therapist-owned session blueprint. |
| Client preferences | Store optional scent, pressure, music, and exclusion preferences | Do not collect diagnoses, detailed medical history, or SOAP notes. |
| Preparation | Generate a room and consent checklist | Every aroma/sensitive-area choice requires a visible review prompt. |
| Reflection | Save private notes and simple ratings | Keep feedback separate from clinical records. |
| Export | Print/export a branded session description | Clearly label as experience guidance, not a treatment plan. |
| Identity preview | Register with a display name and email, log in, display the authenticated name, and log out | Browser-only prototype state; never store a password or describe the preview as production authentication. |
| Editorial | Read reviewed public articles about session design, practice, and professional boundaries | Public access; show author, publication/update date, and sources where needed. |
| Provider community preview | View the community purpose and sample topics; register for prototype participation | Browser-only demo data, explicit rules, no client cases, uploads, direct messages, or production identity claims. |

## Account and paid-registration requirements

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| ID-01 | A visitor can create a provider account using a display name and email address. | Successful registration creates an authenticated session and the display name is visible in the global header. |
| ID-02 | A returning provider can log in and an authenticated provider can log out. | Login restores the correct display name; logout removes access to account-gated features and returns the header to its signed-out state. |
| ID-03 | Registration initiated from an account-gated destination returns the provider to that destination after success. | Community registration scrolls or redirects to the provider community with member access visible. |
| ID-04 | Production identity uses managed authentication and secure server-side sessions. | Email verification, recovery, session revocation, rate limiting, and the controls in [Data persistence and security](data-persistence-security.md) pass acceptance testing. |
| PAY-01 | Before commercial launch, SessionScape supports paid registration for a Professional plan without handling raw card data. | A provider can review plan price and renewal terms, complete provider-hosted checkout, return with the correct entitlement, and cancel according to the disclosed policy. |
| PAY-02 | Paid registration is not required for public content or limited product exploration. | Visitors can read articles, browse themes, and try the limited builder without entering payment details. |

The current static prototype implements ID-01 through ID-03 only as browser-local behavior. PAY-01 and production authentication are tracked in the [product backlog](../BACKLOG.md).

## Out of scope

Scheduling, payment collection, insurance, clinical records, diagnoses, treatment claims, automatic technique recommendations, marketplaces, direct messaging, community file uploads, anonymous posting, and production forum persistence are intentionally excluded from the current static prototype.

## Success measures

- At least 60% of active therapists create a saved blueprint in their first week.
- A repeat user builds or reuses a session in under three minutes.
- Fewer than 10% of sessions are abandoned at the consent/preparation stage.
- Therapist feedback indicates the output feels professional, useful, and easy to adapt.
- In community concept testing, providers understand the privacy boundary and can distinguish owner/editor content from member opinion.

## Product principles

Personalization is useful only when it is safe, transparent, and controllable. The therapist remains the professional decision-maker; SessionScape provides organization and prompts, not clinical direction.
