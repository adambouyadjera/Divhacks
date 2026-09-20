# Fix My City

A shared neighborhood map for problems, events, photos, and the follow-through that matters.

> **Status: concept.** This README describes a proposed app. No feature, integration, API, test result, or city partnership is claimed to exist yet.

## What Fix My City would do

Neighborhood information is scattered. Someone spots a broken sidewalk, another person posts a photo of the same place, and a third wonders whether anyone reported it. Meanwhile, local events and community photos live in separate feeds.

Fix My City would put these things on one interactive map:

| Question | Proposed answer |
| --- | --- |
| What's happening nearby? | Explore problem, event, and photo markers. |
| Has this already been posted? | See possible duplicates and add a dated observation to one shared issue. |
| How do I report it properly? | Find an official reporting link and review an editable factual description. |
| What happened afterward? | Follow a timeline separating community observations from official information. |

The intended flow is:

`Map → Marker details → Community discussion → Reporting guidance → Follow-up`

The map could have a lively, game-inspired design. It would use original visuals and would not be affiliated with any game or city agency.

## Features by screen

### 🗺️ Home map

- Distinct markers for problems, events, and community photos.
- Filters for category, date, neighborhood, and issue status.
- Tappable previews with a title, public location, and latest update.
- Optional weather panel with a source and timestamp.
- Latitude and longitude for public issue and event locations. A person's live location would not be visible to others by default.
- Manual area search for people who decline location access.

### 📍 Issue page

- One page for a physical problem, with separate, dated observations from neighbors.
- Description, public location, photos, discussion, and activity timeline.
- Community attention: independent confirmations, distinct from any official urgency or agency priority.
- Official request reference and status only if available and verifiable, with a source and update time.
- Follow button for meaningful changes.

### ➕ Report a problem

- Choose a category and public location.
- Describe what was observed and optionally add a photo.
- Review nearby possible matches and join the same issue or create a new one.
- Review an editable, factual description and open the appropriate official reporting page.
- If an official request is submitted, attach its reference when it can be verified.

