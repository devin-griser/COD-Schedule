# CDL Schedule

## What This Is

A clean, mobile-first web app that shows upcoming Call of Duty League matches at a glance. Built for CDL fans who are tired of the cluttered official schedule page and just want to see who's playing, when, and where to watch — without the noise.

## Core Value

Users can instantly see the next upcoming CDL matches with teams, times, and stream links — nothing else getting in the way.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Display upcoming CDL match schedule (teams, date/time, stream link)
- [ ] Show team logos/branding alongside match info
- [ ] Display match results and scores for completed matches
- [ ] Convert match times to the user's local timezone
- [ ] Dark/moody premium visual design with clean typography
- [ ] Mobile-first responsive layout that works on desktop too
- [ ] Reliable data source for CDL schedule (scraping, manual, or discovered API)

### Out of Scope

- Team rosters or player stats — this is schedule-only
- User accounts or authentication — no login needed
- Notifications or alerts — just a display app
- Historical season data — focus on upcoming/recent matches
- Live match tracking or real-time scores during games

## Context

- The official CDL schedule lives at callofdutyleague.com/en-us/schedule but the page is cluttered and hard to navigate quickly
- There is no known modern public API for CDL schedule data — data sourcing is the biggest unknown and needs research
- The aesthetic should feel like a premium dark-mode sports app: moody, sharp typography, minimal UI chrome
- This will be publicly deployed for other CDL fans to use, not just a personal tool
- The user is learning web development (Odin Project background) — this is a real project with real users in mind

## Constraints

- **Data Source**: No official API exists — need to discover or build a data pipeline (scraping, unofficial API, manual entry, or hybrid)
- **Hosting**: Needs to be publicly accessible and free/cheap to host
- **Simplicity**: Feature set must stay minimal — the entire value is in what's NOT on the page

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Mobile-first responsive design | Primary use case is checking schedule on phone | — Pending |
| Dark theme as default | Matches esports/gaming aesthetic, user preference | — Pending |
| No user accounts | Keeps app dead-simple, no auth complexity | — Pending |

---
*Last updated: 2026-02-28 after initialization*