A post in Fix My City would not by itself submit a report to the government. NYC residents can currently report problems and look up service requests through [NYC311](https://portal.311.nyc.gov/).

### 📅 Events

- Public event markers with organizer, date, location, description, and original listing link.
- A moderated event discussion and optional follow feature.
- Review process for misleading or duplicate listings.

### 📷 Community photos

- Place-based photos with dates and captions.
- Issue photos kept in the relevant issue timeline.
- Review and reporting tools for inaccurate posts or images that expose private details.

### 📰 Neighborhood feed

- Updates from followed places, issues, and events.
- Visibly separate labels for community content, official information, and sample content.
- User controls for which updates generate notifications.

### 👤 Profile

- Username and password sign-in, optional bio, and optional social links.
- Manage posts, followed issues, and notification settings.
- Public profile fields selected by the account holder; no public location history.

Authentication would use an established provider or secure password hashing. Plaintext passwords would never be stored.

## How an issue would move forward

Illustrative example: A resident photographs an uneven public sidewalk. Fix My City shows a nearby possible match. They confirm it is the same physical spot and add a dated observation to its existing page. The page shows independent confirmations, offers an official reporting link, and later displays a verified request reference if one is provided.

| Stage | What could appear | Important distinction |
| --- | --- | --- |
| Community post | Resident's observation and image. | The city has not necessarily received a report. |
| Duplicate suggestion | Nearby issue with a similar category and date. | A person confirms the match before it is combined. |
| Official request | Verified reference and source. | Community attention does not set city priority. |
| Official response | Agency status and update time. | “Closed” does not always prove a physical repair. |
| Community follow-up | New dated observation. | It remains distinct from an official record. |

The writing helper could use only the details supplied by the resident: where, when, what was observed, and how the public space is affected. The resident reviews it and submits through the official channel. The app would not encourage exaggeration or repeated reports to manipulate priority.

## Proposed tech stack

These are candidate tools, not technologies already used by this project.

| Layer | Candidate | Intended role |
| --- | --- | --- |
| Mobile interface | React Native, Expo, TypeScript | Map, posts, profiles, and notifications. |
| Map | MapLibre or another licensed map SDK | Tiles, markers, filters, and coordinates. |
| Backend | Node.js or Python API | Post validation, matching, and timelines. |
| Database | PostgreSQL with geospatial support | Accounts, issues, observations, events, and follows. |
| Authentication | Managed identity service | Secure account creation and sign-in. |
| Photos | Managed object storage | Reviewed uploads and thumbnails. |
| Weather | Provider to be selected | Conditions with location, source, and timestamp. |

Provider selection would depend on licensing, cost, data access, and the needs of a working prototype.

## Proposed architecture

The app would request markers and issue details from a backend. Community posts would be stored separately from imported official records. A moderation queue would review public submissions. A matching service would suggest nearby duplicates based on category, location, and time, while the contributor confirms whether two posts describe the same problem.

Illustrative request flows:

- **Open the map:** select an area → retrieve filtered markers → tap one for details.
- **Post an issue:** provide category, location, text, and optional image → review suggested matches → join or create an issue.
- **Follow an issue:** opt in to useful timeline updates.
- **Attach an official reference:** supply a request number → verify it where supported → display source-attributed status.

No automatic city submission or status integration is assumed.

## Potential data sources

| Source | Potential use | What must be checked |
| --- | --- | --- |
| NYC311 | Official reporting links and request lookup. | A link is not proof that a request was submitted. |
| NYC Open Data | Public records relevant to supported categories. | Dataset fields, licensing, and update frequency. |
| Weather provider, undecided | Context beside the map. | Coverage, source attribution, and timestamp. |
| Community submissions | Problems, events, photos, and updates. | Accuracy, moderation, and privacy. |

## Proposed data model and API

Possible records include `User`, `Issue`, `Observation`, `OfficialRequest`, `TimelineEvent`, `Event`, `Photo`, `Comment`, and `Follow`. One `Issue` would hold many separately attributed `Observations`.

A future API would need to list map markers, suggest issue matches, create issues, add observations, moderate comments and events, attach official references, and retrieve timeline updates. No endpoints or request formats have been implemented or specified yet.

## Getting started

There is no runnable application or installation command yet. When code exists, this section should contain prerequisites, configuration, and commands tested from a fresh checkout.

An initial prototype would cover one neighborhood with all three marker types and one complete issue flow: post → possible duplicate → reporting guide → clearly labeled sample timeline.

## Testing plan

No tests have been run yet. Useful future checks include:

- Similar reports at one location are suggested as matches; nearby but distinct problems stay separate.
- A community post cannot appear as “officially submitted” without a verified reference.
- Users cannot see another person's private profile fields or live location.
- An official closed status can coexist with a later community observation.
- Weather and official data show their source and last update.
- A user can flag misleading content for moderator review.

## Limitations

- No city affiliation or guaranteed outcome. The app could guide reporting but cannot order a repair.
- Community attention is not official priority. Multiple confirmations show interest, not an agency classification.
- Possible matching errors. Duplicate suggestions require review and a correction path.
- Uncertain official data access. Automatic tracking depends on actual availability and permitted use.
- Moderation work. Public posts, discussions, events, and images may contain mistakes or private details.
- Weather coverage. A nearby reading may not describe conditions at every map marker.

## Roadmap

| Phase | Proposed work | Proof it works |
| --- | --- | --- |
| 1. Map | Problem, event, and photo markers; filters; weather panel. | A tester can open all three marker types. |
| 2. Issue flow | Report creation, possible duplicates, and observations. | One problem has one shared page with distinct contributions. |
| 3. Reporting guide | Reviewed category links and editable factual draft. | A supported issue points to the appropriate official process. |
| 4. Follow-through | Request references, source-attributed status, opt-in updates. | Community and official events remain clearly separated. |
| 5. Community tools | Profiles, moderated discussion, events, and photos. | People can contribute and moderators can correct posts. |
